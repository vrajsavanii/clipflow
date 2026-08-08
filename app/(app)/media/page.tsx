import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getRelativeTime } from '@/lib/time';
import MediaClient, { MediaFile } from './MediaClient';

export default async function MediaLibraryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const [projectsRes, clipsRes] = await Promise.all([
    supabase.from('projects').select('*').eq('user_id', user.id),
    supabase.from('clips').select('*').eq('user_id', user.id).eq('status', 'done'),
  ]);

  const projects = projectsRes.data || [];
  const clips = clipsRes.data || [];

  const files: MediaFile[] = [];

  for (const p of projects) {
    if (p.source_url) {
      const fileName = new URL(p.source_url).pathname.split('/').pop() || 'Untitled_Source';
      const duration = p.duration_sec || 0;
      files.push({
        id: p.id,
        name: fileName,
        size: 'Unknown',
        sizeBytes: 0,
        date: getRelativeTime(p.created_at),
        timestamp: new Date(p.created_at).getTime(),
        duration: duration > 0 ? `${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}` : '--',
        durationSec: duration,
        type: 'video' as const,
        starred: false,
        views: '--',
        thumbnail: null,
        url: p.source_url,
      });
    }
  }

  for (const c of clips) {
    if (c.output_url) {
      const duration = c.duration_sec || 0;
      files.push({
        id: c.id,
        name: `${c.title || 'Clip'}.mp4`,
        size: 'Unknown',
        sizeBytes: 0,
        date: getRelativeTime(c.created_at),
        timestamp: new Date(c.created_at).getTime(),
        duration: duration > 0 ? `${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}` : '--',
        durationSec: duration,
        type: 'video' as const,
        starred: false,
        views: c.actual_views ? c.actual_views.toString() : (c.spark_score ? (c.spark_score * 125).toString() : '--'),
        thumbnail: null,
        url: c.output_url,
      });
    }
  }

  return (
    <div className="max-w-7xl mx-auto relative z-10 pb-12">
      <MediaClient initialFiles={files} />
    </div>
  );
}
