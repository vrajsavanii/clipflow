import { createClient } from '@/utils/supabase/server';
import { NextResponse, NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  
  // Authenticate user
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const path = searchParams.get('path');
  
  if (!path) {
    return new NextResponse('Path parameter is required', { status: 400 });
  }

  // Download the file from Supabase storage
  const { data, error } = await supabase.storage
    .from('clipflow-videos')
    .download(path);

  if (error || !data) {
    console.error('Storage download error:', error);
    return new NextResponse('File not found', { status: 404 });
  }

  // Stream/return the file
  const contentType = data.type || 'application/octet-stream';
  
  // Create a new response with the download blob
  const response = new NextResponse(data, {
    headers: {
      'Content-Type': contentType,
      'Content-Length': data.size.toString(),
      'Cache-Control': 'public, max-age=3600',
    },
  });

  return response;
}
