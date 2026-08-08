import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    // Exchange the auth code for a browser session cookie
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect to dashboard after successful verification
  return NextResponse.redirect(new URL('/dashboard', req.url));
}
