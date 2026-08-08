'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, Video, TrendingUp, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

interface Activity {
  id: string;
  type: 'processing' | 'ready' | 'failed';
  text: string;
  timestamp: number;
}

const FALLBACK_ACTIVITIES: Activity[] = [
  { id: '1', type: 'processing', text: 'AI extracting hooks from a podcast...', timestamp: Date.now() },
  { id: '2', type: 'ready', text: 'Auto-captioned 45 videos in the last hour.', timestamp: Date.now() - 1000 },
  { id: '3', type: 'processing', text: 'Face tracking applied to @mrbeast style clip.', timestamp: Date.now() - 2000 },
  { id: '4', type: 'ready', text: 'A generated clip hit 1M+ views on TikTok!', timestamp: Date.now() - 3000 },
  { id: '5', type: 'processing', text: 'Translated 12 clips into Spanish seamlessly.', timestamp: Date.now() - 4000 },
];

function ActivityIcon({ type }: { type: Activity['type'] }) {
  switch (type) {
    case 'processing': return <Zap className="w-3 h-3 text-yellow-400" />;
    case 'ready': return <CheckCircle2 className="w-3 h-3 text-[#00FFA3]" />;
    case 'failed': return <AlertCircle className="w-3 h-3 text-red-400" />;
  }
}

function ActivityDot({ type }: { type: Activity['type'] }) {
  const base = 'w-1.5 h-1.5 rounded-full';
  switch (type) {
    case 'processing': return <span className={`${base} bg-yellow-400 animate-pulse`} style={{ boxShadow: '0 0 6px rgba(250,204,21,0.5)' }} />;
    case 'ready': return <span className={`${base} bg-[#00FFA3]`} style={{ boxShadow: '0 0 6px rgba(0,255,163,0.5)' }} />;
    case 'failed': return <span className={`${base} bg-red-400`} style={{ boxShadow: '0 0 6px rgba(239,68,68,0.5)' }} />;
  }
}

export function LiveActivityTicker() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    let mounted = true;

    async function fetchRecent() {
      const { data: projects } = await supabase
        .from('projects')
        .select('id, status, created_at, source_url')
        .order('created_at', { ascending: false })
        .limit(10);

      if (!mounted) return;

      if (projects && projects.length > 0) {
        const mapped: Activity[] = projects.map(p => {
          let type: Activity['type'] = 'processing';
          if (p.status === 'ready' || p.status === 'completed' || p.status === 'success') type = 'ready';
          else if (p.status === 'failed') type = 'failed';

          return {
            id: p.id,
            type,
            text: type === 'ready'
              ? `Project "${p.source_url?.slice(0, 40) || 'Untitled'}" processing complete.`
              : type === 'failed'
              ? `Project "${p.source_url?.slice(0, 40) || 'Untitled'}" failed.`
              : `Processing "${p.source_url?.slice(0, 40) || 'Untitled'}" (${p.status})`,
            timestamp: new Date(p.created_at).getTime(),
          };
        });
        setActivities(mapped);
      } else {
        setActivities(FALLBACK_ACTIVITIES);
      }
    }

    fetchRecent();
    const pollInterval = setInterval(fetchRecent, 15000);

    const tickInterval = setInterval(() => {
      setCurrentIndex(prev => {
        const items = activities.length || FALLBACK_ACTIVITIES.length;
        return (prev + 1) % items;
      });
    }, 4000);

    return () => {
      mounted = false;
      clearInterval(pollInterval);
      clearInterval(tickInterval);
    };
  }, [activities.length]);

  const items = activities.length > 0 ? activities : FALLBACK_ACTIVITIES;
  const current = items[currentIndex] || items[0];

  return (
    <div className="flex items-center gap-3 bg-[#0A0B0E]/80 backdrop-blur-md border border-white/5 rounded-full px-4 py-1.5 w-max shadow-lg shadow-black/50 overflow-hidden">
      <div className="flex items-center gap-2 border-r border-white/10 pr-3">
        <ActivityDot type={current?.type || 'processing'} />
        <span className="text-[10px] font-bold text-gray-400 font-mono tracking-wider uppercase">Live</span>
      </div>

      <div className="relative w-[300px] sm:w-[400px] h-4 flex items-center">
        <AnimatePresence mode="wait">
          {current && (
            <motion.div
              key={current.id + currentIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute inset-0 flex items-center gap-2 text-xs text-gray-300"
            >
              <ActivityIcon type={current.type} />
              <span className="truncate">{current.text}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
