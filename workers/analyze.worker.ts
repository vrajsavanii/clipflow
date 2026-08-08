import { createClient } from '@supabase/supabase-js';
import Groq from 'groq-sdk';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) dotenv.config({ path: envPath });
else dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const groqApiKey  = process.env.GROQ_API_KEY!;
const nvidiaKey   = process.env.NVIDIA_API_KEY;

const supabase = createClient(supabaseUrl, serviceKey);
const groq     = new Groq({ apiKey: groqApiKey });

console.log('[AnalyzeWorker] Started — polling for analyze jobs…');

// ── helpers ───────────────────────────────────────────────────────────────────
async function setJobProgress(jobId: string, pct: number, label: string) {
  await supabase.from('jobs').update({ progress_pct: pct, stage_label: label }).eq('id', jobId);
}

async function groqWithBackoff(payload: any, retries = 4): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      return await groq.chat.completions.create(payload);
    } catch (err: any) {
      if (err?.status === 429 && i < retries - 1) {
        const wait = Math.pow(2, i + 1) * 1000;
        console.warn(`[AnalyzeWorker] Groq rate-limited. Waiting ${wait / 1000}s…`);
        await new Promise(r => setTimeout(r, wait));
      } else {
        throw err;
      }
    }
  }
}

async function buildClipEmbedding(clipId: string, projectId: string, userId: string, text: string) {
  if (!nvidiaKey) return;
  try {
    const res = await fetch('https://integrate.api.nvidia.com/v1/embeddings', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${nvidiaKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'nvidia/nv-embed-v2', input: [text], input_type: 'passage', encoding_format: 'float' })
    });
    const data: any = await res.json();
    const embedding = data?.data?.[0]?.embedding;
    if (embedding) {
      await supabase.from('clip_embeddings').upsert({
        clip_id: clipId, project_id: projectId, user_id: userId, content: text, embedding
      }, { onConflict: 'clip_id' });
    }
  } catch (e: any) {
    console.warn('[AnalyzeWorker] Embedding generation skipped:', e.message);
  }
}

// ── main processing ───────────────────────────────────────────────────────────
async function processAnalyzeJob(job: any) {
  console.log(`[AnalyzeWorker] Claimed job ${job.id} → project ${job.project_id}`);

  await supabase.from('jobs').update({
    status: 'processing', progress_pct: 5,
    stage_label: 'Reading transcript…', started_at: new Date().toISOString()
  }).eq('id', job.id);
  await supabase.from('projects').update({ status: 'analyzing' }).eq('id', job.project_id);

  const { data: project, error: pErr } = await supabase.from('projects').select('*').eq('id', job.project_id).single();
  if (pErr || !project) throw new Error(`Project ${job.project_id} not found`);

  const transcriptText = project.transcript_text || project.transcript_json?.text || '';
  if (!transcriptText) throw new Error('Project has no transcript_text');

  const duration = project.duration_sec || 0;
  console.log(`[AnalyzeWorker] Transcript: ${transcriptText.length} chars, ${duration}s duration`);

  await setJobProgress(job.id, 20, 'Detecting viral hook moments with AI…');

  // ── Build prompt ──────────────────────────────────────────────────────────
  const prompt = `You are a world-class viral short-form video editor for TikTok, YouTube Shorts, and Instagram Reels.
Analyze this transcript and identify the TOP 5 MOST VIRAL clip moments.

RULES FOR SELECTION:
- Each clip must be 30–90 seconds long
- Must have a powerful HOOK in the first 3 seconds
- Should contain: surprising facts, emotional peaks, debate, humor, or "aha" moments
- Complete thoughts only — no cut-off sentences
- Clips must NOT overlap

SCORING (spark_score 0–100):
- 80–100: Killer hook + high emotion + surprising/controversial = stops scrolling
- 60–79: Strong content, clear value, good pacing
- 40–59: Average, needs trimming
- <40: Skip — not viral

TRANSCRIPT (${duration}s total):
${transcriptText.substring(0, 18000)}

Return ONLY a valid JSON object with this exact structure:
{
  "clips": [
    {
      "start_sec": 45,
      "end_sec": 92,
      "title": "Short attention-grabbing title (max 60 chars)",
      "hook_text": "The exact opening line that makes someone stop scrolling",
      "explanation": "2-3 sentences: WHY this moment is viral-worthy and what emotion it triggers",
      "spark_score": 87,
      "improvement_tips": ["Add bold text hook overlay in first 2 seconds", "Cut last 5 seconds for better pacing"],
      "target_platforms": ["TikTok", "Instagram Reels"],
      "emotion": "curiosity",
      "caption_style": "cyberpunk",
      "caption_keywords": ["keyword1", "keyword2"]
    }
  ]
}`;

  const completion = await groqWithBackoff({
    messages: [{ role: 'user', content: prompt }],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.25,
    max_tokens: 3000,
    response_format: { type: 'json_object' }
  });

  await setJobProgress(job.id, 65, 'Processing AI clip selections…');

  const rawJson = completion.choices[0]?.message?.content || '{}';
  let parsed: any;
  try { parsed = JSON.parse(rawJson); }
  catch { throw new Error(`AI returned invalid JSON: ${rawJson.substring(0, 200)}`); }

  const clipsRaw: any[] = parsed.clips || [];
  console.log(`[AnalyzeWorker] AI found ${clipsRaw.length} clips`);

  if (clipsRaw.length === 0) throw new Error('AI analysis returned 0 clips');

  // ── Dedup overlapping clips ─────────────────────────────────────────────
  const sorted = [...clipsRaw].sort((a, b) => (b.spark_score || 0) - (a.spark_score || 0));
  const deduped: any[] = [];
  for (const c of sorted) {
    const overlap = deduped.some(d =>
      !(c.end_sec <= d.start_sec || c.start_sec >= d.end_sec) &&
      Math.min(c.end_sec, d.end_sec) - Math.max(c.start_sec, d.start_sec) > 15
    );
    if (!overlap) deduped.push(c);
    if (deduped.length >= 8) break;
  }

  await setJobProgress(job.id, 75, `Saving ${deduped.length} clips to database…`);

  // ── Extract word-level captions for each clip ──────────────────────────
  const allWords: Array<{ word: string; start: number; end: number }> = project.transcript_json?.words || [];

  const insertedClips: any[] = [];
  for (const c of deduped) {
    const startSec = +(c.start_sec || 0);
    const endSec   = +(c.end_sec   || startSec + 45);
    const durSec   = Math.max(5, Math.round(endSec - startSec));
    const clipWords = allWords.filter(w => w.start >= startSec && w.end <= endSec + 1);

    const { data: newClip, error: cErr } = await supabase.from('clips').insert({
      project_id:      project.id,
      user_id:         job.user_id,
      title:           c.title || 'Viral Clip',
      hook_text:       c.hook_text || c.title,
      explanation:     c.explanation || '',
      improvement_tips: Array.isArray(c.improvement_tips) ? c.improvement_tips : [c.improvement_tips || 'Great clip!'],
      start_time:      startSec,
      end_time:        endSec,
      duration_sec:    durSec,
      spark_score:     Math.min(100, Math.max(0, c.spark_score || 80)),
      captions_json:   clipWords,
      caption_style:   c.caption_style || 'cyberpunk',
      aspect_ratio:    '9:16',
      status:          'queued'
    }).select().single();

    if (cErr) {
      console.error('[AnalyzeWorker] Clip insert error:', cErr.message);
    } else if (newClip) {
      insertedClips.push(newClip);
      // Queue render job
      await supabase.from('jobs').insert({
        project_id: project.id, user_id: job.user_id, clip_id: newClip.id,
        type: 'render', status: 'queued'
      });
      // Build NVIDIA NIM embedding (async, non-blocking)
      const embeddingText = `${c.title} ${c.hook_text || ''} ${c.explanation || ''}`.trim();
      buildClipEmbedding(newClip.id, project.id, job.user_id, embeddingText).catch(() => {});
    }
  }

  await setJobProgress(job.id, 95, `Analysis complete — ${insertedClips.length} clips ready!`);
  await supabase.from('projects').update({ status: 'rendering' }).eq('id', job.project_id);
  await supabase.from('jobs').update({
    status: 'done', progress_pct: 100,
    stage_label: `Analysis done — ${insertedClips.length} clips queued`,
    completed_at: new Date().toISOString(), finished_at: new Date().toISOString()
  }).eq('id', job.id);

  console.log(`[AnalyzeWorker] Done! ${insertedClips.length} clips queued for rendering.`);
}

// ── poll loop ─────────────────────────────────────────────────────────────────
async function poll() {
  try {
    const { data: jobs } = await supabase
      .from('jobs').select('*')
      .eq('type', 'analyze').eq('status', 'queued')
      .order('created_at', { ascending: true }).limit(1);

    if (jobs && jobs.length > 0) {
      try {
        await processAnalyzeJob(jobs[0]);
      } catch (err: any) {
        console.error(`[AnalyzeWorker] Job ${jobs[0].id} failed:`, err.message);
        await supabase.from('jobs').update({
          status: 'failed', stage_label: 'AI analysis failed — see error log',
          error_msg: err.message, finished_at: new Date().toISOString()
        }).eq('id', jobs[0].id);
        await supabase.from('projects').update({ status: 'failed', error_msg: err.message }).eq('id', jobs[0].project_id);
      }
    }
  } catch (err: any) {
    console.error('[AnalyzeWorker] Poll error:', err.message);
  } finally {
    setTimeout(poll, 4000);
  }
}

poll();
