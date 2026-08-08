const { createClient } = require('@supabase/supabase-js');
const Groq = require('groq-sdk');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load env
const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf-8');
  for (const line of envConfig.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...vals] = trimmed.split('=');
      if (key && vals.length > 0) {
        process.env[key.trim()] = vals.join('=').trim();
      }
    }
  }
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY, timeout: 600000 });

const targetUrl = 'https://www.youtube.com/watch?v=zSkxqtTbEGU';
const TEMP_DIR = path.join(__dirname, '../temp');
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

async function runPipeline() {
  console.log("=== FULL AI PIPELINE RUNNER FOR RAJ SHAMANI PODCAST (IAN BREMMER FO545) ===");
  console.log("URL:", targetUrl);

  // 1. Ensure test user & project
  let userId;
  const { data: usersList } = await supabase.auth.admin.listUsers();
  const existingUser = usersList?.users?.find(u => u.email === 'test@clipflow.ai');
  if (existingUser) {
    userId = existingUser.id;
  } else {
    const { data: newUser } = await supabase.auth.admin.createUser({ email: 'test@clipflow.ai', password: 'Password123!', email_confirm: true });
    userId = newUser?.user?.id || '00000000-0000-0000-0000-000000000001';
  }

  await supabase.from('users').upsert({ id: userId, plan: 'pro', credits_remaining: 100, minutes_limit: 500 });

  const projectId = '11111111-2222-3333-4444-555555555555';
  let { data: proj } = await supabase.from('projects').select('*').eq('id', projectId).single();
  if (!proj) {
    const { data: newProj } = await supabase.from('projects').insert({ id: projectId, user_id: userId, source_url: targetUrl, status: 'ingesting' }).select().single();
    proj = newProj;
  }
  console.log("Project ID:", projectId);
  const rawAudioPath = path.join(TEMP_DIR, `raw_audio_${projectId}.m4a`);
  const compressedAudioPath = path.join(TEMP_DIR, `compressed_${projectId}.mp3`);

  // STAGE 1: TRANSCRIBE
  if (!proj.transcript_text) {
    console.log("\n--- STAGE 1: AUDIO DOWNLOAD & TRANSCRIPTION ---");

    if (fs.existsSync(compressedAudioPath)) try { fs.unlinkSync(compressedAudioPath); } catch {}

    if (!fs.existsSync(rawAudioPath)) {
      console.log("Downloading audio stream...");
      const ytdlpExe = process.env.YTDLP_PATH || 'yt-dlp';
      const dlCmd = `"${ytdlpExe}" --extractor-args "youtube:player_client=android,web" -f "ba/b" --no-part --no-playlist -o "${rawAudioPath}" "${targetUrl}"`;
      execSync(dlCmd, { stdio: 'inherit' });
    } else {
      console.log("Using existing raw audio stream:", rawAudioPath);
    }

    console.log("Resampling first 60 minutes to 16kHz 16k mono MP3...");
    const ffmpegCmd = `ffmpeg -y -i "${rawAudioPath}" -t 3600 -ac 1 -ar 16000 -b:a 16k "${compressedAudioPath}"`;
    execSync(ffmpegCmd, { stdio: 'inherit' });

    console.log("Sending to Groq Whisper Large v3...");
    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(compressedAudioPath),
      model: 'whisper-large-v3-turbo',
      response_format: 'verbose_json',
      timestamp_granularities: ['word', 'segment'],
    });

    console.log("Transcription received! Duration:", transcription.duration, "s");
    const durationSec = Math.round(transcription.duration || 0);
    const text = transcription.text || '';

    const words = (transcription.words || []).map(w => ({
      word: w.word,
      start: parseFloat(w.start.toFixed(2)),
      end: parseFloat(w.end.toFixed(2))
    }));

    const transcriptJson = { text, duration: durationSec, words, segments: transcription.segments || [] };

    await supabase.from('projects').update({
      transcript_text: text,
      transcript_json: transcriptJson,
      duration_sec: durationSec,
      status: 'transcribed'
    }).eq('id', projectId);

    console.log("Stage 1 complete! Transcript text saved to database.");
  } else {
    console.log("\n--- STAGE 1: ALREADY TRANSCRIBED ---");
    console.log("Transcript length:", proj.transcript_text.length, "chars");
  }

  // STAGE 2: AI VIRAL CLIP EXTRACTION & SPARK SCORING
  console.log("\n--- STAGE 2: AI VIRAL SEGMENT IDENTIFICATION (GROQ LLAMA-3.3-70B) ---");
  const { data: updatedProj } = await supabase.from('projects').select('*').eq('id', projectId).single();
  
  let { data: createdClips } = await supabase.from('clips').select('*').eq('project_id', projectId);
  if (!createdClips || createdClips.length === 0) {
    const prompt = `You are an elite short-form video editor for TikTok, YouTube Shorts, and Instagram Reels.
Analyze this video transcript and extract the TOP 5 MOST VIRAL, high-engagement clip segments.
Target duration per clip: 30 to 75 seconds.

TRANSCRIPT:
${updatedProj.transcript_text.substring(0, 20000)}

Respond ONLY as JSON:
{
  "clips": [
    {
      "start_sec": 15,
      "end_sec": 65,
      "title": "Why America Is Losing Its Global Dominance",
      "hook": "America is no longer the world's leader.",
      "subtitle": "Ian Bremmer reveals the shocking truth about geopolitical shifts.",
      "spark_score": 95,
      "score_breakdown": { "hook": 20, "story": 19, "emotion": 19, "shareability": 19, "platform_fit": 18 },
      "improvement_tips": "Start directly with the provocative claim for maximum retention.",
      "target_platforms": ["TikTok", "YouTube Shorts", "Instagram Reels"],
      "caption_keywords": ["America", "Geopolitics", "Future"],
      "caption_style": "neon_cyberpunk"
    }
  ]
}`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const parsed = JSON.parse(completion.choices[0].message.content);
    console.log(`Extracted ${parsed.clips.length} viral clips! Inserting into clips table...`);

    createdClips = [];
    for (const c of parsed.clips) {
      const { data: clip, error: cErr } = await supabase.from('clips').insert({
        project_id: projectId,
        user_id: updatedProj.user_id,
        title: c.title,
        hook: c.hook,
        subtitle: c.subtitle,
        start_sec: c.start_sec,
        end_sec: c.end_sec,
        duration_sec: Math.max(10, c.end_sec - c.start_sec),
        spark_score: c.spark_score || 90,
        score_breakdown: c.score_breakdown,
        improvement_tips: c.improvement_tips,
        target_platforms: c.target_platforms,
        caption_keywords: c.caption_keywords,
        caption_style: c.caption_style || 'neon_cyberpunk',
        aspect_ratio: '9:16',
        status: 'pending'
      }).select().single();

      if (cErr) console.error("Error inserting clip:", cErr.message);
      else if (clip) {
        createdClips.push(clip);
        console.log(`  Clip created: "${clip.title}" [${clip.start_sec}s - ${clip.end_sec}s] (SparkScore: ${clip.spark_score})`);
      }
    }
  } else {
    console.log(`Found ${createdClips.length} existing clips in database! Skipping AI extraction.`);
  }

  await supabase.from('projects').update({ status: 'ready' }).eq('id', projectId);

  // STAGE 3: RENDERING 9:16 VERTICAL SHORTS WITH ASS CAPTIONS
  console.log("\n--- STAGE 3: RENDERING 9:16 VERTICAL MP4 SHORTS WITH ASS CAPTIONS ---");
  for (const clip of createdClips) {
    console.log(`Rendering Clip ID: ${clip.id} ("${clip.title}")...`);
    
    const slicePath = path.join(TEMP_DIR, `slice_${clip.id}.mp4`);
    const assPath = path.join(TEMP_DIR, `subs_${clip.id}.ass`);
    const renderPath = path.join(TEMP_DIR, `render_${clip.id}.mp4`);

    // Slicing section via FFmpeg from local raw file
    console.log(`  Slicing video segment [${clip.start_sec}s - ${clip.end_sec}s]...`);
    const sliceCmd = `ffmpeg -y -ss ${clip.start_sec} -to ${clip.end_sec} -i "${rawAudioPath}" -c:v libx264 -preset fast -c:a aac "${slicePath}"`;
    execSync(sliceCmd, { stdio: 'inherit' });

    if (fs.existsSync(slicePath)) {
      // Create ASS file
      const assText = `[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Outfit,75,&H00FFFFFF,&H0000E5FF,&H00000000,&H80000000,1,0,0,0,100,100,0,0,1,4,0,2,80,80,320,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 0,0:00:00.00,0:00:30.00,Default,,0,0,0,,${clip.hook.toUpperCase()}
`;
      fs.writeFileSync(assPath, assText, 'utf-8');

      // FFmpeg render
      const escAss = assPath.replace(/\\/g, '/').replace(/:/g, '\\:');
      const ffCmd = `ffmpeg -y -i "${slicePath}" -vf "crop=ih*9/16:ih:(iw-ow)/2:0,subtitles='${escAss}'" -c:v libx264 -preset fast -crf 22 -c:a aac "${renderPath}"`;
      
      try {
        execSync(ffCmd, { stdio: 'inherit' });
      } catch (rErr) {
        console.warn("  Subtitle filter failed, fallback to simple crop...");
        const simpleFFCmd = `ffmpeg -y -i "${slicePath}" -vf "crop=ih*9/16:ih:(iw-ow)/2:0" -c:v libx264 -preset fast -crf 22 -c:a aac "${renderPath}"`;
        execSync(simpleFFCmd, { stdio: 'inherit' });
      }

      if (fs.existsSync(renderPath)) {
        console.log(`  Uploading rendered MP4 (${(fs.statSync(renderPath).size / 1024 / 1024).toFixed(2)} MB) to Supabase Storage...`);
        const buffer = fs.readFileSync(renderPath);
        const storagePath = `rendered_${clip.id}.mp4`;
        await supabase.storage.from('clips').upload(storagePath, buffer, { contentType: 'video/mp4', upsert: true });

        const { data: pubUrl } = supabase.storage.from('clips').getPublicUrl(storagePath);
        const finalUrl = pubUrl.publicUrl;

        await supabase.from('clips').update({ output_url: finalUrl, status: 'completed' }).eq('id', clip.id);
        console.log(`  SUCCESS! Clip "${clip.title}" rendered & uploaded: ${finalUrl}`);
      }
    }
  }

  console.log("\n=== ALL PIPELINE STAGES COMPLETED SUCCESSFULLY ===");
}

runPipeline().catch(console.error);
