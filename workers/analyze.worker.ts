import { createClient } from '@supabase/supabase-js';
import Groq from 'groq-sdk';
import * as fs from 'fs';
import * as path from 'path';
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
const groq = new Groq({ apiKey: groqApiKey });

console.log('[AnalyzeWorker] Worker initialized. Polling for queued analyze jobs...');

async function processAnalyzeJob(job: any) {
  console.log(`[AnalyzeWorker] Claimed job ${job.id} for project ${job.project_id}`);

  await supabase.from('jobs').update({ status: 'processing', progress_pct: 10, started_at: new Date().toISOString() }).eq('id', job.id);
  await supabase.from('projects').update({ status: 'analyzing' }).eq('id', job.project_id);

  const { data: project, error: pErr } = await supabase.from('projects').select('*').eq('id', job.project_id).single();
  if (pErr || !project) throw new Error(`Project ${job.project_id} not found`);

  const transcriptJson = project.transcript_json;
  const transcriptText = project.transcript_text || transcriptJson?.text || '';

  if (!transcriptText) {
    throw new Error(`Project ${project.id} has no transcript_text`);
  }

  console.log(`[AnalyzeWorker] Analyzing transcript (${transcriptText.length} chars, duration: ${project.duration_sec}s)...`);
  await supabase.from('jobs').update({ progress_pct: 30 }).eq('id', job.id);

  // Send to Groq Llama-3.3-70b-versatile to extract top viral clips
  const prompt = `You are a world-class viral short-form video editor (TikTok, YouTube Shorts, Instagram Reels).
Analyze this video transcript and extract the TOP 3 to 5 MOST VIRAL, high-engagement clip segments.
Target duration per clip: 30 to 75 seconds.

Requirements for each clip:
1. Strong, immediate attention-grabbing HOOK in the first 3-5 seconds.
2. Complete narrative or insightful punchline (high value, shocking truth, debate, or emotion).
3. Ideal for 9:16 vertical shorts.

TRANSCRIPT:
${transcriptText.substring(0, 15000)}

Respond ONLY as a valid JSON object with key "clips", containing an array of objects:
{
  "clips": [
    {
      "start_sec": 12,
      "end_sec": 58,
      "title": "Why America Is Losing Its Global Dominance",
      "hook": "America is no longer the sole superpower of the world.",
      "subtitle": "Ian Bremmer breaks down the shifting global power dynamics.",
      "spark_score": 92,
      "score_breakdown": {
        "hook": 19,
        "story": 18,
        "emotion": 18,
        "shareability": 19,
        "platform_fit": 18
      },
      "improvement_tips": "Start directly with the provocative claim, cut intro filler.",
      "target_platforms": ["TikTok", "YouTube Shorts", "Instagram Reels"],
      "caption_keywords": ["America", "Geopolitics", "Superpower", "Future"],
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

  const rawJson = completion.choices[0]?.message?.content || '{}';
  let parsed: any;
  try {
    parsed = JSON.parse(rawJson);
  } catch (err) {
    console.error("[AnalyzeWorker] JSON parse error from LLM output:", rawJson);
    throw new Error("Failed to parse AI clip analysis JSON");
  }

  const clipsToInsert = parsed.clips || [];
  console.log(`[AnalyzeWorker] Extracted ${clipsToInsert.length} viral clips! Inserting into database...`);
  await supabase.from('jobs').update({ progress_pct: 70 }).eq('id', job.id);

  const insertedClips: any[] = [];
  for (const c of clipsToInsert) {
    const duration = Math.max(10, Math.round((c.end_sec || 30) - (c.start_sec || 0)));
    
    const { data: newClip, error: cErr } = await supabase.from('clips').insert({
      project_id: project.id,
      user_id: job.user_id,
      title: c.title || 'Viral Short Clip',
      hook: c.hook || c.title,
      subtitle: c.subtitle || '',
      start_sec: c.start_sec || 0,
      end_sec: c.end_sec || (c.start_sec + 45),
      duration_sec: duration,
      spark_score: c.spark_score || 85,
      score_breakdown: c.score_breakdown || { hook: 17, story: 17, emotion: 17, shareability: 17, platform_fit: 17 },
      improvement_tips: c.improvement_tips || 'Keep pacing snappy and engaging',
      target_platforms: c.target_platforms || ['TikTok', 'YouTube Shorts', 'Instagram Reels'],
      caption_keywords: c.caption_keywords || [],
      caption_style: c.caption_style || 'neon_cyberpunk',
      aspect_ratio: '9:16',
      status: 'pending'
    }).select().single();

    if (cErr) {
      console.error("[AnalyzeWorker] Error inserting clip:", cErr.message);
    } else if (newClip) {
      insertedClips.push(newClip);
      
      // Automatically queue a render job for each generated clip!
      await supabase.from('jobs').insert({
        project_id: project.id,
        user_id: job.user_id,
        clip_id: newClip.id,
        type: 'render',
        status: 'queued'
      });
    }
  }

  // Update project status to ready
  await supabase.from('projects').update({ status: 'ready' }).eq('id', job.project_id);
  await supabase.from('jobs').update({ status: 'done', progress_pct: 100, finished_at: new Date().toISOString() }).eq('id', job.id);

  console.log(`[AnalyzeWorker] Project ${job.project_id} analysis complete! ${insertedClips.length} clips queued for rendering.`);
}

async function poll() {
  try {
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('type', 'analyze')
      .eq('status', 'queued')
      .order('created_at', { ascending: true })
      .limit(1);

    if (error) {
      console.error('[AnalyzeWorker] Poll error:', error.message);
    } else if (jobs && jobs.length > 0) {
      const job = jobs[0];
      try {
        await processAnalyzeJob(job);
      } catch (err: any) {
        console.error(`[AnalyzeWorker] Job ${job.id} failed:`, err.message || err);
        await supabase.from('jobs').update({
          status: 'failed',
          error_msg: err.message || 'Analyze worker error',
          finished_at: new Date().toISOString()
        }).eq('id', job.id);
        await supabase.from('projects').update({ status: 'failed' }).eq('id', job.project_id);
      }
    }
  } catch (err: any) {
    console.error('[AnalyzeWorker] Unexpected error in poll:', err);
  } finally {
    setTimeout(poll, 3000);
  }
}

poll();
