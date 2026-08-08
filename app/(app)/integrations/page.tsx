'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createBrowserClient } from '@supabase/ssr';
import {
  Zap, Video, Music, PlayCircle, MessageCircle,
  MessageSquare, Mail, GitBranch, Globe, Plug, Key,
  CheckCircle, XCircle, ExternalLink, Settings,
  ArrowUpRight, Loader2, Copy, Trash2, Plus,
  Webhook, Sparkles, Smartphone, Monitor
} from 'lucide-react';
import { staggerContainer, fadeInUp, gridContainer, gridItem } from '@/lib/animations';
import { AnimatedCard } from '@/components/AnimatedSection';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  status: 'connected' | 'disconnected' | 'coming_soon';
  handle?: string;
  category: 'social' | 'communication' | 'automation' | 'developer';
}

const INTEGRATIONS: Integration[] = [
  {
    id: 'tiktok', name: 'TikTok',
    description: 'Direct integration for posting clips and tracking performance.',
    icon: <Music className="w-7 h-7" />,
    color: 'text-pink-400', bgColor: 'bg-pink-500/10', borderColor: 'border-pink-500/20',
    status: 'connected', handle: '@clipflow_studio', category: 'social',
  },
  {
    id: 'youtube', name: 'YouTube',
    description: 'Automatically publish Shorts to your connected channels.',
    icon: <PlayCircle className="w-7 h-7" />,
    color: 'text-red-400', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/20',
    status: 'connected', handle: 'ClipFlow Studio', category: 'social',
  },
  {
    id: 'instagram', name: 'Instagram',
    description: 'Publish Reels directly to your Instagram account.',
    icon: <Video className="w-7 h-7" />,
    color: 'text-purple-400', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/20',
    status: 'disconnected', category: 'social',
  },
  {
    id: 'discord', name: 'Discord',
    description: 'Get real-time notifications and clip previews in your server.',
    icon: <MessageCircle className="w-7 h-7" />,
    color: 'text-indigo-400', bgColor: 'bg-indigo-500/10', borderColor: 'border-indigo-500/20',
    status: 'disconnected', category: 'communication',
  },
  {
    id: 'slack', name: 'Slack',
    description: 'Receive updates and share clips directly to your workspace.',
    icon: <MessageSquare className="w-7 h-7" />,
    color: 'text-[#E44B4B]', bgColor: 'bg-[#E44B4B]/10', borderColor: 'border-[#E44B4B]/20',
    status: 'disconnected', category: 'communication',
  },
  {
    id: 'resend', name: 'Resend',
    description: 'Send transactional emails for clip approvals and reports.',
    icon: <Mail className="w-7 h-7" />,
    color: 'text-[#FF6B35]', bgColor: 'bg-[#FF6B35]/10', borderColor: 'border-[#FF6B35]/20',
    status: 'connected', handle: 'team@clipflow.ai', category: 'communication',
  },
  {
    id: 'zapier', name: 'Zapier',
    description: 'Connect ClipFlow to 5000+ apps with automated workflows.',
    icon: <Zap className="w-7 h-7" />,
    color: 'text-[#FF4A00]', bgColor: 'bg-[#FF4A00]/10', borderColor: 'border-[#FF4A00]/20',
    status: 'coming_soon', category: 'automation',
  },
  {
    id: 'webhooks', name: 'Webhooks',
    description: 'Build custom integrations with event-driven HTTP callbacks.',
    icon: <Webhook className="w-7 h-7" />,
    color: 'text-[#00E5FF]', bgColor: 'bg-[#00E5FF]/10', borderColor: 'border-[#00E5FF]/20',
    status: 'disconnected', category: 'developer',
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All', icon: <Globe className="w-3.5 h-3.5" /> },
  { id: 'social', label: 'Social', icon: <Smartphone className="w-3.5 h-3.5" /> },
  { id: 'communication', label: 'Communication', icon: <MessageCircle className="w-3.5 h-3.5" /> },
  { id: 'automation', label: 'Automation', icon: <Zap className="w-3.5 h-3.5" /> },
  { id: 'developer', label: 'Developer', icon: <GitBranch className="w-3.5 h-3.5" /> },
];

function IntegrationCard({ integration, index, onConnect, onDisconnect }: {
  integration: Integration; index: number;
  onConnect: (id: string) => void; onDisconnect: (id: string) => void;
}) {
  const [connecting, setConnecting] = useState(false);
  const isConnected = integration.status === 'connected';
  const isComingSoon = integration.status === 'coming_soon';

  const handleConnect = async () => {
    setConnecting(true);
    await new Promise(r => setTimeout(r, 1200));
    setConnecting(false);
    onConnect(integration.id);
  };

  return (
    <motion.div
      variants={gridItem}
      className="group"
    >
      <div className={cn(
        'glass-panel p-5 md:p-6 rounded-2xl border transition-all duration-300 flex flex-col h-full relative overflow-hidden',
        isConnected
          ? 'hover:border-[#00FFA3]/30 hover:shadow-[0_0_30px_rgba(0,255,163,0.06)]'
          : isComingSoon
            ? 'border-dashed border-white/10 hover:border-white/20'
            : `hover:border-white/20 hover:shadow-[0_0_30px_rgba(255,255,255,0.03)]`
      )}>
        {/* Hover glow */}
        <div className={cn(
          'absolute -inset-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-[inherit]',
          isConnected ? 'shadow-[0_0_40px_rgba(0,255,163,0.08)]' : ''
        )} />

        {/* Category Badge */}
        <div className="absolute top-3 right-3 z-10">
          <span className="text-[8px] font-mono uppercase tracking-widest text-gray-600 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
            {integration.category}
          </span>
        </div>

        <div className="flex items-start justify-between mb-4 relative z-10">
          <motion.div
            whileHover={{ scale: 1.1, rotate: -5 }}
            className={cn(
              'w-14 h-14 rounded-2xl flex items-center justify-center border shadow-inner transition-all',
              integration.bgColor, integration.borderColor
            )}
          >
            <div className={integration.color}>{integration.icon}</div>
          </motion.div>
          {isConnected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-[#00FFA3]/10 border border-[#00FFA3]/30 rounded-full"
            >
              <CheckCircle className="w-3 h-3 text-[#00FFA3]" />
              <span className="text-[9px] font-bold text-[#00FFA3] font-mono uppercase">Live</span>
            </motion.div>
          )}
          {isComingSoon && (
            <Badge variant="primary" size="sm">
              <Sparkles className="w-3 h-3 mr-1" />
              Soon
            </Badge>
          )}
        </div>

        <h3 className="text-lg font-bold text-white font-heading relative z-10">{integration.name}</h3>
        <p className="text-sm text-gray-400 mt-2 flex-1 relative z-10 leading-relaxed">{integration.description}</p>

        {isConnected && integration.handle && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5 relative z-10"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[#00FFA3] shadow-[0_0_6px_#00FFA3]" />
            <span className="text-xs font-mono text-gray-300 truncate">{integration.handle}</span>
          </motion.div>
        )}

        <div className="mt-5 pt-4 border-t border-white/5 relative z-10">
          {isConnected ? (
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-bold transition-all border border-white/10 flex items-center justify-center gap-1.5"
              >
                <Settings className="w-3.5 h-3.5" />
                Settings
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onDisconnect(integration.id)}
                className="py-2.5 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-all border border-red-500/20 flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </motion.button>
            </div>
          ) : isComingSoon ? (
            <motion.button
              disabled
              className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-500 text-xs font-medium cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Coming Soon
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleConnect}
              disabled={connecting}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#9945FF] to-[#00E5FF] text-black text-xs font-bold shadow-lg shadow-[#9945FF]/20 hover:shadow-[#00E5FF]/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {connecting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Plug className="w-3.5 h-3.5" />
              )}
              {connecting ? 'Connecting...' : `Connect ${integration.name}`}
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function IntegrationsPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [integrations, setIntegrations] = useState(INTEGRATIONS);

  const filtered = useMemo(() => {
    if (activeCategory === 'all') return integrations;
    return integrations.filter(i => i.category === activeCategory);
  }, [activeCategory, integrations]);

  const connectedCount = integrations.filter(i => i.status === 'connected').length;
  const totalCount = integrations.filter(i => i.status !== 'coming_soon').length;

  const handleConnect = (id: string) => {
    setIntegrations(prev => prev.map(i =>
      i.id === id ? { ...i, status: 'connected' as const, handle: `@${id}_user` } : i
    ));
    toast.success('Integration connected successfully!', { position: 'bottom-right' });
  };

  const handleDisconnect = (id: string) => {
    setIntegrations(prev => prev.map(i =>
      i.id === id ? { ...i, status: 'disconnected' as const, handle: undefined } : i
    ));
    toast('Integration disconnected', { position: 'bottom-right' });
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="max-w-7xl mx-auto space-y-6 pb-12"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#9945FF]/10 border border-[#9945FF]/30 flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#9945FF]" />
            </div>
            <div>
              <h1 className="text-3xl font-black font-heading tracking-tight text-white">Integrations</h1>
              <p className="text-sm text-gray-400">Connect your tools to automate your content pipeline.</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00FFA3]/10 border border-[#00FFA3]/20">
            <CheckCircle className="w-4 h-4 text-[#00FFA3]" />
            <span className="text-xs font-bold text-[#00FFA3] font-mono">{connectedCount}/{totalCount} active</span>
          </div>
        </div>
      </motion.div>

      {/* Category Filters */}
      <motion.div variants={fadeInUp} className="flex flex-wrap gap-2">
        {CATEGORIES.map(cat => (
          <motion.button
            key={cat.id}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all',
              activeCategory === cat.id
                ? 'bg-gradient-to-r from-[#9945FF] to-[#00E5FF] text-black shadow-lg'
                : 'bg-[#0A0B0E] border border-white/10 text-gray-400 hover:text-white hover:border-white/20'
            )}
          >
            {cat.icon}
            {cat.label}
          </motion.button>
        ))}
      </motion.div>

      {/* Integration Grid */}
      <motion.div
        key={activeCategory}
        variants={gridContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        {filtered.map((integration, i) => (
          <IntegrationCard
            key={integration.id}
            integration={integration}
            index={i}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
          />
        ))}
      </motion.div>

      {/* Webhook / API Configuration */}
      <motion.div variants={fadeInUp}>
        <div className="glass-panel p-5 md:p-6 rounded-2xl border border-white/5 relative overflow-hidden">
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-[#00E5FF] rounded-full blur-[100px] opacity-[0.03] pointer-events-none" />
          <div className="flex items-center gap-3 mb-5 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/10 flex items-center justify-center border border-[#00E5FF]/20">
              <Webhook className="w-5 h-5 text-[#00E5FF]" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-bold text-white font-heading">API & Webhook Configuration</h3>
              <p className="text-[10px] md:text-xs text-gray-500 font-mono">Build custom integrations with our API</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-[#9945FF]" />
                <span className="text-sm font-bold text-white">Webhook Endpoints</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Receive real-time events when clips are rendered, analyzed, or scheduled.
              </p>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#050505] border border-white/5">
                <code className="text-[11px] font-mono text-[#00E5FF]">https://api.clipflow.ai/webhooks</code>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { navigator.clipboard.writeText('https://api.clipflow.ai/webhooks'); toast.success('Copied!'); }}
                  className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                >
                  <Copy className="w-3.5 h-3.5" />
                </motion.button>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-300 hover:text-white transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add New Endpoint
              </motion.button>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-[#00E5FF]" />
                <span className="text-sm font-bold text-white">API Reference</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Full REST API documentation for programmatic clip generation and management.
              </p>
              <div className="space-y-2">
                {[
                  { method: 'GET', path: '/v1/clips', color: 'text-[#00FFA3]' },
                  { method: 'POST', path: '/v1/clips/generate', color: 'text-[#00E5FF]' },
                  { method: 'GET', path: '/v1/projects', color: 'text-[#00FFA3]' },
                  { method: 'DELETE', path: '/v1/clips/:id', color: 'text-red-400' },
                ].map((route, i) => (
                  <div key={i} className="flex items-center gap-2 text-[11px] font-mono">
                    <span className={cn('font-bold', route.color)}>{route.method}</span>
                    <span className="text-gray-500">{route.path}</span>
                  </div>
                ))}
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-2 rounded-lg bg-gradient-to-r from-[#9945FF] to-[#00E5FF] text-black text-xs font-bold shadow-lg shadow-[#9945FF]/20 hover:shadow-[#00E5FF]/30 transition-all flex items-center justify-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View API Docs
                <ArrowUpRight className="w-3 h-3" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Connected Summary */}
      <motion.div variants={fadeInUp}>
        <div className="glass-panel p-5 md:p-6 rounded-2xl border border-white/5 relative overflow-hidden">
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-[#00FFA3] rounded-full blur-[100px] opacity-[0.04] pointer-events-none" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00FFA3]/10 flex items-center justify-center border border-[#00FFA3]/20">
                <Globe className="w-5 h-5 text-[#00FFA3]" />
              </div>
              <div>
                <h3 className="font-bold text-white">Connected Ecosystem</h3>
                <p className="text-xs text-gray-500 font-mono mt-0.5">
                  {connectedCount} of {totalCount} integrations active &bull; {integrations.filter(i => i.status === 'coming_soon').length} coming soon
                </p>
              </div>
            </div>
            <div className="flex -space-x-2">
              {integrations.filter(i => i.status === 'connected').map(i => (
                <div
                  key={i.id}
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center border-2 border-[#050505] shadow-lg',
                    i.bgColor, i.borderColor, i.color
                  )}
                >
                  {i.icon}
                </div>
              ))}
              {integrations.filter(i => i.status === 'coming_soon').length > 0 && (
                <div className="w-8 h-8 rounded-full bg-white/5 border-2 border-[#050505] flex items-center justify-center text-[10px] font-bold text-gray-500">
                  +{integrations.filter(i => i.status === 'coming_soon').length}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
