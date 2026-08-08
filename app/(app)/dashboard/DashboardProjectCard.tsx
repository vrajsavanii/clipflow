'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, Video, Play, CheckCircle, Sparkles, ArrowRight } from 'lucide-react';
import { ProjectDropdown } from '@/components/ProjectDropdown';
import { useProjectProgress } from '@/hooks/useProjectProgress';
import { LiveTimer } from '@/components/LiveTimer';

export function DashboardProjectCard({ initialProject, dateStr, clipCount }: any) {
  const [project, setProject] = useState(initialProject);

  useProjectProgress({
    projectId: project.status === 'processing' || project.status === 'downloading' || project.status === 'ingesting' || project.status === 'transcribing' || project.status === 'visual_analyzing' || project.status === 'analyzing' || project.status === 'face_detecting' || project.status === 'queued' ? project.id : null,
    onUpdate: (data) => {
      if (data.failed) {
        setProject((p: any) => ({ ...p, status: 'failed', clipCount: data.clipCount || p.clipCount }));
      } else {
        setProject((p: any) => ({ ...p, status: data.status, clipCount: data.clipCount || p.clipCount }));
      }
    },
    onComplete: (data) => {
      if (data.status === 'failed') {
        setProject((p: any) => ({ ...p, status: 'failed', clipCount: data.clipCount || p.clipCount }));
      } else {
        setProject((p: any) => ({ ...p, status: 'ready', clipCount: data.clipCount || p.clipCount }));
      }
    }
  });

  const isReady = project.status === 'ready' || project.status === 'completed' || project.status === 'success';
  const isFailed = project.status === 'failed';

  let realProgress = 10;
  let baseEta = "Queued (~5m left)";
  if (project.status === 'queued') { realProgress = 10; baseEta = "Queued (~5m left)"; }
  if (project.status === 'ingesting') { realProgress = 20; baseEta = "Initializing Video Download (~4.5m left)"; }
  if (project.status === 'downloading') { realProgress = 35; baseEta = "Extracting Audio (~4m left)"; }
  if (project.status === 'transcribing') { realProgress = 50; baseEta = "AI Transcribing Speech (~3m left)"; }
  if (project.status === 'transcribed') { realProgress = 60; baseEta = "Analyzing Transcript (~2.5m left)"; }
  if (project.status === 'visual_analyzing') { realProgress = 75; baseEta = "AI Hook & Emotion Scoring (~2m left)"; }
  if (project.status === 'face_detecting') { realProgress = 80; baseEta = "Auto 9:16 Speaker Framing (~1.5m left)"; }
  if (project.status === 'analyzing') { realProgress = 88; baseEta = "Rendering Subtitles & Shorts (~1m left)"; }
  if (project.status === 'analyzing_done') { realProgress = 95; baseEta = "Finalizing Storage Upload..."; }
  if (isReady) { realProgress = 100; baseEta = "Ready"; }

  const currentClipCount = project.clipCount !== undefined ? project.clipCount : clipCount;

  const statusLabel = isReady ? 'READY' : isFailed ? 'FAILED' : project.status.replace('_', ' ').toUpperCase();

  return (
    <Link href={isReady ? `/project/${project.id}` : '#'} key={project.id}>
      <div className={`glass-panel p-3 md:p-4 rounded-2xl border flex flex-col md:flex-row gap-3 md:gap-4 group transition-all duration-300 cursor-pointer h-full ${
        isReady ? 'border-white/5 hover:border-[#00E5FF]/30 hover:shadow-[0_0_30px_rgba(0,229,255,0.1)]' :
        isFailed ? 'border-red-500/20 hover:border-red-500/40 hover:shadow-[0_0_30px_rgba(239,68,68,0.1)]' :
        'border-[#9945FF]/30 hover:border-[#9945FF]/50 relative overflow-hidden shadow-[0_0_20px_rgba(153,69,255,0.05)]'
      }`}>

        {!isReady && !isFailed && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#9945FF]/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
        )}

        <ProjectDropdown projectId={project.id} />

        <div className="w-full md:w-24 h-32 md:h-24 rounded-xl shrink-0 relative overflow-hidden bg-gradient-to-br from-[#0F1115] to-[#14161B] flex items-center justify-center z-10 border border-white/5 group-hover:scale-[1.02] transition-transform">
          {isReady ? (
            <>
              <Video className="w-8 h-8 text-gray-600" />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors flex items-center justify-center backdrop-blur-[1px] group-hover:backdrop-blur-none">
                <div className="w-8 h-8 rounded-full bg-[#00E5FF] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 shadow-[0_0_20px_#00E5FF]">
                  <Play className="w-4 h-4 text-black ml-1" />
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Clock className="w-6 h-6 text-[#9945FF] animate-pulse drop-shadow-[0_0_8px_rgba(153,69,255,0.5)]" />
              <span className="text-[10px] font-mono text-[#9945FF]">{realProgress}%</span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-center py-1 z-10">
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-bold text-sm text-white truncate pr-2 group-hover:text-[#00E5FF] transition-colors" title={project.source_url}>{project.source_url}</h3>
            {isReady && <CheckCircle className="w-4 h-4 text-[#00E5FF] shrink-0 drop-shadow-[0_0_5px_#00E5FF]" />}
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2 font-mono">
            <span>{dateStr}</span>
            <span>•</span>
            <span className={isReady ? "text-gray-500" : isFailed ? "text-red-400" : "text-[#9945FF] font-bold drop-shadow-[0_0_5px_rgba(153,69,255,0.3)]"}>
              {statusLabel}
            </span>
          </div>

          {isReady ? (
            <div className="mt-auto flex items-center gap-1.5 text-[#00E5FF] text-xs font-mono font-bold bg-[#00E5FF]/10 w-max px-2 py-1 rounded-md border border-[#00E5FF]/20">
              <Sparkles className="w-3 h-3" />
              {currentClipCount} Viral Clips
              <ArrowRight className="w-3 h-3 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </div>
          ) : !isFailed ? (
            <div className="mt-auto space-y-1.5 w-full">
              <div className="flex justify-between items-center w-full">
                <span className="text-[10px] font-mono text-gray-400 uppercase">Processing</span>
                <LiveTimer createdAt={project.created_at} progress={realProgress} />
              </div>
              <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden border border-white/5">
                <div
                  className="h-full bg-gradient-to-r from-[#9945FF] to-[#00E5FF] transition-all duration-1000 ease-out relative shadow-[0_0_10px_#00E5FF]"
                  style={{ width: `${realProgress}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
