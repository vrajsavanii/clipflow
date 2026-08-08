'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Terminal, Copy, Check, Key, Shield, Book, ChevronRight,
  ArrowRight, Server, Webhook, Database, Lock, Home,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AnimatedContainer,
  AnimatedItem,
  AnimatedCard,
  AnimatedGradientText,
  AnimatedSection,
} from '@/components/AnimatedSection';

const endpoints = [
  {
    method: 'POST' as const,
    path: '/v1/clips/ingest',
    title: 'Ingest Video',
    description: 'Submit a video URL or direct file upload for AI-powered clip generation. Returns a job ID for polling or webhook delivery.',
    color: '#00FFA3',
    code: `curl -X POST https://api.clipflow.ai/v1/clips/ingest \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "source_url": "https://youtube.com/watch?v=...",
    "target_duration": "30s-60s",
    "caption_style": "hormozi_bold",
    "webhook_url": "https://your.app/webhook"
  }'`,
    response: `{
  "job_id": "clip_job_abc123",
  "status": "processing",
  "estimated_time_sec": 8,
  "webhook_url": "https://your.app/webhook"
}`,
  },
  {
    method: 'GET' as const,
    path: '/v1/clips',
    title: 'List Clips',
    description: 'Retrieve all generated clips for your account. Supports pagination, filtering by status, and date range queries.',
    color: '#00E5FF',
    code: `curl -X GET "https://api.clipflow.ai/v1/clips?limit=20&status=completed" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
    response: `{
  "data": [
    {
      "id": "clip_xyz456",
      "status": "completed",
      "source_url": "https://...",
      "output_url": "https://cdn.clipflow.ai/clips/...",
      "duration_sec": 45,
      "viral_score": 0.92,
      "created_at": "2026-05-27T12:00:00Z"
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 142
  }
}`,
  },
  {
    method: 'POST' as const,
    path: '/v1/clips/render',
    title: 'Render Clip',
    description: 'Trigger a custom render job with specific aspect ratios, caption overlays, brand kit settings, and output formats.',
    color: '#9945FF',
    code: `curl -X POST https://api.clipflow.ai/v1/clips/render \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "clip_id": "clip_xyz456",
    "aspect_ratios": ["9:16", "1:1", "16:9"],
    "caption_enabled": true,
    "brand_kit_id": "bk_001",
    "output_format": "mp4"
  }'`,
    response: `{
  "render_job_id": "render_jkl789",
  "status": "queued",
  "outputs": [
    {"ratio": "9:16", "url": null, "status": "pending"},
    {"ratio": "1:1", "url": null, "status": "pending"},
    {"ratio": "16:9", "url": null, "status": "pending"}
  ],
  "estimated_time_sec": 15
}`,
  },
  {
    method: 'GET' as const,
    path: '/v1/projects',
    title: 'List Projects',
    description: 'Fetch all projects in your workspace. Each project contains grouped clips, brand kits, and shared team settings.',
    color: '#FF6B9D',
    code: `curl -X GET "https://api.clipflow.ai/v1/projects" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
    response: `{
  "data": [
    {
      "id": "proj_001",
      "name": "Podcast Clips",
      "clip_count": 48,
      "total_views": 1250000,
      "members": ["user_1", "user_2"],
      "created_at": "2026-01-15T08:00:00Z"
    }
  ]
}`,
  },
];

const sidebarLinks = [
  { name: 'Authentication', href: '#auth', icon: <Lock className="w-4 h-4" /> },
  { name: 'POST /ingest', href: '#ingest', icon: <Terminal className="w-4 h-4" /> },
  { name: 'GET /clips', href: '#clips', icon: <Database className="w-4 h-4" /> },
  { name: 'POST /render', href: '#render', icon: <Server className="w-4 h-4" /> },
  { name: 'GET /projects', href: '#projects', icon: <Book className="w-4 h-4" /> },
  { name: 'Webhooks', href: '#webhooks', icon: <Webhook className="w-4 h-4" /> },
];

function CodeBlock({ code, label }: { code: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#0A0A0A] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.02]">
        <span className="text-xs text-gray-500 font-mono">{label}</span>
        <button
          onClick={copy}
          className="text-gray-500 hover:text-white transition-colors flex items-center gap-1.5 text-xs"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-[#00FFA3]" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="text-xs font-mono text-gray-300 leading-relaxed whitespace-pre-wrap"><code>{code}</code></pre>
      </div>
    </div>
  );
}

function MethodBadge({ method }: { method: 'GET' | 'POST' }) {
  const isPost = method === 'POST';
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold font-mono tracking-wider ${
        isPost
          ? 'bg-[#00FFA3]/10 text-[#00FFA3] border border-[#00FFA3]/20'
          : 'bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20'
      }`}
    >
      {method}
    </span>
  );
}

export default function ApiReferencePage() {
  const [showSidebar, setShowSidebar] = useState(false);
  return (
    <div className="min-h-screen bg-[#050505] text-white relative overflow-hidden">
      <div className="fixed top-[-15%] right-[-5%] w-[700px] h-[700px] bg-[#9945FF]/[0.03] rounded-full blur-[200px] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#00E5FF]/[0.03] rounded-full blur-[180px] pointer-events-none" />

      {/* Hero */}
      <AnimatedSection className="relative z-10 pt-36 pb-16 px-6">
        <AnimatedContainer className="max-w-7xl mx-auto">
          <AnimatedItem>
            <div className="flex items-center gap-2 text-sm text-gray-500 font-mono mb-6">
              <Link href="/" className="hover:text-white transition-colors flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5" /> Home
              </Link>
              <span>/</span>
              <span className="text-[#00E5FF]">API Reference</span>
            </div>
          </AnimatedItem>
          <AnimatedItem>
            <Badge variant="primary" size="lg" className="mb-6 px-4 py-1.5">
              <Terminal className="w-3.5 h-3.5 mr-2 inline-block" />
              API v1 — Stable
            </Badge>
          </AnimatedItem>
          <AnimatedItem>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black font-heading tracking-tight leading-[0.95] mb-6">
              <AnimatedGradientText from="#9945FF" via="#00E5FF" to="#FF6B9D">
                API Reference
              </AnimatedGradientText>
            </h1>
          </AnimatedItem>
          <AnimatedItem>
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl leading-relaxed">
              Integrate ClipFlow&apos;s video intelligence engine directly into your
              application. Generate, render, and manage clips programmatically.
            </p>
          </AnimatedItem>
        </AnimatedContainer>
      </AnimatedSection>

      <div className="relative z-10 px-6 pb-24">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10">
          {/* Mobile Sidebar Toggle */}
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="flex lg:hidden items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-4"
          >
            <Book className="w-4 h-4" />
            {showSidebar ? 'Hide Navigation' : 'Show Navigation'}
            <ChevronRight className={`w-3 h-3 transition-transform ${showSidebar ? 'rotate-90' : ''}`} />
          </button>

          {/* Sidebar */}
          <motion.aside
            className={`w-full lg:w-56 flex-shrink-0 space-y-1 ${showSidebar ? 'block' : 'hidden lg:block'}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="sticky top-32 space-y-1">
              {sidebarLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/[0.03] transition-all"
                >
                  {link.icon}
                  {link.name}
                </a>
              ))}
            </div>
          </motion.aside>

          {/* Main */}
          <div className="flex-1 min-w-0 max-w-4xl">
            {/* Authentication */}
            <AnimatedContainer className="mb-16">
              <AnimatedItem>
                <h2 id="auth" className="text-2xl md:text-3xl font-bold font-heading mb-4 flex items-center gap-3">
                  <Lock className="w-6 h-6 text-[#9945FF]" />
                  Authentication
                </h2>
              </AnimatedItem>
              <AnimatedItem>
                <p className="text-gray-400 leading-relaxed mb-6">
                  All API requests require a valid API key passed via the <code className="text-[#00E5FF] bg-white/[0.03] px-1.5 py-0.5 rounded text-sm">Authorization</code> header.
                  You can manage your keys from the ClipFlow dashboard.
                </p>
              </AnimatedItem>
              <AnimatedItem>
                <CodeBlock
                  label="Request"
                  code={`curl https://api.clipflow.ai/v1/clips \\
  -H "Authorization: Bearer cf_live_abc123def456"`}
                />
              </AnimatedItem>
              <AnimatedItem>
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { icon: <Key className="w-5 h-5" />, title: 'API Keys', desc: 'Generate scoped keys per environment.', color: '#9945FF' },
                    { icon: <Shield className="w-5 h-5" />, title: 'Rate Limits', desc: '100 req/min on Pro, unlimited on Enterprise.', color: '#00E5FF' },
                    { icon: <Lock className="w-5 h-5" />, title: 'Encryption', desc: 'All data encrypted in transit (TLS 1.3).', color: '#00FFA3' },
                  ].map((item, i) => (
                    <div
                      key={item.title}
                      className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03] transition-all"
                    >
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: `${item.color}15`, color: item.color }}>
                        {item.icon}
                      </div>
                      <h4 className="text-sm font-bold text-white mb-1">{item.title}</h4>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </AnimatedItem>
            </AnimatedContainer>

            {/* Endpoints */}
            <div className="space-y-16">
              {endpoints.map((ep, i) => (
                <AnimatedContainer key={ep.path}>
                  <AnimatedItem>
                    <div id={ep.path.replace('/', '-')} className="scroll-mt-32">
                      <div className="flex items-center gap-3 mb-3">
                        <MethodBadge method={ep.method} />
                        <code className="text-sm font-mono text-white font-bold">{ep.path}</code>
                      </div>
                      <h3 className="text-xl font-bold font-heading mb-2">{ep.title}</h3>
                      <p className="text-gray-400 leading-relaxed mb-6">{ep.description}</p>
                    </div>
                  </AnimatedItem>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <AnimatedItem>
                      <CodeBlock code={ep.code} label="Request" />
                    </AnimatedItem>
                    <AnimatedItem>
                      <CodeBlock code={ep.response} label="Response" />
                    </AnimatedItem>
                  </div>
                </AnimatedContainer>
              ))}
            </div>

            {/* Webhooks section */}
            <AnimatedContainer className="mt-16">
              <AnimatedItem>
                <h2 id="webhooks" className="text-2xl md:text-3xl font-bold font-heading mb-4 flex items-center gap-3">
                  <Webhook className="w-6 h-6 text-[#00E5FF]" />
                  Webhooks
                </h2>
              </AnimatedItem>
              <AnimatedItem>
                <p className="text-gray-400 leading-relaxed mb-6">
                  Receive real-time notifications when clips finish processing. Configure webhook
                  URLs per job or globally in your dashboard. We&apos;ll send a POST request with the
                  full clip payload to your endpoint.
                </p>
              </AnimatedItem>
              <AnimatedItem>
                <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl">
                  <div className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                    <span className="w-2 h-2 rounded-full bg-[#00FFA3]" />
                    Payload delivered to your webhook URL
                  </div>
                  <pre className="text-xs font-mono text-gray-500 mt-2">
{`{
  "event": "clip.completed",
  "clip_id": "clip_xyz456",
  "status": "completed",
  "output_url": "https://cdn.clipflow.ai/clips/...",
  "viral_score": 0.92,
  "duration_sec": 45
}`}</pre>
                </div>
              </AnimatedItem>
            </AnimatedContainer>

            {/* CTA */}
            <AnimatedContainer className="mt-16">
              <AnimatedItem>
                <div className="p-8 md:p-10 rounded-2xl border border-[#9945FF]/10 bg-gradient-to-br from-[#9945FF]/5 to-[#00E5FF]/5 text-center">
                  <h3 className="text-2xl font-bold font-heading mb-3">Ready to integrate?</h3>
                  <p className="text-gray-400 mb-6 max-w-md mx-auto">
                    Grab your API key from the dashboard and start building in minutes.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-4">
                    <Link href="/login">
                      <Button variant="rainbow" size="lg" className="gap-2">
                        Get API Key <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Link href="/documentation">
                      <Button variant="secondary" size="lg">
                        Read Docs
                      </Button>
                    </Link>
                  </div>
                </div>
              </AnimatedItem>
            </AnimatedContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
