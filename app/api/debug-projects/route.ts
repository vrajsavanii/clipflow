import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = await createClient();
  
  // 1. Who is logged in?
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  
  if (authErr || !user) {
    return NextResponse.json({ 
      error: 'Not authenticated',
      authErr: authErr?.message 
    });
  }

  // 2. Can we see projects for this user?
  const { data: projects, error: projErr } = await supabase
    .from('projects')
    .select('id, status, created_at, user_id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // 3. What does auth.uid() return? (test with a raw query)
  const { data: rawUser } = await supabase
    .from('profiles')
    .select('id, plan')
    .eq('id', user.id)
    .single();

  return NextResponse.json({
    auth_user_id: user.id,
    auth_email: user.email,
    profiles_table_row: rawUser,
    projects_count: projects?.length ?? 0,
    projects: projects ?? [],
    projects_error: projErr?.message ?? null,
  });
}
