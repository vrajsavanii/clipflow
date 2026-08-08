'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, ChevronLeft, ChevronRight, Video, Plus,
  X, Clock, Loader2, CheckCircle, Trash2, Filter,
  Music, PlayCircle, Camera, Globe, Bell,
  History, Sparkles, Play, ListTodo, Smartphone,
  Monitor, AlertCircle, ExternalLink, ArrowUpRight
} from 'lucide-react';
import { staggerContainer, fadeInUp } from '@/lib/animations';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const PLATFORMS = [
  { id: 'tiktok', label: 'TikTok', color: 'bg-pink-500/20 border-pink-500/40 text-pink-400', dot: 'bg-pink-400', icon: <Music className="w-4 h-4" /> },
  { id: 'youtube', label: 'YouTube', color: 'bg-red-500/20 border-red-500/40 text-red-400', dot: 'bg-red-400', icon: <PlayCircle className="w-4 h-4" /> },
  { id: 'instagram', label: 'Instagram', color: 'bg-purple-500/20 border-purple-500/40 text-purple-400', dot: 'bg-purple-400', icon: <Camera className="w-4 h-4" /> },
];

const STATUS_KEYS = ['scheduled', 'published', 'failed'] as const;
const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  scheduled: { label: 'Scheduled', color: 'text-[#00E5FF] bg-[#00E5FF]/10 border-[#00E5FF]/30', dot: 'bg-[#00E5FF]' },
  published: { label: 'Published', color: 'text-[#00FFA3] bg-[#00FFA3]/10 border-[#00FFA3]/30', dot: 'bg-[#00FFA3]' },
  failed: { label: 'Failed', color: 'text-red-400 bg-red-500/10 border-red-500/30', dot: 'bg-red-400' },
  pending: { label: 'Pending', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30', dot: 'bg-yellow-400' },
};

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function getPlatform(id: string) {
  return PLATFORMS.find(p => p.id === id) || PLATFORMS[0];
}

function getStatus(key: string) {
  return STATUS_CONFIG[key] || STATUS_CONFIG.pending;
}

function CalendarCell({ date, posts, isToday, onClick, onPostClick }: {
  date: Date | null; posts: any[]; isToday: boolean;
  onClick: () => void; onPostClick: (id: string) => void;
}) {
  if (!date) return <div className="min-h-[80px] md:min-h-[100px] border-r border-b border-white/[0.03] bg-white/[0.005]" />;
  return (
    <motion.div
      whileHover={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
      onClick={onClick}
      className={cn(
        'min-h-[80px] md:min-h-[100px] border-r border-b border-white/[0.03] p-1.5 md:p-2 transition-all relative group cursor-pointer',
        isToday && 'bg-[#9945FF]/[0.06]'
      )}
    >
      <div className="flex justify-between items-start mb-1">
        <span className={cn(
          'text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full transition-colors',
          isToday ? 'bg-[#9945FF] text-white shadow-lg shadow-[#9945FF]/30' : 'text-gray-500 group-hover:text-white'
        )}>
          {date.getDate()}
        </span>
        <Plus className="w-3 h-3 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="space-y-1">
        {posts.slice(0, 3).map((post: any) => {
          const plt = getPlatform(post.platform);
          const st = getStatus(post.status);
          return (
            <div
              key={post.id}
              onClick={(e) => { e.stopPropagation(); onPostClick(post.id); }}
              className={cn('px-1.5 py-1 rounded-md border text-[9px] md:text-[10px] font-bold flex items-center gap-1 truncate transition-all hover:scale-[1.02]', plt.color)}
            >
              <div className={cn('w-1.5 h-1.5 rounded-full shrink-0', st.dot)} />
              <span className="truncate">{post.title}</span>
            </div>
          );
        })}
        {posts.length > 3 && (
          <div className="text-[9px] text-gray-500 font-mono pl-1">+{posts.length - 3} more</div>
        )}
      </div>
    </motion.div>
  );
}

export default function SchedulePage() {
  const router = useRouter();
  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);
  const [clips, setClips] = useState<any[]>([]);
  const [socialAccounts, setSocialAccounts] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [showModal, setShowModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [savedToast, setSavedToast] = useState(false);
  const [view, setView] = useState<'calendar' | 'timeline'>('calendar');
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [formClipId, setFormClipId] = useState('');
  const [formPlatform, setFormPlatform] = useState('tiktok');
  const [formTime, setFormTime] = useState('12:00');
  const [formTitle, setFormTitle] = useState('');

  const today = new Date();

  const fetchData = useCallback(async (uid: string) => {
    const [postsRes, clipsRes, socialRes] = await Promise.all([
      supabase.from('scheduled_posts').select('*').eq('user_id', uid).order('scheduled_at', { ascending: false }),
      supabase.from('clips').select('id, title, start_sec, end_sec, status').eq('user_id', uid).eq('status', 'done'),
      supabase.from('social_accounts').select('*').eq('user_id', uid),
    ]);
    setPosts(postsRes.data || []);
    setClips(clipsRes.data || []);
    setSocialAccounts(socialRes.data || []);
  }, [supabase]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      if (!cancelled) setUser(user);
      await fetchData(user.id);
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [supabase, router, fetchData]);

  const prevMonth = () => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const firstDayOfWeek = currentDate.getDay();
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const cells = Array.from({ length: 42 }, (_, i) => {
    const dayNum = i - firstDayOfWeek + 1;
    if (dayNum < 1 || dayNum > daysInMonth) return null;
    return new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNum);
  });

  const getPostsForDay = useCallback((date: Date | null) => {
    if (!date) return [];
    return posts.filter(p => {
      const d = new Date(p.scheduled_at);
      return d.getFullYear() === date.getFullYear() &&
             d.getMonth() === date.getMonth() &&
             d.getDate() === date.getDate();
    });
  }, [posts]);

  const openModal = (date: Date) => {
    setSelectedDay(date);
    setFormTime('12:00');
    setFormPlatform('tiktok');
    setFormClipId(clips[0]?.id || '');
    setFormTitle('');
    setShowModal(true);
  };

  const handleSchedule = async () => {
    if (!user || !selectedDay) return;
    setSaving(true);
    try {
      const [h, m] = formTime.split(':').map(Number);
      const dt = new Date(selectedDay.getFullYear(), selectedDay.getMonth(), selectedDay.getDate(), h, m);
      const clip = clips.find(c => c.id === formClipId);
      await supabase.from('scheduled_posts').insert({
        user_id: user.id,
        clip_id: formClipId || null,
        platform: formPlatform,
        scheduled_at: dt.toISOString(),
        status: 'scheduled',
        title: formTitle || (clip ? clip.title || `Clip ${clip.id.slice(0, 6)}` : 'Untitled Post'),
      });
      await fetchData(user.id);
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 3000);
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (postId: string) => {
    setDeleting(postId);
    await supabase.from('scheduled_posts').delete().eq('id', postId).eq('user_id', user?.id);
    await fetchData(user!.id);
    setDeleting(null);
  };

  const filteredPosts = useMemo(() => {
    return posts.filter(p => {
      if (filterPlatform !== 'all' && p.platform !== filterPlatform) return false;
      if (filterStatus !== 'all' && p.status !== filterStatus) return false;
      return true;
    });
  }, [posts, filterPlatform, filterStatus]);

  const upcoming = useMemo(() => filteredPosts
    .filter(p => new Date(p.scheduled_at) >= today)
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()),
  [filteredPosts, today]);

  const past = useMemo(() => filteredPosts
    .filter(p => new Date(p.scheduled_at) < today)
    .sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime()),
  [filteredPosts, today]);

  const platformCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    posts.forEach(p => { counts[p.platform] = (counts[p.platform] || 0) + 1; });
    return counts;
  }, [posts]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Loader2 className="w-10 h-10 text-[#00E5FF] animate-spin" />
            <div className="absolute inset-0 w-10 h-10 animate-ping rounded-full bg-[#00E5FF]/20" />
          </div>
          <p className="text-gray-400 text-sm font-mono">Loading your schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="max-w-7xl mx-auto space-y-6 pb-12 relative z-10"
    >
      {/* Toast */}
      <AnimatePresence>
        {savedToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl bg-[#00FFA3]/10 border border-[#00FFA3]/30 backdrop-blur-xl shadow-2xl"
          >
            <CheckCircle className="w-5 h-5 text-[#00FFA3]" />
            <span className="text-sm font-bold text-[#00FFA3]">Post scheduled!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-[#9945FF]/10 border border-[#9945FF]/30 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-[#9945FF]" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black font-heading tracking-tight text-white">Content Schedule</h1>
              <p className="text-xs md:text-sm text-gray-400">Plan and track your clip publishing across platforms.</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setView(view === 'calendar' ? 'timeline' : 'calendar')}
            className={cn(
              'px-3 py-2 rounded-xl text-xs font-bold font-mono transition-all border flex items-center gap-2',
              view === 'timeline'
                ? 'bg-[#9945FF]/20 text-[#9945FF] border-[#9945FF]/30'
                : 'bg-[#0A0B0E] text-gray-400 border-white/10 hover:text-white'
            )}
          >
            {view === 'calendar' ? <ListTodo className="w-3.5 h-3.5" /> : <Calendar className="w-3.5 h-3.5" />}
            {view === 'calendar' ? 'Timeline' : 'Calendar'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => openModal(new Date())}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#9945FF] to-[#00E5FF] text-black text-xs font-bold shadow-lg shadow-[#9945FF]/20 flex items-center gap-2 hover:shadow-[#00E5FF]/30 transition-shadow"
          >
            <Plus className="w-3.5 h-3.5" />
            Schedule Post
          </motion.button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
          <Filter className="w-3.5 h-3.5" />
          <span>Filter:</span>
        </div>
        <select
          value={filterPlatform}
          onChange={e => setFilterPlatform(e.target.value)}
          className="bg-[#0A0B0E] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-gray-300 focus:outline-none focus:border-[#00E5FF]/50 appearance-none cursor-pointer"
        >
          <option value="all">All Platforms</option>
          {PLATFORMS.map(p => (
            <option key={p.id} value={p.id}>{p.label}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="bg-[#0A0B0E] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-gray-300 focus:outline-none focus:border-[#00E5FF]/50 appearance-none cursor-pointer"
        >
          <option value="all">All Status</option>
          {STATUS_KEYS.map(s => (
            <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
          ))}
        </select>
        <div className="text-xs text-gray-500 font-mono ml-auto">
          {posts.length} total posts
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {view === 'calendar' ? (
            <>
              {/* Calendar Nav */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={prevMonth}
                    className="p-2 border border-white/10 rounded-xl bg-[#111317] hover:bg-white/5 transition-colors text-gray-300"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </motion.button>
                  <h2 className="font-bold font-heading text-white text-base min-w-[160px] text-center">
                    {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={nextMonth}
                    className="p-2 border border-white/10 rounded-xl bg-[#111317] hover:bg-white/5 transition-colors text-gray-300"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                </div>
                <div className="flex gap-1">
                  {PLATFORMS.map(p => (
                    <div key={p.id} className="flex items-center gap-1.5 text-[10px] text-gray-500 font-mono">
                      <div className={cn('w-2 h-2 rounded-full', p.dot)} />
                      <span className="hidden md:inline">{p.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="bg-white/[0.02] backdrop-blur-md border border-white/[0.06] rounded-2xl overflow-hidden">
                <div className="grid grid-cols-7 border-b border-white/[0.06] bg-white/[0.01]">
                  {DAY_NAMES.map(d => (
                    <div key={d} className="py-3 text-center text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">
                      {d}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 grid-rows-6">
                  {cells.map((date, i) => (
                    <CalendarCell
                      key={i}
                      date={date}
                      posts={getPostsForDay(date)}
                      isToday={!!(date &&
                        date.getDate() === today.getDate() &&
                        date.getMonth() === today.getMonth() &&
                        date.getFullYear() === today.getFullYear())}
                      onClick={() => date && openModal(date)}
                      onPostClick={(id) => handleDelete(id)}
                    />
                  ))}
                </div>
              </div>

              {/* Month Stats */}
              <div className="grid grid-cols-3 gap-3">
                {PLATFORMS.map(plt => {
                  const count = posts.filter(p => {
                    const d = new Date(p.scheduled_at);
                    return p.platform === plt.id &&
                      d.getMonth() === currentDate.getMonth() &&
                      d.getFullYear() === currentDate.getFullYear();
                  }).length;
                  return (
                    <motion.div
                      key={plt.id}
                      whileHover={{ y: -2 }}
                      className={cn('p-3 rounded-xl border text-center', plt.color.replace('text-', 'text-').replace('bg-', 'bg-'))}
                    >
                      <div className={cn('text-lg font-black font-heading text-white')}>{count}</div>
                      <div className="text-[10px] font-mono mt-0.5 opacity-70">{plt.label}</div>
                    </motion.div>
                  );
                })}
              </div>
            </>
          ) : (
            /* Timeline View */
            <div className="space-y-6">
              {/* Create Schedule CTA */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => openModal(new Date())}
                className="w-full p-5 rounded-2xl border border-dashed border-[#00E5FF]/30 bg-[#00E5FF]/[0.02] hover:bg-[#00E5FF]/[0.05] hover:border-[#00E5FF]/50 transition-all group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#00E5FF]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center justify-center gap-3 relative z-10">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#9945FF] to-[#00E5FF] flex items-center justify-center shadow-lg">
                    <Plus className="w-5 h-5 text-black" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-white">Create a New Scheduled Post</p>
                    <p className="text-xs text-gray-500 font-mono">Schedule clips for auto-publishing</p>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-[#00E5FF] ml-auto opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                </div>
              </motion.button>

              {/* Upcoming */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-4 h-4 text-[#00E5FF]" />
                  <h2 className="text-sm font-bold text-white">Upcoming Posts</h2>
                  <Badge variant="info" size="sm">{upcoming.length}</Badge>
                </div>
                {upcoming.length === 0 ? (
                  <div className="text-center py-10 glass-panel rounded-2xl border border-white/5">
                    <Calendar className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 font-mono">All clear! No upcoming posts</p>
                    <p className="text-xs text-gray-600 mt-1">Click a date or the button above to schedule</p>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-[#9945FF]/50 via-[#00E5FF]/30 to-transparent" />
                    <div className="space-y-3 pl-10">
                      {upcoming.map((post, i) => {
                        const plt = getPlatform(post.platform);
                        const st = getStatus(post.status);
                        const dt = new Date(post.scheduled_at);
                        const isDeleting = deleting === post.id;
                        return (
                          <motion.div
                            key={post.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            whileHover={{ x: 4, scale: 1.01 }}
                            className="relative group"
                          >
                            <div className={cn('absolute -left-[34px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-[#050505]', st.dot)} />
                            <div className={cn('p-4 rounded-xl border transition-all', plt.color)}>
                              <div className="flex justify-between items-start">
                                <div className="flex-1 min-w-0 pr-3">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm">{plt.icon}</span>
                                    <p className="text-sm font-bold truncate text-white">{post.title}</p>
                                  </div>
                                  <div className="flex items-center gap-3 text-[11px] font-mono">
                                    <span className="text-gray-400 flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {dt.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })} at{' '}
                                      {dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <Badge variant={post.status === 'scheduled' ? 'info' : post.status === 'published' ? 'success' : 'danger'} size="sm">
                                      {st.label}
                                    </Badge>
                                  </div>
                                </div>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleDelete(post.id)}
                                  disabled={isDeleting}
                                  className="shrink-0 opacity-0 group-hover:opacity-100 transition-all p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"
                                >
                                  {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                </motion.button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Past Posts */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <History className="w-4 h-4 text-gray-500" />
                  <h2 className="text-sm font-bold text-white">Past Posts</h2>
                  <Badge variant="secondary" size="sm">{past.length}</Badge>
                </div>
                {past.length === 0 ? (
                  <div className="text-center py-8 glass-panel rounded-2xl border border-white/5">
                    <p className="text-xs text-gray-500 font-mono">No past posts yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {past.slice(0, 10).map((post, i) => {
                      const plt = getPlatform(post.platform);
                      const st = getStatus(post.status);
                      const dt = new Date(post.scheduled_at);
                      return (
                        <motion.div
                          key={post.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', plt.color)}>
                              {plt.icon}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-gray-200 truncate">{post.title}</p>
                              <p className="text-[10px] text-gray-500 font-mono">
                                {dt.toLocaleDateString([], { month: 'short', day: 'numeric' })} &middot; {plt.label}
                              </p>
                            </div>
                          </div>
                          <Badge variant={post.status === 'published' ? 'success' : 'danger'} size="sm">
                            {st.label}
                          </Badge>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Quick Schedule */}
          <motion.div variants={fadeInUp} className="glass-panel p-5 rounded-2xl border border-white/5">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-[#9945FF]" />
              <h2 className="text-sm font-bold text-white">Quick Actions</h2>
            </div>
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => openModal(new Date())}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#9945FF] to-[#00E5FF] text-black text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#9945FF]/20 hover:shadow-[#00E5FF]/30 transition-shadow"
              >
                <Plus className="w-4 h-4" />
                New Schedule
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-300 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                Bulk Schedule
              </motion.button>
            </div>
          </motion.div>

          {/* Platform Connections */}
          <motion.div variants={fadeInUp} className="glass-panel p-5 rounded-2xl border border-white/5">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-4 h-4 text-[#00E5FF]" />
              <h2 className="text-sm font-bold text-white">Platforms</h2>
            </div>
            <div className="space-y-3">
              {PLATFORMS.map(plt => {
                const connected = socialAccounts.some(a => a.platform === plt.id);
                const account = socialAccounts.find(a => a.platform === plt.id);
                return (
                  <div key={plt.id} className={cn('p-3 rounded-xl border transition-all', plt.color)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {plt.icon}
                        <span className="text-xs font-bold">{plt.label}</span>
                      </div>
                      {connected ? (
                        <CheckCircle className="w-4 h-4 text-[#00FFA3]" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-gray-500" />
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[10px] font-mono text-gray-400">
                        {connected ? account?.handle || 'Connected' : 'Not connected'}
                      </span>
                      <span className="text-[10px] font-bold font-mono" style={{ color: connected ? '#00FFA3' : '#6B7280' }}>
                        {platformCounts[plt.id] || 0} posts
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Coming Soon */}
          <motion.div variants={fadeInUp} className="glass-panel p-5 rounded-2xl border border-dashed border-[#9945FF]/30 bg-[#9945FF]/[0.02]">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="w-4 h-4 text-[#9945FF]" />
              <h2 className="text-sm font-bold text-white">Auto-Schedule AI</h2>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Let our AI analyze your best-performing clips and automatically schedule them at optimal times for maximum engagement.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-4 w-full py-2.5 rounded-xl bg-[#9945FF]/10 border border-[#9945FF]/20 text-xs font-bold text-[#9945FF] hover:bg-[#9945FF]/20 transition-all"
            >
              Coming Soon
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Schedule Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-[#0D0E12] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <div>
                  <h2 className="font-bold text-lg text-white">Schedule Post</h2>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">
                    {selectedDay?.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white transition-colors p-1"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="p-6 space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Post Title</label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={e => setFormTitle(e.target.value)}
                    placeholder="e.g. Morning motivation clip"
                    className="w-full bg-[#111317] border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#00E5FF]/50 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Select Clip</label>
                  {clips.length === 0 ? (
                    <div className="p-3 rounded-xl border border-white/5 bg-[#111317] text-xs text-gray-500 font-mono text-center">
                      No ready clips yet. Generate clips first.
                    </div>
                  ) : (
                    <select
                      value={formClipId}
                      onChange={e => setFormClipId(e.target.value)}
                      className="w-full bg-[#111317] border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[#00E5FF]/50 transition-all"
                    >
                      {clips.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.title || `Clip ${c.id.slice(0, 8)}`} ({Math.round((c.end_sec - c.start_sec))}s)
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Platform</label>
                  <div className="grid grid-cols-3 gap-2">
                    {PLATFORMS.map(p => (
                      <motion.button
                        key={p.id}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setFormPlatform(p.id)}
                        className={cn(
                          'flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all',
                          formPlatform === p.id
                            ? p.color
                            : 'border-white/10 text-gray-500 hover:text-gray-300 hover:border-white/20'
                        )}
                      >
                        {p.icon}
                        {p.label.split(' ')[0]}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Time</label>
                  <input
                    type="time"
                    value={formTime}
                    onChange={e => setFormTime(e.target.value)}
                    className="w-full bg-[#111317] border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[#00E5FF]/50 transition-all"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-white/5 flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm font-bold text-gray-400 hover:text-white hover:border-white/20 transition-all"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSchedule}
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#9945FF] to-[#00E5FF] text-black text-sm font-bold shadow-lg shadow-[#9945FF]/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                  {saving ? 'Scheduling...' : 'Schedule Post'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
