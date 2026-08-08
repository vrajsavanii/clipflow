'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Video, Clock, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

function AnimatedCounter({ value, suffix = '' }: { value: number | string; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  const targetValue = typeof value === 'string' ? parseInt(value.replace(/,/g, '')) : value;

  useEffect(() => {
    let start = 0;
    const end = isNaN(targetValue) ? 0 : targetValue;
    if (start === end) {
      setDisplayValue(end);
      return;
    }

    const totalDuration = 1500;
    let incrementTime = totalDuration / Math.min(end, 100);
    if (incrementTime < 10) incrementTime = 10;
    if (incrementTime > 100) incrementTime = 100;

    const step = Math.max(1, Math.ceil(end / (totalDuration / incrementTime)));

    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(start);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [targetValue]);

  const formatted = suffix === '%'
    ? `${displayValue}%`
    : displayValue.toLocaleString();

  return <span>{formatted}</span>;
}

interface DashboardMetricsProps {
  totalClips: number;
  totalProjects: number;
  avgScore: number;
  minutesProcessed: string;
}

export function DashboardMetrics({ totalClips, totalProjects, avgScore, minutesProcessed }: DashboardMetricsProps) {
  const metrics = [
    {
      label: 'Total Clips Generated',
      value: totalClips,
      suffix: '',
      icon: <Video className="w-5 h-5" />,
      accent: '#00E5FF',
      bg: 'bg-[#00E5FF]/10',
    },
    {
      label: 'Projects Analyzed',
      value: totalProjects,
      suffix: '',
      icon: <Clock className="w-5 h-5" />,
      accent: '#9945FF',
      bg: 'bg-[#9945FF]/10',
    },
    {
      label: 'Avg. Virality Score',
      value: avgScore,
      suffix: '%',
      icon: <Zap className="w-5 h-5" />,
      accent: '#FFD700',
      bg: 'bg-yellow-500/10',
    },
    {
      label: 'Minutes Processed',
      value: minutesProcessed,
      suffix: 'm',
      icon: <Clock className="w-5 h-5" />,
      accent: '#00FFA3',
      bg: 'bg-[#00FFA3]/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {metrics.map((metric, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
          className="group relative overflow-hidden rounded-2xl border border-white/5 p-5 space-y-4 transition-all duration-300 hover:border-white/20 hover:shadow-xl"
          style={{ background: 'rgba(14, 17, 22, 0.45)', backdropFilter: 'blur(20px)' }}
        >
          {/* Shimmer overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

          {/* Accent glow line */}
          <div
            className="absolute top-0 left-4 right-4 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ background: `linear-gradient(90deg, transparent, ${metric.accent}, transparent)` }}
          />

          <div className="flex justify-between items-start relative z-10">
            <span className="text-xs font-mono text-gray-500 uppercase tracking-wider">{metric.label}</span>
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${metric.bg} transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
            >
              <span style={{ color: metric.accent }}>{metric.icon}</span>
            </div>
          </div>
          <div className="relative z-10">
            <div className="text-4xl font-black font-heading text-white tracking-tight">
              <AnimatedCounter value={metric.value} suffix={metric.suffix} />
            </div>
            <div className="text-xs text-gray-400 mt-1 font-mono flex items-center gap-1.5">
              <div
                className="w-1 h-1 rounded-full"
                style={{ backgroundColor: metric.accent, boxShadow: `0 0 4px ${metric.accent}` }}
              />
              Lifetime
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
