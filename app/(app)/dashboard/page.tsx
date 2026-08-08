import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import {
  Video, Play, Clock,
  ArrowRight, CheckCircle, Sparkles, Zap
} from 'lucide-react';
import IngestForm from './IngestForm';
import { DashboardMetrics } from '@/components/DashboardMetrics';
import { LiveActivityTicker } from '@/components/LiveActivityTicker';
import { DashboardChart } from '@/components/DashboardChart';
import { DashboardWidgets } from '@/components/DashboardWidgets';
import { getRelativeTime } from '@/lib/time';
import { ProjectDropdown } from '@/components/ProjectDropdown';
import { SemanticSearch } from '@/components/SemanticSearch';
import { DashboardProjectCard } from './DashboardProjectCard';

// Always fetch fresh data — never serve cached project list
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const [
    { count: totalClips },
    { count: totalProjects },
    { data: clipsForScore },
    { data: recentProjects }
  ] = await Promise.all([
    supabase.from('clips').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('projects').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('clips').select('spark_score').eq('user_id', user.id).not('spark_score', 'is', null),
    supabase.from('projects').select('*, clips(count)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(4)
  ]);

  const avgScore = clipsForScore && clipsForScore.length > 0
    ? Math.round(clipsForScore.reduce((acc, c) => acc + (c.spark_score || 0), 0) / clipsForScore.length)
    : 0;

  const { data: durationData } = await supabase.from('clips').select('duration_sec').eq('user_id', user.id);
  const totalSeconds = durationData?.reduce((acc, c) => acc + (c.duration_sec || 0), 0) || 0;
  const minutesProcessed = Math.round(totalSeconds / 60);

  const hasProcessingProjects = recentProjects?.some(p => p.status !== 'ready' && p.status !== 'completed' && p.status !== 'success' && p.status !== 'failed');

  return (
    <>
    <style>{`
      @keyframes shimmer {
        100% { transform: translateX(100%); }
      }
    `}</style>
    <div className="max-w-7xl mx-auto space-y-8 pb-12 relative z-10">
      {/* Welcome Banner & Live Ticker */}
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-4xl font-black font-heading tracking-tight text-white mb-2">
            Welcome back, <span className="text-gradient-purple-cyan">{user.email?.split('@')[0]}</span>.
          </h1>
          <p className="text-sm text-gray-400">Your AI processing queue is ready. Let&apos;s make something viral.</p>
        </div>
        <LiveActivityTicker />
      </div>

      {/* Semantic Clip Search (NIM Powered) */}
      <SemanticSearch />

      {/* Metrics Row */}
      <DashboardMetrics
        totalClips={totalClips || 0}
        totalProjects={totalProjects || 0}
        avgScore={avgScore}
        minutesProcessed={minutesProcessed.toString()}
      />

      {/* Main Grid Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column (Wider) */}
        <div className="lg:col-span-2 space-y-8">

          {/* Quick Action Widget */}
          <div className="glass-panel p-1 rounded-2xl border border-white/10 bg-gradient-to-r from-[#0A0B0E] via-white/5 to-[#0A0B0E] relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#00E5FF]/50 to-transparent"></div>
            <div className="relative z-10">
              <IngestForm />
            </div>
          </div>

          {/* Recent Projects */}
          <div className="space-y-4">
            <div className="flex justify-between items-end px-1">
              <h2 className="text-lg font-bold font-heading">Recent Projects</h2>
              <Link href="/projects" className="text-xs text-[#00E5FF] hover:text-white transition-colors font-mono tracking-wider uppercase">View All</Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentProjects?.map((project, i) => {
                const isReady = project.status === 'ready' || project.status === 'completed' || project.status === 'success';
                const isFailed = project.status === 'failed';
                const dateStr = getRelativeTime(project.created_at);
                const clipCount = project.clips?.[0]?.count || 0;

                let realProgress = 5;
                let eta = "Queued...";
                if (project.status === 'ingesting') { realProgress = 5; eta = "Waking up engine..."; }
                if (project.status === 'downloading') { realProgress = 15; eta = "~4.5 mins left"; }
                if (project.status === 'transcribing') { realProgress = 30; eta = "~3 mins left"; }
                if (project.status === 'transcribed') { realProgress = 40; eta = "~3 mins left"; }
                if (project.status === 'visual_analyzing') { realProgress = 50; eta = "~2.5 mins left"; }
                if (project.status === 'face_detecting') { realProgress = 65; eta = "~1.5 mins left"; }
                if (project.status === 'analyzing') { realProgress = 80; eta = "~1 min left"; }
                if (project.status === 'analyzing_done') { realProgress = 95; eta = "Almost done..."; }
                if (isReady) { realProgress = 100; eta = "Done"; }

                const statusLabel = isReady ? 'READY' : isFailed ? 'FAILED' : project.status.replace('_', ' ').toUpperCase();

                return (
                  <DashboardProjectCard
                    key={project.id}
                    initialProject={project}
                    dateStr={dateStr}
                    clipCount={clipCount}
                  />
                );
              })}

              {/* Cinematic Empty State */}
              {(!recentProjects || recentProjects.length === 0) && (
                <div className="col-span-1 md:col-span-2">
                  <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0A0B0E] p-8 md:p-12 text-center shadow-2xl group">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[300px] bg-[#9945FF]/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-[#00E5FF]/10 transition-colors duration-1000"></div>
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay"></div>

                    <div className="relative z-10 flex flex-col items-center max-w-lg mx-auto">
                      <div className="relative mb-6">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#9945FF] to-[#00E5FF] rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity animate-pulse"></div>
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#14161B] to-[#0A0B0E] border border-white/10 flex items-center justify-center relative shadow-xl">
                          <Sparkles className="w-10 h-10 text-transparent bg-clip-text bg-gradient-to-r from-[#9945FF] to-[#00E5FF] drop-shadow-[0_0_15px_rgba(0,229,255,0.5)]" />
                        </div>
                      </div>

                      <h3 className="text-2xl font-black font-heading text-white mb-3 tracking-tight">Your First Viral Hit Awaits</h3>
                      <p className="text-gray-400 mb-8 leading-relaxed">
                        Drop a YouTube link above. Our AI will analyze the video, identify the most engaging moments, and generate ready-to-post vertical clips with perfect Captions.
                      </p>

                      <div className="flex flex-wrap justify-center gap-4 text-xs font-mono">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-gray-300">
                          <span className="w-2 h-2 rounded-full bg-[#00FFA3] animate-pulse"></span>
                          Ready to Process
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-gray-300">
                          <Zap className="w-3.5 h-3.5 text-yellow-500" />
                          AI Hook Engine Online
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (Narrow) */}
        <div className="space-y-6">
          <DashboardChart />

          {/* Connected Accounts */}
          <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-5">
            <h2 className="text-sm font-bold font-heading">Auto-Publish Destinations</h2>
            <div className="space-y-3">
              <div className="text-center py-6 text-sm text-gray-500">
                <p>Social accounts feature coming soon.</p>
                <p className="text-xs mt-2">You will be able to auto-post directly to YouTube, TikTok, and Instagram.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DashboardWidgets />
    </div>
    </>
  );
}
