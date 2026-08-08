'use server'

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function deleteProjectAction(projectId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  // Manually cascade delete to ensure no foreign key errors
  await supabase.from('jobs').delete().eq('project_id', projectId);
  await supabase.from('captions').delete().eq('project_id', projectId);
  await supabase.from('clips').delete().eq('project_id', projectId);

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(error.message);
  }

  // Tell Next.js to re-fetch Server Components on these paths
  revalidatePath('/projects');
  revalidatePath('/dashboard');
  
  return { success: true };
}
