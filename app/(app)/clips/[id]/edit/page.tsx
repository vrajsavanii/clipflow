import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import ClipEditorClient from '@/components/ClipEditorClient';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ClipEditPage({ params }: PageProps) {
  const supabase = await createClient();
  const { id } = await params;

  // 1. Authenticate user
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/login');
  }

  // 2. Fetch clip
  const { data: clip, error: clipError } = await supabase
    .from('clips')
    .select('*')
    .eq('id', id)
    .single();

  if (clipError || !clip) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="glass-panel flex flex-col items-center justify-center min-h-[400px] rounded-2xl p-8">
          <h2 className="text-xl font-bold text-red-500 mb-2">Clip Not Found</h2>
          <p className="text-gray-400 text-sm">This clip either does not exist or you do not have permission to edit it.</p>
        </div>
      </div>
    );
  }

  // 3. Fetch project
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', clip.project_id)
    .single();

  if (projectError || !project) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="glass-panel flex flex-col items-center justify-center min-h-[400px] rounded-2xl p-8">
          <h2 className="text-xl font-bold text-red-500 mb-2">Project Not Found</h2>
          <p className="text-gray-400 text-sm">The parent project for this clip could not be located.</p>
        </div>
      </div>
    );
  }

  // 4. Fetch captions for transcript editing
  const { data: captions } = await supabase
    .from('captions')
    .select('*')
    .eq('project_id', clip.project_id)
    .order('start_ms', { ascending: true });

  return (
    <ClipEditorClient
      clip={clip}
      project={project}
      initialCaptions={captions || []}
    />
  );
}
