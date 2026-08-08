import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { url, file_path } = await req.json();
    if (!url && !file_path) return NextResponse.json({ error: 'URL or File Path is required' }, { status: 400 });

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    // Quota check before ingestion
    const { data: userRow } = await supabase
      .from('users')
      .select('plan, credits_remaining, minutes_used_this_month, minutes_limit')
      .eq('id', userId)
      .single();

    if (userRow) {
      if (userRow.plan === 'free' && userRow.credits_remaining <= 0) {
        return NextResponse.json({ error: 'You have run out of free video credits. Upgrade to Pro to process more videos.' }, { status: 403 });
      }
      if (userRow.minutes_used_this_month >= userRow.minutes_limit) {
        return NextResponse.json({ error: `You have reached your limit of ${userRow.minutes_limit} minutes. Upgrade for more.` }, { status: 403 });
      }

      // Concurrency limit for free plan — with stuck-project escape hatch
      if (userRow.plan === 'free') {
        const { data: activeProjects, error: activeErr } = await supabase
          .from('projects')
          .select('id, status, created_at')
          .eq('user_id', userId)
          .not('status', 'in', '(ready,completed,success,failed)');

        if (!activeErr && activeProjects && activeProjects.length > 0) {
          const now = Date.now();
          const stuckThreshold = 10 * 60 * 1000; // 10 minutes
          const allStuck = activeProjects.every(p => {
            const age = now - new Date(p.created_at).getTime();
            return age > stuckThreshold && ['ingesting', 'downloading', 'queued'].includes(p.status);
          });

          if (!allStuck) {
            return NextResponse.json({
              error: 'Free plan users can only process one video at a time. Please wait for your current video to finish processing or upgrade to Pro.'
            }, { status: 429 });
          }

          // Auto-cancel stuck projects
          await supabase.from('projects').update({ status: 'failed' }).in('id', activeProjects.map(p => p.id));
          await supabase.from('jobs').update({ status: 'failed', error_msg: 'Auto-cancelled: project was stuck' }).in('project_id', activeProjects.map(p => p.id));
        }
      }
    }

    // 1. Create project
    const { data: project, error: pError } = await supabase
      .from('projects')
      .insert({
        user_id: userId,
        source_url: url || null,
        file_path: file_path || null,
        status: 'ingesting'
      })
      .select()
      .single();

    if (pError || !project) throw pError || new Error('Failed to create project');

    // 2. Create ingest job
    const { data: job, error: jError } = await supabase
      .from('jobs')
      .insert({
        project_id: project.id,
        user_id: userId,
        type: 'transcribe',
        status: 'queued'
      })
      .select()
      .single();

    if (jError || !job) throw jError || new Error('Failed to create job');

    // We rely purely on the dedicated hf-space worker engine now!
    // The worker engine will automatically pick up this 'transcribe' job.
    console.log(`[Ingest] Job queued for worker engine: ${job.id}`);

    return NextResponse.json({ projectId: project.id });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
