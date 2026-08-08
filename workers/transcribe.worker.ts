import { createClient } from '@supabase/supabase-js';
import Groq from 'groq-sdk';
import * as fs from 'fs';
import * as path from 'path';
import { execSync, spawnSync } from 'child_process';
import * as dotenv from 'dotenv';

const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) dotenv.config({ path: envPath });
else dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const groqApiKey  = process.env.GROQ_API_KEY!;

const supabase = createClient(supabaseUrl, serviceKey);
const groq     = new Groq({ apiKey: groqApiKey, timeout: 600000 });

const TEMP_DIR = path.join(__dirname, '../temp');
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

const ytdlpExe = process.env.YTDLP_PATH || 'yt-dlp';

// ── helpers ──────────────────────────────────────────────────────────────────
async function setJobProgress(jobId: string, pct: number, label: string) {
  await supabase.from('jobs').update({ progress_pct: pct, stage_label: label }).eq('id', jobId);
}
async function setProjectStatus(projectId: string, status: string, error?: string) {
  const upd: any = { status };
  if (error) upd.error_msg = error;
  await supabase.from('projects').update(upd).eq('id', projectId);
}

// ── main processing ───────────────────────────────────────────────────────────
async function processTranscribeJob(job: any) {
  const ts = Date.now();
  console.log(`[TranscribeWorker] Claimed job ${job.id} → project ${job.project_id}`);

  await supabase.from('jobs').update({
    status: 'processing', progress_pct: 5,
    stage_label: 'Initializing…', started_at: new Date().toISOString(), error_msg: null
  }).eq('id', job.id);
  await setProjectStatus(job.project_id, 'downloading');

  const { data: project, error: pErr } = await supabase.from('projects').select('*').eq('id', job.project_id).single();
  if (pErr || !project) throw new Error(`Project ${job.project_id} not found`);

  const sourceUrl = project.source_url;
  if (!sourceUrl) throw new Error('Project has no source_url');

  const rawAudioPath  = path.join(TEMP_DIR, `raw_${project.id}_${ts}.m4a`);
  const compAudioPath = path.join(TEMP_DIR, `compressed_${project.id}_${ts}.mp3`);

  // ── Step 1: Download audio ──────────────────────────────────────────────────
  await setJobProgress(job.id, 15, 'Downloading audio from source…');
  const dlCmd = `"${ytdlpExe}" --extractor-args "youtube:player_client=android,web" -f "139/249/ba[ext=m4a]/ba" --no-part --no-playlist --max-filesize 200M -o "${rawAudioPath}" "${sourceUrl}"`;
  try {
    execSync(dlCmd, { stdio: 'inherit' });
  } catch {
    console.warn('[TranscribeWorker] Fast format failed, trying fallback…');
    const fallback = `"${ytdlpExe}" --extractor-args "youtube:player_client=android,web" -f "ba/b" --no-part --no-playlist -o "${rawAudioPath}" "${sourceUrl}"`;
    execSync(fallback, { stdio: 'inherit' });
  }

  if (!fs.existsSync(rawAudioPath)) throw new Error(`Audio download failed — file not created`);
  const rawMb = (fs.statSync(rawAudioPath).size / 1024 / 1024).toFixed(1);
  console.log(`[TranscribeWorker] Audio downloaded (${rawMb} MB). Compressing…`);

  // ── Step 2: Compress to 16kHz 16kbps mono MP3 ──────────────────────────────
  await setJobProgress(job.id, 30, 'Compressing audio to 16 kHz…');
  execSync(`ffmpeg -y -i "${rawAudioPath}" -ac 1 -ar 16000 -b:a 16k "${compAudioPath}"`, { stdio: 'inherit' });

  if (!fs.existsSync(compAudioPath)) throw new Error('FFmpeg compression failed');
  const compMb = parseFloat((fs.statSync(compAudioPath).size / 1024 / 1024).toFixed(2));
  console.log(`[TranscribeWorker] Compressed (${compMb} MB). Transcribing…`);

  // ── Step 3: Groq Whisper transcription (chunk if > 24 MB) ──────────────────
  await setJobProgress(job.id, 45, 'Transcribing speech with Groq Whisper…');
  await setProjectStatus(job.project_id, 'transcribing');

  let allWords: Array<{ word: string; start: number; end: number }> = [];
  let allText  = '';
  let totalDuration = 0;

  const MAX_MB = 23;

  if (compMb <= MAX_MB) {
    // Single pass
    const result: any = await groq.audio.transcriptions.create({
      file: fs.createReadStream(compAudioPath),
      model: 'whisper-large-v3-turbo',
      response_format: 'verbose_json',
      timestamp_granularities: ['word', 'segment'],
    });
    allText     = result.text || '';
    totalDuration = Math.round(result.duration || 0);
    allWords    = extractWords(result);
  } else {
    // Split audio into 10-min chunks
    await setJobProgress(job.id, 40, 'Splitting long audio into chunks…');
    const chunkDuration = 600; // seconds
    let offset = 0;
    let chunkIdx = 0;
    while (offset < totalDuration || chunkIdx === 0) {
      const chunkPath = path.join(TEMP_DIR, `chunk_${project.id}_${ts}_${chunkIdx}.mp3`);
      const cmd = `ffmpeg -y -i "${compAudioPath}" -ss ${offset} -t ${chunkDuration} "${chunkPath}"`;
      execSync(cmd, { stdio: 'pipe' });
      if (!fs.existsSync(chunkPath) || fs.statSync(chunkPath).size < 1000) break;

      const res: any = await groq.audio.transcriptions.create({
        file: fs.createReadStream(chunkPath),
        model: 'whisper-large-v3-turbo',
        response_format: 'verbose_json',
        timestamp_granularities: ['word', 'segment'],
      });
      allText += (res.text || '') + ' ';
      const dur = Math.round(res.duration || 0);
      const words = extractWords(res, offset);
      allWords.push(...words);
      totalDuration += dur;
      if (fs.existsSync(chunkPath)) fs.unlinkSync(chunkPath);
      offset += chunkDuration;
      if (dur < chunkDuration) break;
      chunkIdx++;
    }
  }

  // ── Step 4: Save to Supabase ────────────────────────────────────────────────
  await setJobProgress(job.id, 85, 'Saving transcript to database…');
  await supabase.from('projects').update({
    transcript_text: allText.trim(),
    transcript_json: { text: allText.trim(), words: allWords, duration: totalDuration },
    duration_sec: totalDuration,
    status: 'analyzing'
  }).eq('id', project.id);

  // ── Step 5: Cleanup + queue analyze ────────────────────────────────────────
  [rawAudioPath, compAudioPath].forEach(f => { try { if (fs.existsSync(f)) fs.unlinkSync(f); } catch {} });

  await supabase.from('jobs').update({
    status: 'done', progress_pct: 100, stage_label: 'Transcription complete!',
    completed_at: new Date().toISOString(), finished_at: new Date().toISOString()
  }).eq('id', job.id);

  await supabase.from('jobs').insert({
    project_id: job.project_id, user_id: job.user_id, type: 'analyze', status: 'queued'
  });

  console.log(`[TranscribeWorker] Done! ${totalDuration}s of audio transcribed → ${allWords.length} words.`);
}

function extractWords(result: any, offsetSec = 0): Array<{ word: string; start: number; end: number }> {
  const out: Array<{ word: string; start: number; end: number }> = [];
  if (result.words && Array.isArray(result.words)) {
    for (const w of result.words) {
      out.push({ word: w.word, start: +(w.start + offsetSec).toFixed(2), end: +(w.end + offsetSec).toFixed(2) });
    }
  } else if (result.segments && Array.isArray(result.segments)) {
    for (const seg of result.segments) {
      const segWords = (seg.text || '').trim().split(/\s+/);
      const segStart = (seg.start || 0) + offsetSec;
      const segEnd   = (seg.end   || segStart + 1) + offsetSec;
      const step     = (segEnd - segStart) / Math.max(segWords.length, 1);
      segWords.forEach((w: string, i: number) => {
        out.push({ word: w, start: +(segStart + i * step).toFixed(2), end: +(segStart + (i + 1) * step).toFixed(2) });
      });
    }
  }
  return out;
}

// ── poll loop ─────────────────────────────────────────────────────────────────
async function poll() {
  try {
    const { data: jobs } = await supabase
      .from('jobs').select('*')
      .eq('type', 'transcribe').eq('status', 'queued')
      .order('created_at', { ascending: true }).limit(1);

    if (jobs && jobs.length > 0) {
      try {
        await processTranscribeJob(jobs[0]);
      } catch (err: any) {
        console.error(`[TranscribeWorker] Job ${jobs[0].id} failed:`, err.message);
        await supabase.from('jobs').update({
          status: 'failed', stage_label: 'Failed — check error log',
          error_msg: err.message, finished_at: new Date().toISOString()
        }).eq('id', jobs[0].id);
        await setProjectStatus(jobs[0].project_id, 'failed', err.message);
      }
    }
  } catch (err: any) {
    console.error('[TranscribeWorker] Poll error:', err.message);
  } finally {
    setTimeout(poll, 4000);
  }
}

console.log('[TranscribeWorker] Started — polling every 4s');
poll();
