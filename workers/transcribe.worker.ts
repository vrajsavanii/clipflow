import { createClient } from '@supabase/supabase-js';
import Groq from 'groq-sdk';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import * as dotenv from 'dotenv';

// Load environment variables
const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const groqApiKey = process.env.GROQ_API_KEY!;

const supabase = createClient(supabaseUrl, serviceKey);
const groq = new Groq({ apiKey: groqApiKey, timeout: 600000 });

const TEMP_DIR = path.join(__dirname, '../temp');
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

console.log('[TranscribeWorker] Worker initialized with --no-part & inherit stdio.');

async function processTranscribeJob(job: any) {
  console.log(`[TranscribeWorker] Claimed job ${job.id} for project ${job.project_id}`);

  await supabase.from('jobs').update({ status: 'processing', progress_pct: 10, started_at: new Date().toISOString(), error_msg: null }).eq('id', job.id);
  await supabase.from('projects').update({ status: 'downloading' }).eq('id', job.project_id);

  const { data: project, error: pErr } = await supabase.from('projects').select('*').eq('id', job.project_id).single();
  if (pErr || !project) throw new Error(`Project ${job.project_id} not found`);

  const sourceUrl = project.source_url;
  if (!sourceUrl) throw new Error(`Project ${project.id} has no source_url`);

  const timestamp = Date.now();
  const rawAudioPath = path.join(TEMP_DIR, `raw_${project.id}_${timestamp}.m4a`);
  const compressedAudioPath = path.join(TEMP_DIR, `compressed_${project.id}_${timestamp}.mp3`);

  console.log(`[TranscribeWorker] Downloading fast audio stream with --no-part...`);
  await supabase.from('jobs').update({ progress_pct: 20 }).eq('id', job.id);

  // --no-part writes directly without Windows file locking rename issues
  const ytdlpExe = process.env.YTDLP_PATH || 'yt-dlp';
  const dlCmd = `"${ytdlpExe}" --extractor-args "youtube:player_client=android,web" -f "139/249/ba[ext=m4a]/ba" --no-part --no-playlist -o "${rawAudioPath}" "${sourceUrl}"`;
  
  try {
    execSync(dlCmd, { stdio: 'inherit' });
  } catch (dlErr: any) {
    console.warn('[TranscribeWorker] Fast format download failed, trying fallback...');
    const fallbackCmd = `"${ytdlpExe}" --extractor-args "youtube:player_client=android,web" -f "ba/b" --no-part --no-playlist -o "${rawAudioPath}" "${sourceUrl}"`;
    execSync(fallbackCmd, { stdio: 'inherit' });
  }

  if (!fs.existsSync(rawAudioPath)) {
    throw new Error(`Audio download failed: file ${rawAudioPath} not generated`);
  }

  console.log(`[TranscribeWorker] Audio downloaded (${(fs.statSync(rawAudioPath).size / 1024 / 1024).toFixed(2)} MB). Resampling to 16kHz 24k mono MP3 via FFmpeg...`);
  await supabase.from('jobs').update({ progress_pct: 35 }).eq('id', job.id);

  const ffmpegCompressCmd = `ffmpeg -y -i "${rawAudioPath}" -ac 1 -ar 16000 -b:a 16k "${compressedAudioPath}"`;
  execSync(ffmpegCompressCmd, { stdio: 'inherit' });

  if (!fs.existsSync(compressedAudioPath)) {
    throw new Error(`FFmpeg audio compression failed`);
  }

  const finalSizeMb = (fs.statSync(compressedAudioPath).size / 1024 / 1024).toFixed(2);
  console.log(`[TranscribeWorker] Compressed audio file ready (${finalSizeMb} MB). Calling Groq Whisper Large v3 API...`);
  await supabase.from('jobs').update({ progress_pct: 50 }).eq('id', job.id);

  await supabase.from('projects').update({ status: 'transcribing' }).eq('id', job.project_id);

  const transcription: any = await groq.audio.transcriptions.create({
    file: fs.createReadStream(compressedAudioPath),
    model: 'whisper-large-v3-turbo',
    response_format: 'verbose_json',
    timestamp_granularities: ['word', 'segment'],
  });

  console.log('[TranscribeWorker] Groq Whisper response received! Structuring transcript data...');
  await supabase.from('jobs').update({ progress_pct: 85 }).eq('id', job.id);

  const durationSec = Math.round(transcription.duration || 0);
  const transcriptText = transcription.text || '';
  const language = transcription.language || 'en';

  const words: Array<{ word: string; start: number; end: number }> = [];
  if (transcription.words && Array.isArray(transcription.words)) {
    for (const w of transcription.words) {
      words.push({
        word: w.word,
        start: parseFloat(w.start?.toFixed(2) || '0'),
        end: parseFloat(w.end?.toFixed(2) || '0')
      });
    }
  } else if (transcription.segments && Array.isArray(transcription.segments)) {
    for (const seg of transcription.segments) {
      const segWords = (seg.text || '').trim().split(/\s+/);
      const segStart = seg.start || 0;
      const segEnd = seg.end || segStart + 1;
      const step = (segEnd - segStart) / Math.max(segWords.length, 1);
      segWords.forEach((w: string, idx: number) => {
        words.push({
          word: w,
          start: parseFloat((segStart + idx * step).toFixed(2)),
          end: parseFloat((segStart + (idx + 1) * step).toFixed(2))
        });
      });
    }
  }

  const transcriptJson = {
    text: transcriptText,
    language: language,
    duration: durationSec,
    words: words,
    segments: transcription.segments || []
  };

  await supabase.from('projects').update({
    transcript_text: transcriptText,
    transcript_json: transcriptJson,
    duration_sec: durationSec,
    language: language,
    status: 'transcribed'
  }).eq('id', job.project_id);

  [rawAudioPath, compressedAudioPath].forEach(f => {
    if (fs.existsSync(f)) try { fs.unlinkSync(f); } catch {}
  });

  await supabase.from('jobs').update({ status: 'done', progress_pct: 100, finished_at: new Date().toISOString() }).eq('id', job.id);

  console.log(`[TranscribeWorker] Queueing next job 'analyze' for project ${job.project_id}...`);
  await supabase.from('jobs').insert({
    project_id: job.project_id,
    user_id: job.user_id,
    type: 'analyze',
    status: 'queued'
  });

  console.log(`[TranscribeWorker] Project ${job.project_id} transcription completed successfully! Duration: ${durationSec}s`);
}

async function poll() {
  try {
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('type', 'transcribe')
      .in('status', ['queued', 'processing', 'failed'])
      .order('created_at', { ascending: false })
      .limit(1);

    if (jobs && jobs.length > 0) {
      const job = jobs[0];
      if (job.status !== 'done') {
        try {
          await processTranscribeJob(job);
        } catch (err: any) {
          console.error(`[TranscribeWorker] Job ${job.id} failed:`, err.message || err);
          await supabase.from('jobs').update({
            status: 'failed',
            error_msg: err.message || 'Transcribe worker error',
            finished_at: new Date().toISOString()
          }).eq('id', job.id);
          await supabase.from('projects').update({ status: 'failed' }).eq('id', job.project_id);
        }
      }
    }
  } catch (err: any) {
    console.error('[TranscribeWorker] Unexpected error in poll:', err);
  } finally {
    setTimeout(poll, 3000);
  }
}

poll();
