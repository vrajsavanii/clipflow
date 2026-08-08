'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { 
  Play, Pause, Scissors, Sparkles, Sliders, Type, Check, AlertCircle, 
  ArrowLeft, RotateCcw, Video, HelpCircle, Loader2, Save, FileText, 
  Settings, Flame, Compass, Volume2, Maximize2, Minimize2, CheckCircle2,
  Calendar, CheckSquare, Smile, ZoomIn, Music, Layers, Eye, Download
} from 'lucide-react';
import Link from 'next/link';

interface Caption {
  id: string;
  word: string;
  start_ms: number;
  end_ms: number;
  speaker?: string;
  confidence?: number;
}

export default function ClipEditorClient({ clip, project, initialCaptions }: any) {
  const router = useRouter();
  const supabase = createClient();

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const [clipStart, setClipStart] = useState(clip.start_sec);
  const [clipEnd, setClipEnd] = useState(clip.end_sec);
  const [title, setTitle] = useState(clip.title);
  const [captionStyle, setCaptionStyle] = useState(clip.caption_style || 'BOLD_WHITE');
  const [aspectRatio, setAspectRatio] = useState(clip.aspect_ratio || '9:16');
  
  const [captions, setCaptions] = useState<Caption[]>(initialCaptions);
  const [editingWordId, setEditingWordId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  const [activeSidebarTab, setActiveSidebarTab] = useState<'script' | 'design' | 'ai'>('script');

  // AI Feature Toggles (Mock state)
  const [autoZoom, setAutoZoom] = useState(true);
  const [emojiOverlay, setEmojiOverlay] = useState(true);
  const [removeSilences, setRemoveSilences] = useState(true);
  const [bRoll, setBRoll] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.currentTime >= clipEnd) {
        video.currentTime = clipStart;
        if (!isPlaying) { video.play().catch(() => {}); setIsPlaying(true); }
      }
    };
    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [clipStart, clipEnd, isPlaying]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) { video.pause(); setIsPlaying(false); } 
    else { video.play().catch(() => {}); setIsPlaying(true); }
  };

  const seekTo = (sec: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = sec;
    setCurrentTime(sec);
  };

  // Use the clip's output URL if available, otherwise fall back to the project's transcript data
  const sourceVideoUrl = clip.output_url 
    ? `/api/storage?path=${clip.output_url}`
    : null;
  const clipDuration = (clipEnd - clipStart).toFixed(1);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] -mx-6 -mb-6 bg-[#050505] overflow-hidden text-white font-sans selection:bg-[#00E5FF]/30">
      
      {/* Top Navigation Bar */}
      <header className="h-14 border-b border-white/5 bg-[#0A0B0E] flex items-center justify-between px-4 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <Link href={`/project/${clip.project_id}`} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
            <ArrowLeft className="w-4 h-4 text-gray-400" />
          </Link>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-gray-200">{clip.title}</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20">1080p</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs font-mono">
            <Flame className="w-4 h-4 text-[#FF0055]" /> Viral Score: <span className="font-bold text-white">{clip.spark_score}</span>
          </div>
          <button 
            onClick={async () => {
              try {
                const res = await fetch(`/api/clips/${clip.id}/render`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    start_sec: clipStart,
                    end_sec: clipEnd,
                    title,
                    caption_style: captionStyle,
                    aspect_ratio: aspectRatio,
                  })
                });
                if (!res.ok) throw new Error('Failed to render');
                alert('Render job queued successfully! Go back to project to check progress.');
                router.push(`/project/${clip.project_id}`);
              } catch (e: any) {
                alert(e.message);
              }
            }}
            className="px-6 py-2 bg-gradient-to-r from-[#9945FF] to-[#00E5FF] hover:opacity-90 transition-opacity rounded-lg text-black font-bold text-sm flex items-center gap-2 shadow-[0_0_15px_rgba(0,229,255,0.3)]"
          >
            <Download className="w-4 h-4" /> Export HD
          </button>
        </div>
      </header>

      {/* Main Editor Workspace */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Toolbar (Tools) */}
        <div className="w-14 border-r border-white/5 bg-[#0A0B0E] flex flex-col items-center py-4 gap-4 shrink-0 z-10">
          <button className="w-10 h-10 rounded-xl bg-[#00E5FF]/10 text-[#00E5FF] flex items-center justify-center border border-[#00E5FF]/20 tooltip-trigger"><Scissors className="w-5 h-5" /></button>
          <button className="w-10 h-10 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white flex items-center justify-center transition-colors"><Type className="w-5 h-5" /></button>
          <button className="w-10 h-10 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white flex items-center justify-center transition-colors"><Smile className="w-5 h-5" /></button>
          <button className="w-10 h-10 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white flex items-center justify-center transition-colors"><ZoomIn className="w-5 h-5" /></button>
          <div className="mt-auto">
            <button className="w-10 h-10 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white flex items-center justify-center transition-colors"><Settings className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Center Canvas (Video Player) */}
        <div className="flex-1 bg-[#050505] flex flex-col relative overflow-hidden">
          {/* Background grid pattern */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>

          <div className="flex-1 flex items-center justify-center p-8 relative z-10">
            <div className={`relative bg-black rounded-xl overflow-hidden border border-white/10 shadow-2xl group transition-all duration-300 ${aspectRatio === '9:16' ? 'aspect-[9/16] h-[90%]' : 'aspect-square h-[80%]'}`}>
              <video
                ref={videoRef}
                src={sourceVideoUrl || undefined}
                className="w-full h-full object-cover"
                onClick={togglePlay}
              />
              {/* Play Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <button className="w-16 h-16 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 pointer-events-auto hover:scale-110 transition-transform">
                  {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                </button>
              </div>
              {/* Mock Subtitle Render */}
              <div className="absolute bottom-[20%] inset-x-4 text-center pointer-events-none">
                <span className={`text-2xl md:text-3xl font-black uppercase ${captionStyle === 'BOLD_WHITE' ? 'text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]' : captionStyle === 'NEON_CYAN' ? 'text-[#00E5FF] drop-shadow-[0_0_15px_rgba(0,229,255,0.8)]' : 'text-[#00FFA3] drop-shadow-[0_0_15px_rgba(0,255,163,0.8)]'}`}>
                  {captions.find(c => currentTime * 1000 >= c.start_ms && currentTime * 1000 <= c.end_ms)?.word || '...'}
                </span>
              </div>
              {/* Safe Zones */}
              <div className="absolute inset-x-0 bottom-0 h-32 border-t border-white/10 bg-gradient-to-t from-red-500/10 to-transparent pointer-events-none flex items-end justify-center pb-2">
                <span className="text-[10px] text-red-500/50 font-bold uppercase tracking-widest">TikTok UI Safe Zone</span>
              </div>
            </div>
          </div>

          {/* Timeline Playback Controls */}
          <div className="h-12 border-t border-white/5 bg-[#0A0B0E] flex items-center justify-between px-4 z-10 shrink-0">
            <div className="flex items-center gap-4 text-xs font-mono text-gray-400">
              <span className="text-white">{currentTime.toFixed(2)}</span>
              <span>/</span>
              <span>{clipEnd.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2">
               <button onClick={togglePlay} className="p-2 bg-white/10 hover:bg-white/20 rounded text-white transition-colors">
                  {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
               </button>
            </div>
            <div className="flex items-center gap-3">
              <Volume2 className="w-4 h-4 text-gray-500" />
              <div className="w-24 h-1 bg-white/10 rounded-full"><div className="w-[80%] h-full bg-[#00E5FF] rounded-full"></div></div>
            </div>
          </div>
        </div>

        {/* Right Sidebar (Script/Design/AI) */}
        <div className="w-80 border-l border-white/5 bg-[#0A0B0E] flex flex-col z-20 shrink-0">
          
          {/* Tabs */}
          <div className="flex border-b border-white/5 p-2 gap-1 shrink-0">
            {[
              { id: 'script', label: 'Script', icon: FileText },
              { id: 'design', label: 'Design', icon: Sliders },
              { id: 'ai', label: 'AI Magic', icon: Sparkles }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveSidebarTab(tab.id as any)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex flex-col items-center gap-1 ${
                  activeSidebarTab === tab.id ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                }`}
              >
                <tab.icon className="w-4 h-4" /> {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            
            {/* SCRIPT TAB */}
            {activeSidebarTab === 'script' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs font-mono text-gray-500 border-b border-white/5 pb-2 mb-4">
                  <span>Interactive Transcript</span>
                  <span>{captions.length} words</span>
                </div>
                <div className="text-[13px] leading-relaxed text-gray-400">
                  {captions.map((cap) => {
                    const active = currentTime * 1000 >= cap.start_ms && currentTime * 1000 <= cap.end_ms;
                    return (
                      <span
                        key={cap.id}
                        onClick={() => seekTo(cap.start_ms / 1000)}
                        className={`cursor-pointer hover:bg-white/10 rounded px-1 transition-colors ${active ? 'text-black bg-[#00E5FF] font-bold' : ''}`}
                      >
                        {cap.word}{' '}
                      </span>
                    )
                  })}
                </div>
              </div>
            )}

            {/* DESIGN TAB */}
            {activeSidebarTab === 'design' && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-gray-500 uppercase">Caption Template</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'BOLD_WHITE', label: 'Standard', style: 'text-white' },
                      { id: 'NEON_CYAN', label: 'Cyber', style: 'text-[#00E5FF]' },
                      { id: 'YELLOW_GREEN', label: 'Hormozi', style: 'text-[#00FFA3]' }
                    ].map(s => (
                      <button 
                        key={s.id} onClick={() => setCaptionStyle(s.id)}
                        className={`p-3 border rounded-xl text-center text-xs font-black transition-all ${captionStyle === s.id ? 'border-[#9945FF] bg-[#9945FF]/10 text-white' : 'border-white/10 text-gray-500'}`}
                      >
                        <span className={s.style}>{s.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-gray-500 uppercase">Position (Y-Axis)</label>
                  <input type="range" className="w-full h-1 bg-white/10 rounded-full appearance-none accent-[#00E5FF]" defaultValue={80} />
                </div>
              </div>
            )}

            {/* AI MAGIC TAB */}
            {activeSidebarTab === 'ai' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-[#9945FF]/10 to-[#00E5FF]/10 border border-[#9945FF]/30 space-y-2">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2"><Sparkles className="w-4 h-4 text-[#9945FF]" /> LLaMA Recommendations</h4>
                  <p className="text-xs text-gray-400">This clip has high viral potential, but removing silences will increase retention by est. 12%.</p>
                </div>

                <div className="space-y-2 mt-6">
                  {[
                    { id: 'silence', label: 'Remove Silences', desc: 'Auto-cut dead air', state: removeSilences, set: setRemoveSilences, icon: Scissors },
                    { id: 'zoom', label: 'Auto-Zooms', desc: 'Dynamic punch-ins on punchlines', state: autoZoom, set: setAutoZoom, icon: ZoomIn },
                    { id: 'emoji', label: 'Emoji Overlays', desc: 'Contextual animated emojis', state: emojiOverlay, set: setEmojiOverlay, icon: Smile },
                    { id: 'broll', label: 'AI B-Roll', desc: 'Generate visual cutaways', state: bRoll, set: setBRoll, icon: Layers }
                  ].map(feature => (
                    <div key={feature.id} className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-black/50 flex items-center justify-center text-gray-400"><feature.icon className="w-4 h-4" /></div>
                        <div>
                          <div className="text-xs font-bold text-white">{feature.label}</div>
                          <div className="text-[10px] text-gray-500">{feature.desc}</div>
                        </div>
                      </div>
                      <button 
                        onClick={() => feature.set(!feature.state)}
                        className={`w-10 h-6 rounded-full p-1 transition-colors ${feature.state ? 'bg-[#00E5FF]' : 'bg-white/10'}`}
                      >
                        <motion.div layout className={`w-4 h-4 rounded-full bg-white shadow-sm ${feature.state ? 'ml-auto' : ''}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Bottom Multi-Track Timeline */}
      <div className="h-64 border-t border-white/5 bg-[#050505] shrink-0 flex flex-col">
        {/* Timeline Header Tools */}
        <div className="h-10 border-b border-white/5 flex items-center px-4 gap-4 text-xs font-bold text-gray-500 bg-[#0A0B0E]">
          <button className="hover:text-white">Cut</button>
          <button className="hover:text-white">Split</button>
          <button className="hover:text-white">Delete</button>
          <div className="w-px h-4 bg-white/10 mx-2"></div>
          <button className="text-[#00E5FF]">Auto-Sync</button>
        </div>

        {/* Tracks Area */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden relative p-4 flex flex-col gap-2 relative">
          {/* Playhead indicator */}
          <motion.div 
            className="absolute top-0 bottom-0 w-px bg-red-500 z-50 pointer-events-none"
            style={{ left: `calc(1rem + ${(currentTime / 180) * 100}%)` }}
          >
            <div className="w-3 h-3 rotate-45 bg-red-500 -translate-x-1.5 -translate-y-1.5 rounded-sm"></div>
          </motion.div>

          {/* Video Track */}
          <div className="flex items-center gap-4 h-16 group">
            <div className="w-20 shrink-0 text-xs font-bold text-gray-500 flex items-center justify-between">Video <Eye className="w-3 h-3" /></div>
            <div className="flex-1 h-full bg-[#111317] rounded-lg border border-white/10 relative overflow-hidden">
              <div 
                className="absolute inset-y-0 bg-[#00E5FF]/20 border border-[#00E5FF]/50 rounded-lg backdrop-blur-sm shadow-[0_0_10px_rgba(0,229,255,0.1)] flex items-center px-2 cursor-grab"
                style={{ left: `${(clipStart / 180) * 100}%`, width: `${((clipEnd - clipStart) / 180) * 100}%` }}
              >
                <div className="text-[10px] text-[#00E5FF] font-bold truncate">source_video.mp4</div>
              </div>
            </div>
          </div>

          {/* Subtitle Track */}
          <div className="flex items-center gap-4 h-12 group">
            <div className="w-20 shrink-0 text-xs font-bold text-gray-500 flex items-center justify-between">Captions <Type className="w-3 h-3" /></div>
            <div className="flex-1 h-full bg-[#111317] rounded-lg border border-white/10 relative overflow-hidden">
              <div 
                className="absolute inset-y-0 bg-[#9945FF]/30 border border-[#9945FF]/50 rounded-lg flex items-center justify-center text-[10px] text-white font-bold"
                style={{ left: `${(clipStart / 180) * 100}%`, width: `${((clipEnd - clipStart) / 180) * 100}%` }}
              >
                {captionStyle} Text Layer
              </div>
            </div>
          </div>

          {/* Audio Waveform Track */}
          <div className="flex items-center gap-4 h-12 group">
            <div className="w-20 shrink-0 text-xs font-bold text-gray-500 flex items-center justify-between">Audio <Music className="w-3 h-3" /></div>
            <div className="flex-1 h-full bg-[#111317] rounded-lg border border-white/10 relative overflow-hidden flex items-center px-1">
              {/* Mock Waveform bars */}
              {Array.from({length: 100}).map((_, i) => (
                <div key={i} className="flex-1 mx-[1px] bg-[#00FFA3]/40 rounded-full" style={{ height: `${Math.max(10, Math.random() * 100)}%` }}></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
