import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ProjectDetailClient } from './ProjectDetailClient';

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { id } = await params;

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!project) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center border border-red-500/20 bg-red-950/5 rounded-2xl p-8 text-center glass-panel max-w-lg mx-auto mt-12">
        <AlertCircleIcon />
        <h2 className="text-xl font-bold text-white mb-2">Project not found</h2>
        <p className="text-gray-400 text-sm max-w-md">This project does not exist or has been deleted.</p>
        <Link href="/projects" className="mt-6 px-5 py-2 bg-[#222] hover:bg-[#333] border border-[#333] text-white rounded-lg transition-colors text-sm">
          Back to Projects
        </Link>
      </div>
    );
  }

  const { data: clips } = await supabase
    .from('clips')
    .select('*')
    .eq('project_id', id)
    .order('spark_score', { ascending: false });

  const isProcessing = project.status !== 'analyzing_done' && project.status !== 'done' && project.status !== 'ready' && project.status !== 'failed';
  const isFailed = project.status === 'failed';
  const isReady = !isProcessing && !isFailed;

  const projectData = {
    id: project.id,
    title: project.visual_analysis_json?.ai_project_title || 'Project Analysis',
    sourceUrl: project.source_url,
    status: project.status,
    isProcessing,
    isReady,
    isFailed,
    duration: project.duration_sec || 0,
    language: project.language || null,
    createdAt: project.created_at,
    transcriptText: project.transcript_text || null,
  };

  const clipsData = (clips || []).map(c => ({
    id: c.id,
    title: c.title || 'Untitled Clip',
    hook: c.hook || null,
    hookType: c.hook_type || null,
    sparkScore: c.spark_score || 0,
    durationSec: c.duration_sec || 0,
    startSec: c.start_sec || 0,
    endSec: c.end_sec || 0,
    outputUrl: c.output_url || null,
    status: c.status || 'pending',
    scoreBreakdown: c.score_breakdown || null,
    improvementTips: c.improvement_tips || [],
    captionStyle: c.caption_style || null,
    hookSentence: c.hook_sentence || null,
    hookRewrite: c.hook_rewrite || null,
    captionHook: c.caption_hook || null,
    whyViral: c.why_viral || null,
    storyArc: c.story_arc || null,
  }));

  return (
    <ProjectDetailClient
      project={projectData}
      clips={clipsData}
    />
  );
}

function AlertCircleIcon() {
  return (
    <svg className="w-12 h-12 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
  );
}
