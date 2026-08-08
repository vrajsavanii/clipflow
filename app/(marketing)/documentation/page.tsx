'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Book, Search, Terminal, Zap, Settings, Video,
  FileText, ChevronRight, Code, Bot, Globe, Layers,
  ArrowRight, Shield, Sparkles, Menu, X, Home,
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

const sidebarSections = [
  {
    title: 'Getting Started',
    links: [
      { name: 'Introduction', href: '#', active: true },
      { name: 'Quickstart Guide', href: '#', active: false },
      { name: 'Installation', href: '#', active: false },
      { name: 'Authentication', href: '#', active: false },
    ],
  },
  {
    title: 'Guides',
    links: [
      { name: 'Video Ingestion', icon: <Video className="w-4 h-4" />, href: '#', active: false },
      { name: 'AI Viral Scoring', icon: <Zap className="w-4 h-4" />, href: '#', active: false },
      { name: 'Auto-Framing', icon: <Settings className="w-4 h-4" />, href: '#', active: false },
      { name: 'Dynamic Captions', icon: <FileText className="w-4 h-4" />, href: '#', active: false },
    ],
  },
  {
    title: 'API Reference',
    links: [
      { name: 'REST API', icon: <Code className="w-4 h-4" />, href: '#', active: false },
      { name: 'Webhooks', icon: <Bot className="w-4 h-4" />, href: '#', active: false },
      { name: 'Rate Limits', icon: <Shield className="w-4 h-4" />, href: '#', active: false },
      { name: 'SDKs', icon: <Layers className="w-4 h-4" />, href: '#', active: false },
    ],
  },
  {
    title: 'SDKs',
    links: [
      { name: 'Python SDK', href: '#', active: false },
      { name: 'Node.js SDK', href: '#', active: false },
      { name: 'Go SDK', href: '#', active: false },
    ],
  },
  {
    title: 'Changelog',
    links: [
      { name: 'v3.2.0 — Latest', href: '#', active: false },
      { name: 'v3.1.0', href: '#', active: false },
      { name: 'v3.0.0', href: '#', active: false },
    ],
  },
];

const quickLinks = [
  {
    icon: <Terminal className="w-6 h-6" />,
    title: 'API Integration',
    desc: 'Automate your pipeline by connecting our clipping engine directly to your ingest servers.',
    color: '#9945FF',
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Viral Scoring',
    desc: 'Understand exactly why a clip was generated with our transparent AI confidence metrics.',
    color: '#00FFA3',
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: 'Multi-Platform Export',
    desc: 'Auto-publish your clips to YouTube, TikTok, and Instagram with a single click.',
    color: '#00E5FF',
  },
  {
    icon: <Layers className="w-6 h-6" />,
    title: 'SDK Quickstart',
    desc: 'Integrate ClipFlow into your stack with our Python, Node.js, and Go SDKs.',
    color: '#FF6B9D',
  },
  {
    icon: <Bot className="w-6 h-6" />,
    title: 'Webhooks Guide',
    desc: 'Receive real-time notifications when clips finish processing and rendering.',
    color: '#00FFA3',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Security Best Practices',
    desc: 'Learn how to secure your API keys and manage access controls for your team.',
    color: '#00E5FF',
  },
  {
    icon: <Settings className="w-6 h-6" />,
    title: 'Custom Configs',
    desc: 'Fine-tune caption styles, aspect ratios, and brand kit settings via API.',
    color: '#9945FF',
  },
  {
    icon: <Video className="w-6 h-6" />,
    title: 'Batch Processing',
    desc: 'Process hundreds of hours of footage in parallel with our batch ingestion API.',
    color: '#FF6B9D',
  },
];

const popularArticles = [
  { title: 'Getting Started with ClipFlow', reads: '12.4k', color: '#9945FF' },
  { title: 'Understanding Viral Scores', reads: '8.7k', color: '#00E5FF' },
  { title: 'Custom Caption Styles Guide', reads: '6.2k', color: '#00FFA3' },
  { title: 'API Authentication & Keys', reads: '5.1k', color: '#FF6B9D' },
  { title: 'Multi-Platform Export Setup', reads: '4.8k', color: '#9945FF' },
  { title: 'Webhook Event Reference', reads: '3.9k', color: '#00E5FF' },
];

export default function DocumentationPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#050505] text-white relative overflow-hidden">
      <div className="fixed top-[-10%] left-[-5%] w-[600px] h-[600px] bg-[#9945FF]/[0.03] rounded-full blur-[200px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#00E5FF]/[0.03] rounded-full blur-[200px] pointer-events-none" />

      {/* Hero */}
      <AnimatedSection className="relative z-10 pt-36 pb-16 px-6">
        <AnimatedContainer className="max-w-7xl mx-auto">
          <AnimatedItem>
            <div className="flex items-center gap-2 text-sm text-gray-500 font-mono mb-6">
              <Link href="/" className="hover:text-white transition-colors flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5" /> Home
              </Link>
              <span>/</span>
              <span className="text-[#00E5FF]">Documentation</span>
            </div>
          </AnimatedItem>
          <AnimatedItem>
            <Badge variant="info" size="lg" className="mb-6 px-4 py-1.5">
              <Book className="w-3.5 h-3.5 mr-2 inline-block" />
              Documentation v3.0
            </Badge>
          </AnimatedItem>
          <AnimatedItem>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black font-heading tracking-tight leading-[0.95] mb-6">
              Build with{' '}
              <AnimatedGradientText from="#9945FF" via="#00E5FF" to="#FF6B9D">
                Documentation
              </AnimatedGradientText>
            </h1>
          </AnimatedItem>
          <AnimatedItem>
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl leading-relaxed">
              Everything you need to integrate ClipFlow into your workflow. From
              quickstart guides to API references, we&apos;ve got you covered.
            </p>
          </AnimatedItem>
        </AnimatedContainer>
      </AnimatedSection>

      {/* Content area */}
      <div className="relative z-10 px-6 pb-24">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
          {/* Mobile sidebar toggle */}
          <div className="lg:hidden flex items-center justify-between mb-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="gap-2"
            >
              {mobileSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              Sections
            </Button>
            <div className="relative w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search docs..."
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF]/30 transition-all text-white placeholder:text-gray-500"
              />
            </div>
          </div>

          {/* Sidebar */}
          <motion.aside
            className={`w-full lg:w-64 flex-shrink-0 space-y-6 ${
              mobileSidebarOpen ? 'block' : 'hidden lg:block'
            }`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Desktop search */}
            <div className="hidden lg:block relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#00E5FF] transition-colors" />
              <input
                type="text"
                placeholder="Search docs..."
                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF]/30 transition-all text-white placeholder:text-gray-500"
              />
            </div>

            <nav className="space-y-8">
              {sidebarSections.map((section, i) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                >
                  <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 px-3">
                    {section.title}
                  </h3>
                  <ul className="space-y-0.5">
                    {section.links.map((link) => (
                      <li key={link.name}>
                        <Link
                          href={link.href}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                            link.active
                              ? 'bg-[#9945FF]/10 text-white font-medium border border-[#9945FF]/20'
                              : 'text-gray-400 hover:text-white hover:bg-white/[0.03]'
                          }`}
                        >
                          {'icon' in link && link.icon}
                          {link.active && <ChevronRight className="w-3 h-3 text-[#9945FF]" />}
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </nav>
          </motion.aside>

          {/* Main content */}
          <motion.main
            className="flex-1 min-w-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Quick links grid */}
            <h2 className="text-2xl font-bold font-heading mb-6">Quick Links</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-12">
              {quickLinks.map((link, i) => (
                <AnimatedCard key={link.title} index={i} className="h-full">
                  <Link
                    href="#"
                    className="block h-full p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl hover:border-white/[0.12] transition-all duration-300 group"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110"
                      style={{ backgroundColor: `${link.color}15`, color: link.color }}
                    >
                      {link.icon}
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1">{link.title}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">{link.desc}</p>
                    <div
                      className="mt-3 flex items-center gap-1 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: link.color }}
                    >
                      Read more <ArrowRight className="w-3 h-3" />
                    </div>
                  </Link>
                </AnimatedCard>
              ))}
            </div>

            {/* Popular articles */}
            <AnimatedContainer>
              <AnimatedItem>
                <h2 className="text-2xl font-bold font-heading mb-6">Popular Articles</h2>
              </AnimatedItem>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                {popularArticles.map((article, i) => (
                  <AnimatedItem key={article.title}>
                    <Link
                      href="#"
                      className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/[0.08] transition-all duration-300 group"
                    >
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: article.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-white truncate group-hover:text-[#00E5FF] transition-colors">
                          {article.title}
                        </h4>
                        <p className="text-xs text-gray-600">{article.reads} reads</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors shrink-0" />
                    </Link>
                  </AnimatedItem>
                ))}
              </div>
            </AnimatedContainer>

            {/* Featured doc section */}
            <AnimatedContainer>
              <AnimatedItem>
                <h2 className="text-2xl font-bold font-heading mb-6">Getting Started</h2>
              </AnimatedItem>
              <AnimatedItem>
                <div className="p-6 md:p-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl mb-8">
                  <h3 className="text-xl font-bold font-heading mb-3">What is ClipFlow?</h3>
                  <p className="text-gray-400 leading-relaxed mb-6 text-sm">
                    ClipFlow is an AI-powered video clipping engine that transforms long-form
                    footage into viral-ready short-form clips. By analyzing narrative structure,
                    emotional arcs, and engagement patterns, our neural network identifies the
                    exact moments that drive conversion — then automatically reframes, captions,
                    and exports them for every platform.
                  </p>
                  <div className="p-4 rounded-xl bg-black/60 border border-white/[0.06] font-mono text-sm leading-relaxed space-y-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#9945FF]" />
                      <span className="text-gray-300">ClipFlow v3.2 initialized</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#00FFA3]">✓</span>
                      <span className="text-gray-300">Whisper-v3 model loaded</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#00E5FF]">⚡</span>
                      <span className="text-gray-300">Analyzing 14 hook candidates...</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#9945FF]">➜</span>
                      <span className="text-white font-bold">6 viral clips generated</span>
                    </div>
                  </div>
                </div>
              </AnimatedItem>

              <AnimatedItem>
                <div className="flex flex-wrap gap-4">
                  <Link href="#">
                    <Button variant="rainbow" size="lg" className="gap-2">
                      Read the Guide <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href="#">
                    <Button variant="secondary" size="lg">
                      View API Reference
                    </Button>
                  </Link>
                </div>
              </AnimatedItem>
            </AnimatedContainer>
          </motion.main>
        </div>
      </div>
    </div>
  );
}
