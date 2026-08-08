'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, Activity, Target, Flame,
  Calendar, Zap, DollarSign, BarChart2, MessageSquare,
  ArrowUpRight, Sparkles, AlertCircle, GripHorizontal, Video, Radio, RefreshCw
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

function AccentBar({ color }: { color: string }) {
  return (
    <div
      className="absolute top-0 inset-x-0 h-0.5 opacity-60"
      style={{
        background: `linear-gradient(90deg, ${color}, transparent)`,
        boxShadow: `0 0 12px ${color}`,
      }}
    />
  );
}

interface TrendItem {
  title: string;
  hook: string;
  category: string;
  emoji: string;
  videoId?: string;
  author?: string;
}

function TrendRadarWidget() {
  const [trends, setTrends] = useState<TrendItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<'youtube' | 'mock'>('mock');
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchTrends = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/trends');
      const data = await res.json();
      setTrends(data.trends || []);
      setSource(data.source);
      setLastRefresh(new Date());
    } catch {
      // silent fail — component will show empty
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTrends(); }, [fetchTrends]);

  return (
    <motion.div
      layout
      className="relative overflow-hidden rounded-3xl border border-[#9945FF]/20 p-6 group"
      style={{ background: 'rgba(10, 11, 14, 0.6)', backdropFilter: 'blur(20px)', boxShadow: '0 0 30px rgba(153, 69, 255, 0.05)' }}
    >
      <AccentBar color="#9945FF" />

      <div className="flex justify-between items-center mb-5">
        <h3 className="font-bold font-heading text-white flex items-center gap-2">
          <Radio className="w-5 h-5 text-[#9945FF]" /> Trend Radar
          {source === 'youtube' && (
            <span className="flex items-center gap-1 ml-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[9px] font-mono text-red-400 uppercase tracking-widest">Live</span>
            </span>
          )}
        </h3>
        <button
          onClick={fetchTrends}
          disabled={loading}
          className="p-1.5 rounded-lg border border-white/10 text-gray-500 hover:text-white hover:border-[#9945FF]/40 transition-all"
          title="Refresh trends"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <ul className="space-y-2">
          {[1, 2, 3, 4].map(i => (
            <li key={i} className="h-12 rounded-xl bg-white/5 animate-pulse" />
          ))}
        </ul>
      ) : (
        <ul className="space-y-2">
          {trends.slice(0, 5).map((t, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-start gap-3 p-3 rounded-xl border border-white/5 hover:bg-white/5 transition-colors cursor-pointer group/item"
              style={{ background: 'rgba(255,255,255,0.03)' }}
            >
              <span className="text-xl leading-none mt-0.5">{t.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-300 group-hover/item:text-white transition-colors truncate leading-snug">{t.title}</p>
                {t.author && <p className="text-[10px] text-gray-600 font-mono mt-0.5 truncate">{t.author}</p>}
              </div>
              <span className="text-[9px] font-bold font-mono px-2 py-1 rounded-md shrink-0 text-[#9945FF]"
                style={{ background: 'rgba(153,69,255,0.12)' }}>
                {t.hook}
              </span>
            </motion.li>
          ))}
        </ul>
      )}

      {lastRefresh && !loading && (
        <p className="text-[9px] text-gray-600 font-mono mt-3 text-right">
          Updated {lastRefresh.toLocaleTimeString()}
        </p>
      )}
    </motion.div>
  );
}

export function DashboardWidgets() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-8">
      {/* 1. AI Assistant Panel */}
      <motion.div
        layout
        className="relative overflow-hidden rounded-3xl border border-[#00E5FF]/20 p-6 group md:col-span-2 xl:col-span-1"
        style={{ background: 'rgba(10, 11, 14, 0.6)', backdropFilter: 'blur(20px)', boxShadow: '0 0 30px rgba(0, 229, 255, 0.05)' }}
      >
        <AccentBar color="#9945FF" />
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[#00E5FF]/5 blur-[60px] pointer-events-none" />

        <div className="flex justify-between items-center mb-6 relative z-10">
          <h3 className="font-bold font-heading text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#00E5FF]" /> LLaMA 3.3 Insights
          </h3>
          <GripHorizontal className="w-4 h-4 text-gray-600 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <div className="space-y-4 relative z-10">
          <div className="p-4 rounded-xl text-sm text-gray-300 border border-white/5" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <span className="text-[#00E5FF] font-bold">Trend Alert:</span> "Day in the life" hooks are outperforming educational hooks by 42% in your niche this week. Suggesting a pivot for your next batch.
          </div>
          <div className="p-4 rounded-xl text-sm text-gray-300 flex items-start gap-3 border border-white/5" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
            <p>Your last 3 YouTube Shorts had high drop-off at the 4s mark. Let's increase B-roll pacing for the next export.</p>
          </div>
          <button className="w-full py-3 rounded-xl font-bold text-sm transition-colors border border-[#00E5FF]/20 text-[#00E5FF] hover:bg-[#00E5FF]/20" style={{ background: 'rgba(0, 229, 255, 0.08)' }}>
            Apply Recommendations
          </button>
        </div>
      </motion.div>

      {/* 2. Viral Score Heatmap */}
      <motion.div
        layout
        className="relative overflow-hidden rounded-3xl border border-white/5 p-6 group"
        style={{ background: 'rgba(10, 11, 14, 0.6)', backdropFilter: 'blur(20px)' }}
      >
        <AccentBar color="#FF6B9D" />
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold font-heading text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#FF6B9D]" /> Viral Heatmap
          </h3>
          <GripHorizontal className="w-4 h-4 text-gray-600 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: 35 }).map((_, i) => {
              // Deterministic pseudo-random value based on index
              const r = ((Math.sin((i + 1) * 123.456) * 10000) % 1 + 1) % 1;
              const hue = r > 0.8 ? '#FF6B9D' : r > 0.5 ? 'rgba(255,107,157,0.6)' : r > 0.2 ? 'rgba(255,107,157,0.25)' : 'rgba(255,255,255,0.04)';
              return (
                <div
                  key={i}
                  className="aspect-square rounded-sm transition-all duration-200 hover:scale-125 cursor-pointer"
                  style={{ backgroundColor: hue }}
                  title={`Activity: ${Math.round(r * 100)}%`}
                />
              );
            })}
          </div>
          <div className="flex justify-between text-[10px] text-gray-500 font-mono">
            <span>Low</span>
            <span>High Viral Potential</span>
          </div>
        </div>
      </motion.div>

      {/* 3. Revenue Estimator */}
      <motion.div
        layout
        className="relative overflow-hidden rounded-3xl border border-white/5 p-6 group"
        style={{ background: 'rgba(10, 11, 14, 0.6)', backdropFilter: 'blur(20px)' }}
      >
        <AccentBar color="#00FFA3" />
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-[#00FFA3]/5 blur-[80px] pointer-events-none" />

        <div className="flex justify-between items-center mb-6 relative z-10">
          <h3 className="font-bold font-heading text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#00FFA3]" /> Platform Revenue
          </h3>
          <GripHorizontal className="w-4 h-4 text-gray-600 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <div className="flex flex-col items-center justify-center py-4 relative z-10">
          <div className="text-[10px] text-gray-500 font-mono mb-2 uppercase tracking-[0.15em]">Est. 30-Day Payout</div>
          <div className="text-5xl font-black font-heading text-white">$4,820</div>
          <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold font-mono border border-[#00FFA3]/20 text-[#00FFA3]" style={{ background: 'rgba(0, 255, 163, 0.08)' }}>
            <ArrowUpRight className="w-3 h-3" /> +14.2%
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 text-center relative z-10">
          <div className="p-3 rounded-xl border border-white/5" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className="text-[10px] text-gray-500 mb-1 font-mono">YouTube</div>
            <div className="font-bold text-white text-sm">$3,210</div>
          </div>
          <div className="p-3 rounded-xl border border-white/5" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className="text-[10px] text-gray-500 mb-1 font-mono">TikTok</div>
            <div className="font-bold text-white text-sm">$1,610</div>
          </div>
        </div>
      </motion.div>

      {/* 4. Live Trend Radar */}
      <TrendRadarWidget />

      {/* 5. Export Queue */}
      <motion.div
        layout
        className="relative overflow-hidden rounded-3xl border border-white/5 p-6 group md:col-span-2 xl:col-span-2"
        style={{ background: 'rgba(10, 11, 14, 0.6)', backdropFilter: 'blur(20px)' }}
      >
        <AccentBar color="#00E5FF" />
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold font-heading text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#00E5FF]" /> Auto-Scheduler Queue
          </h3>
          <GripHorizontal className="w-4 h-4 text-gray-600 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-[10px] text-gray-500 font-mono border-b border-white/10">
                <th className="pb-3 font-normal">Content Title</th>
                <th className="pb-3 font-normal">Platform</th>
                <th className="pb-3 font-normal">Scheduled For</th>
                <th className="pb-3 font-normal text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              {[
                { title: 'The Billion Dollar Pivot (Short 1)', platform: 'YouTube', platformColor: 'text-red-500 bg-red-500/10 border-red-500/20', time: 'Today, 5:00 PM', status: 'READY', statusColor: 'text-[#00FFA3]' },
                { title: 'How We Scaled to $1M (Short 4)', platform: 'TikTok', platformColor: 'text-pink-500 bg-pink-500/10 border-pink-500/20', time: 'Tomorrow, 12:00 PM', status: 'QUEUED', statusColor: 'text-yellow-500' },
                { title: 'The Future of AI Content (Short 2)', platform: 'YouTube', platformColor: 'text-red-500 bg-red-500/10 border-red-500/20', time: 'Tomorrow, 6:00 PM', status: 'DRAFT', statusColor: 'text-gray-500' },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 font-medium">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <Video className="w-4 h-4 text-gray-500" />
                      </div>
                      <span className="truncate max-w-[200px] text-sm">{row.title}</span>
                    </div>
                  </td>
                  <td className="py-3.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold font-mono border ${row.platformColor}`}>{row.platform}</span>
                  </td>
                  <td className="py-3.5 font-mono text-xs text-gray-400">{row.time}</td>
                  <td className="py-3.5 text-right">
                    <span className={`text-[11px] font-bold font-mono ${row.statusColor}`}>{row.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
