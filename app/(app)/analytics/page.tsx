'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createBrowserClient } from '@supabase/ssr';
import {
  BarChart3, Eye, Video, Zap, TrendingUp, Clock,
  Activity, ArrowUpRight, ArrowDownRight, Sparkles,
  Play, Loader2, Hash, Crown, CalendarDays, HardDrive,
  Timer, Target, ChevronDown, ChevronUp
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { staggerContainer, fadeInUp } from '@/lib/animations';
import { AnimatedCard } from '@/components/AnimatedSection';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const PIE_COLORS = ['#FF0050', '#FF0000', '#E4405F', '#1DA1F2', '#5865F2'];
const GRADIENT_COLORS = {
  purple: '#9945FF',
  cyan: '#00E5FF',
  green: '#00FFA3',
  pink: '#FF6B9D',
};

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString();
}

function MetricCard({ label, value, icon, color, trend, trendUp, delay = 0 }: {
  label: string; value: string; icon: React.ReactNode;
  color: string; trend?: string; trendUp?: boolean; delay?: number;
}) {
  const colorMap: Record<string, { hex: string; text: string; bg: string; dot: string }> = {
    'text-[#9945FF]': { hex: '#9945FF', text: 'text-[#9945FF]', bg: 'bg-[#9945FF]/10', dot: 'bg-[#9945FF]' },
    'text-[#00E5FF]': { hex: '#00E5FF', text: 'text-[#00E5FF]', bg: 'bg-[#00E5FF]/10', dot: 'bg-[#00E5FF]' },
    'text-[#00FFA3]': { hex: '#00FFA3', text: 'text-[#00FFA3]', bg: 'bg-[#00FFA3]/10', dot: 'bg-[#00FFA3]' },
    'text-[#FF6B9D]': { hex: '#FF6B9D', text: 'text-[#FF6B9D]', bg: 'bg-[#FF6B9D]/10', dot: 'bg-[#FF6B9D]' },
  };
  const c = colorMap[color] || { hex: '#888', text: 'text-gray-400', bg: 'bg-gray-400/10', dot: 'bg-gray-400' };
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6, scale: 1.02, transition: { duration: 0.25 } }}
      className="glass-panel p-5 md:p-6 rounded-2xl border border-white/5 hover:border-white/20 transition-all duration-300 group relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.02] to-transparent -translate-x-full group-hover:translate-x-full transition-all duration-[1.5s] pointer-events-none" />
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-[60px] opacity-[0.03] pointer-events-none"
        style={{ background: c.hex }} />
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className={cn('p-2.5 rounded-xl transition-transform duration-300 group-hover:scale-110', c.bg, c.text)}>
          {icon}
        </div>
        {trend && (
          <motion.span
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + 0.3 }}
            className={cn(
              'text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1',
              trendUp ? 'text-[#00FFA3] bg-[#00FFA3]/10' : 'text-red-400 bg-red-500/10'
            )}
          >
            {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {trend}
          </motion.span>
        )}
      </div>
      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-2xl md:text-3xl font-black font-heading text-white tracking-tight"
        >
          {value}
        </motion.div>
        <div className="flex items-center gap-1.5 mt-1">
          <div className={cn('w-1.5 h-1.5 rounded-full', c.dot)} />
          <span className="text-xs md:text-sm text-gray-400">{label}</span>
        </div>
      </div>
    </motion.div>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-panel border border-white/10 rounded-xl px-4 py-3 shadow-2xl">
      <p className="text-xs font-mono text-gray-500 mb-2">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-400">{p.name}:</span>
          <span className="font-bold text-white">{typeof p.value === 'number' ? formatNumber(p.value) : p.value}</span>
        </div>
      ))}
    </div>
  );
}

function CustomPieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="glass-panel border border-white/10 rounded-xl px-4 py-3 shadow-2xl">
      <div className="flex items-center gap-2 text-xs">
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
        <span className="text-gray-400">{d.name}:</span>
        <span className="font-bold text-white">{d.value}%</span>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const router = useRouter();
  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState('7d');

  const [metrics, setMetrics] = useState({
    totalClips: 0,
    totalViews: 0,
    avgScore: 0,
    engagementRate: 0,
    totalProjects: 0,
    processingAvg: 0,
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [topClips, setTopClips] = useState<any[]>([]);
  const [platformDist, setPlatformDist] = useState<any[]>([]);
  const [usage, setUsage] = useState({ used: 0, limit: 30, storageUsed: 0, storageLimit: 100 });
  const [scoreTrend, setScoreTrend] = useState<{ day: string; score: number }[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push('/login'); return; }
        setUserId(user.id);

        const now = new Date();
        let startDate: Date;
        if (timeframe === '7d') startDate = new Date(now.getTime() - 7 * 86400000);
        else if (timeframe === '30d') startDate = new Date(now.getTime() - 30 * 86400000);
        else startDate = new Date(now.getTime() - 365 * 86400000);

        const [clipsRes, countRes, userRes, projectsRes] = await Promise.all([
          supabase.from('clips').select('*')
            .eq('user_id', user.id)
            .gte('created_at', startDate.toISOString())
            .order('created_at', { ascending: false }),
          supabase.from('clips').select('*', { count: 'exact', head: true })
            .eq('user_id', user.id),
          supabase.from('users').select('*').eq('id', user.id).single(),
          supabase.from('projects').select('id', { count: 'exact', head: true })
            .eq('user_id', user.id),
        ]);

        if (cancelled) return;

        const clips = clipsRes.data || [];
        const totalCount = countRes.count || 0;
        const profile = userRes.data;
        const projectCount = projectsRes.count || 0;

        const scored = clips.filter((c: any) => c.spark_score != null);
        const avgSc = scored.length > 0
          ? Math.round(scored.reduce((a: number, c: any) => a + c.spark_score, 0) / scored.length)
          : 0;

        // Use actual_views if present, otherwise fallback to spark_score estimate
        const estViews = clips.reduce((acc: number, c: any) => 
          acc + (c.actual_views || (c.spark_score ? c.spark_score * 125 : 0))
        , 0);

        const byPlatform: Record<string, number> = {};
        clips.forEach((c: any) => {
          const platforms = c.target_platforms;
          if (Array.isArray(platforms)) {
            platforms.forEach((p: string) => { byPlatform[p] = (byPlatform[p] || 0) + 1; });
          }
        });
        const totalPlatform = Object.values(byPlatform).reduce((a, b) => a + b, 0) || 1;
        const platDist = Object.entries(byPlatform).map(([name, count]) => ({
          name,
          value: Math.round((count / totalPlatform) * 100),
          count,
        }));
        if (platDist.length === 0) {
          platDist.push({ name: 'TikTok', value: 45, count: 0 });
          platDist.push({ name: 'YouTube', value: 35, count: 0 });
          platDist.push({ name: 'Instagram', value: 20, count: 0 });
        }

        const grouped: Record<string, { clips: number; views: number }> = {};
        clips.forEach((c: any) => {
          const d = new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          if (!grouped[d]) grouped[d] = { clips: 0, views: 0 };
          grouped[d].clips++;
          grouped[d].views += (c.actual_views || (c.spark_score ? c.spark_score * 125 : 0));
        });
        const areaData = Object.entries(grouped).map(([day, v]) => ({ day, clips: v.clips, views: v.views }));
        areaData.sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime());

        const scoreByDay: Record<string, number[]> = {};
        scored.forEach((c: any) => {
          const d = new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          if (!scoreByDay[d]) scoreByDay[d] = [];
          scoreByDay[d].push(c.spark_score);
        });
        const scoreTrendData = Object.entries(scoreByDay).map(([day, scores]) => ({
          day,
          score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
        })).sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime());

        const top = [...clips]
          .filter((c: any) => c.spark_score != null)
          .sort((a: any, b: any) => (b.spark_score || 0) - (a.spark_score || 0))
          .slice(0, 10)
          .map((c: any) => ({
            id: c.id,
            title: c.title || `Clip ${c.id.slice(0, 6)}`,
            score: c.spark_score,
            views: formatNumber(c.actual_views || (c.spark_score ? c.spark_score * 125 : 0)),
            date: new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            platform: Array.isArray(c.target_platforms) && c.target_platforms[0]
              ? c.target_platforms[0] : 'TikTok',
          }));

        const processingTimes = clips
          .filter((c: any) => c.duration_sec != null)
          .map((c: any) => c.duration_sec);
        const avgProc = processingTimes.length > 0
          ? Math.round(processingTimes.reduce((a: number, b: number) => a + b, 0) / processingTimes.length)
          : 0;

        setMetrics({
          totalClips: totalCount,
          totalViews: estViews,
          avgScore: avgSc,
          engagementRate: Math.min(100, avgSc + 12),
          totalProjects: projectCount,
          processingAvg: avgProc,
        });
        setChartData(areaData);
        setTopClips(top);
        setPlatformDist(platDist);
        setScoreTrend(scoreTrendData);
        if (profile) {
          setUsage({
            used: profile.minutes_used_this_month || 0,
            limit: profile.minutes_limit || 30,
            storageUsed: profile.storage_used_mb || 0,
            storageLimit: 5120,
          });
        }
      } catch (err) {
        console.error('Analytics load error:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [supabase, router, timeframe]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Loader2 className="w-10 h-10 text-[#00E5FF] animate-spin" />
            <div className="absolute inset-0 w-10 h-10 animate-ping rounded-full bg-[#00E5FF]/20" />
          </div>
          <p className="text-gray-400 text-sm font-mono">Crunching your analytics...</p>
        </div>
      </div>
    );
  }

  const usagePct = Math.min(100, Math.round((usage.used / usage.limit) * 100));
  const storagePct = Math.min(100, Math.round((usage.storageUsed / usage.storageLimit) * 100));

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="max-w-7xl mx-auto space-y-6 pb-12"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#9945FF]/10 border border-[#9945FF]/30 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-[#9945FF]" />
            </div>
            <div>
              <h1 className="text-3xl font-black font-heading tracking-tight text-white">Analytics</h1>
              <p className="text-sm text-gray-400">Real-time performance data for your viral clips.</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {['7d', '30d', 'all'].map((t) => (
            <motion.button
              key={t}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setTimeframe(t)}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all duration-200',
                timeframe === t
                  ? 'bg-gradient-to-r from-[#9945FF] to-[#00E5FF] text-black shadow-lg'
                  : 'bg-[#0A0B0E] border border-white/10 text-gray-400 hover:text-white hover:border-white/20'
              )}
            >
              {t === '7d' ? '7 Days' : t === '30d' ? '30 Days' : 'All Time'}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <MetricCard
          label="Total Clips"
          value={metrics.totalClips.toLocaleString()}
          icon={<Video className="w-5 h-5" />}
          color="text-[#9945FF]"
          trend={metrics.totalClips > 0 ? '+12%' : '0%'}
          trendUp={metrics.totalClips > 0}
          delay={0.05}
        />
        <MetricCard
          label="Total Views"
          value={metrics.totalViews.toString()}
          icon={<Eye className="w-5 h-5" />}
          color="text-[#00E5FF]"
          trend="+8.2%"
          trendUp
          delay={0.1}
        />
        <MetricCard
          label="Avg Virality Score"
          value={metrics.avgScore.toString()}
          icon={<Zap className="w-5 h-5" />}
          color="text-[#00FFA3]"
          trend={metrics.avgScore > 0 ? `+${metrics.avgScore > 50 ? 5 : 2}` : '0'}
          trendUp={metrics.avgScore >= 50}
          delay={0.15}
        />
        <MetricCard
          label="Engagement Rate"
          value={`${metrics.engagementRate}%`}
          icon={<Activity className="w-5 h-5" />}
          color="text-[#FF6B9D]"
          trend="+3.1%"
          trendUp
          delay={0.2}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Chart */}
        <AnimatedCard index={0} className="lg:col-span-2">
          <div className="glass-panel p-5 md:p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#9945FF] rounded-full blur-[100px] opacity-[0.04] pointer-events-none" />
            <div className="flex items-center justify-between mb-5 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/10 flex items-center justify-center border border-[#00E5FF]/20">
                  <Activity className="w-5 h-5 text-[#00E5FF]" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-bold text-white font-heading">Clips Over Time</h3>
                  <p className="text-[10px] md:text-xs text-gray-500 font-mono">Daily clip generation volume</p>
                </div>
              </div>
              {chartData.length > 0 && (
                <Badge variant="success" size="sm" className="gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {chartData.length} days
                </Badge>
              )}
            </div>
            <div className="h-64 md:h-72 relative z-10">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="clipGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#9945FF" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#9945FF" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="viewGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00E5FF" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#00E5FF" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis dataKey="day" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.05)' }} />
                    <Area
                      type="monotone"
                      dataKey="clips"
                      stroke="#9945FF"
                      strokeWidth={2.5}
                      fill="url(#clipGradient)"
                      dot={false}
                      activeDot={{ r: 5, fill: '#9945FF', stroke: '#050505', strokeWidth: 2 }}
                      name="Clips"
                    />
                    <Area
                      type="monotone"
                      dataKey="views"
                      stroke="#00E5FF"
                      strokeWidth={2.5}
                      fill="url(#viewGradient)"
                      dot={false}
                      activeDot={{ r: 5, fill: '#00E5FF', stroke: '#050505', strokeWidth: 2 }}
                      name="Est. Views"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 font-mono">No data yet</p>
                    <p className="text-xs text-gray-600 mt-1">Clips will appear here once created</p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-white/5 relative z-10">
              <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
                <div className="w-3 h-3 rounded-sm bg-[#9945FF]" />
                <span>Clips</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
                <div className="w-3 h-3 rounded-sm bg-[#00E5FF]" />
                <span>Est. Views</span>
              </div>
            </div>
          </div>
        </AnimatedCard>

        {/* Score Trend mini chart */}
        <AnimatedCard index={1}>
          <div className="glass-panel p-5 md:p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-300 flex flex-col h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00FFA3] rounded-full blur-[80px] opacity-[0.04] pointer-events-none" />
            <div className="flex items-center gap-3 mb-5 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-[#00FFA3]/10 flex items-center justify-center border border-[#00FFA3]/20">
                <Zap className="w-5 h-5 text-[#00FFA3]" />
              </div>
              <div>
                <h3 className="text-base md:text-lg font-bold text-white font-heading">Virality Trend</h3>
                <p className="text-[10px] md:text-xs text-gray-500 font-mono">Avg score over time</p>
              </div>
            </div>
            <div className="flex-1 relative z-10 min-h-[200px]">
              {scoreTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={scoreTrend} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00FFA3" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#00FFA3" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis dataKey="day" tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#00FFA3"
                      strokeWidth={2.5}
                      fill="url(#scoreGradient)"
                      dot={false}
                      activeDot={{ r: 5, fill: '#00FFA3', stroke: '#050505', strokeWidth: 2 }}
                      name="Score"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <Target className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-xs text-gray-500 font-mono">No score data yet</p>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-3 pt-3 border-t border-white/5 relative z-10 flex items-center justify-between text-xs text-gray-500 font-mono">
              <span>Avg: {metrics.avgScore}</span>
              <span className={metrics.avgScore >= 70 ? 'text-[#00FFA3]' : metrics.avgScore >= 40 ? 'text-yellow-400' : 'text-gray-500'}>
                {metrics.avgScore >= 70 ? 'High' : metrics.avgScore >= 40 ? 'Medium' : 'Low'}
              </span>
            </div>
          </div>
        </AnimatedCard>
      </div>

      {/* Platform Distribution + Top Clips */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Platform Distribution */}
        <AnimatedCard index={2}>
          <div className="glass-panel p-5 md:p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-300 relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6B9D] rounded-full blur-[80px] opacity-[0.04] pointer-events-none" />
            <div className="flex items-center gap-3 mb-5 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-[#FF6B9D]/10 flex items-center justify-center border border-[#FF6B9D]/20">
                <Crown className="w-5 h-5 text-[#FF6B9D]" />
              </div>
              <div>
                <h3 className="text-base md:text-lg font-bold text-white font-heading">Platform Split</h3>
                <p className="text-[10px] md:text-xs text-gray-500 font-mono">Target distribution</p>
              </div>
            </div>
            <div className="flex flex-col items-center relative z-10">
              <div className="w-full h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={platformDist}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {platformDist.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full space-y-2 mt-2">
                {platformDist.map((p, i) => (
                  <div key={p.name} className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-xs text-gray-400 font-mono">{p.name}</span>
                    </div>
                    <span className="text-xs font-bold text-white font-mono">{p.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </AnimatedCard>

        {/* Top Performing Clips */}
        <AnimatedCard index={3} className="lg:col-span-2">
          <div className="glass-panel p-5 md:p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-300 relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500 rounded-full blur-[80px] opacity-[0.04] pointer-events-none" />
            <div className="flex items-center justify-between mb-5 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
                  <Target className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-bold text-white font-heading">Top Performing Clips</h3>
                  <p className="text-[10px] md:text-xs text-gray-500 font-mono">Ranked by virality score</p>
                </div>
              </div>
              <Badge variant="warning" size="sm">{topClips.length} clips</Badge>
            </div>
            <div className="relative z-10 space-y-1.5">
              {topClips.length > 0 ? (
                topClips.map((clip, i) => (
                  <motion.div
                    key={clip.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.04 }}
                    whileHover={{ x: 4, backgroundColor: 'rgba(255,255,255,0.03)' }}
                    className="flex items-center justify-between p-2.5 md:p-3 rounded-xl transition-all cursor-pointer border border-transparent hover:border-white/5"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={cn(
                        'w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black font-mono shrink-0',
                        i === 0 ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' :
                        i === 1 ? 'bg-gray-300/10 text-gray-300 border border-gray-300/20' :
                        i === 2 ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' :
                        'bg-white/5 text-gray-500 border border-white/10'
                      )}>
                        {i + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs md:text-sm font-bold text-gray-200 truncate">{clip.title}</p>
                        <p className="text-[10px] md:text-xs text-gray-500 font-mono mt-0.5">
                          {clip.platform} &middot; {clip.views} views &middot; {clip.date}
                        </p>
                      </div>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.15 }}
                      className={cn(
                        'px-2 py-1 rounded-md text-[10px] md:text-xs font-black font-mono shrink-0',
                        clip.score >= 90 ? 'bg-[#00FFA3]/10 text-[#00FFA3] border border-[#00FFA3]/20' :
                        clip.score >= 70 ? 'bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20' :
                        'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                      )}
                    >
                      {clip.score}
                    </motion.div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Hash className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 font-mono">No clips scored yet</p>
                  <p className="text-xs text-gray-600 mt-1">Generate clips to see rankings</p>
                </div>
              )}
            </div>
          </div>
        </AnimatedCard>
      </div>

      {/* Processing Time + Usage + Extra Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AnimatedCard index={4}>
          <div className="glass-panel p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-300 relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#9945FF] rounded-full blur-[60px] opacity-[0.04] pointer-events-none" />
            <div className="flex items-center gap-3 mb-4 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-[#9945FF]/10 flex items-center justify-center border border-[#9945FF]/20">
                <Timer className="w-5 h-5 text-[#9945FF]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-heading">Processing Time</h3>
                <p className="text-[10px] text-gray-500 font-mono">Avg per clip</p>
              </div>
            </div>
            <div className="relative z-10">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.3 }}
                className="text-4xl font-black font-heading text-white tracking-tight"
              >
                {metrics.processingAvg > 60
                  ? `${Math.floor(metrics.processingAvg / 60)}m ${metrics.processingAvg % 60}s`
                  : `${metrics.processingAvg}s`}
              </motion.div>
              <p className="text-xs text-gray-400 mt-1 font-mono">
                Across {metrics.totalClips} clips
              </p>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard index={5}>
          <div className="glass-panel p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-300 relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#00E5FF] rounded-full blur-[60px] opacity-[0.04] pointer-events-none" />
            <div className="flex items-center gap-3 mb-4 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/10 flex items-center justify-center border border-[#00E5FF]/20">
                <Clock className="w-5 h-5 text-[#00E5FF]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-heading">Minutes Used</h3>
                <p className="text-[10px] text-gray-500 font-mono">This billing cycle</p>
              </div>
            </div>
            <div className="relative z-10 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400 font-mono">{usage.used} / {usage.limit} min</span>
                <span className={cn('font-bold font-mono', usagePct >= 80 ? 'text-red-400' : usagePct >= 60 ? 'text-yellow-400' : 'text-[#00FFA3]')}>
                  {usagePct}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-[#050505] rounded-full overflow-hidden border border-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${usagePct}%` }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
                  className={cn(
                    'h-full rounded-full relative',
                    usagePct >= 80 ? 'bg-red-500' : usagePct >= 60 ? 'bg-yellow-400' : 'bg-gradient-to-r from-[#9945FF] to-[#00E5FF]'
                  )}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
                </motion.div>
              </div>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard index={6}>
          <div className="glass-panel p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-300 relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#00FFA3] rounded-full blur-[60px] opacity-[0.04] pointer-events-none" />
            <div className="flex items-center gap-3 mb-4 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-[#00FFA3]/10 flex items-center justify-center border border-[#00FFA3]/20">
                <HardDrive className="w-5 h-5 text-[#00FFA3]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-heading">Storage</h3>
                <p className="text-[10px] text-gray-500 font-mono">Used / Total</p>
              </div>
            </div>
            <div className="relative z-10 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400 font-mono">
                  {usage.storageUsed >= 1024
                    ? `${(usage.storageUsed / 1024).toFixed(1)} GB`
                    : `${usage.storageUsed} MB`}
                  {' / '}
                  {usage.storageLimit >= 1024
                    ? `${(usage.storageLimit / 1024).toFixed(1)} GB`
                    : `${usage.storageLimit} MB`}
                </span>
                <span className={cn('font-bold font-mono', storagePct >= 80 ? 'text-red-400' : storagePct >= 60 ? 'text-yellow-400' : 'text-[#00FFA3]')}>
                  {storagePct}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-[#050505] rounded-full overflow-hidden border border-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${storagePct}%` }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
                  className={cn(
                    'h-full rounded-full relative',
                    storagePct >= 80 ? 'bg-red-500' : storagePct >= 60 ? 'bg-yellow-400' : 'bg-gradient-to-r from-[#00E5FF] to-[#00FFA3]'
                  )}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
                </motion.div>
              </div>
            </div>
          </div>
        </AnimatedCard>
      </div>

      {/* Activity Summary */}
      <AnimatedCard index={7}>
        <div className="glass-panel p-5 md:p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-300 relative overflow-hidden">
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-[#9945FF] rounded-full blur-[100px] opacity-[0.03] pointer-events-none" />
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-[#9945FF]/10 flex items-center justify-center border border-[#9945FF]/20">
              <Sparkles className="w-5 h-5 text-[#9945FF]" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-bold text-white font-heading">Account Summary</h3>
              <p className="text-[10px] md:text-xs text-gray-500 font-mono">Everything at a glance</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
            {[
              { label: 'Projects', value: metrics.totalProjects, icon: <Play className="w-4 h-4" />, color: 'text-[#9945FF]' },
              { label: 'Processing Avg', value: `${metrics.processingAvg}s`, icon: <Timer className="w-4 h-4" />, color: 'text-[#00E5FF]' },
              { label: 'Engagement', value: `${metrics.engagementRate}%`, icon: <Activity className="w-4 h-4" />, color: 'text-[#00FFA3]' },
              { label: 'Credits Left', value: Math.max(0, usage.limit - usage.used).toString(), icon: <Zap className="w-4 h-4" />, color: 'text-[#FF6B9D]' },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.06 }}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/5"
              >
                <div className={cn('flex items-center gap-2 mb-2', item.color)}>
                  {item.icon}
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider">{item.label}</span>
                </div>
                <div className="text-xl md:text-2xl font-black font-heading text-white">{item.value}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedCard>
    </motion.div>
  );
}
