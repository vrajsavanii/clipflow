'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import {
  Cpu, Zap, Download, Trash2, RefreshCw, Copy, CheckCircle,
  Wifi, WifiOff, Clock, MonitorSpeaker, Plus, ExternalLink,
  AlertCircle, ChevronRight, Activity
} from 'lucide-react';
import { toast } from 'sonner';

interface Machine {
  id: string;
  hostname: string;
  gpu_type: 'nvidia' | 'amd' | 'apple' | 'intel' | 'cpu';
  vram_gb: number;
  status: 'online' | 'offline' | 'processing';
  last_heartbeat: string;
  created_at: string;
}

const GPU_COLORS: Record<string, { bg: string; text: string; border: string; label: string }> = {
  nvidia:  { bg: 'rgba(118,185,0,0.1)',   text: '#76b900', border: 'rgba(118,185,0,0.25)',   label: 'NVIDIA' },
  amd:     { bg: 'rgba(237,28,36,0.1)',   text: '#ed4545', border: 'rgba(237,28,36,0.25)',   label: 'AMD' },
  apple:   { bg: 'rgba(255,255,255,0.06)',text: '#e0e0e0', border: 'rgba(255,255,255,0.15)', label: 'Apple' },
  intel:   { bg: 'rgba(0,113,197,0.1)',   text: '#0071c5', border: 'rgba(0,113,197,0.25)',   label: 'Intel' },
  cpu:     { bg: 'rgba(255,255,255,0.04)',text: '#888',    border: 'rgba(255,255,255,0.08)', label: 'CPU Only' },
};

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function isOnline(lastHeartbeat: string): boolean {
  return (Date.now() - new Date(lastHeartbeat).getTime()) < 90_000; // 90s
}

export default function MachinesPage() {
  const router = useRouter();
  const supabase = createClient();

  const [machines, setMachines] = useState<Machine[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadMachines = useCallback(async (uid: string) => {
    const { data, error } = await supabase
      .from('machines')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code !== 'PGRST205' && error.code !== '42P01') {
        console.error(error);
        toast.error('Failed to load machines');
      }
      setMachines([]);
    } else {
      setMachines(data || []);
    }
  }, [supabase]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/login'); return; }
      if (cancelled) return;
      setUserId(user.id);
      await loadMachines(user.id);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [supabase, router, loadMachines]);

  // Auto-refresh every 30s
  useEffect(() => {
    if (!userId) return;
    const interval = setInterval(() => loadMachines(userId), 30_000);
    return () => clearInterval(interval);
  }, [userId, loadMachines]);

  const handleRefresh = async () => {
    if (!userId) return;
    setRefreshing(true);
    await loadMachines(userId);
    setRefreshing(false);
  };

  const handleDelete = async (machineId: string, hostname: string) => {
    if (!confirm(`Remove machine "${hostname}"? It will stop processing your jobs.`)) return;
    setDeleting(machineId);
    const { error } = await supabase.from('machines').delete().eq('id', machineId);
    if (error) {
      toast.error('Failed to remove machine');
    } else {
      setMachines(prev => prev.filter(m => m.id !== machineId));
      toast.success(`Machine "${hostname}" removed`);
    }
    setDeleting(null);
  };

  const copyUserId = async () => {
    if (!userId) return;
    await navigator.clipboard.writeText(userId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('User ID copied!');
  };

  const onlineMachines  = machines.filter(m => isOnline(m.last_heartbeat));
  const offlineMachines = machines.filter(m => !isOnline(m.last_heartbeat));

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-transparent p-6">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#9945FF]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#00E5FF]/8 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#9945FF]/20 to-[#00E5FF]/20 border border-[#9945FF]/20">
            <Cpu className="h-6 w-6 text-[#00E5FF]" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold tracking-tight mb-1">GPU Machines</h1>
            <p className="text-sm text-gray-400 leading-relaxed">
              Connect your local GPU to process videos at blazing speed — for free.
              All heavy AI runs on <span className="text-white font-medium">your machine</span>, not our servers.
            </p>
            <div className="flex items-center gap-3 mt-3">
              <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                onlineMachines.length > 0
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                  : 'bg-white/[0.04] text-gray-500 border border-white/[0.06]'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${onlineMachines.length > 0 ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`} />
                {onlineMachines.length} machine{onlineMachines.length !== 1 ? 's' : ''} online
              </div>
              <div className="text-xs text-gray-600">•</div>
              <div className="text-xs text-gray-500">{machines.length} total registered</div>
            </div>
          </div>
        </div>
      </div>

      {/* Your User ID — needed for worker setup */}
      <div className="rounded-2xl border border-[#9945FF]/20 bg-[#9945FF]/5 p-5">
        <div className="flex items-start gap-3">
          <div className="shrink-0 mt-0.5">
            <Zap className="h-4 w-4 text-[#9945FF]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white mb-1">Your Worker Auth ID</p>
            <p className="text-xs text-gray-400 mb-3">
              Paste this into the ClipFlow Worker desktop app to link your machine to your account.
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 truncate rounded-lg bg-black/40 border border-white/[0.08] px-3 py-2 text-xs font-mono text-[#00E5FF]">
                {loading ? '...' : userId || '—'}
              </code>
              <button
                onClick={copyUserId}
                className="shrink-0 flex items-center gap-1.5 rounded-lg bg-white/[0.06] border border-white/[0.08] px-3 py-2 text-xs font-medium text-gray-300 hover:text-white hover:bg-white/[0.1] transition-all"
              >
                {copied ? <CheckCircle className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Download Worker */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
              <Download className="h-4 w-4 text-[#00E5FF]" />
              ClipFlow Worker App
            </h2>
            <p className="text-xs text-gray-400">
              Download the desktop worker to connect your GPU. Runs quietly in the system tray.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            {(['Windows', 'macOS', 'Linux'] as const).map(os => (
              <button
                key={os}
                className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs font-medium text-gray-300 hover:text-white hover:bg-white/[0.08] hover:border-white/[0.12] transition-all"
              >
                <ExternalLink className="h-3 w-3" />
                {os}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Machines List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <MonitorSpeaker className="h-4 w-4 text-gray-400" />
            Connected Machines
          </h2>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-24 rounded-2xl bg-white/[0.03] border border-white/[0.04] animate-pulse" />
            ))}
          </div>
        ) : machines.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.02] p-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/[0.06] mx-auto mb-4">
              <Cpu className="h-6 w-6 text-gray-600" />
            </div>
            <p className="text-sm font-medium text-gray-300 mb-1">No machines connected</p>
            <p className="text-xs text-gray-500 mb-5">
              Download the worker app, paste your User ID, and click Start.
            </p>
            <button className="inline-flex items-center gap-2 rounded-full border border-[#9945FF]/30 bg-[#9945FF]/10 px-4 py-2 text-xs font-medium text-[#9945FF] hover:bg-[#9945FF]/20 transition-all">
              <Plus className="h-3.5 w-3.5" />
              Connect a machine
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {machines.map((machine) => {
                const online = isOnline(machine.last_heartbeat);
                const gpu = GPU_COLORS[machine.gpu_type] || GPU_COLORS.cpu;

                return (
                  <motion.div
                    key={machine.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 hover:border-white/[0.1] hover:bg-white/[0.04] transition-all duration-200"
                  >
                    {/* Subtle glow on online */}
                    {online && (
                      <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-2xl pointer-events-none" />
                    )}

                    <div className="flex items-start gap-4">
                      {/* GPU indicator */}
                      <div
                        className="shrink-0 flex h-11 w-11 items-center justify-center rounded-xl border text-sm font-bold"
                        style={{ background: gpu.bg, borderColor: gpu.border, color: gpu.text }}
                      >
                        ⚡
                      </div>

                      {/* Machine info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-white text-sm truncate">{machine.hostname}</span>
                          <span
                            className="px-2 py-0.5 rounded-full text-[10px] font-bold border"
                            style={{ background: gpu.bg, borderColor: gpu.border, color: gpu.text }}
                          >
                            {gpu.label}
                          </span>
                          <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            online
                              ? 'bg-green-500/10 border-green-500/20 text-green-400'
                              : 'bg-white/[0.04] border-white/[0.06] text-gray-500'
                          }`}>
                            {online ? <Wifi className="h-2.5 w-2.5" /> : <WifiOff className="h-2.5 w-2.5" />}
                            {online ? 'Online' : 'Offline'}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500 flex-wrap">
                          {machine.vram_gb > 0 && (
                            <span className="flex items-center gap-1">
                              <Activity className="h-3 w-3" />
                              {machine.vram_gb} GB VRAM
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {online ? 'Active now' : `Last seen ${timeAgo(machine.last_heartbeat)}`}
                          </span>
                          <span>Registered {timeAgo(machine.created_at)}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleDelete(machine.id, machine.hostname)}
                          disabled={deleting === machine.id}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                          title="Remove machine"
                        >
                          {deleting === machine.id
                            ? <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            : <Trash2 className="h-3.5 w-3.5" />
                          }
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* How it works */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
        <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-[#9945FF]" />
          How Local GPU Processing Works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { step: '1', icon: Download, label: 'Download', desc: 'Get the ClipFlow Worker app for your OS' },
            { step: '2', icon: Copy, label: 'Authenticate', desc: 'Paste your User ID to link it to your account' },
            { step: '3', icon: Zap, label: 'Process', desc: 'Submit a video — your GPU handles all the AI work' },
          ].map(({ step, icon: Icon, label, desc }) => (
            <div key={step} className="flex gap-3">
              <div className="shrink-0 h-7 w-7 rounded-full bg-[#9945FF]/15 border border-[#9945FF]/20 flex items-center justify-center text-xs font-bold text-[#9945FF]">
                {step}
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-white mb-0.5">
                  <Icon className="h-3.5 w-3.5 text-[#00E5FF]" />
                  {label}
                </div>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
