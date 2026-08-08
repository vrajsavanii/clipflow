'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud, Video, HardDrive, Link as LinkIcon,
  Loader2, Zap, PlayCircle, Globe, Clock, CheckCircle,
  ArrowRight, Activity, Terminal, Cpu, Target, FileVideo,
  Download, Eye, Brain, Radio, Sparkles, BarChart3
} from 'lucide-react';
import Link from 'next/link';
import { useProjectProgress } from '@/hooks';
import { createBrowserClient } from '@supabase/ssr';

const PIPELINE_STEPS = [
  { key: 'pending', label: 'Queued', icon: Clock, color: '#6B7280' },
  { key: 'downloading', label: 'Download', icon: Download, color: '#9945FF' },
  { key: 'transcribing', label: 'Whisper', icon: Radio, color: '#00E5FF' },
  { key: 'visual_analyzing', label: 'Vision', icon: Eye, color: '#00FFA3' },
  { key: 'analyzing', label: 'Hook AI', icon: Brain, color: '#FF6B9D' },
  { key: 'ready', label: 'Ready', icon: Sparkles, color: '#00FFA3' },
];

const STATUS_PROGRESS_MAP: Record<string, { progress: number; eta: string; title: string }> = {
  pending:         { progress: 5,  eta: "Queued...",           title: "Waiting for Worker" },
  queued:          { progress: 5,  eta: "Queued...",           title: "Waiting for Worker" },
  assigned:        { progress: 10, eta: "Booting engine...",   title: "Initializing Worker" },
  processing:      { progress: 20, eta: "Extracting...",       title: "AI Pipeline Active" },
  ingesting:       { progress: 5,  eta: "Waking up engine...", title: "Initializing" },
  downloading:     { progress: 15, eta: "~4.5 mins left",     title: "Ingesting Media" },
  transcribing:    { progress: 30, eta: "~3 mins left",       title: "Whisper V3 Transcription" },
  transcribed:     { progress: 40, eta: "~3 mins left",       title: "Transcription Complete" },
  visual_analyzing:{ progress: 50, eta: "~2.5 mins left",    title: "Computer Vision Analysis" },
  face_detecting:  { progress: 65, eta: "~1.5 mins left",    title: "Active Speaker Tracking" },
  analyzing:       { progress: 80, eta: "~1 min left",       title: "Viral Hook Extraction" },
  analyzing_done:  { progress: 95, eta: "Finalizing renders", title: "Compiling Assets" },
};

export default function IngestForm() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'url' | 'upload'>('url');
  const [uploadProgress, setUploadProgress] = useState(0);

  const [processingProjectId, setProcessingProjectId] = useState<string | null>(null);
  const [projectStatus, setProjectStatus] = useState('pending');
  const [projectUrl, setProjectUrl] = useState('');

  // Serverless processing pipeline removed, relying on worker engine

  const [logs, setLogs] = useState<string[]>([]);
  const [stuckWarning, setStuckWarning] = useState(false);

  const addLog = useCallback((msg: string) => {
    setLogs(prev => [...prev.slice(-20), `[${new Date().toISOString().split('T')[1].slice(0,8)}] ${msg}`]);
  }, []);

  // Real-time progress via SSE
  const { data: progressData, isConnected } = useProjectProgress({
    projectId: processingProjectId,
    onUpdate: (data) => {
      if (data.status !== lastStatusRef.current) {
        addLog(`Status → ${data.status}`);
        lastStatusRef.current = data.status;
      }
      
      if (data.failed) {
        setProjectStatus('failed');
      } else {
        setProjectStatus(data.status);
      }
      if (data.sourceUrl && !projectUrlRef.current) {
        projectUrlRef.current = data.sourceUrl;
        setProjectUrl(data.sourceUrl);
      }
      setStuckWarning(false);
    },
    onComplete: (data) => {
      if (data.status === 'ready' || data.status === 'completed') {
        addLog('SUCCESS: Pipeline complete. Clips ready for export.');
        setStuckWarning(false);
      } else if (data.status === 'failed') {
        addLog('ERROR: Pipeline failed.');
      }
    },
    onError: (err) => {
      addLog(`ERROR: ${err}`);
      setStuckWarning(true);
    },
  });

  // Log pipeline start on initial connection
  useEffect(() => {
    if (isConnected && processingProjectId && projectStatus === 'pending') {
      addLog('Booting neural pipeline...');
    }
  }, [isConnected, processingProjectId, projectStatus, addLog]);

  // refs for tracking status changes (stuck detection) and project url
  const lastStatusRef = useRef<string>('pending');
  const statusTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const projectUrlRef = useRef<string>('');

  // stuck detection timer
  useEffect(() => {
    if (!processingProjectId) return;
    if (progressData?.type === 'complete') return;

    statusTimerRef.current = setTimeout(() => {
      if (lastStatusRef.current === projectStatus) {
        setStuckWarning(true);
      }
    }, 60000);

    return () => clearTimeout(statusTimerRef.current);
  }, [processingProjectId, projectStatus, progressData?.type]);

  // Fake log generators for visual feedback while processing
  useEffect(() => {
    if (!processingProjectId) return;

    let interval: NodeJS.Timeout;

    const logGenerators: Record<string, () => string> = {
      downloading: () => {
        const pct = Math.floor(Math.random() * 100);
        const speed = (Math.random() * 12 + 3).toFixed(1);
        return `Downloading chunk: ${pct}% @ ${speed} MB/s`;
      },
      transcribing: () => {
        const chunkId = Math.floor(Math.random() * 9999);
        const conf = (Math.random() * 15 + 85).toFixed(1);
        return `Whisper V3 chunk_${chunkId}: confidence ${conf}%`;
      },
      visual_analyzing: () => {
        const speaker = Math.floor(Math.random() * 3) + 1;
        return `OpenCV: speaker_${speaker} bounds [${Math.floor(Math.random() * 120)}, ${Math.floor(Math.random() * 80)}]`;
      },
      face_detecting: () => {
        const pathVectors = Math.floor(Math.random() * 50 + 20);
        return `Neural tracking: ${pathVectors} path vectors smoothed. Lock acquired.`;
      },
      analyzing: () => {
        const score = Math.random() > 0.5 ? 'HIGH' : 'MEDIUM';
        const hookIdx = Math.floor(Math.random() * 5 + 1);
        return `LLaMA 3.3 scoring hook_${hookIdx}: ${score} viral potential`;
      },
    };

    if (logGenerators[projectStatus]) {
      interval = setInterval(() => {
        addLog(logGenerators[projectStatus]());
      }, projectStatus === 'downloading' ? 900 : projectStatus === 'transcribing' ? 700 : 500);
    }

    return () => clearInterval(interval);
  }, [projectStatus, processingProjectId, addLog]);

  const handleIngest = async () => {
    if (!url.trim()) { toast.error('Please paste a video URL first.'); return; }
    setIsLoading(true);
    setLogs([]);

    try {
      const res = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (res.status === 401) {
        toast.error('Not signed in', { description: 'Please log in to submit a video.' });
        setIsLoading(false);
        return;
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ingest failed');

      toast.success('Pipeline engaged!', { description: 'AI Engine is processing your video.' });
      setProcessingProjectId(data.projectId);
      setProjectStatus('downloading');
      setUrl('');
      // The worker engine will automatically pick up the job and update the DB
      addLog(`[${new Date().toLocaleTimeString()}] Worker Engine notified...`);
      addLog(`[${new Date().toLocaleTimeString()}] Project ID: ${data.projectId}`);
      setIsLoading(false);
    } catch (err: any) {
      toast.error('Submission failed', { description: err.message });
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setUploadProgress(0);
    setLogs(['Initializing direct media upload...']);

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not logged in');

      const fileExt = file.name.split('.').pop();
      const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;

      setLogs(['Uploading raw file to distributed storage via Tus...']);

      // Dynamic import to avoid SSR issues with tus
      const tus = await import('tus-js-client');

      const upload = new tus.Upload(file, {
        endpoint: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/upload/resumable`,
        retryDelays: [0, 3000, 5000, 10000, 20000],
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'x-upsert': 'true', // optionally overwrite
        },
        uploadDataDuringCreation: true,
        removeFingerprintOnSuccess: true, // clear local storage state
        metadata: {
          bucketName: 'clipflow-videos',
          objectName: fileName,
          contentType: file.type,
          cacheControl: '3600',
        },
        chunkSize: 6 * 1024 * 1024, // 6MB chunks
        onError: function (error) {
          toast.error('Upload failed', { description: error.message });
          setIsLoading(false);
          setUploadProgress(0);
        },
        onProgress: function (bytesUploaded, bytesTotal) {
          const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
          setUploadProgress(Number(percentage));
        },
        onSuccess: async function () {
          setUploadProgress(100);
          setLogs(['Upload complete. Triggering neural pipeline...']);

          try {
            // Now call /api/ingest with file_path
            const res = await fetch('/api/ingest', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ file_path: fileName }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Ingest failed');

            toast.success('File uploaded!', { description: 'AI Engine is processing your video.' });
            setProcessingProjectId(data.projectId);
            setProjectStatus('downloading');

            // Worker engine handles it from here
            addLog(`[${new Date().toLocaleTimeString()}] Worker Engine notified...`);
            setIsLoading(false);

          } catch (err: any) {
            toast.error('Pipeline Error', { description: err?.message || 'Failed to start AI pipeline.' });
            setIsLoading(false);
          }
        },
      });

      // Start the upload
      upload.findPreviousUploads().then((previousUploads) => {
        // Found previous uploads so we select the first one. 
        if (previousUploads.length) {
          upload.resumeFromPreviousUpload(previousUploads[0]);
        }
        upload.start();
      });

    } catch (e: any) {
      toast.error('Upload Error', { description: e?.message || 'Please try again.' });
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const [dynamicEta, setDynamicEta] = useState<string>('');

  const isReady = projectStatus === 'ready' || projectStatus === 'completed' || projectStatus === 'success';
  const isFailed = projectStatus === 'failed';

  const statusInfo = STATUS_PROGRESS_MAP[projectStatus] || { progress: 5, eta: "Queued...", title: "Waiting for Worker" };
  const realProgress = isReady ? 100 : isFailed ? 0 : statusInfo.progress;
  const statusTitle = isReady ? "Ready for Export" : isFailed ? "Pipeline Failed" : statusInfo.title;

  useEffect(() => {
    if (!processingProjectId || isReady || isFailed) {
      setDynamicEta('');
      return;
    }
    
    // Default to a fallback if we don't have createdAt yet
    if (!progressData?.createdAt) {
      setDynamicEta(statusInfo.eta);
      return;
    }

    const interval = setInterval(() => {
      const startMs = new Date(progressData.createdAt!).getTime();
      const elapsedSec = (Date.now() - startMs) / 1000;
      
      // If we are at 5% (queued), we can't estimate well, so use fallback or simple math
      if (realProgress > 5 && realProgress < 100) {
        const totalEstimatedSec = (elapsedSec / realProgress) * 100;
        const remainingSec = Math.max(0, totalEstimatedSec - elapsedSec);
        
        if (remainingSec > 60) {
          setDynamicEta(`~${Math.ceil(remainingSec / 60)} mins left`);
        } else if (remainingSec > 0) {
          setDynamicEta(`~${Math.ceil(remainingSec)} secs left`);
        } else {
          setDynamicEta('Almost done...');
        }
      } else {
        setDynamicEta(statusInfo.eta); // Fallback for very early stages
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [processingProjectId, projectStatus, isReady, isFailed, progressData?.createdAt, realProgress, statusInfo.eta]);

  const eta = isReady ? "Complete!" : isFailed ? "Failed" : dynamicEta || statusInfo.eta;

  const currentStepIndex = PIPELINE_STEPS.findIndex(s => {
    if (isReady) return s.key === 'ready';
    return s.key === projectStatus || (projectStatus === 'completed' && s.key === 'ready');
  });

  return (
    <div className="rounded-2xl border border-white/10 relative overflow-hidden transition-all duration-500 shadow-2xl" style={{ background: 'rgba(10, 11, 14, 0.6)', backdropFilter: 'blur(20px)' }}>

      {/* Neural Background Shimmer when processing */}
      {processingProjectId && !isReady && !isFailed && (
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0" style={{ backgroundImage: 'url(https://grainy-gradients.vercel.app/noise.svg)', opacity: 0.2, mixBlendMode: 'overlay' }}></div>
          <motion.div
            animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.2, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] rounded-full blur-[100px] pointer-events-none"
            style={{ background: 'linear-gradient(90deg, rgba(153,69,255,0.1), rgba(0,229,255,0.1), rgba(153,69,255,0.1))' }}
          ></motion.div>
        </div>
      )}

      <div className="relative z-10">
        {!processingProjectId ? (
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black font-heading text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#00E5FF]" /> AI Processing Studio
                </h2>
                <p className="text-sm text-gray-400 mt-1">Import long-form content to extract viral shorts.</p>
              </div>
            </div>

            <div className="flex gap-2 p-1 bg-[#111317] border border-white/5 rounded-xl mb-6 max-w-sm">
              <button
                onClick={() => setActiveTab('url')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'url' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
              >
                <LinkIcon className="w-4 h-4" /> YouTube / URL
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'upload' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
              >
                <HardDrive className="w-4 h-4" /> Local Upload
              </button>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'url' ? (
                <motion.div
                  key="url"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                      <Video className="w-5 h-5 text-red-500" />
                    </div>
                    <input
                      type="url"
                      placeholder="Paste YouTube, Vimeo, or Google Drive URL here..."
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleIngest()}
                      disabled={isLoading}
                      className="w-full bg-[#0A0B0E] border border-white/10 rounded-xl py-4 pl-12 pr-32 text-white focus:outline-none focus:border-[#00E5FF]/50 focus:ring-1 focus:ring-[#00E5FF]/50 transition-all font-mono text-sm placeholder:text-gray-600 disabled:opacity-50"
                    />
                    <button
                      onClick={handleIngest}
                      disabled={isLoading || !url}
                      className="absolute inset-y-2 right-2 px-6 bg-gradient-to-r from-[#9945FF] to-[#00E5FF] hover:opacity-90 rounded-lg text-black font-black text-sm flex items-center gap-2 disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(0,229,255,0.3)]"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                      Extract
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.label
                  key="upload"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="relative border-2 border-dashed border-white/10 hover:border-[#00E5FF]/50 rounded-2xl p-12 text-center bg-[#0A0B0E]/50 transition-colors group cursor-pointer block"
                >
                  <input type="file" accept="video/mp4,video/quicktime,video/webm" className="hidden" onChange={handleFileUpload} disabled={isLoading} />
                  {isLoading && activeTab === 'upload' ? (
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <Loader2 className="w-10 h-10 text-[#00E5FF] animate-spin" />
                      <h3 className="text-lg font-bold text-white">Uploading... {uploadProgress}%</h3>
                      <div className="w-48 h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div className="h-full bg-[#00E5FF]" initial={{ width: 0 }} animate={{ width: `${uploadProgress}%` }} />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:bg-[#00E5FF]/10 transition-all">
                        <UploadCloud className="w-8 h-8 text-gray-400 group-hover:text-[#00E5FF]" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">Drag & Drop Media</h3>
                      <p className="text-sm text-gray-500 font-sans max-w-sm mx-auto">Supports MP4, MOV, WEBM up to 5GB. Or click to browse your files.</p>
                    </>
                  )}
                </motion.label>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="p-8">
            <div className="flex flex-col md:flex-row gap-8">

              {/* Left Side: Status & Progress */}
              <div className="flex-1 space-y-8">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-[#0A0B0E] border border-[#00E5FF]/30 flex items-center justify-center shadow-[0_0_30px_rgba(0,229,255,0.2)] z-10 relative">
                      {isReady ? (
                        <CheckCircle className="w-8 h-8 text-[#00FFA3]" />
                      ) : isFailed ? (
                        <Globe className="w-8 h-8 text-red-500" />
                      ) : (
                        <Cpu className="w-8 h-8 text-[#00E5FF] animate-pulse" />
                      )}
                    </div>
                    {!isReady && !isFailed && (
                      <div className="absolute inset-0 rounded-2xl border-2 border-[#00E5FF] border-dashed animate-[spin_4s_linear_infinite] opacity-50"></div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-xl font-bold font-heading text-white">{statusTitle}</h3>
                    <p className="text-sm text-[#00E5FF] font-mono mt-1 tracking-wider">{realProgress}% <span className="text-gray-500 mx-2">•</span> {eta}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono text-gray-400">
                    <span>Neural Pipeline</span>
                    <span>{projectUrl ? new URL(projectUrl).hostname : 'Media Intake'}</span>
                  </div>
                  <div className="w-full h-3 bg-[#0A0B0E] rounded-full overflow-hidden border border-white/10 shadow-inner">
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

                {/* Pipeline Step Indicators - 6 steps */}
                <div className="grid grid-cols-6 gap-1.5">
                  {PIPELINE_STEPS.map((step, i) => {
                    const isActive = i === currentStepIndex && !isReady && !isFailed;
                    const isDone = i < currentStepIndex || isReady;
                    const isFail = isFailed && i === currentStepIndex;
                    const Icon = step.icon;
                    return (
                      <motion.div
                        key={step.key}
                        animate={isActive ? { scale: [1, 1.05, 1] } : {}}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-all ${
                          isDone
                            ? 'border-[#00FFA3]/30 bg-[#00FFA3]/10'
                            : isFail
                            ? 'border-red-500/30 bg-red-500/10'
                            : isActive
                            ? 'border-[#00E5FF]/40 bg-[#00E5FF]/10 shadow-[0_0_15px_rgba(0,229,255,0.1)]'
                            : 'border-white/5 bg-white/5'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${
                          isDone ? 'text-[#00FFA3]' : isFail ? 'text-red-500' : isActive ? 'text-[#00E5FF]' : 'text-gray-600'
                        }`} />
                        <span className={`text-[9px] font-bold font-mono text-center leading-tight ${
                          isDone ? 'text-[#00FFA3]' : isFail ? 'text-red-500' : isActive ? 'text-[#00E5FF]' : 'text-gray-600'
                        }`}>
                          {step.label}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Stuck warning banner */}
                {stuckWarning && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs"
                  >
                    <strong>⚠️ No progress detected.</strong> The processing worker may not be running.
                    Make sure to start background workers with <code className="px-1 py-0.5 bg-black/30 rounded font-mono">npm run workers:start</code> in your terminal.
                  </motion.div>
                )}
              </div>

              {/* Right Side: Streaming Logs */}
              <div className="flex-1 bg-[#0A0B0E] rounded-xl border border-white/10 flex flex-col overflow-hidden h-72 font-mono text-xs">
                <div className="px-4 py-2 bg-black/50 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Terminal className="w-3.5 h-3.5" /> Engine Telemetry
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'} transition-colors`}></span>
                    <span className={`${isConnected ? 'text-green-500' : 'text-red-500'} font-bold uppercase tracking-widest text-[10px] transition-colors`}>{isConnected ? 'Live' : 'Disconnected'}</span>
                  </div>
                </div>
                <div className="p-4 flex-1 overflow-y-auto space-y-1.5 flex flex-col justify-end">
                  <AnimatePresence initial={false}>
                    {logs.map((log, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`${
                          log.includes('SUCCESS') ? 'text-[#00FFA3] font-bold' :
                          log.includes('ERROR') ? 'text-red-500 font-bold' :
                          log.includes('Status →') ? 'text-[#00E5FF]' :
                          'text-gray-400'
                        }`}
                      >
                        {log}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {!isReady && !isFailed && (
                    <div className="text-gray-600 animate-pulse">_</div>
                  )}
                </div>
              </div>

            </div>

            {isReady && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 pt-6 border-t border-white/10 flex justify-end"
              >
                <Link href={`/clips/${processingProjectId}`} className="px-8 py-3 bg-white text-black font-bold rounded-lg shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-105 transition-all flex items-center gap-2">
                  <FileVideo className="w-5 h-5" /> View Extracted Clips
                </Link>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
