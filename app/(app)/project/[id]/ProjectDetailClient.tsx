'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ExternalLink, Clock, Sparkles, Download,
  Sliders, Flame, Gauge, AlertCircle,
  Video, LayoutGrid, List,
  Globe, BrainCircuit
} from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { staggerContainer, fadeInUp, fadeInScale, gridContainer, gridItem } from '@/lib/animations';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useProjectProgress } from '@/hooks';

const STATUS_PROGRESS_MAP: Record<string, { progress: number; eta: string; title: string }> = {
  queued:          { progress: 5,  eta: "Queued...",           title: "Waiting for Worker" },
  ingesting:       { progress: 5,  eta: "Waking up engine...", title: "Initializing" },
  downloading:     { progress: 15, eta: "~4.5 mins left",     title: "Ingesting Media" },
  transcribing:    { progress: 30, eta: "~3 mins left",       title: "Whisper V3 Transcription" },
  transcribed:     { progress: 40, eta: "~3 mins left",       title: "Transcription Complete" },
  visual_analyzing:{ progress: 50, eta: "~2.5 mins left",    title: "Computer Vision Analysis" },
  face_detecting:  { progress: 65, eta: "~1.5 mins left",    title: "Active Speaker Tracking" },
  analyzing:       { progress: 80, eta: "~1 min left",       title: "Viral Hook Extraction" },
  analyzing_done:  { progress: 95, eta: "Finalizing renders", title: "Compiling Assets" },
};

interface ClipItem {
  id: string;
  title: string;
  hook: string | null;
  hookType: string | null;
  sparkScore: number;
  durationSec: number;
  startSec: number;
  endSec: number;
  outputUrl: string | null;
  status: string;
  scoreBreakdown: Record<string, number> | null;
  improvementTips: string[];
  captionStyle: string | null;
  hookSentence?: string | null;
  hookRewrite?: string | null;
  captionHook?: string | null;
  whyViral?: string | null;
  storyArc?: { setup?: number, tension?: number, payoff?: number, self_contained?: number } | null;
}

interface ProjectItem {
  id: string;
  title: string;
  sourceUrl: string | null;
  status: string;
  isProcessing: boolean;
  isReady: boolean;
  isFailed: boolean;
  duration: number;
  language: string | null;
  createdAt: string;
  transcriptText: string | null;
}

interface ProjectDetailClientProps {
  project: ProjectItem;
  clips: ClipItem[];
}

export function ProjectDetailClient({ project, clips }: ProjectDetailClientProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'score' | 'duration' | 'newest'>('score');
  const [liveStatus, setLiveStatus] = useState(project.status);
  const [liveClips, setLiveClips] = useState<ClipItem[]>(clips);
  const [liveProject, setLiveProject] = useState(project);

  // Fetch latest clips + project data from Supabase client-side (no page reload)
  const fetchLatest = useCallback(async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const [{ data: clipsData }, { data: projectData }] = await Promise.all([
      supabase.from('clips').select('*').eq('project_id', project.id).order('spark_score', { ascending: false }),
      supabase.from('projects').select('*').eq('id', project.id).single(),
    ]);
    if (clipsData) {
      setLiveClips(clipsData.map((c: any) => ({
        id: c.id, title: c.title || 'Untitled Clip', hook: c.hook || null,
        hookType: c.hook_type || null, sparkScore: c.spark_score || 0,
        durationSec: c.duration_sec || 0, startSec: c.start_sec || 0, endSec: c.end_sec || 0,
        outputUrl: c.output_url || null, status: c.status || 'pending',
        scoreBreakdown: c.score_breakdown || null, improvementTips: c.improvement_tips || [],
        captionStyle: c.caption_style || null, hookSentence: c.hook_sentence || null,
        hookRewrite: c.hook_rewrite || null, captionHook: c.caption_hook || null,
        whyViral: c.why_viral || null, storyArc: c.story_arc || null,
      })));
    }
    if (projectData) {
      setLiveProject(prev => ({
        ...prev,
        title: projectData.visual_analysis_json?.ai_project_title || prev.title,
        status: projectData.status,
        language: projectData.language || prev.language,
        duration: projectData.duration_sec || prev.duration,
      }));
    }
  }, [project.id]);

  // Only poll while processing — stop once done/failed
  const [wasProcessing] = useState(
    !['ready', 'completed', 'success', 'failed'].includes(project.status)
  );

  useProjectProgress({
    projectId: project.id,
    enabled: wasProcessing,
    onUpdate: (data) => {
      setLiveStatus(data.status);
      if (data.clipCount > liveClips.length) {
        fetchLatest();
      }
    },
    onComplete: (data) => {
      setLiveStatus(data.status);
      // Fetch fresh clips + project data without any page reload
      fetchLatest();
    },
  });

  const isProcessingLive = !['analyzing_done', 'done', 'ready', 'completed', 'success', 'failed'].includes(liveStatus);
  const isFailedLive = liveStatus === 'failed';
  const isReadyLive = !isProcessingLive && !isFailedLive;

  const statusInfo = STATUS_PROGRESS_MAP[liveStatus] || { progress: 5, eta: "Queued...", title: "Waiting for Worker" };
  const realProgress = isReadyLive ? 100 : isFailedLive ? 0 : statusInfo.progress;
  const statusTitle = isReadyLive ? "Ready for Export" : isFailedLive ? "Pipeline Failed" : statusInfo.title;

  const sortedClips = useMemo(() => {
    const result = [...liveClips];
    switch (sortBy) {
      case 'score': result.sort((a, b) => b.sparkScore - a.sparkScore); break;
      case 'duration': result.sort((a, b) => b.durationSec - a.durationSec); break;
      case 'newest': result.sort((a, b) => b.id.localeCompare(a.id)); break;
    }
    return result;
  }, [liveClips, sortBy]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-[#00FFA3] border-[#00FFA3]';
    if (score >= 60) return 'text-yellow-400 border-yellow-400';
    return 'text-gray-500 border-gray-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-[#00FFA3]/10 border-[#00FFA3]/30';
    if (score >= 60) return 'bg-yellow-400/10 border-yellow-400/30';
    return 'bg-gray-500/10 border-gray-500/30';
  };

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = () => {
    if (isProcessingLive) return 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse';
    if (isReadyLive) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (isFailedLive) return 'bg-red-500/10 text-red-400 border-red-500/20';
    return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="relative space-y-8 pb-12"
    >
      {/* Glow orbs */}
      <div className="glow-orb w-[400px] h-[400px] bg-[#9945FF] top-[-100px] right-[-100px]" />
      <div className="glow-orb w-[300px] h-[300px] bg-[#00E5FF] bottom-[100px] left-[-150px]" />

      {/* Header */}
      <motion.div variants={fadeInUp} className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/projects"
            className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-extrabold tracking-tight text-white">
                {liveProject.title}
              </h1>
              <span className={`text-xs font-mono uppercase px-2.5 py-1 rounded-full border ${getStatusBadge()}`}>
                ● {liveStatus.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-1.5 text-sm text-gray-500 flex-wrap">
              {liveProject.sourceUrl && (
                <a href={liveProject.sourceUrl} target="_blank" rel="noreferrer" className="text-[#00E5FF] hover:underline flex items-center gap-1 max-w-[300px] truncate">
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  {liveProject.sourceUrl}
                </a>
              )}
              {liveProject.duration > 0 && (
                <span className="flex items-center gap-1 font-mono text-xs">
                  <Clock className="w-3.5 h-3.5 text-[#00E5FF]" />
                  {formatDuration(liveProject.duration)}
                </span>
              )}
              {liveProject.language && (
                <Badge variant="info" size="sm" className="gap-1.5">
                  <Globe className="w-3 h-3" /> {liveProject.language.toUpperCase()}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {isReadyLive && (
          <div className="flex items-center gap-3">
            <Link href={`/clips/${project.id}`}>
              <Button variant="primary" size="lg" className="gap-2">
                <Sliders className="w-4 h-4" /> Open Editor
              </Button>
            </Link>
          </div>
        )}
      </motion.div>

      {/* Processing State */}
      {isProcessingLive && (
        <motion.div variants={fadeInScale} className="relative bg-white/5 border border-white/10 rounded-2xl p-12 overflow-hidden glass-panel max-w-3xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-r from-[#9945FF]/5 via-[#00E5FF]/5 to-transparent pointer-events-none" />
          <div className="relative space-y-8 flex flex-col items-center">
            
            <div className="flex items-center gap-4 text-center flex-col">
              <div className="w-16 h-16 bg-[#9945FF]/10 rounded-2xl flex items-center justify-center border border-[#9945FF]/30 shadow-[0_0_30px_rgba(153,69,255,0.2)]">
                <BrainCircuit className="w-8 h-8 text-[#9945FF] animate-pulse" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">{statusTitle}</h2>
                <ProcessingStats 
                  createdAt={project.createdAt} 
                  isReadyLive={isReadyLive} 
                  isFailedLive={isFailedLive} 
                  statusInfo={statusInfo} 
                  realProgress={realProgress} 
                />
              </div>
            </div>

            <div className="w-full max-w-md space-y-2">
              <div className="flex justify-between text-xs font-mono text-gray-400">
                <span>Neural Pipeline</span>
                <span className="text-[#00E5FF]">{realProgress}%</span>
              </div>
              <div className="w-full h-4 bg-[#0A0B0E] rounded-full overflow-hidden border border-white/10 shadow-inner">
                <motion.div
                  className="h-full relative"
                  style={{ background: 'linear-gradient(90deg, #9945FF, #00E5FF, #00FFA3)' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${realProgress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  <div className="absolute inset-0" style={{ backgroundImage: 'url(https://grainy-gradients.vercel.app/noise.svg)', opacity: 0.5, mixBlendMode: 'overlay' }}></div>
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </motion.div>
              </div>
            </div>

            {/* Live Pipeline Stage Log */}
            <div className="w-full max-w-md bg-black/40 rounded-xl border border-white/5 p-4 space-y-1.5">
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2.5 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse inline-block" />
                Live Pipeline
              </div>
              {([
                ['queued',           'Queued for processing'],
                ['ingesting',        'Waking up engine'],
                ['downloading',      'Ingesting media'],
                ['transcribing',     'Whisper V3 transcription'],
                ['transcribed',      'Transcription complete'],
                ['visual_analyzing', 'Computer vision analysis'],
                ['face_detecting',   'Active speaker tracking'],
                ['analyzing',        'Viral hook extraction'],
                ['analyzing_done',   'Compiling assets'],
              ] as [string, string][]).map(([stage, label]) => {
                const stages = ['queued','ingesting','downloading','transcribing','transcribed','visual_analyzing','face_detecting','analyzing','analyzing_done'];
                const stageIdx = stages.indexOf(stage);
                const currentIdx = stages.indexOf(liveStatus);
                const isDone = currentIdx > stageIdx;
                const isActive = liveStatus === stage;
                return (
                  <div key={stage} className={`flex items-center gap-2.5 text-xs font-mono py-0.5 transition-all ${isActive ? 'text-white' : isDone ? 'text-gray-600' : 'text-gray-800'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? 'bg-[#00E5FF] animate-pulse shadow-[0_0_6px_#00E5FF]' : isDone ? 'bg-[#00FFA3]' : 'bg-gray-800'}`} />
                    <span className={isActive ? 'text-[#00E5FF] font-bold' : isDone ? 'text-gray-600 line-through decoration-gray-700' : 'text-gray-800'}>{label}</span>
                    {isActive && <span className="ml-auto text-[10px] text-[#9945FF] animate-pulse font-bold">● ACTIVE</span>}
                    {isDone && <span className="ml-auto text-[10px] text-[#00FFA3]">✓</span>}
                  </div>
                );
              })}
            </div>

          </div>
        </motion.div>
      )}

      {/* Failed State */}
      {isFailedLive && (
        <motion.div variants={fadeInScale} className="bg-red-500/5 border border-red-500/20 rounded-2xl p-12 text-center max-w-xl mx-auto glass-panel">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Processing Failed</h2>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Something went wrong while analyzing your video. Please try uploading again.
          </p>
          <Link href="/dashboard">
            <Button variant="destructive" className="mt-6">
              Upload Again
            </Button>
          </Link>
        </motion.div>
      )}

      {/* Clips Section */}
      {isReadyLive && (
        <motion.div variants={fadeInUp} className="space-y-6">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                <Flame className="w-6 h-6 text-[#FF0055]" /> Viral Clips
              </h2>
              <Badge variant="outline" size="sm" className="font-mono">
                {liveClips.length} clip{liveClips.length !== 1 ? 's' : ''}
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="appearance-none bg-white/5 border border-white/10 rounded-xl py-2 pl-4 pr-10 text-sm text-gray-300 focus:outline-none focus:border-[#9945FF]/50 cursor-pointer"
                >
                  <option value="score">Sort by Score</option>
                  <option value="duration">Sort by Duration</option>
                  <option value="newest">Sort by Newest</option>
                </select>
                <Gauge className="w-3.5 h-3.5 text-gray-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white/10 text-[#00E5FF]' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white/10 text-[#00E5FF]' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Clips Grid/List */}
          {sortedClips.length === 0 ? (
            <motion.div variants={fadeInScale} className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center max-w-md mx-auto glass-panel">
              <AlertCircle className="w-10 h-10 text-gray-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-1">No Clips Found</h3>
              <p className="text-gray-400 text-xs">
                Our AI analyzed this video but could not find high-impact viral moments. Try uploading a longer video with stronger speech sections.
              </p>
              <Link href="/dashboard">
                <Button variant="secondary" className="mt-4">
                  Upload Another Video
                </Button>
              </Link>
            </motion.div>
          ) : viewMode === 'grid' ? (
            <motion.div
              variants={gridContainer}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6"
            >
              {sortedClips.map((clip, i) => (
                <ClipCard key={clip.id} clip={clip} index={i} formatDuration={formatDuration} />
              ))}
            </motion.div>
          ) : (
            <motion.div variants={gridContainer} className="space-y-3">
              {sortedClips.map((clip, i) => (
                <ClipListItem key={clip.id} clip={clip} index={i} formatDuration={formatDuration} getScoreColor={getScoreColor} getScoreBg={getScoreBg} />
              ))}
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

function ClipCard({ clip, index, formatDuration }: { clip: ClipItem; index: number; formatDuration: (s: number) => string }) {
  const arc = clip.storyArc || { setup: 0, tension: 0, payoff: 0 };
  const totalArc = (arc.setup || 0) + (arc.tension || 0) + (arc.payoff || 0);
  
  // Dynamic gradient based on score and index
  const gradientColors = [
    'from-[#FF0055]/40 to-[#9945FF]/40',
    'from-[#00E5FF]/40 to-[#00FFA3]/40',
    'from-[#FF8A00]/40 to-[#FF0055]/40',
    'from-[#9945FF]/40 to-[#00E5FF]/40',
  ];
  const bgGradient = gradientColors[index % gradientColors.length];

  const [showTip, setShowTip] = useState(false);

  // Map hook type to icon/color
  const getHookBadgeStyle = (type: string | null) => {
    if (!type) return { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/30', icon: '✨' };
    const t = type.toLowerCase();
    if (t.includes('contrarian') || t.includes('claim')) return { bg: 'bg-[#FF0055]/10', text: 'text-[#FF0055]', border: 'border-[#FF0055]/30', icon: '⚡' };
    if (t.includes('list') || t.includes('number')) return { bg: 'bg-[#00E5FF]/10', text: 'text-[#00E5FF]', border: 'border-[#00E5FF]/30', icon: '🔢' };
    if (t.includes('revelation') || t.includes('story')) return { bg: 'bg-[#9945FF]/10', text: 'text-[#9945FF]', border: 'border-[#9945FF]/30', icon: '💡' };
    if (t.includes('mistake') || t.includes('warning')) return { bg: 'bg-yellow-400/10', text: 'text-yellow-400', border: 'border-yellow-400/30', icon: '⚠️' };
    return { bg: 'bg-[#00FFA3]/10', text: 'text-[#00FFA3]', border: 'border-[#00FFA3]/30', icon: '🔥' };
  };
  const badgeStyle = getHookBadgeStyle(clip.hookType);

  const getArcColor = (score: number) => {
    if (score >= 20) return 'bg-[#00FFA3]';
    if (score >= 15) return 'bg-yellow-400';
    return 'bg-[#FF0055]';
  };

  return (
    <motion.div
      variants={gridItem}
      className="group bg-[#0A0A0A] border border-white/10 rounded-[24px] overflow-hidden flex flex-col transition-all duration-500 hover:border-[#9945FF]/50 hover:shadow-[0_0_40px_rgba(153,69,255,0.15)] relative"
    >
      {/* Video / Thumbnail Section */}
      <div className="relative aspect-[9/16] w-full bg-black flex flex-col justify-between overflow-hidden group-hover:scale-[1.02] transition-transform duration-700 ease-out">
        
        {clip.outputUrl ? (
          <video
            src={clip.outputUrl.startsWith('http') ? clip.outputUrl : `/api/storage?path=${clip.outputUrl}`}
            className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
            controls
            preload="metadata"
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient} flex items-center justify-center`}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent pointer-events-none opacity-60 h-1/3" />
        
        {/* Top Header */}
        <div className="relative z-20 p-4 flex justify-between items-start">
          <div className="flex flex-col gap-2">
            <Badge variant="outline" size="sm" className={`${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border} font-mono text-[10px] uppercase font-bold tracking-wider`}>
              {badgeStyle.icon} {clip.hookType?.replace(/_/g, ' ') || 'VIRAL HOOK'}
            </Badge>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white uppercase tracking-wider w-fit">
              <Clock className="w-3 h-3 text-[#00E5FF]" />
              {formatDuration(clip.durationSec)}
            </span>
          </div>
          
          {/* Spark Score Ring */}
          <div className="relative w-12 h-12 flex items-center justify-center bg-black/60 backdrop-blur-xl rounded-full border border-white/10 shadow-2xl shrink-0 group/score cursor-help">
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle cx="24" cy="24" r="20" className="stroke-white/5" strokeWidth="3" fill="transparent" />
              <circle
                cx="24" cy="24" r="20"
                className={`transition-all duration-1000 ease-out ${
                  clip.sparkScore >= 80 ? 'stroke-[#00FFA3]' : clip.sparkScore >= 60 ? 'stroke-[#FFD700]' : 'stroke-gray-500'
                }`}
                strokeWidth="3"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 20}
                strokeDashoffset={2 * Math.PI * 20 * (1 - clip.sparkScore / 100)}
                strokeLinecap="round"
              />
            </svg>
            <span className="relative z-10 text-sm font-black text-white font-mono">{clip.sparkScore}</span>
            <Flame className={`absolute -bottom-1 -right-1 w-4 h-4 ${clip.sparkScore >= 80 ? 'text-[#FF0055]' : 'hidden'}`} />
            
            {/* Score Breakdown Tooltip on hover */}
            <div className="absolute right-0 top-14 w-48 bg-[#111] border border-white/10 rounded-xl p-3 opacity-0 group-hover/score:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Arc Breakdown</div>
              <div className="space-y-1.5 text-xs text-white font-mono">
                <div className="flex justify-between"><span>Setup</span><span className={clip.storyArc?.setup && clip.storyArc.setup >= 20 ? 'text-[#00FFA3]' : ''}>{clip.storyArc?.setup || 0}/25</span></div>
                <div className="flex justify-between"><span>Tension</span><span className={clip.storyArc?.tension && clip.storyArc.tension >= 20 ? 'text-[#00FFA3]' : ''}>{clip.storyArc?.tension || 0}/25</span></div>
                <div className="flex justify-between"><span>Payoff</span><span className={clip.storyArc?.payoff && clip.storyArc.payoff >= 20 ? 'text-[#00FFA3]' : ''}>{clip.storyArc?.payoff || 0}/25</span></div>
                <div className="flex justify-between"><span>Self-Contained</span><span className={clip.storyArc?.self_contained && clip.storyArc.self_contained >= 20 ? 'text-[#00FFA3]' : ''}>{clip.storyArc?.self_contained || 0}/25</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Content Overlay (Caption & Hook) */}
        <div className="relative z-20 p-3 md:p-4 pt-12 flex flex-col justify-end mt-auto h-full pb-4 space-y-3">
          {/* Caption Hook Preview */}
          {clip.captionHook && (
            <div className="text-center w-full transform -rotate-2 py-2 px-2">
              <span className="text-lg sm:text-xl font-black text-white bg-[#FF0055] px-3 py-1 leading-snug tracking-tighter uppercase box-decoration-clone shadow-xl line-clamp-3">
                {clip.captionHook}
              </span>
            </div>
          )}

          <div className="space-y-1.5 bg-black/50 backdrop-blur-md p-3 rounded-xl border border-white/10 mt-auto shadow-xl">
            {/* Hook Sentence */}
            <p className="font-bold text-white text-xs md:text-sm leading-snug drop-shadow-md line-clamp-2">
              "{clip.hookSentence || clip.hook || clip.title}"
            </p>
            {/* Why it works */}
            {clip.whyViral && (
              <p className="text-[10px] font-medium text-[#00E5FF] leading-tight line-clamp-2 mt-1">
                <Sparkles className="w-3 h-3 inline mr-1" /> {clip.whyViral}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Action Bar & Stats (Below the thumbnail) */}
      <div className="bg-[#0A0A0A] flex flex-col flex-1 border-t border-white/5">
        
        {/* Story Arc Mini-Bar */}
        <div className="px-4 py-3 flex flex-col gap-1.5 border-b border-white/5">
          <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            <span>Setup</span>
            <span>Tension</span>
            <span>Payoff</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full flex gap-0.5 overflow-hidden">
            <div className={`h-full ${getArcColor(arc.setup || 0)}`} style={{ width: '33.33%' }} />
            <div className={`h-full ${getArcColor(arc.tension || 0)}`} style={{ width: '33.33%' }} />
            <div className={`h-full ${getArcColor(arc.payoff || 0)}`} style={{ width: '33.33%' }} />
          </div>
        </div>

        {/* Improvement Tip Toggle */}
        {clip.hookRewrite && (
          <div className="px-4 py-2 border-b border-white/5">
            <button 
              onClick={() => setShowTip(!showTip)}
              className="w-full flex items-center justify-between text-xs font-medium text-gray-400 hover:text-white transition-colors py-1"
            >
              <span className="flex items-center gap-1.5"><LightbulbIcon className="w-3.5 h-3.5 text-yellow-400" /> Hook Tip</span>
              <span className="text-[10px]">{showTip ? 'Hide' : 'Show'}</span>
            </button>
            <AnimatePresence>
              {showTip && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <p className="text-[11px] text-gray-300 bg-white/5 p-2 rounded-lg mt-1 border border-white/10 italic">
                    {clip.hookRewrite}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Action Buttons */}
        <div className="p-4 mt-auto flex gap-2">
          <Link href={`/clips/${clip.id}/edit`} className="flex-1">
            <button className="w-full h-10 bg-white/5 hover:bg-white/10 text-white font-bold border border-white/10 rounded-xl transition-all flex items-center justify-center gap-2 text-sm hover:border-white/20">
              <Sliders className="w-4 h-4 text-[#00E5FF]" /> Open Editor
            </button>
          </Link>
          {clip.outputUrl ? (
            <a
              href={clip.outputUrl.startsWith('http') ? clip.outputUrl : `/api/storage?path=${clip.outputUrl}`}
              download={`${clip.title || 'clip'}.mp4`}
              className="w-10 h-10 bg-[#00FFA3] hover:bg-[#00FFA3]/90 text-black font-bold rounded-xl transition-all flex items-center justify-center shadow-lg hover:shadow-[#00FFA3]/30 shrink-0"
            >
              <Download className="w-4 h-4" />
            </a>
          ) : (
            <button disabled className="w-10 h-10 bg-white/5 text-gray-600 rounded-xl cursor-not-allowed flex items-center justify-center shrink-0">
              <Video className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function LightbulbIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.9 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </svg>
  );
}

function ClipListItem({ clip, index, formatDuration, getScoreColor, getScoreBg }: {
  clip: ClipItem; index: number; formatDuration: (s: number) => string;
  getScoreColor: (s: number) => string; getScoreBg: (s: number) => string;
}) {
  return (
    <motion.div
      variants={gridItem}
      className="group bg-[#0A0A0A] border border-white/10 rounded-2xl p-4 flex items-center gap-5 hover:border-[#9945FF]/40 transition-all shadow-sm hover:shadow-[0_0_30px_rgba(153,69,255,0.1)]"
    >
      {/* Rank/Thumbnail block */}
      <div className="relative w-16 h-24 rounded-xl bg-black overflow-hidden flex items-center justify-center border border-white/5 shrink-0">
        {clip.outputUrl ? (
          <video src={clip.outputUrl.startsWith('http') ? clip.outputUrl : `/api/storage?path=${clip.outputUrl}`} className="w-full h-full object-cover opacity-60" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#9945FF]/30 to-[#00E5FF]/30" />
        )}
        <span className="absolute z-10 text-xl font-black text-white drop-shadow-md">{index + 1}</span>
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <h4 className="text-base font-bold text-white truncate group-hover:text-[#00E5FF] transition-colors">{clip.title || "AI Clip Title"}</h4>
        {clip.hook && <p className="text-sm text-gray-400 truncate mt-1 border-l-2 border-white/20 pl-2">&ldquo;{clip.hook}&rdquo;</p>}
        
        <div className="flex gap-3 mt-3">
          <span className="flex items-center gap-1 text-xs font-mono text-gray-500 bg-white/5 px-2 py-0.5 rounded-md">
            <Clock className="w-3 h-3" /> {formatDuration(clip.durationSec)}
          </span>
          {clip.hookType && (
            <span className="flex items-center gap-1 text-[10px] font-mono text-[#9945FF] bg-[#9945FF]/10 border border-[#9945FF]/30 px-2 py-0.5 rounded-md uppercase">
              {clip.hookType.replace(/_/g, ' ')}
            </span>
          )}
          {clip.improvementTips && clip.improvementTips.length > 0 && (
            <span className="flex items-center gap-1 text-xs font-medium text-[#00FFA3] bg-[#00FFA3]/10 px-2 py-0.5 rounded-md">
              <Sparkles className="w-3 h-3" /> AI Enhanced
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-5 shrink-0 pr-2">
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Score</span>
          <span className={`text-sm font-black font-mono px-3 py-1 rounded-lg border ${getScoreColor(clip.sparkScore)} ${getScoreBg(clip.sparkScore)}`}>
            {clip.sparkScore}
          </span>
        </div>

        <div className="h-10 w-px bg-white/10" />

        <div className="flex items-center gap-2">
          <Link href={`/clips/${clip.id}/edit`}>
            <button className="h-10 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium hover:text-[#00E5FF] transition-all flex items-center gap-2">
              <Sliders className="w-4 h-4" /> Edit
            </button>
          </Link>
          {clip.outputUrl ? (
             <a href={clip.outputUrl.startsWith('http') ? clip.outputUrl : `/api/storage?path=${clip.outputUrl}`} download className="h-10 w-10 flex items-center justify-center rounded-xl bg-[#00FFA3] hover:bg-[#00FFA3]/90 text-black font-bold transition-all shadow-lg hover:shadow-[#00FFA3]/30">
               <Download className="w-4 h-4" />
             </a>
          ) : (
            <button disabled className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 text-gray-600 cursor-not-allowed">
               <Video className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ProcessingStats({ createdAt, isReadyLive, isFailedLive, statusInfo, realProgress }: any) {
  const [dynamicEta, setDynamicEta] = useState<string>('');
  const [elapsedStr, setElapsedStr] = useState<string>('0s');

  useEffect(() => {
    if (isReadyLive || isFailedLive) {
      setDynamicEta('');
      return;
    }
    const interval = setInterval(() => {
      const startMs = new Date(createdAt).getTime();
      const elapsedSec = (Date.now() - startMs) / 1000;
      
      if (realProgress > 5 && realProgress < 100) {
        const totalEstimatedSec = (elapsedSec / realProgress) * 100;
        const remainingSec = Math.max(0, totalEstimatedSec - elapsedSec);
        if (remainingSec > 60) setDynamicEta(`~${Math.ceil(remainingSec / 60)} mins left`);
        else if (remainingSec > 0) setDynamicEta(`~${Math.ceil(remainingSec)} secs left`);
        else setDynamicEta('Almost done...');
      } else {
        setDynamicEta(statusInfo.eta);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [createdAt, isReadyLive, isFailedLive, realProgress, statusInfo.eta]);

  useEffect(() => {
    const startMs = new Date(createdAt).getTime();
    const interval = setInterval(() => {
      const elapsedSec = Math.floor((Date.now() - startMs) / 1000);
      if (elapsedSec < 60) setElapsedStr(`${elapsedSec}s`);
      else {
        const m = Math.floor(elapsedSec / 60);
        const s = elapsedSec % 60;
        setElapsedStr(`${m}m ${s}s`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [createdAt]);

  const eta = isReadyLive ? "Complete!" : isFailedLive ? "Failed" : dynamicEta || statusInfo.eta;

  return (
    <>
      <p className="text-[#00E5FF] font-mono text-sm mt-1">{realProgress}% <span className="text-gray-500 mx-2">•</span> {eta}</p>
      <p className="text-gray-500 font-mono text-xs mt-0.5">Elapsed: <span className="text-gray-300">{elapsedStr}</span></p>
    </>
  );
}
