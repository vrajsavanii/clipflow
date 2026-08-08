import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import * as dotenv from 'dotenv';
import { CAPTION_STYLES, getStyleById } from '../lib/caption-styles';

// Load environment variables
const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceKey);

const TEMP_DIR = path.join(__dirname, '../temp');
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

console.log('[RenderWorker] Worker initialized. Polling for queued render jobs...');

function generateAssSubtitles(clipWords: Array<{ word: string; start: number; end: number }>, styleId: string): string {
  // Advanced SubStation Alpha header
  let assContent = `[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Outfit,75,&H00FFFFFF,&H0000E5FF,&H00000000,&H80000000,1,0,0,0,100,100,0,0,1,4,0,2,80,80,320,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  // Group words into 3-4 word lines for vertical video impact
  const chunkSize = 3;
  for (let i = 0; i < clipWords.length; i += chunkSize) {
    const chunk = clipWords.slice(i, i + chunkSize);
    if (chunk.length === 0) continue;

    const startSec = chunk[0].start;
    const endSec = chunk[chunk.length - 1].end;

    const formatTime = (sec: number) => {
      const h = Math.floor(sec / 3600);
      const m = Math.floor((sec % 3600) / 60);
      const s = Math.floor(sec % 60);
      const ms = Math.floor((sec % 1) * 100);
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
    };

    const textStr = chunk.map(w => w.word).join(' ').toUpperCase();
    assContent += `Dialogue: 0,${formatTime(startSec)},${formatTime(endSec)},Default,,0,0,0,,${textStr}\n`;
  }

  return assContent;
}

async function processRenderJob(job: any) {
  console.log(`[RenderWorker] Claimed render job ${job.id} for clip ${job.clip_id}`);

  await supabase.from('jobs').update({ status: 'processing', progress_pct: 10, started_at: new Date().toISOString() }).eq('id', job.id);

  // 1. Fetch clip and project details
  const { data: clip, error: cErr } = await supabase.from('clips').select('*').eq('id', job.clip_id).single();
  if (cErr || !clip) throw new Error(`Clip ${job.clip_id} not found`);

  await supabase.from('clips').update({ status: 'rendering' }).eq('id', clip.id);

  const { data: project, error: pErr } = await supabase.from('projects').select('*').eq('id', clip.project_id).single();
  if (pErr || !project) throw new Error(`Project ${clip.project_id} not found`);

  const sourceUrl = project.source_url;
  const startSec = clip.start_sec || 0;
  const endSec = clip.end_sec || (startSec + 30);
  const clipId = clip.id;

  const rawSlicePath = path.join(TEMP_DIR, `slice_${clipId}.mp4`);
  const assPath = path.join(TEMP_DIR, `subs_${clipId}.ass`);
  const finalOutputPath = path.join(TEMP_DIR, `render_${clipId}.mp4`);

  // Clean old files if exist
  [rawSlicePath, assPath, finalOutputPath].forEach(f => {
    if (fs.existsSync(f)) try { fs.unlinkSync(f); } catch {}
  });

  console.log(`[RenderWorker] Slicing video from ${startSec}s to ${endSec}s via yt-dlp section download...`);
  await supabase.from('jobs').update({ progress_pct: 30 }).eq('id', job.id);

  // Fast slice download via yt-dlp section slicing
  const sectionCmd = `python -m yt_dlp --download-sections "*${startSec}-${endSec}" -f "bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best" --force-keyframes-at-cuts -o "${rawSlicePath}" "${sourceUrl}"`;

  try {
    execSync(sectionCmd, { stdio: 'pipe' });
  } catch (dlErr: any) {
    console.warn(`[RenderWorker] Section download failed, trying full format fallback...`, dlErr.stderr?.toString());
    const fallbackCmd = `python -m yt_dlp --download-sections "*${startSec}-${endSec}" -f "best" -o "${rawSlicePath}" "${sourceUrl}"`;
    execSync(fallbackCmd, { stdio: 'pipe' });
  }

  if (!fs.existsSync(rawSlicePath)) {
    throw new Error(`Failed to extract clip video slice: ${rawSlicePath} not created`);
  }

  console.log(`[RenderWorker] Slice downloaded (${(fs.statSync(rawSlicePath).size / 1024 / 1024).toFixed(2)} MB). Generating captions & burning subtitles...`);
  await supabase.from('jobs').update({ progress_pct: 60 }).eq('id', job.id);

  // Extract clip word list from project transcript_json if available
  const words: Array<{ word: string; start: number; end: number }> = [];
  if (project.transcript_json?.words) {
    for (const w of project.transcript_json.words) {
      if (w.start >= startSec && w.end <= endSec + 1) {
        words.push({
          word: w.word,
          start: w.start - startSec,
          end: w.end - startSec
        });
      }
    }
  }

  // Generate ASS file
  const assText = generateAssSubtitles(words, clip.caption_style || 'neon_cyberpunk');
  fs.writeFileSync(assPath, assText, 'utf-8');

  // FFmpeg crop 9:16 vertical & subtitle burn-in
  // Escaping backslashes for FFmpeg subtitle path on Windows
  const escapedAssPath = assPath.replace(/\\/g, '/').replace(/:/g, '\\:');
  const ffmpegCmd = `ffmpeg -y -i "${rawSlicePath}" -vf "crop=ih*(9/16):ih:(iw-crop_w)/2:0,subtitles='${escapedAssPath}'" -c:v libx264 -preset fast -crf 22 -c:a aac -b:a 192k "${finalOutputPath}"`;

  console.log(`[RenderWorker] Executing FFmpeg 9:16 vertical crop & ASS subtitle render...`);
  try {
    execSync(ffmpegCmd, { stdio: 'pipe' });
  } catch (ffErr: any) {
    console.warn(`[RenderWorker] Subtitle burn-in fallback without subtitles...`, ffErr.stderr?.toString());
    const simpleFfmpegCmd = `ffmpeg -y -i "${rawSlicePath}" -vf "crop=ih*(9/16):ih:(iw-crop_w)/2:0" -c:v libx264 -preset fast -crf 22 -c:a aac "${finalOutputPath}"`;
    execSync(simpleFfmpegCmd, { stdio: 'pipe' });
  }

  if (!fs.existsSync(finalOutputPath)) {
    throw new Error(`FFmpeg rendering failed: ${finalOutputPath} not created`);
  }

  console.log(`[RenderWorker] Render complete! Uploading to Supabase Storage bucket 'clips'...`);
  await supabase.from('jobs').update({ progress_pct: 85 }).eq('id', job.id);

  // Upload to Supabase storage
  const fileBuffer = fs.readFileSync(finalOutputPath);
  const storagePath = `rendered_${clip.id}.mp4`;

  const { error: uploadErr } = await supabase.storage
    .from('clips')
    .upload(storagePath, fileBuffer, { contentType: 'video/mp4', upsert: true });

  if (uploadErr) {
    console.error("[RenderWorker] Storage upload error:", uploadErr.message);
  }

  const { data: publicUrlData } = supabase.storage.from('clips').getPublicUrl(storagePath);
  const outputUrl = publicUrlData.publicUrl;

  console.log(`[RenderWorker] File uploaded successfully! Public URL: ${outputUrl}`);

  // Update clip record
  await supabase.from('clips').update({
    output_url: outputUrl,
    status: 'completed'
  }).eq('id', clip.id);

  // Mark job done
  await supabase.from('jobs').update({ status: 'done', progress_pct: 100, finished_at: new Date().toISOString() }).eq('id', job.id);

  // Clean temp files
  [rawSlicePath, assPath, finalOutputPath].forEach(f => {
    if (fs.existsSync(f)) try { fs.unlinkSync(f); } catch {}
  });

  console.log(`[RenderWorker] Render job ${job.id} for clip ${clip.id} completed successfully!`);
}

async function poll() {
  try {
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('type', 'render')
      .eq('status', 'queued')
      .order('created_at', { ascending: true })
      .limit(1);

    if (error) {
      console.error('[RenderWorker] Poll error:', error.message);
    } else if (jobs && jobs.length > 0) {
      const job = jobs[0];
      try {
        await processRenderJob(job);
      } catch (err: any) {
        console.error(`[RenderWorker] Render job ${job.id} failed:`, err.message || err);
        await supabase.from('jobs').update({
          status: 'failed',
          error_msg: err.message || 'Render worker error',
          finished_at: new Date().toISOString()
        }).eq('id', job.id);
        if (job.clip_id) {
          await supabase.from('clips').update({ status: 'failed' }).eq('id', job.clip_id);
        }
      }
    }
  } catch (err: any) {
    console.error('[RenderWorker] Unexpected error in poll:', err);
  } finally {
    setTimeout(poll, 3000);
  }
}

poll();
