import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import * as dotenv from 'dotenv';

const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) dotenv.config({ path: envPath });
else dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase    = createClient(supabaseUrl, serviceKey);
const ytdlpExe    = process.env.YTDLP_PATH || 'yt-dlp';

const TEMP_DIR = path.join(__dirname, '../temp');
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

console.log('[RenderWorker] Started — polling for render jobs…');

// ── caption style configs ─────────────────────────────────────────────────────
const STYLES: Record<string, { font: string; size: number; primary: string; outline: string; bold: number }> = {
  cyberpunk:   { font: 'Impact',    size: 72, primary: '&H00FFFF&', outline: '&H00000000&', bold: 1 },
  fire:        { font: 'Anton',     size: 80, primary: '&H0000FF&', outline: '&H00000000&', bold: 1 },
  minimal:     { font: 'Inter',     size: 60, primary: '&HFFFFFF&', outline: '&H00000000&', bold: 0 },
  viral_pink:  { font: 'Montserrat',size: 76, primary: '&HFF69B4&', outline: '&H00000000&', bold: 1 },
  green:       { font: 'Impact',    size: 72, primary: '&H00FF00&', outline: '&H00000000&', bold: 1 },
  neon_cyberpunk: { font: 'Impact', size: 72, primary: '&H00FFFF&', outline: '&H00000000&', bold: 1 },
};

function generateAssSubtitles(
  clipWords: Array<{ word: string; start: number; end: number }>,
  styleId: string,
  brandKit?: any
): string {
  const s = STYLES[styleId] || STYLES['cyberpunk'];
  const font     = brandKit?.primary_font  || s.font;
  const size     = brandKit?.font_size     || s.size;
  const primary  = brandKit?.text_color    ? hexToAss(brandKit.text_color)    : s.primary;
  const outColor = brandKit?.stroke_color  ? hexToAss(brandKit.stroke_color)  : s.outline;
  const strokeW  = brandKit?.stroke_width  ?? 4;

  let ass = `[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,${font},${size},${primary},${primary},${outColor},&H80000000&,${s.bold},0,0,0,100,100,0,0,1,${strokeW},0,2,80,80,320,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  // Group words into lines of 3
  const CHUNK = 3;
  const textCase = brandKit?.text_case || 'uppercase';
  for (let i = 0; i < clipWords.length; i += CHUNK) {
    const chunk = clipWords.slice(i, i + CHUNK);
    if (!chunk.length) continue;
    const start = chunk[0].start;
    const end   = chunk[chunk.length - 1].end;
    const text  = chunk.map(w => transformCase(w.word, textCase)).join(' ');
    ass += `Dialogue: 0,${fmtTime(start)},${fmtTime(end)},Default,,0,0,0,,${text}\n`;
  }
  return ass;
}

function fmtTime(sec: number) {
  const h  = Math.floor(sec / 3600);
  const m  = Math.floor((sec % 3600) / 60);
  const s  = Math.floor(sec % 60);
  const cs = Math.floor((sec % 1) * 100);
  return `${h}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}.${cs.toString().padStart(2,'0')}`;
}

function hexToAss(hex: string): string {
  const c = hex.replace('#','');
  if (c.length !== 6) return '&HFFFFFF&';
  const r = c.slice(0,2), g = c.slice(2,4), b = c.slice(4,6);
  return `&H${b}${g}${r}&`;
}

function transformCase(word: string, mode: string) {
  switch (mode) {
    case 'uppercase':   return word.toUpperCase();
    case 'lowercase':   return word.toLowerCase();
    case 'capitalize':  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    default:            return word;
  }
}

// ── main processing ───────────────────────────────────────────────────────────
async function processRenderJob(job: any) {
  console.log(`[RenderWorker] Claimed render job ${job.id} → clip ${job.clip_id}`);

  await supabase.from('jobs').update({
    status: 'processing', progress_pct: 5,
    stage_label: 'Preparing render…', started_at: new Date().toISOString()
  }).eq('id', job.id);

  const { data: clip, error: cErr } = await supabase.from('clips').select('*').eq('id', job.clip_id).single();
  if (cErr || !clip) throw new Error(`Clip ${job.clip_id} not found`);
  await supabase.from('clips').update({ status: 'rendering' }).eq('id', clip.id);

  const { data: project } = await supabase.from('projects').select('*').eq('id', clip.project_id).single();
  if (!project) throw new Error(`Project ${clip.project_id} not found`);

  // Fetch user brand kit (if exists)
  const { data: brandKit } = await supabase.from('brand_kits').select('*').eq('user_id', job.user_id).single();

  const startSec     = clip.start_time  || clip.start_sec  || 0;
  const endSec       = clip.end_time    || clip.end_sec    || (startSec + 45);
  const aspectRatio  = clip.aspect_ratio || '9:16';
  const captionStyle = clip.caption_style || 'cyberpunk';

  const rawSlicePath  = path.join(TEMP_DIR, `slice_${clip.id}.mp4`);
  const assPath       = path.join(TEMP_DIR, `subs_${clip.id}.ass`);
  const finalPath     = path.join(TEMP_DIR, `render_${clip.id}.mp4`);

  [rawSlicePath, assPath, finalPath].forEach(f => { try { if (fs.existsSync(f)) fs.unlinkSync(f); } catch {} });

  // ── Step 1: Download video segment ─────────────────────────────────────────
  await supabase.from('jobs').update({ progress_pct: 20, stage_label: 'Downloading video segment…' }).eq('id', job.id);
  console.log(`[RenderWorker] Downloading ${startSec}s → ${endSec}s`);

  const dlCmd = `"${ytdlpExe}" --download-sections "*${startSec}-${endSec}" -f "bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best" --force-keyframes-at-cuts --no-part --merge-output-format mp4 -o "${rawSlicePath}" "${project.source_url}"`;
  try {
    execSync(dlCmd, { stdio: 'pipe' });
  } catch {
    const fallback = `"${ytdlpExe}" --download-sections "*${startSec}-${endSec}" -f "best" --force-keyframes-at-cuts -o "${rawSlicePath}" "${project.source_url}"`;
    execSync(fallback, { stdio: 'pipe' });
  }

  if (!fs.existsSync(rawSlicePath)) throw new Error('Video slice download failed');
  const sliceMb = (fs.statSync(rawSlicePath).size / 1024 / 1024).toFixed(1);
  console.log(`[RenderWorker] Slice ready (${sliceMb} MB). Building captions…`);

  // ── Step 2: Build caption words (relative timestamps) ──────────────────────
  await supabase.from('jobs').update({ progress_pct: 45, stage_label: 'Generating captions…' }).eq('id', job.id);

  let words: Array<{ word: string; start: number; end: number }> = [];
  if (clip.captions_json && Array.isArray(clip.captions_json)) {
    words = clip.captions_json.map((w: any) => ({
      word: w.word, start: Math.max(0, w.start - startSec), end: Math.max(0, w.end - startSec)
    }));
  } else if (project.transcript_json?.words) {
    words = (project.transcript_json.words as any[])
      .filter(w => w.start >= startSec && w.end <= endSec + 1)
      .map(w => ({ word: w.word, start: w.start - startSec, end: w.end - startSec }));
  }

  const assText = generateAssSubtitles(words, captionStyle, brandKit || undefined);
  fs.writeFileSync(assPath, assText, 'utf-8');

  // ── Step 3: FFmpeg render with aspect ratio ─────────────────────────────────
  await supabase.from('jobs').update({ progress_pct: 60, stage_label: 'Rendering with FFmpeg…' }).eq('id', job.id);

  const escapedAss = assPath.replace(/\\/g, '/').replace(/:/g, '\\:');
  let vf: string;
  if (aspectRatio === '9:16') {
    vf = `crop=ih*9/16:ih:(iw-ow)/2:0,scale=1080:1920:flags=lanczos,subtitles='${escapedAss}'`;
  } else if (aspectRatio === '1:1') {
    vf = `crop=ih:ih:(iw-ow)/2:0,scale=1080:1080:flags=lanczos,subtitles='${escapedAss}'`;
  } else {
    // 16:9
    vf = `scale=1920:1080:flags=lanczos,subtitles='${escapedAss}'`;
  }

  const ffmpegCmd = `ffmpeg -y -i "${rawSlicePath}" -vf "${vf}" -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 128k -movflags +faststart "${finalPath}"`;
  try {
    execSync(ffmpegCmd, { stdio: 'pipe' });
  } catch (ffErr: any) {
    console.warn('[RenderWorker] Subtitle render failed, trying without subtitles…');
    let vfFallback: string;
    if (aspectRatio === '9:16') vfFallback = 'crop=ih*9/16:ih:(iw-ow)/2:0,scale=1080:1920:flags=lanczos';
    else if (aspectRatio === '1:1') vfFallback = 'crop=ih:ih:(iw-ow)/2:0,scale=1080:1080:flags=lanczos';
    else vfFallback = 'scale=1920:1080:flags=lanczos';
    execSync(`ffmpeg -y -i "${rawSlicePath}" -vf "${vfFallback}" -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 128k -movflags +faststart "${finalPath}"`, { stdio: 'pipe' });
  }

  if (!fs.existsSync(finalPath)) throw new Error('FFmpeg rendering failed');

  // ── Step 4: Upload to Supabase Storage ─────────────────────────────────────
  await supabase.from('jobs').update({ progress_pct: 85, stage_label: 'Uploading to cloud storage…' }).eq('id', job.id);
  console.log(`[RenderWorker] Uploading MP4 to Supabase Storage…`);

  const fileBuffer = fs.readFileSync(finalPath);
  const storagePath = `${job.user_id}/${clip.project_id}/${clip.id}.mp4`;

  const { error: uploadErr } = await supabase.storage.from('clips').upload(storagePath, fileBuffer, {
    contentType: 'video/mp4', upsert: true
  });
  if (uploadErr) console.error('[RenderWorker] Upload error:', uploadErr.message);

  const { data: publicData } = supabase.storage.from('clips').getPublicUrl(storagePath);
  const outputUrl = publicData.publicUrl;

  await supabase.from('clips').update({ output_url: outputUrl, status: 'completed' }).eq('id', clip.id);
  await supabase.from('jobs').update({
    status: 'done', progress_pct: 100, stage_label: 'Render complete!',
    completed_at: new Date().toISOString(), finished_at: new Date().toISOString()
  }).eq('id', job.id);

  // ── Step 5: Check if all render jobs done for project ──────────────────────
  const { count } = await supabase.from('jobs')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', clip.project_id).eq('type', 'render').neq('status', 'done');
  if ((count || 0) === 0) {
    await supabase.from('projects').update({ status: 'ready' }).eq('id', clip.project_id);
    console.log(`[RenderWorker] All renders done for project ${clip.project_id} → status: ready`);
  }

  // ── Step 6: Cleanup ─────────────────────────────────────────────────────────
  [rawSlicePath, assPath, finalPath].forEach(f => { try { if (fs.existsSync(f)) fs.unlinkSync(f); } catch {} });
  console.log(`[RenderWorker] Render complete for clip ${clip.id} → ${outputUrl}`);
}

// ── poll loop ─────────────────────────────────────────────────────────────────
async function poll() {
  try {
    const { data: jobs } = await supabase
      .from('jobs').select('*')
      .eq('type', 'render').eq('status', 'queued')
      .order('created_at', { ascending: true }).limit(1);

    if (jobs && jobs.length > 0) {
      try {
        await processRenderJob(jobs[0]);
      } catch (err: any) {
        console.error(`[RenderWorker] Job ${jobs[0].id} failed:`, err.message);
        await supabase.from('jobs').update({
          status: 'failed', stage_label: 'Render failed — check error log',
          error_msg: err.message, finished_at: new Date().toISOString()
        }).eq('id', jobs[0].id);
        if (jobs[0].clip_id) await supabase.from('clips').update({ status: 'failed' }).eq('id', jobs[0].clip_id);
      }
    }
  } catch (err: any) {
    console.error('[RenderWorker] Poll error:', err.message);
  } finally {
    setTimeout(poll, 4000);
  }
}

poll();
