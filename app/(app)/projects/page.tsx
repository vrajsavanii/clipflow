'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, ArrowUpDown, LayoutGrid, List,
  FolderOpen, Clock, Flame, AlertCircle, CheckCircle2,
  Sparkles, Video, ExternalLink, Play, Eye
} from 'lucide-react';
import { staggerContainer, fadeInUp, gridContainer, gridItem } from '@/lib/animations';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProjectDropdown } from '@/components/ProjectDropdown';
import { LiveTimer } from '@/components/LiveTimer';
import { createClient } from '@/lib/supabase/client';
import { useProjectProgress } from '@/hooks/useProjectProgress';
import Link from 'next/link';
import { getRelativeTime } from '@/lib/time';

interface ProjectItem {
  id: string;
  title: string;
  status: 'ready' | 'processing' | 'failed';
  progress: number;
  clipCount: number;
  duration: string | null;
  durationSec: number;
  time: string;
  createdAt: string;
  sourceUrl: string | null;
  language: string | null;
  maxScore: number;
}

export default function ProjectsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'clips'>('newest');

  useEffect(() => {
    let cancelled = false;
    async function loadProjects() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/login'); return; }

      const { data: projectsData, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) { console.error('Projects fetch error:', error); setLoading(false); return; }
      if (cancelled) return;

      // Fetch clip stats
      const projectIds = (projectsData || []).map((p: any) => p.id);
      const { data: clipStats } = projectIds.length > 0
        ? await supabase.from('clips').select('project_id, spark_score').in('project_id', projectIds)
        : { data: [] };

      const mapped: ProjectItem[] = (projectsData || []).map((p: any) => {
        const isReady = ['ready', 'completed', 'success', 'analyzing_done', 'done'].includes(p.status);
        const isFailed = p.status === 'failed';

        const d = p.duration_sec || 0;
        const hrs = Math.floor(d / 3600);
        const mins = Math.floor((d % 3600) / 60);
        const secs = Math.floor(d % 60);
        const durationStr = d > 0 ? (hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m ${secs}s`) : null;

        let progress = 10;
        if (p.status === 'queued') progress = 10;
        if (p.status === 'ingesting') progress = 20;
        if (p.status === 'downloading') progress = 35;
        if (p.status === 'transcribing') progress = 50;
        if (p.status === 'transcribed') progress = 60;
        if (p.status === 'visual_analyzing') progress = 75;
        if (p.status === 'face_detecting') progress = 80;
        if (p.status === 'analyzing') progress = 88;
        if (p.status === 'analyzing_done') progress = 95;
        if (isReady) progress = 100;

        let title = 'Untitled Project';
        if (p.visual_analysis_json?.ai_project_title) {
          title = p.visual_analysis_json.ai_project_title;
        } else if (p.source_url) {
          try {
            title = `Video: ${new URL(p.source_url).pathname.split('/').pop() || p.source_url}`;
          } catch {
            title = `Video: ${p.source_url.split('/').pop() || 'Untitled'}`;
          }
        }

        const projectClips = (clipStats || []).filter((c: any) => c.project_id === p.id);
        const clipCount = projectClips.length;
        const maxScore = clipCount > 0
          ? Math.max(0, ...projectClips.map((c: any) => c.spark_score || 0))
          : 0;

        return {
          id: p.id,
          title,
          status: (isReady ? 'ready' : isFailed ? 'failed' : 'processing') as 'ready' | 'failed' | 'processing',
          progress,
          clipCount,
          duration: durationStr,
          durationSec: d,
          time: getRelativeTime(p.created_at),
          createdAt: p.created_at,
          sourceUrl: p.source_url,
          language: p.language,
          maxScore,
        };
      });

      if (!cancelled) {
        setProjects(mapped);
        setLoading(false);
      }
    }

    loadProjects();
    return () => { cancelled = true; };
  }, [supabase, router]);

  const filteredProjects = useMemo(() => {
    let result = [...projects];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.title.toLowerCase().includes(q));
    }
    if (filterStatus !== 'all') {
      result = result.filter(p => p.status === filterStatus);
    }
    switch (sortBy) {
      case 'newest': result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
      case 'oldest': result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()); break;
      case 'clips':  result.sort((a, b) => b.clipCount - a.clipCount); break;
    }
    return result;
  }, [projects, searchQuery, filterStatus, sortBy]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: projects.length };
    projects.forEach(p => { counts[p.status] = (counts[p.status] || 0) + 1; });
    return counts;
  }, [projects]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready':
        return <Badge variant="success" size="sm" className="gap-1.5"><CheckCircle2 className="w-3 h-3" /> Ready</Badge>;
      case 'processing':
        return <Badge variant="warning" size="sm" className="gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" /> Processing</Badge>;
      case 'failed':
        return <Badge variant="danger" size="sm" className="gap-1.5"><AlertCircle className="w-3 h-3" /> Failed</Badge>;
      default:
        return <Badge variant="secondary" size="sm">{status}</Badge>;
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div className="h-10 w-48 rounded-xl bg-white/[0.04] animate-pulse" />
          <div className="h-10 w-32 rounded-xl bg-white/[0.04] animate-pulse" />
        </div>
        <div className="h-14 rounded-2xl bg-white/[0.04] animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-64 rounded-3xl bg-white/[0.04] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="max-w-7xl mx-auto space-y-8 relative z-10 pb-12">
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white flex items-center gap-3">
            Projects
            <span className="px-2.5 py-1 rounded-full bg-white/10 text-xs font-mono font-bold text-gray-400 border border-white/10">
              {projects.length}
            </span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">Manage your processed videos and generated clips.</p>
        </div>
        <Link href="/dashboard">
          <Button variant="primary" size="lg" className="gap-2 shadow-[0_0_20px_rgba(0,229,255,0.2)]">
            <Plus className="w-4 h-4" /> New Project
          </Button>
        </Link>
      </motion.div>

      {/* Filter/Search Bar */}
      <motion.div variants={fadeInUp} className="glass-panel rounded-2xl border border-white/5 p-2 flex flex-col md:flex-row gap-3">
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'All', icon: <FolderOpen className="w-4 h-4" /> },
            { id: 'ready', label: 'Ready', icon: <CheckCircle2 className="w-4 h-4" /> },
            { id: 'processing', label: 'Processing', icon: <Clock className="w-4 h-4" /> },
            { id: 'failed', label: 'Failed', icon: <AlertCircle className="w-4 h-4" /> },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterStatus(f.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                filterStatus === f.id
                  ? 'bg-white/10 text-white shadow-inner border border-white/10'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              {f.icon} {f.label}
              {statusCounts[f.id] > 0 && (
                <span className="text-[10px] font-mono text-gray-500 ml-0.5">({statusCounts[f.id]})</span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 group">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-[#00E5FF] transition-colors" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#050505] border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-[#00E5FF]/50 focus:ring-1 focus:ring-[#00E5FF]/50 transition-all placeholder:text-gray-600 shadow-inner"
            />
          </div>

          <div className="relative">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="appearance-none bg-[#050505] border border-white/10 rounded-xl py-2 pl-4 pr-10 text-sm text-gray-300 focus:outline-none focus:border-[#9945FF]/50 cursor-pointer shadow-inner"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="clips">Most Clips</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="hidden sm:flex items-center bg-[#050505] border border-white/10 rounded-xl p-1 shadow-inner">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white/10 text-[#00E5FF] shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white/10 text-[#00E5FF] shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <motion.div variants={fadeInUp}>
          <EmptyState
            title={searchQuery || filterStatus !== 'all' ? 'No matching projects' : 'Your library is empty'}
            description={
              searchQuery || filterStatus !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Upload your first long-form video to start generating viral short-form clips instantly.'
            }
            icon={<FolderOpen className="w-10 h-10" />}
            primaryAction={
              searchQuery || filterStatus !== 'all'
                ? { label: 'Clear Filters', onClick: () => { setSearchQuery(''); setFilterStatus('all'); } }
                : { label: 'Create Project', href: '/dashboard' }
            }
          />
        </motion.div>
      )}

      {/* Projects Grid/List */}
      {filteredProjects.length > 0 && (
        <motion.div
          variants={gridContainer}
          className={viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'flex flex-col gap-3'
          }
        >
          <AnimatePresence mode="popLayout">
            {filteredProjects.map(project => (
              <ProjectCardItem
                key={project.id}
                initialProject={project}
                viewMode={viewMode}
                getStatusBadge={getStatusBadge}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
}

function ProjectCardItem({ initialProject, viewMode, getStatusBadge }: any) {
  const [project, setProject] = useState(initialProject);
  const score = project.maxScore || 0;

  useProjectProgress({
    projectId: project.status === 'processing' ? project.id : null,
    onUpdate: (data) => {
      let prog = project.progress;
      if (data.status === 'ingesting') prog = 15;
      if (data.status === 'downloading') prog = 25;
      if (data.status === 'transcribing') prog = 40;
      if (data.status === 'visual_analyzing') prog = 60;
      if (data.status === 'face_detecting') prog = 75;
      if (data.status === 'analyzing') prog = 90;
      if (data.failed) {
        setProject((p: any) => ({ ...p, status: 'failed', clipCount: data.clipCount || p.clipCount }));
      } else {
        setProject((p: any) => ({ ...p, progress: prog, status: 'processing', clipCount: data.clipCount || p.clipCount }));
      }
    },
    onComplete: (data) => {
      if (data.status === 'failed') {
        setProject((p: any) => ({ ...p, status: 'failed', clipCount: data.clipCount || p.clipCount }));
      } else {
        setProject((p: any) => ({ ...p, status: 'ready', progress: 100, clipCount: data.clipCount || p.clipCount }));
      }
    }
  });

  return (
    <motion.div
      layout
      variants={gridItem}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, scale: 0.95 }}
      className={`glass-panel border border-white/5 overflow-hidden group hover:border-[#00E5FF]/40 transition-all duration-500 hover:shadow-[0_8px_30px_rgba(0,229,255,0.15)] bg-gradient-to-b from-[#0A0B0E] to-[#050505] ${
        viewMode === 'grid' ? 'rounded-3xl flex flex-col' : 'rounded-2xl flex flex-row h-28 items-center pr-4'
      }`}
    >
      {/* Thumbnail area */}
      <div className={`relative bg-gradient-to-br from-[#14161B] to-[#0A0B0E] overflow-hidden ${
        viewMode === 'grid' ? 'aspect-[16/10] w-full p-4 flex flex-col justify-between' : 'w-48 h-full p-3 flex flex-col justify-between shrink-0 border-r border-white/5'
      }`}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

        <div className="relative z-30 flex justify-between items-start w-full pointer-events-none">
          <div className="flex flex-col gap-2 pointer-events-auto">
            {getStatusBadge(project.status)}
          </div>
          <div onClick={e => e.stopPropagation()} className="relative z-30 pointer-events-auto">
            <ProjectDropdown projectId={project.id} className={viewMode === 'grid' ? 'opacity-0 group-hover:opacity-100 transition-opacity' : ''} />
          </div>
        </div>

        {project.status === 'ready' && (
          <Link href={`/clips/${project.id}`} className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 duration-500 z-20">
            <div className="w-12 h-12 rounded-full bg-[#00E5FF]/20 flex items-center justify-center backdrop-blur-md border border-[#00E5FF]/50 hover:bg-[#00E5FF]/40 transition-colors shadow-[0_0_30px_rgba(0,229,255,0.4)]">
              <div className="absolute inset-0 bg-[#00E5FF] rounded-full blur-md opacity-20" />
              <Play className="w-5 h-5 text-[#00E5FF] ml-1 relative z-10" />
            </div>
          </Link>
        )}

        <div className="relative z-10 flex justify-between items-end w-full">
          {project.duration && (
            <span className="px-2 py-1 bg-black/60 rounded-md text-[10px] font-mono backdrop-blur-md border border-white/10 text-white shadow-sm flex items-center gap-1">
              <Clock className="w-3 h-3" /> {project.duration}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className={viewMode === 'grid' ? 'p-5 flex flex-col gap-4 flex-1' : 'flex-1 min-w-0 px-6 py-2 flex items-center justify-between'}>
        <div className={viewMode === 'grid' ? '' : 'flex flex-col justify-center min-w-0 w-1/3'}>
          <Link
            href={project.status === 'ready' ? `/clips/${project.id}` : '#'}
            className="font-bold text-white hover:text-[#00E5FF] transition-colors truncate block"
          >
            {project.title}
          </Link>
          <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
            <span>{project.time}</span>
            {project.sourceUrl && (
              <a href={project.sourceUrl} target="_blank" rel="noreferrer" className="text-[#00E5FF]/60 hover:text-[#00E5FF] inline-flex items-center gap-1">
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {project.status === 'ready' && (
          <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-3 mb-2' : 'flex items-center gap-6 w-1/3'}>
            <div>
              <div className="text-[10px] text-gray-500 font-mono uppercase">Viral Score</div>
              <div className="flex items-center gap-1.5 text-sm font-bold font-mono text-white mt-0.5">
                <Flame className={`w-4 h-4 ${score >= 80 ? 'text-[#FF0055]' : score >= 50 ? 'text-yellow-500' : 'text-gray-400'}`} />
                {score > 0 ? `${score}%` : 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 font-mono uppercase">Clips</div>
              <div className="flex items-center gap-1.5 text-sm font-bold font-mono text-[#00E5FF] mt-0.5">
                <Sparkles className="w-4 h-4" />
                {project.clipCount}
              </div>
            </div>
          </div>
        )}

        {project.status === 'processing' && (
          <div className={viewMode === 'grid' ? 'space-y-2 mt-auto w-full' : 'w-64 ml-4 shrink-0'}>
            <div className="flex justify-between items-center w-full mb-1">
              <span className="text-[10px] font-mono text-[#9945FF] font-bold uppercase tracking-widest">Processing</span>
              <LiveTimer createdAt={project.createdAt} progress={project.progress} />
            </div>
            <div className="w-full h-2 bg-[#050505] rounded-full overflow-hidden border border-white/5 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-[#9945FF] to-[#00E5FF] transition-all duration-1000 ease-out shadow-[0_0_15px_#00E5FF]"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>
        )}

        {project.status === 'ready' && (
          <div className={viewMode === 'grid' ? 'mt-auto flex items-center gap-2 pt-4 border-t border-white/5' : 'flex items-center gap-3 shrink-0'}>
            <Link href={`/clips/${project.id}`} className="flex-1 text-center py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold text-white transition-all hover:border-white/20">
              Open Studio
            </Link>
            <Link href={`/project/${project.id}`} className="py-2.5 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-all">
              <Eye className="w-4 h-4" />
            </Link>
          </div>
        )}

        {project.status === 'failed' && (
          <div className={viewMode === 'grid' ? 'mt-auto' : 'shrink-0'}>
            <Link href="/dashboard" className="text-center block py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-sm font-bold text-red-400 transition-all">
              Retry Upload
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
}
