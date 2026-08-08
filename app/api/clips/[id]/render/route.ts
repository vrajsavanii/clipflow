import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id: clipId } = await params;

  // 1. Authenticate user
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await req.json();
    const { start_sec, end_sec, title, subtitle, caption_style, aspect_ratio } = body;

    // 2. Verify clip ownership and get project_id
    const { data: clip, error: clipError } = await supabase
      .from('clips')
      .select('*')
      .eq('id', clipId)
      .eq('user_id', session.user.id)
      .single();

    if (clipError || !clip) {
      return new NextResponse('Clip not found or access denied', { status: 404 });
    }

    // Calculate duration
    const duration = end_sec - start_sec;

    // 3. Update clip metadata
    const { error: updateError } = await supabase
      .from('clips')
      .update({
        start_sec,
        end_sec,
        duration_sec: duration,
        title: title || clip.title,
        subtitle: subtitle || clip.subtitle,
        caption_style: caption_style || clip.caption_style,
        aspect_ratio: aspect_ratio || clip.aspect_ratio,
        status: 'pending' // reset status to pending for rendering
      })
      .eq('id', clipId);

    if (updateError) {
      console.error('Error updating clip:', updateError);
      return new NextResponse('Failed to update clip metadata', { status: 500 });
    }

    // 4. Create a new render job
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .insert({
        project_id: clip.project_id,
        user_id: session.user.id,
        clip_id: clipId,
        type: 'render',
        status: 'pending',
        progress: 0
      })
      .select()
      .single();

    if (jobError) {
      console.error('Error creating render job:', jobError);
      return new NextResponse('Failed to queue render job', { status: 500 });
    }

    return NextResponse.json({ success: true, job });
  } catch (error: any) {
    console.error('Render trigger API error:', error);
    return new NextResponse(error.message || 'Internal Server Error', { status: 500 });
  }
}
