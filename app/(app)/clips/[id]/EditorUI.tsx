'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, Maximize2, Minimize2,
  Type, LayoutTemplate, MessageSquare, Video,
  Wand2, Undo2, Redo2, Share2, Download, Globe,
  Sparkles, CheckCircle2, Copy, SkipBack, SkipForward,
  Volume2, VolumeX, Film, Music, BrainCircuit,
  ChevronLeft, Loader2, ArrowLeftToLine, Clock,
  X, Heart
} from 'lucide-react';
import {
  CAPTION_STYLES, getLanguageInfo, getStyleById,
  type CaptionStyleId, type CaptionStyle
} from '@/lib/caption-styles';
import { staggerContainer, fadeInUp, fadeInScale, spring, buttonHover } from '@/lib/animations';
import { cn } from '@/lib/utils';

interface ClipData {
  id: string;
  title: string;
  hook: string | null;
  sparkScore: number;
  durationSec: number;
  startSec: number;
  endSec: number;
  outputUrl: string | null;
  status: string;
  captionStyle: string | null;
  language: string | null;
}

interface ProjectData {
  id: string;
  sourceUrl: string | null;
  status: string;
  durationSec: number;
  language: string | null;
  transcriptText: string | null;
}

interface TranscriptWord {
  word: string;
  start_ms: number;
  end_ms: number;
}

interface EditorUIProps {
  project: ProjectData;
  clips: ClipData[];
  activeClip: ClipData | null;
  videoUrl: string | null;
  transcript: TranscriptWord[];
}

type PanelTab = 'styles' | 'transcript' | 'clips' | 'magic';

export default function EditorUI({ project, clips, activeClip, videoUrl, transcript }: EditorUIProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<PanelTab>('styles');
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedStyle, setSelectedStyle] = useState<CaptionStyleId>(
    (activeClip?.captionStyle as CaptionStyleId) || 'neon_cyberpunk'
  );
  const [isExporting, setIsExporting] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [hoveredWord, setHoveredWord] = useState<number | null>(null);
  const [showSafeZone, setShowSafeZone] = useState(false);
  const [volume, setVolume] = useState(1);

  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const scrubberRef = useRef<HTMLDivElement>(null);

  const langInfo = getLanguageInfo(activeClip?.language || project?.language);
  const activeStyle = getStyleById(selectedStyle);
  const hasVideo = !!videoUrl;

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) videoRef.current.pause();
    else videoRef.current.play().catch(() => {});
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    if (videoRef.current) videoRef.current.volume = v;
    setVolume(v);
  }, []);

  const handleScrubberClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    videoRef.current.currentTime = percent * (activeClip?.durationSec || 0);
    setCurrentTime(videoRef.current.currentTime);
  }, [activeClip?.durationSec]);

  const skipForward = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.min(videoRef.current.duration, videoRef.current.currentTime + 5);
  }, []);

  const skipBack = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (!playerRef.current) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await playerRef.current.requestFullscreen();
    }
  }, []);

  const formatTime = (sec: number) => {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleExport = useCallback(async () => {
    if (!videoUrl) { toast.error('No video to export. Render the clip first.'); return; }
    setIsExporting(true);
    toast.loading('Preparing export...', { id: 'export' });
    await new Promise(r => setTimeout(r, 1200));
    toast.dismiss('export');
    toast.success('Export ready! Downloading your clip.');
    setIsExporting(false);
    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = `${activeClip?.title || 'clip'}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [videoUrl, activeClip?.title]);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setIsCopied(false), 2000);
  }, []);

  const handleStyleSelect = useCallback(async (styleId: CaptionStyleId) => {
    setSelectedStyle(styleId);
    const style = getStyleById(styleId);
    toast.success(`Style selected: ${style.name}`, {
      description: 'Click "Apply & Render" to bake this style into the video.',
      duration: 3000,
    });
  }, []);

  const handleRender = useCallback(async () => {
    if (!activeClip) return;
    setIsRendering(true);
    toast.loading('Queueing render...', { id: 'render' });
    try {
      const res = await fetch(`/api/clips/${activeClip.id}/render`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          caption_style: selectedStyle,
          start_sec: activeClip.startSec,
          end_sec: activeClip.endSec
        })
      });
      if (!res.ok) throw new Error('Failed to queue render');
      toast.dismiss('render');
      toast.success('Render queued! The video is being regenerated.', { duration: 5000 });
      // Reload after a short delay so the page shows the pending state
      setTimeout(() => window.location.reload(), 2000);
    } catch (err) {
      toast.dismiss('render');
      toast.error('Failed to queue render');
      setIsRendering(false);
    }
  }, [activeClip, selectedStyle]);

  const progress = activeClip?.durationSec ? (currentTime / activeClip.durationSec) * 100 : 0;
  const needsRender = selectedStyle !== (activeClip?.captionStyle || 'neon_cyberpunk');

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#050505]">
      {/* Top Navbar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="h-14 shrink-0 border-b border-white/5 flex items-center justify-between px-3 md:px-4 bg-[#080A0D] z-20"
      >
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <Link
            href={`/project/${project.id}`}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-white transition-colors shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Link>
          <div className="h-4 w-px bg-white/10 shrink-0" />
          <h1 className="text-sm font-bold text-white truncate max-w-[160px] sm:max-w-xs md:max-w-sm">
            {activeClip?.title || 'Clip Editor'}
          </h1>
          {langInfo && (
            <span className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-white/5 border border-white/10 text-gray-300">
              <Globe className="w-3 h-3 text-[#00E5FF]" />
              {langInfo.flag} {langInfo.name}
            </span>
          )}
          <span className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#00FFA3]/10 text-[#00FFA3] border border-[#00FFA3]/20">
            <CheckCircle2 className="w-3 h-3" /> AUTO-SAVED
          </span>
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          <button
            onClick={() => toast.info('Undo feature coming soon')}
            className="p-2 text-gray-500 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            title="Undo"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => toast.info('Redo feature coming soon')}
            className="p-2 text-gray-500 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            title="Redo"
          >
            <Redo2 className="w-4 h-4" />
          </button>
          <div className="h-4 w-px bg-white/10 mx-0.5 hidden sm:block" />
          <button
            onClick={handleCopyLink}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 hover:text-white transition-colors"
          >
            {isCopied ? <CheckCircle2 className="w-3.5 h-3.5 text-[#00FFA3]" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">Share</span>
          </button>
          
          {needsRender ? (
            <button
              onClick={handleRender}
              disabled={isRendering || !hasVideo}
              className="flex items-center gap-1.5 bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-black px-3 md:px-4 py-1.5 rounded-lg text-sm shadow-[0_0_15px_rgba(0,229,255,0.4)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {isRendering ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
              <span className="font-bold hidden sm:inline">{isRendering ? 'Rendering...' : 'Apply & Render'}</span>
            </button>
          ) : (
            <button
              onClick={handleExport}
              disabled={isExporting || !hasVideo}
              className="flex items-center gap-1.5 btn-premium-purple px-3 md:px-4 py-1.5 rounded-lg text-white text-sm shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              <span className="font-bold hidden sm:inline">{isExporting ? 'Exporting...' : 'Export'}</span>
            </button>
          )}
        </div>
      </motion.div>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Video Player */}
        <div className="flex-1 flex flex-col bg-[#030405] min-w-0">
          <div
            ref={playerRef}
            className="flex-1 p-3 md:p-6 flex items-center justify-center relative overflow-hidden group"
            onMouseEnter={() => setShowSafeZone(true)}
            onMouseLeave={() => setShowSafeZone(false)}
          >
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

            <motion.div
              layout
              className={`aspect-[9/16] h-full max-h-full bg-black border border-white/10 shadow-2xl relative flex flex-col justify-end rounded-lg overflow-hidden ${
                hasVideo ? 'neon-glow-cyan' : ''
              }`}
            >
              {hasVideo ? (
                <>
                  <video
                    ref={videoRef}
                    src={videoUrl!}
                    className="w-full h-full object-cover absolute inset-0 cursor-pointer"
                    onClick={togglePlay}
                    onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                    loop
                    preload="metadata"
                    playsInline
                  />

                  {/* Caption Style Preview Overlay Removed to prevent double-captions 
                      since the backend already burns captions into the output_url */}

                  {/* Controls overlay - bottom gradient */}
                  <div
                    className={`absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none z-10 transition-opacity duration-300 ${
                      isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
                    }`}
                  />
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={spring}
                  className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-[#07090E] z-20"
                >
                  <div className="w-16 h-16 rounded-full bg-[#9945FF]/15 border border-[#9945FF]/30 flex items-center justify-center mb-4">
                    <Sparkles className="w-7 h-7 text-[#9945FF] animate-pulse" />
                  </div>
                  <p className="text-white font-bold text-sm">Rendering in progress...</p>
                  <p className="text-gray-500 text-xs mt-1 font-mono max-w-[200px]">
                    Your clip will appear here once the AI processing is complete.
                  </p>
                  <div className="flex gap-1 mt-4">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="w-2 h-2 rounded-full bg-[#9945FF] animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* TikTok Safe Zone Indicator */}
              <AnimatePresence>
                {showSafeZone && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-x-0 bottom-0 h-36 pointer-events-none z-20"
                  >
                    <div className="absolute inset-x-4 bottom-10 h-px border-b border-dashed border-red-500/50" />
                    <div className="absolute inset-x-4 bottom-20 h-px border-t border-dashed border-red-500/50" />
                    <span className="absolute bottom-1 left-4 text-[10px] font-mono text-red-400/70">
                      TikTok Safe Zone
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Scrubber / Controls */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-16 shrink-0 border-t border-white/5 bg-[#080A0D] flex items-center px-3 md:px-4 gap-2 md:gap-4"
          >
            <button
              onClick={skipBack}
              className="p-1.5 text-gray-500 hover:text-white transition-colors rounded-lg hover:bg-white/5 hidden sm:block"
              title="Skip back 5s"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={togglePlay}
              disabled={!hasVideo}
              className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white flex items-center justify-center disabled:opacity-40"
            >
              {isPlaying
                ? <Pause className="w-4 h-4 fill-current" />
                : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>

            <button
              onClick={skipForward}
              className="p-1.5 text-gray-500 hover:text-white transition-colors rounded-lg hover:bg-white/5 hidden sm:block"
              title="Skip forward 5s"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <span className="text-xs font-mono text-gray-500 w-10 text-right tabular-nums shrink-0">
              {formatTime(currentTime)}
            </span>

            <div
              ref={scrubberRef}
              className="flex-1 h-1.5 bg-white/10 rounded-full relative overflow-hidden cursor-pointer group/bar"
              onClick={handleScrubberClick}
            >
              <motion.div
                className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-[#9945FF] to-[#00E5FF] rounded-full"
                style={{ width: `${progress}%` }}
                layout
              />
              <div className="absolute inset-0 group-hover/bar:bg-white/5 transition-colors rounded-full" />
            </div>

            <span className="text-xs font-mono text-gray-500 w-10 tabular-nums shrink-0">
              {formatTime(activeClip?.durationSec || 0)}
            </span>

            <button
              onClick={toggleMute}
              disabled={!hasVideo}
              className="p-1.5 text-gray-500 hover:text-white transition-colors rounded-lg hover:bg-white/5 hidden sm:block disabled:opacity-40"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              className="w-16 hidden md:block accent-[#00E5FF]"
            />

            <button
              onClick={toggleFullscreen}
              className="p-1.5 text-gray-500 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </motion.div>
        </div>

        {/* Right Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-[360px] flex flex-col bg-[#080A0D] border-l border-white/5 shrink-0"
        >
          {/* Tab Bar */}
          <div className="flex border-b border-white/5 shrink-0">
            {[
              { id: 'styles' as PanelTab, icon: <LayoutTemplate className="w-4 h-4" />, label: 'Styles' },
              { id: 'transcript' as PanelTab, icon: <MessageSquare className="w-4 h-4" />, label: 'Script' },
              { id: 'clips' as PanelTab, icon: <Film className="w-4 h-4" />, label: 'Clips' },
              { id: 'magic' as PanelTab, icon: <Wand2 className="w-4 h-4" />, label: 'AI Magic' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-[#00E5FF] text-[#00E5FF] bg-white/3'
                    : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              {activeTab === 'styles' && (
                <StylesPanel
                  key="styles"
                  langInfo={langInfo}
                  selectedStyle={selectedStyle}
                  activeStyle={activeStyle}
                  onStyleSelect={handleStyleSelect}
                />
              )}
              {activeTab === 'transcript' && (
                <TranscriptPanel
                  key="transcript"
                  transcript={transcript}
                  langInfo={langInfo}
                  hoveredWord={hoveredWord}
                  onHoverWord={setHoveredWord}
                  currentTime={currentTime}
                />
              )}
              {activeTab === 'clips' && (
                <ClipsPanel
                  key="clips"
                  clips={clips}
                  activeClip={activeClip}
                  projectId={project.id}
                />
              )}
              {activeTab === 'magic' && (
                <AiMagicPanel
                  key="magic"
                  activeClip={activeClip}
                />
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Styles Tab
   ────────────────────────────────────────────── */
function StylesPanel({
  langInfo,
  selectedStyle,
  activeStyle,
  onStyleSelect,
}: {
  langInfo: ReturnType<typeof getLanguageInfo>;
  selectedStyle: CaptionStyleId;
  activeStyle: CaptionStyle;
  onStyleSelect: (id: CaptionStyleId) => void;
}) {
  return (
    <motion.div
      key="styles"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="h-full overflow-y-auto"
    >
      {/* Language Detection Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 border-b border-white/5"
      >
        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
          <div className="w-8 h-8 rounded-lg bg-[#00E5FF]/10 flex items-center justify-center text-[#00E5FF] shrink-0">
            <Globe className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white">
              {langInfo.flag} Language: <span className="text-[#00E5FF]">{langInfo.name}</span>
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {langInfo.rtl ? 'RTL layout auto-applied' : `Recommended: ${getStyleById(langInfo.recommended_style).name}`}
            </p>
          </div>
          {selectedStyle !== langInfo.recommended_style && (
            <button
              onClick={() => onStyleSelect(langInfo.recommended_style)}
              className="shrink-0 text-[10px] font-bold text-[#00E5FF] hover:underline px-2 py-1 rounded-lg hover:bg-[#00E5FF]/10 transition-colors"
            >
              Apply
            </button>
          )}
        </div>
      </motion.div>

      {/* Caption Style Grid */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Caption Presets</p>
          <span className="text-[10px] font-mono text-gray-600">{CAPTION_STYLES.length} styles</span>
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="space-y-2"
        >
          {CAPTION_STYLES.map((style, i) => {
            const isActive = selectedStyle === style.id;
            return (
              <motion.button
                key={style.id}
                variants={fadeInUp}
                onClick={() => onStyleSelect(style.id)}
                className={`w-full text-left p-3 rounded-xl border transition-all duration-200 group ${
                  isActive
                    ? 'bg-white/10 border-[#00E5FF]/40 shadow-[0_0_20px_-5px_rgba(0,229,255,0.2)]'
                    : 'bg-white/3 border-transparent hover:bg-white/6 hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Mini Preview Swatch */}
                  <div
                    className="w-12 h-8 rounded-lg border border-white/10 flex items-center justify-center shrink-0 text-[8px] font-black uppercase overflow-hidden"
                    style={{
                      background: style.preview.background,
                      color: style.preview.highlightColor,
                      textShadow: style.preview.glow || 'none',
                      fontWeight: style.preview.fontWeight as any,
                    }}
                  >
                    Aa
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{style.name}</span>
                      {style.badge && (
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${style.badgeColor}`}>
                          {style.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5 truncate">{style.description}</p>
                  </div>

                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={spring}
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#00E5FF] shrink-0" />
                    </motion.div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Active Style Details */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-white/5 border border-white/5 rounded-xl mt-4 space-y-2"
        >
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Active: {activeStyle.name}
          </p>
          <div className="flex gap-3">
            {[
              { label: 'Text', color: activeStyle.preview.textColor },
              { label: 'Highlight', color: activeStyle.preview.highlightColor },
              { label: 'Stroke', color: activeStyle.preview.strokeColor },
            ].map(c => (
              <div key={c.label} className="flex items-center gap-1.5">
                <div
                  className="w-4 h-4 rounded border border-white/20"
                  style={{
                    background: c.color === 'transparent'
                      ? 'repeating-linear-gradient(45deg,#333 0px,#333 2px,transparent 2px,transparent 8px)'
                      : c.color,
                  }}
                />
                <span className="text-[10px] text-gray-500">{c.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   Transcript Tab
   ────────────────────────────────────────────── */
function TranscriptPanel({
  transcript,
  langInfo,
  hoveredWord,
  onHoverWord,
  currentTime,
}: {
  transcript: TranscriptWord[];
  langInfo: ReturnType<typeof getLanguageInfo>;
  hoveredWord: number | null;
  onHoverWord: (i: number | null) => void;
  currentTime: number;
}) {
  return (
    <motion.div
      key="transcript"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="h-full flex flex-col overflow-hidden"
    >
      <div className="p-4 border-b border-white/5 flex items-center justify-between shrink-0">
        <h3 className="text-sm font-bold">Transcript</h3>
        <span className="text-[11px] text-gray-500 font-mono">
          {langInfo.flag} {langInfo.name}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {transcript.length > 0 ? (
          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <p
              className="text-sm leading-relaxed text-gray-200"
              dir={langInfo?.rtl ? 'rtl' : 'ltr'}
            >
              {transcript.map((w, idx) => {
                const wordStartSec = w.start_ms / 1000;
                const wordEndSec = w.end_ms / 1000;
                const isActive = currentTime >= wordStartSec && currentTime <= wordEndSec;

                return (
                  <span
                    key={idx}
                    onMouseEnter={() => onHoverWord(idx)}
                    onMouseLeave={() => onHoverWord(null)}
                    className={`rounded px-0.5 cursor-pointer transition-all duration-150 inline ${
                      isActive
                        ? 'bg-[#00E5FF]/30 text-[#00E5FF] font-bold'
                        : hoveredWord === idx
                          ? 'bg-[#00E5FF]/20 text-[#00E5FF]'
                          : 'hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {w.word}{' '}
                  </span>
                );
              })}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <MessageSquare className="w-8 h-8 text-gray-700 mb-2" />
            <p className="text-gray-500 text-xs font-mono">No transcript available</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   Clips Tab
   ────────────────────────────────────────────── */
function ClipsPanel({
  clips,
  activeClip,
  projectId,
}: {
  clips: ClipData[];
  activeClip: ClipData | null;
  projectId: string;
}) {
  return (
    <motion.div
      key="clips"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="h-full flex flex-col overflow-hidden"
    >
      <div className="p-4 border-b border-white/5 shrink-0">
        <h3 className="text-sm font-bold">Viral Clips</h3>
        <p className="text-[11px] text-gray-500 mt-0.5">{clips.length} clip{clips.length !== 1 ? 's' : ''} generated</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <AnimatePresence>
          {clips.map((c, i) => {
            const isActiveClip = activeClip?.id === c.id;
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href={`/clips/${projectId}?clipId=${c.id}`}
                  className={`block p-3 rounded-xl border transition-all ${
                    isActiveClip
                      ? 'bg-[#00E5FF]/10 border-[#00E5FF]/40 shadow-[0_0_15px_rgba(0,229,255,0.1)]'
                      : 'bg-white/3 border-transparent hover:bg-white/6 hover:border-white/10'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <span className="text-[11px] font-mono text-[#00E5FF]">Clip {i + 1}</span>
                    <div className="flex items-center gap-2">
                      {c.sparkScore > 0 && (
                        <span className={`text-[10px] font-bold font-mono ${
                          c.sparkScore >= 80 ? 'text-[#00FFA3]' : c.sparkScore >= 60 ? 'text-yellow-400' : 'text-gray-500'
                        }`}>
                          {c.sparkScore}
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-gray-500">
                        {Math.round(c.durationSec)}s
                      </span>
                    </div>
                  </div>
                  <h4 className="text-xs font-bold text-white leading-tight mb-1">{c.title}</h4>
                  {c.hook && (
                    <p className="text-[11px] text-gray-400 line-clamp-2">&ldquo;{c.hook}&rdquo;</p>
                  )}
                  {c.status === 'rendering' && (
                    <div className="mt-2 flex items-center gap-1.5 text-[10px] text-yellow-400 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" /> Rendering...
                    </div>
                  )}
                  {c.status === 'done' && (
                    <div className="mt-2 flex items-center gap-1.5 text-[10px] text-[#00FFA3] font-bold">
                      <CheckCircle2 className="w-3 h-3" /> Ready
                    </div>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   AI Magic Tab
   ────────────────────────────────────────────── */
function AiMagicPanel({ activeClip }: { activeClip: ClipData | null }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedFeatures, setCompletedFeatures] = useState<Record<string, boolean>>({});

  const features = [
    { id: 'broll', icon: <Film className="w-5 h-5" />, label: 'AI B-Roll', desc: 'Auto-suggest relevant stock footage and cutaway clips' },
    { id: 'audio', icon: <Music className="w-5 h-5" />, label: 'AI Audio', desc: 'Trending sound recommendations and background music' },
    { id: 'hook', icon: <BrainCircuit className="w-5 h-5" />, label: 'Hook Optimizer', desc: 'Rewrite your hook for maximum retention' },
    { id: 'score', icon: <Heart className="w-5 h-5" />, label: 'Viral Score', desc: 'Predict engagement before you post' },
  ];

  const handleEnhance = () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setCompletedFeatures({});
    
    // Simulate processing pipeline
    setTimeout(() => setCompletedFeatures(prev => ({ ...prev, broll: true })), 1500);
    setTimeout(() => setCompletedFeatures(prev => ({ ...prev, audio: true })), 3000);
    setTimeout(() => setCompletedFeatures(prev => ({ ...prev, hook: true })), 4500);
    setTimeout(() => {
      setCompletedFeatures(prev => ({ ...prev, score: true }));
      setIsProcessing(false);
    }, 6000);
  };

  return (
    <motion.div
      key="magic"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="h-full overflow-y-auto p-6"
    >
      <div className="flex flex-col items-center text-center space-y-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={spring}
          className="w-16 h-16 rounded-full bg-[#9945FF]/15 border border-[#9945FF]/30 flex items-center justify-center neon-glow-purple relative"
        >
          {isProcessing ? (
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="w-8 h-8 text-[#9945FF]" />
            </motion.div>
          ) : (
            <Wand2 className="w-8 h-8 text-[#9945FF]" />
          )}
        </motion.div>

        <div>
          <h3 className="text-lg font-bold">AI Magic Studio</h3>
          <p className="text-sm text-gray-400 mt-1">
            Supercharge <span className="text-white font-semibold">{activeClip?.title || 'this clip'}</span> with AI-powered enhancements.
          </p>
        </div>

        <div className="w-full space-y-3">
          {features.map((feat, i) => {
            const isCompleted = completedFeatures[feat.id];
            
            return (
              <motion.div
                key={feat.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-xl border transition-all",
                  isCompleted ? "bg-[#00FFA3]/5 border-[#00FFA3]/20" : 
                  isProcessing && !isCompleted ? "bg-white/5 border-[#9945FF]/30 shadow-[0_0_15px_rgba(153,69,255,0.15)] animate-pulse" :
                  "bg-white/5 border-white/5"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                  isCompleted ? "bg-[#00FFA3]/10 text-[#00FFA3]" : "bg-[#9945FF]/10 text-[#9945FF]"
                )}>
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : feat.icon}
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className={cn("text-sm font-bold", isCompleted ? "text-[#00FFA3]" : "text-white")}>{feat.label}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{feat.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <button
          onClick={handleEnhance}
          disabled={isProcessing}
          className={cn(
            "w-full px-6 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all",
            isProcessing ? "bg-white/10 text-gray-400 cursor-not-allowed" : "btn-premium-purple shadow-lg hover:shadow-[0_0_25px_rgba(153,69,255,0.4)]"
          )}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Enhancing Clip...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Auto Enhance
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
