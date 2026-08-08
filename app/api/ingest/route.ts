import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

const SUPPORTED_URL_PATTERN = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch|youtu\.be\/|youtube\.com\/shorts|tiktok\.com\/@|tiktok\.com\/v|instagram\.com\/p\/|instagram\.com\/reel\/|vimeo\.com\/)/i;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url, source_url } = body;
    const sourceUrl = (url || source_url || '').trim();

    if (!sourceUrl) {
      return NextResponse.json({ error: 'A video URL is required' }, { status: 400 });
    }

    if (!SUPPORTED_URL_PATTERN.test(sourceUrl)) {
      return NextResponse.json({
        error: 'Unsupported URL. Please paste a YouTube, TikTok, Instagram, or Vimeo link.'
      }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = user.id;

    // ── Quota check via profiles table ────────────────────────────────────────
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan, credits_used, credits_limit')
      .eq('id', userId)
      .single();

    if (profile && profile.credits_used >= profile.credits_limit) {
      return NextResponse.json({
        error: `Quota exceeded: you've used ${profile.credits_used}/${profile.credits_limit} minutes this month.`,
        upgrade_url: '/pricing',
        code: 'quota_exceeded'
      }, { status: 402 });
    }

    // ── Duplicate URL check ───────────────────────────────────────────────────
    const { data: existing } = await supabase
      .from('projects')
      .select('id, status')
      .eq('user_id', userId)
      .eq('source_url', sourceUrl)
      .not('status', 'in', '(failed)')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (existing && existing.status !== 'failed') {
      return NextResponse.json({
        project_id: existing.id,
        projectId: existing.id,
        message: 'already_processing',
        status: existing.status
      }, { status: 200 });
    }

    // ── Free plan: one active project at a time ────────────────────────────────
    if (!profile || profile.plan === 'starter') {
      const { data: active } = await supabase
        .from('projects')
        .select('id, status, created_at')
        .eq('user_id', userId)
        .not('status', 'in', '(ready,failed)');

      if (active && active.length > 0) {
        const tenMinAgo = Date.now() - 10 * 60 * 1000;
        const allStuck = active.every(p => new Date(p.created_at).getTime() < tenMinAgo);
        if (!allStuck) {
          return NextResponse.json({
            error: 'Free plan: only one video at a time. Wait for current video to finish or upgrade to Pro.',
            code: 'concurrent_limit'
          }, { status: 429 });
        }
        // Auto-fail stuck projects
        await supabase.from('projects').update({ status: 'failed', error_msg: 'Auto-cancelled (stuck)' })
          .in('id', active.map(p => p.id));
      }
    }

    // ── Create project ────────────────────────────────────────────────────────
    const { data: project, error: pErr } = await supabase
      .from('projects')
      .insert({ user_id: userId, source_url: sourceUrl, status: 'ingesting' })
      .select().single();

    if (pErr || !project) throw pErr || new Error('Failed to create project');

    // ── Create transcribe job ─────────────────────────────────────────────────
    const { data: job, error: jErr } = await supabase
      .from('jobs')
      .insert({ project_id: project.id, user_id: userId, type: 'transcribe', status: 'queued' })
      .select().single();

    if (jErr || !job) throw jErr || new Error('Failed to create job');

    console.log(`[Ingest] Created project ${project.id} + job ${job.id} for user ${userId}`);

    return NextResponse.json({ projectId: project.id, jobId: job.id }, { status: 201 });
  } catch (err: any) {
    console.error('[Ingest] Error:', err.message);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
