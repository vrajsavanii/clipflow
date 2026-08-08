'use client';

import { motion } from 'framer-motion';
import {
  Rocket, Bug, Gift, Sparkles, Zap, Cpu, Layers,
  ArrowUpRight, Code, CheckCircle2, Clock, Hash,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AnimatedContainer, AnimatedItem, AnimatedCard,
  AnimatedGradientText, AnimatedSection,
} from '@/components/AnimatedSection';

const changelog = [
  {
    version: 'v3.0.0',
    date: 'May 15, 2026',
    tag: 'Major Release' as const,
    title: 'The Viral Prediction Engine',
    description:
      'We trained a new model on 50M+ TikTok and Shorts videos to predict your clip\'s virality score before you hit export. Plus massive speed improvements to the FFmpeg rendering pipeline.',
    changes: [
      'Introduced Virality Score prediction dashboard with real-time feedback',
      '50% faster rendering for 4K source files via GPU-accelerated encoding',
      'New dynamic auto-zoom capabilities with face tracking v2',
      'Redesigned project manager with drag-and-drop organization',
    ],
  },
  {
    version: 'v2.5.0',
    date: 'April 28, 2026',
    tag: 'Feature' as const,
    title: 'Multi-Speaker Timeline Split',
    description:
      'ClipFlow can now automatically detect different speakers in a podcast or interview and split the timeline into individual tracks for independent editing.',
    changes: [
      'Automatic speaker diarization with 97% accuracy across 14 languages',
      'Individual track volume, effects, and caption controls per speaker',
      'Visual waveform color-coding per speaker identity',
    ],
  },
  {
    version: 'v2.4.2',
    date: 'April 10, 2026',
    tag: 'Improvement' as const,
    title: 'Advanced Brand Kits & Subtitle Magic',
    description:
      'Complete overhaul of how fonts and brand colors are applied to AI-generated subtitles. The text now animates with word-level precision.',
    changes: [
      'Added 50+ new kinetic typography animation presets',
      'Support for custom .OTF and .TTF font uploads with preview gallery',
      'Improved word-boundary detection in 14 languages',
      'New subtitle timeline editor for fine-grained timing control',
    ],
  },
  {
    version: 'v2.4.0',
    date: 'March 22, 2026',
    tag: 'Feature' as const,
    title: 'B-Roll Auto-Injection',
    description:
      'ClipFlow now listens to the semantic meaning of your speech and automatically fetches royalty-free B-Roll to overlay at the exact right moment.',
    changes: [
      'Integration with premium stock libraries (Pexels, Pixabay, Artgrid)',
      'Context-aware visual pacing algorithms that match scene energy',
      'Auto-duration matching based on speech cadence analysis',
    ],
  },
  {
    version: 'v2.3.5',
    date: 'February 15, 2026',
    tag: 'Patch' as const,
    title: 'Performance & Stability Sprint',
    description:
      'A dedicated sprint to clean up the cutting room floor and make the editor feel lightning fast, even with massive podcast episodes.',
    changes: [
      'Resolved timeline stuttering on Safari WebGL renderer',
      'Optimized memory usage for files over 10GB — 40% reduction',
      'Streamlined export settings UI with preset management',
      'Fixed rare crash on M3 Ultra when applying transitions',
    ],
  },
  {
    version: 'v2.3.0',
    date: 'January 30, 2026',
    tag: 'Improvement' as const,
    title: 'Smart Captions v2 & Localization',
    description:
      'Our caption engine got a massive upgrade. Word-level timestamps, emoji support, and real-time translation in 30+ languages.',
    changes: [
      'Word-level timestamp accuracy for perfect subtitle sync',
      'Emoji and sticker support in auto-generated captions',
      'Real-time translation overlays for 30+ languages',
      'Custom caption style templates with save/share functionality',
    ],
  },
];

type TagType = (typeof changelog)[number]['tag'];

const tagConfig: Record<TagType, { color: string; bg: string; border: string; icon: React.ReactNode }> = {
  'Major Release': {
    color: '#9945FF',
    bg: 'bg-[#9945FF]/10',
    border: 'border-[#9945FF]/25',
    icon: <Rocket className="w-4 h-4" />,
  },
  Feature: {
    color: '#00FFA3',
    bg: 'bg-[#00FFA3]/10',
    border: 'border-[#00FFA3]/25',
    icon: <Gift className="w-4 h-4" />,
  },
  Improvement: {
    color: '#00E5FF',
    bg: 'bg-[#00E5FF]/10',
    border: 'border-[#00E5FF]/25',
    icon: <Sparkles className="w-4 h-4" />,
  },
  Patch: {
    color: '#8B8B8B',
    bg: 'bg-white/5',
    border: 'border-white/10',
    icon: <Bug className="w-4 h-4" />,
  },
};

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white relative overflow-hidden">
      {/* Ambient orbs */}
      <motion.div
        className="absolute top-[-5%] right-[-5%] w-[45vw] h-[45vw] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(153,69,255,0.07) 0%, transparent 70%)' }}
        animate={{ x: [0, 25, -15, 0], y: [0, -30, 15, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-[-8%] left-[-5%] w-[40vw] h-[40vw] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,229,255,0.05) 0%, transparent 70%)' }}
        animate={{ x: [0, -20, 10, 0], y: [0, 25, -10, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="max-w-4xl mx-auto px-6 pt-32 pb-20 relative z-10">

        {/* ─── Hero ─── */}
        <AnimatedContainer className="text-center max-w-3xl mx-auto mb-20">
          <AnimatedItem>
            <motion.div whileHover={{ scale: 1.05 }} className="inline-block mb-6">
              <Badge variant="info" size="lg" className="cursor-default">
                <Zap className="w-3.5 h-3.5 mr-1.5" />
                Product Updates
              </Badge>
            </motion.div>
          </AnimatedItem>
          <AnimatedItem>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black font-heading tracking-tight leading-[1.05] mb-6">
              Building at the{' '}
              <AnimatedGradientText from="#00E5FF" via="#9945FF" to="#FF6B9D">
                Speed of Light
              </AnimatedGradientText>
            </h1>
          </AnimatedItem>
          <AnimatedItem>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
              We ship fast to keep you ahead of the algorithm. Here is a look at the latest features,
              improvements, and fixes we&apos;ve pushed to ClipFlow.
            </p>
          </AnimatedItem>
        </AnimatedContainer>

        {/* ─── Timeline ─── */}
        <div className="relative">
          {/* Timeline line */}
          <motion.div
            className="absolute left-[23px] md:left-8 top-0 bottom-0 w-px"
            style={{ background: 'linear-gradient(180deg, rgba(153,69,255,0.4), rgba(0,229,255,0.4), transparent)' }}
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          />

          <div className="space-y-12 md:space-y-16">
            {changelog.map((entry, idx) => {
              const config = tagConfig[entry.tag];
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ delay: idx * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="relative pl-16 md:pl-20"
                >
                  {/* Timeline dot */}
                  <motion.div
                    className="absolute left-[13px] md:left-[19px] top-1.5 w-5 h-5 rounded-full border-2 flex items-center justify-center"
                    style={{ borderColor: config.color, backgroundColor: '#050505' }}
                    whileHover={{ scale: 1.4, boxShadow: `0 0 20px ${config.color}40` }}
                  >
                    <motion.div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: config.color }}
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  </motion.div>

                  {/* Card */}
                  <motion.div
                    className="glass-card rounded-2xl p-6 md:p-8 group relative overflow-hidden"
                    whileHover={{ y: -4, transition: { duration: 0.25 } }}
                  >
                    {/* Hover glow */}
                    <div
                      className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[100px] opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"
                      style={{ background: `radial-gradient(circle, ${config.color}, transparent)` }}
                    />

                    <div className="relative z-10">
                      {/* Header row */}
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <span className="text-2xl md:text-3xl font-black font-heading text-white tracking-tight">
                          {entry.version}
                        </span>
                        <span className="text-sm text-gray-500 font-mono bg-white/[0.03] px-3 py-1 rounded-full border border-white/5">
                          <Clock className="w-3 h-3 inline mr-1.5 -mt-0.5" />
                          {entry.date}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${config.bg} ${config.border}`}
                          style={{ color: config.color }}
                        >
                          {config.icon}
                          {entry.tag}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-xl md:text-2xl font-bold font-heading mb-3" style={{ color: config.color }}>
                        {entry.title}
                      </h3>

                      {/* Description */}
                      <p className="text-sm md:text-base text-gray-400 leading-relaxed mb-6">
                        {entry.description}
                      </p>

                      {/* Changes list */}
                      <div className="space-y-2.5">
                        {entry.changes.map((change, ci) => (
                          <motion.div
                            key={ci}
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: ci * 0.05 }}
                            className="flex items-start gap-3 text-sm text-gray-300"
                          >
                            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: config.color }} />
                            <span>{change}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ─── CTA ─── */}
        <motion.div
          className="text-center mt-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="glass-card rounded-3xl p-10 md:p-14 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#9945FF]/8 via-transparent to-[#00E5FF]/8" />
            <div className="relative z-10">
              <Badge variant="premium" size="lg" className="mb-5">Stay in the Loop</Badge>
              <h2 className="text-2xl md:text-4xl font-black font-heading mb-4">
                Want to see what&apos;s next?
              </h2>
              <p className="text-gray-400 max-w-xl mx-auto mb-6">
                Check out our public roadmap to see what we&apos;re building right now.
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Button variant="primary" size="xl" asChild>
                  <Link href="/roadmap">
                    View Roadmap <ArrowUpRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
