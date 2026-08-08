import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { query, userId } = await req.json();

    if (!query || !userId) {
      return NextResponse.json({ error: 'Query and userId are required' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

    const nvidiaKey = process.env.NVIDIA_API_KEY;

    // If NVIDIA API key is not set, fall back to keyword search
    if (!nvidiaKey) {
      console.warn('[Search] NVIDIA_API_KEY not set — falling back to keyword search');
      const { data: clips, error } = await supabaseAdmin
        .from('clips')
        .select('id, title, hook, spark_score, output_url, duration_sec')
        .eq('user_id', userId)
        .ilike('title', `%${query}%`)
        .limit(5);

      if (error) {
        return NextResponse.json({ error: 'Database search failed' }, { status: 500 });
      }
      return NextResponse.json({ clips });
    }

    // Vector search path (requires NVIDIA_API_KEY + pgvector RPC)
    const embedRes = await fetch('https://integrate.api.nvidia.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${nvidiaKey}`,
      },
      body: JSON.stringify({
        model: 'nvidia/nv-embed-v1',
        input: query,
        encoding_format: 'float',
      }),
    });

    if (!embedRes.ok) {
      const err = await embedRes.text();
      console.error('[Search] Embedding API error:', err);
      return NextResponse.json({ error: 'Embedding failed' }, { status: 502 });
    }

    const embedJson = await embedRes.json();
    const queryEmbedding = embedJson.data?.[0]?.embedding;

    if (!queryEmbedding) {
      return NextResponse.json({ error: 'No embedding returned' }, { status: 502 });
    }

    const { data: clips, error } = await supabaseAdmin.rpc('search_clips_by_embedding', {
      query_embedding: queryEmbedding,
      match_threshold: 0.5,
      match_count: 5,
      p_user_id: userId,
    });

    if (error) {
      console.error('[Search] Supabase RPC error:', error);
      return NextResponse.json({ error: 'Database search failed' }, { status: 500 });
    }

    return NextResponse.json({ clips });
  } catch (error: any) {
    console.error('[Search] Unexpected error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
