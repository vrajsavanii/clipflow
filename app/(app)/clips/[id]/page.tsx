import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import EditorUI from './EditorUI';

export default async function ClipEditorPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ clipId?: string }>;
}) {
  const { id } = await params;
  const { clipId } = await searchParams;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  const { data: clips } = await supabase
    .from('clips')
    .select('*')
    .eq('project_id', id)
    .order('created_at', { ascending: true });

  if (!project) notFound();

  const activeClip = clipId
    ? clips?.find(c => c.id === clipId) || clips?.[0]
    : clips?.[0];

  let videoUrl: string | null = null;
  let transcript: { word: string; start_ms: number; end_ms: number }[] = [];

  if (activeClip?.output_url) {
    const { data: publicUrlData } = supabase.storage
      .from('clipflow-videos')
      .getPublicUrl(activeClip.output_url);
    videoUrl = publicUrlData.publicUrl;

    const clipStartMs = (activeClip.start_sec || 0) * 1000;
    const clipEndMs = Math.max((activeClip.end_sec || 0) * 1000, clipStartMs + 1000);

    const { data: caps } = await supabase
      .from('captions')
      .select('word, start_ms, end_ms')
      .eq('project_id', id)
      .gte('start_ms', Math.max(0, clipStartMs - 1000))
      .lte('start_ms', clipEndMs + 1000)
      .order('start_ms', { ascending: true });

    if (caps) transcript = caps;
  }

  const projectData = {
    id: project.id,
    sourceUrl: project.source_url,
    status: project.status,
    durationSec: project.duration_sec || 0,
    language: project.language || null,
    transcriptText: project.transcript_text || null,
  };

  const clipsData = (clips || []).map(c => ({
    id: c.id,
    title: c.title || 'Untitled Clip',
    hook: c.hook || null,
    sparkScore: c.spark_score || 0,
    durationSec: c.duration_sec || 0,
    startSec: c.start_sec || 0,
    endSec: c.end_sec || 0,
    outputUrl: c.output_url || null,
    status: c.status || 'pending',
    captionStyle: c.caption_style || null,
    language: project.language || null,
  }));

  const activeClipData = activeClip ? {
    id: activeClip.id,
    title: activeClip.title || 'Untitled Clip',
    hook: activeClip.hook || null,
    sparkScore: activeClip.spark_score || 0,
    durationSec: activeClip.duration_sec || 0,
    startSec: activeClip.start_sec || 0,
    endSec: activeClip.end_sec || 0,
    outputUrl: activeClip.output_url || null,
    status: activeClip.status || 'pending',
    captionStyle: activeClip.caption_style || null,
    language: project.language || null,
  } : null;

  return (
    <EditorUI
      project={projectData}
      clips={clipsData}
      activeClip={activeClipData}
      videoUrl={videoUrl}
      transcript={transcript}
    />
  );
}
