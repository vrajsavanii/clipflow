'use client';

import { motion } from 'framer-motion';
import {
  CheckCircle2, CircleDashed, Clock, Map, Sparkles,
  ArrowRight, Lightbulb, Cpu, Palette, Layers,
  Database, Globe, Lock, Zap,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AnimatedContainer, AnimatedItem, AnimatedCard,
  AnimatedGradientText, AnimatedSection,
} from '@/components/AnimatedSection';
import { staggerContainer, fadeInUp, fadeInLeft, fadeInRight } from '@/lib/animations';

const roadmapData = {
  completed: [
    { title: 'AI Subtitle Generation', desc: 'Auto-captions with 99.8% accuracy in 30+ languages, word-level timestamps.', label: 'AI' as const },
    { title: 'Smart Auto-Framing', desc: 'Real-time face tracking for flawless landscape to vertical conversion.', label: 'Core' as const },
    { title: 'Export to Socials', desc: 'Direct one-click publishing to TikTok, Reels, YouTube Shorts, and X.', label: 'Integration' as const },
    { title: 'Dynamic Caption Styles', desc: '50+ kinetic typography templates with full brand customization.', label: 'Design' as const },
  ],
  inProgress: [
    { title: 'B-Roll Injection AI', desc: 'Context-aware stock footage placement synced to speech semantics.', label: 'AI' as const },
    { title: 'Multi-Speaker Detection', desc: 'Automatic speaker diarization and split-track timeline editing.', label: 'Core' as const },
    { title: 'Custom Font Uploads', desc: 'Full typography control with .OTF/.TTF support for brand consistency.', label: 'Design' as const },
    { title: 'Team Workspaces Beta', desc: 'Collaborative projects with role-based access for agencies.', label: 'Infrastructure' as const },
  ],
  planned: [
    { title: 'Virality Scoring Model', desc: 'Predict hook performance with ML models trained on 50M+ viral clips.', label: 'AI' as const },
    { title: 'Webhooks & Public API', desc: 'Programmatic clipping pipelines for enterprise content workflows.', label: 'Developer' as const },
    { title: 'Real-Time Collaboration', desc: 'Multi-user editing with live cursors and version history.', label: 'Infrastructure' as const },
    { title: 'Mobile Capture App', desc: 'Record, trim, and send to ClipFlow desktop from your phone.', label: 'Core' as const },
    { title: 'Advanced Analytics', desc: 'Deep performance dashboards with audience retention graphs.', label: 'Analytics' as const },
  ],
};

const labelConfig: Record<string, { color: string; bg: string; border: string; icon: React.ReactNode }> = {
  AI: { color: '#9945FF', bg: 'bg-[#9945FF]/10', border: 'border-[#9945FF]/20', icon: <Cpu className="w-3 h-3" /> },
  Core: { color: '#00E5FF', bg: 'bg-[#00E5FF]/10', border: 'border-[#00E5FF]/20', icon: <Zap className="w-3 h-3" /> },
  Integration: { color: '#00FFA3', bg: 'bg-[#00FFA3]/10', border: 'border-[#00FFA3]/20', icon: <Globe className="w-3 h-3" /> },
  Design: { color: '#FF6B9D', bg: 'bg-[#FF6B9D]/10', border: 'border-[#FF6B9D]/20', icon: <Palette className="w-3 h-3" /> },
  Infrastructure: { color: '#FFD700', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', icon: <Layers className="w-3 h-3" /> },
  Developer: { color: '#FF8C00', bg: 'bg-orange-500/10', border: 'border-orange-500/20', icon: <Database className="w-3 h-3" /> },
  Analytics: { color: '#FF1493', bg: 'bg-pink-500/10', border: 'border-pink-500/20', icon: <Lightbulb className="w-3 h-3" /> },
};

const columnConfig = {
  completed: {
    icon: <CheckCircle2 className="w-5 h-5 text-[#00FFA3]" />,
    title: 'Completed',
    color: '#00FFA3',
    borderClass: '',
    cardClass: 'opacity-70 hover:opacity-100 transition-all duration-300',
    borderStyle: 'border-white/10',
    delay: 0.05,
  },
  inProgress: {
    icon: <CircleDashed className="w-5 h-5 text-[#00E5FF]" />,
    title: 'In Progress',
    color: '#00E5FF',
    borderClass: 'ring-1 ring-[#00E5FF]/20 shadow-[0_0_20px_rgba(0,229,255,0.06)]',
    cardClass: 'transition-all duration-300',
    borderStyle: 'border-[#00E5FF]/25',
    delay: 0.1,
  },
  planned: {
    icon: <Clock className="w-5 h-5 text-[#9945FF]" />,
    title: 'Planned',
    color: '#9945FF',
    borderClass: '',
    cardClass: 'transition-all duration-300',
    borderStyle: 'border-dashed border-white/10 hover:border-solid hover:border-white/20',
    delay: 0.15,
  },
};

export default function RoadmapPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white relative overflow-hidden">
      {/* Ambient background */}
      <motion.div
        className="absolute top-[-6%] left-1/3 w-[40vw] h-[40vw] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(153,69,255,0.06) 0%, transparent 70%)' }}
        animate={{ x: [0, 20, -10, 0], y: [0, -20, 10, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-[-8%] right-1/4 w-[35vw] h-[35vw] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,229,255,0.04) 0%, transparent 70%)' }}
        animate={{ x: [0, -15, 10, 0], y: [0, 20, -10, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="max-w-7xl mx-auto px-6 pt-32 pb-20 relative z-10">

        {/* ─── Hero ─── */}
        <AnimatedContainer className="text-center max-w-4xl mx-auto mb-20">
          <AnimatedItem>
            <motion.div whileHover={{ scale: 1.05 }} className="inline-block mb-6">
              <Badge variant="primary" size="lg" className="cursor-default">
                <Map className="w-3.5 h-3.5 mr-1.5" />
                Public Roadmap
              </Badge>
            </motion.div>
          </AnimatedItem>
          <AnimatedItem>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black font-heading tracking-tight leading-[1.05] mb-6">
              The Future of{' '}
              <AnimatedGradientText from="#9945FF" via="#00E5FF" to="#0066FF">
                Video Creation
              </AnimatedGradientText>
            </h1>
          </AnimatedItem>
          <AnimatedItem>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
              We&apos;re building in public. Here is exactly what the ClipFlow engineering team is working
              on to make you the most dangerous creator on the internet.
            </p>
          </AnimatedItem>
        </AnimatedContainer>

        {/* ─── 3-Column Grid ─── */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start"
        >
          {(['completed', 'inProgress', 'planned'] as const).map((columnKey) => {
            const column = columnConfig[columnKey];
            const items = roadmapData[columnKey];
            return (
              <motion.div
                key={columnKey}
                variants={fadeInUp}
                className="flex flex-col gap-4"
              >
                {/* Column header */}
                <motion.div
                  className="flex items-center gap-2.5 pb-4 border-b border-white/10 mb-2"
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    animate={columnKey === 'inProgress' ? { rotate: [0, 360] } : undefined}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                  >
                    {column.icon}
                  </motion.div>
                  <h2 className="text-lg font-bold font-heading text-white">{column.title}</h2>
                  <span
                    className="ml-auto text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border"
                    style={{
                      color: column.color,
                      borderColor: `${column.color}25`,
                      backgroundColor: `${column.color}10`,
                    }}
                  >
                    {items.length}
                  </span>
                </motion.div>

                {/* Cards */}
                {items.map((item, idx) => {
                  const label = labelConfig[item.label];
                  return (
                    <motion.div
                      key={idx}
                      variants={fadeInUp}
                      className={`glass-card rounded-xl p-5 group relative overflow-hidden ${column.cardClass} ${column.borderStyle} ${column.borderClass}`}
                      whileHover={{ y: -4, transition: { duration: 0.25 } }}
                    >
                      {/* Hover glow */}
                      <div
                        className="absolute -top-16 -right-16 w-32 h-32 rounded-full blur-[60px] opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"
                        style={{ background: `radial-gradient(circle, ${column.color}, transparent)` }}
                      />

                      <div className="relative z-10">
                        {/* Label badge */}
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-1 rounded border mb-3 ${label.bg} ${label.border}`}
                          style={{ color: label.color }}
                        >
                          {label.icon}
                          {item.label}
                        </span>

                        {/* Title */}
                        <h3 className="font-bold text-white mb-1.5 flex items-center gap-2">
                          {item.title}
                          {columnKey === 'inProgress' && (
                            <motion.span
                              animate={{ opacity: [1, 0.3, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              <Sparkles className="w-3.5 h-3.5 text-[#00E5FF]" />
                            </motion.span>
                          )}
                        </h3>

                        {/* Description */}
                        <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            );
          })}
        </motion.div>

        {/* ─── Bottom CTA ─── */}
        <motion.div
          className="text-center mt-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="glass-card rounded-3xl p-10 md:p-14 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#9945FF]/8 via-transparent to-[#00E5FF]/8" />
            <div className="relative z-10">
              <Badge variant="premium" size="lg" className="mb-5">Have an idea?</Badge>
              <h2 className="text-2xl md:text-4xl font-black font-heading mb-4">
                Suggest a Feature
              </h2>
              <p className="text-gray-400 max-w-xl mx-auto mb-6">
                We read every single request. Your feedback shapes our roadmap.
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Button variant="primary" size="xl" asChild>
                  <Link href="/feedback">
                    Submit Feedback <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Legend */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-4 mt-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          {Object.entries(labelConfig).map(([key, cfg]) => (
            <span
              key={key}
              className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full ${cfg.bg} ${cfg.border}`}
              style={{ color: cfg.color }}
            >
              {cfg.icon}
              {key}
            </span>
          ))}
        </motion.div>

      </div>
    </div>
  );
}
