'use client';

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';
import { BarChart2, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const DATA_7D = [
  { name: 'Mon', views: 4200, clips: 24 },
  { name: 'Tue', views: 3800, clips: 18 },
  { name: 'Wed', views: 5100, clips: 31 },
  { name: 'Thu', views: 4600, clips: 27 },
  { name: 'Fri', views: 7200, clips: 42 },
  { name: 'Sat', views: 8900, clips: 55 },
  { name: 'Sun', views: 10300, clips: 61 },
];

const DATA_30D = [
  { name: 'W1', views: 28000, clips: 160 },
  { name: 'W2', views: 35000, clips: 210 },
  { name: 'W3', views: 42000, clips: 280 },
  { name: 'W4', views: 51000, clips: 340 },
];

const DATA_90D = [
  { name: 'Jan', views: 95000, clips: 620 },
  { name: 'Feb', views: 112000, clips: 780 },
  { name: 'Mar', views: 148000, clips: 1030 },
];

type RangeKey = '7d' | '30d' | '90d';

const DATA_MAP: Record<RangeKey, { name: string; views: number; clips: number }[]> = {
  '7d': DATA_7D,
  '30d': DATA_30D,
  '90d': DATA_90D,
};

const RANGE_LABELS: Record<RangeKey, string> = {
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
};

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0F1115] border border-white/10 p-4 rounded-xl shadow-2xl backdrop-blur-xl" style={{ background: 'rgba(15, 17, 21, 0.95)' }}>
        <p className="text-xs font-bold text-white mb-2">{label}</p>
        <p className="text-lg font-black font-mono" style={{ color: '#00E5FF' }}>
          {payload[0]?.value?.toLocaleString()} Views
        </p>
        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 font-mono">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#9945FF' }} />
          {payload[0]?.payload?.clips} clips generated
        </div>
      </div>
    );
  }
  return null;
}

export function DashboardChart() {
  const [range, setRange] = useState<RangeKey>('7d');
  const [showRange, setShowRange] = useState(false);

  const data = DATA_MAP[range];
  const totalViews = data.reduce((sum, d) => sum + d.views, 0);
  const totalClips = data.reduce((sum, d) => sum + d.clips, 0);
  const avgDaily = Math.round(totalViews / data.length);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="rounded-2xl border border-white/5 p-5 space-y-4 group"
      style={{ background: 'rgba(14, 17, 22, 0.45)', backdropFilter: 'blur(20px)' }}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold font-heading flex items-center gap-2 text-white">
          <BarChart2 className="w-4 h-4 text-[#9945FF]" />
          Account Performance
        </h2>

        {/* Range Selector */}
        <div className="relative">
          <button
            onClick={() => setShowRange(!showRange)}
            className="text-[10px] font-mono text-gray-400 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 flex items-center gap-1 hover:bg-white/10 transition-colors"
          >
            {RANGE_LABELS[range]}
            <ChevronDown className="w-3 h-3" />
          </button>
          {showRange && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowRange(false)} />
              <div className="absolute right-0 top-full mt-1 bg-[#14161B] border border-white/10 rounded-xl shadow-2xl z-20 py-1 min-w-[140px]">
                {(Object.keys(DATA_MAP) as RangeKey[]).map(key => (
                  <button
                    key={key}
                    onClick={() => { setRange(key); setShowRange(false); }}
                    className={`w-full text-left px-3 py-2 text-xs font-mono transition-colors ${
                      range === key ? 'text-[#00E5FF] bg-[#00E5FF]/10' : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {RANGE_LABELS[key]}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="h-44 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#9945FF" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#9945FF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#6B7280', fontFamily: 'var(--font-mono)' }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#6B7280', fontFamily: 'var(--font-mono)' }}
              dx={-5}
              tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.05)', strokeWidth: 1 }} />
            <Area
              type="monotone"
              dataKey="views"
              stroke="#00E5FF"
              strokeWidth={2}
              fill="url(#chartGradient)"
              animationDuration={1500}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3 pt-2 border-t border-white/5">
        <div className="text-center">
          <div className="text-lg font-black font-heading text-white">{totalViews >= 1000 ? `${(totalViews / 1000).toFixed(1)}k` : totalViews}</div>
          <div className="text-[10px] text-gray-500 font-mono mt-0.5">Total Views</div>
        </div>
        <div className="text-center border-x border-white/5">
          <div className="text-lg font-black font-heading text-white">{totalClips}</div>
          <div className="text-[10px] text-gray-500 font-mono mt-0.5">Clips Generated</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-black font-heading text-white">{avgDaily >= 1000 ? `${(avgDaily / 1000).toFixed(1)}k` : avgDaily}</div>
          <div className="text-[10px] text-gray-500 font-mono mt-0.5">Avg. Daily Views</div>
        </div>
      </div>
    </motion.div>
  );
}
