'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BrainCircuit, Sparkles, Captions, Crop,
  Globe, Calendar, Palette, BarChart3,
  Users, GitCompareArrows, CheckCircle2, ArrowRight,
  Zap, Tv, Music, MessageCircle, MessageSquare,
  Mic, Layers, Search, TrendingUp,
  Play, Target, Film, Hash, Camera,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AnimatedContainer,
  AnimatedItem,
  AnimatedCard,
  AnimatedGradientText,
  AnimatedSection,
} from '@/components/AnimatedSection';

const featureCategories = [
  {
    title: 'AI Intelligence',
    color: '#9945FF',
    features: [
      {
        icon: <Search className="w-5 h-5" />,
        title: 'Hook Detection',
        desc: 'Neural engine identifies the exact moment that maximizes retention and engagement.',
      },
      {
        icon: <TrendingUp className="w-5 h-5" />,
        title: 'Viral Score Prediction',
        desc: 'Pre-launch score predicts shareability with 94% accuracy across all platforms.',
      },
      {
        icon: <Captions className="w-5 h-5" />,
        title: 'Auto-Captioning',
        desc: '98% accurate speech-to-text with dynamic styling, emoji placement, and keyword highlights.',
      },
    ],
  },
  {
    title: 'Video Processing',
    color: '#00E5FF',
    features: [
      {
        icon: <Target className="w-5 h-5" />,
        title: 'Smart Auto-Framing',
        desc: 'Subject-aware reframing keeps your face centered across every aspect ratio.',
      },
      {
        icon: <Crop className="w-5 h-5" />,
        title: 'Dynamic Crop',
        desc: 'AI-powered crop zones that follow action, not just faces — perfect for gaming and sports.',
      },
      {
        icon: <Layers className="w-5 h-5" />,
        title: 'B-Roll Injection',
        desc: 'Auto-sync secondary footage to vocal cadence. No timeline scrubbing required.',
      },
    ],
  },
  {
    title: 'Export & Share',
    color: '#00FFA3',
    features: [
      {
        icon: <Globe className="w-5 h-5" />,
        title: 'Multi-Platform Export',
        desc: 'One click renders in 16:9, 9:16, 1:1, 4:5, and 3:4 simultaneously.',
      },
      {
        icon: <Calendar className="w-5 h-5" />,
        title: 'Auto-Scheduler',
        desc: 'Optimal posting time AI schedules every clip across your connected platforms.',
      },
      {
        icon: <Palette className="w-5 h-5" />,
        title: 'Brand Kit',
        desc: 'Fonts, colors, intros, outros — apply your full brand identity in one tap.',
      },
    ],
  },
  {
    title: 'Analytics',
    color: '#FF6B9D',
    features: [
      {
        icon: <BarChart3 className="w-5 h-5" />,
        title: 'Performance Dashboard',
        desc: 'Real-time views, retention curves, share rate, and revenue attribution.',
      },
      {
        icon: <Users className="w-5 h-5" />,
        title: 'Audience Insights',
        desc: 'Demographic breakdowns, watch-time heatmaps, and drop-off analysis.',
      },
      {
        icon: <GitCompareArrows className="w-5 h-5" />,
        title: 'A/B Testing',
        desc: 'Test hooks, thumbnails, captions, and publish the winning variant automatically.',
      },
    ],
  },
];

const deepDiveFeatures = [
  {
    icon: <BrainCircuit className="w-8 h-8" />,
    name: 'Context-Aware AI Clipping',
    gradient: '#9945FF',
    description:
      'ClipFlow understands narrative structure, not just waveform spikes. Our proprietary neural engine analyzes pacing, context, and emotional arcs to extract moments that drive conversion.',
    bullets: [
      'Multi-modal understanding of audio, visual, and textual cues',
      'Trained on 50M+ high-performing social clips',
      'Sub-second inference on consumer hardware',
      'Continuous learning from your publishing patterns',
    ],
    cta: '/features/ai-clipping',
    imageSide: 'left',
  },
  {
    icon: <Zap className="w-8 h-8" />,
    name: 'Rust-Accelerated Rendering',
    gradient: '#00E5FF',
    description:
      'Built on a custom FFmpeg pipeline accelerated by Rust. Export 4K clips with overlays, captions, and effects in milliseconds — no render queue, no waiting.',
    bullets: [
      'GPU-accelerated encode/decode pipeline',
      'Parallel frame processing with zero-copy architecture',
      'Supports H.264, H.265, AV1, and ProRes',
      'Batch export 50+ variants in under a minute',
    ],
    cta: '/features/rendering',
    imageSide: 'right',
  },
  {
    icon: <Sparkles className="w-8 h-8" />,
    name: 'Viral Hook Generator',
    gradient: '#00FFA3',
    description:
      'Stop guessing. ClipFlow analyzes millions of viral videos to generate scroll-stopping hooks, then A/B tests them against your audience for maximum impact.',
    bullets: [
      'Generates text, visual, and audio hook combinations',
      'Predicts hook performance before you publish',
      'Auto-rotates underperforming hooks in scheduled posts',
      'Library of 10,000+ proven hook templates',
    ],
    cta: '/features/hook-generator',
    imageSide: 'left',
  },
  {
    icon: <BarChart3 className="w-8 h-8" />,
    name: 'Real-Time Performance Analytics',
    gradient: '#FF6B9D',
    description:
      'Track every metric that matters with dashboards built for creators, not data scientists. Know exactly what works and double down on your winning formula.',
    bullets: [
      'Sub-5 minute data freshness across all platforms',
      'Competitive benchmarking against similar creators',
      'Revenue attribution per clip, per platform',
      'Automated weekly growth reports with AI recommendations',
    ],
    cta: '/features/analytics',
    imageSide: 'right',
  },
];

const platforms = [
  { name: 'TikTok', icon: <Music className="w-6 h-6" />, color: '#000000' },
  { name: 'YouTube', icon: <Film className="w-6 h-6" />, color: '#FF0000' },
  { name: 'Instagram', icon: <Camera className="w-6 h-6" />, color: '#E4405F' },
  { name: 'Twitter/X', icon: <Hash className="w-6 h-6" />, color: '#1DA1F2' },
  { name: 'LinkedIn', icon: <MessageCircle className="w-6 h-6" />, color: '#0A66C2' },
  { name: 'Facebook', icon: <Globe className="w-6 h-6" />, color: '#1877F2' },
  { name: 'Snapchat', icon: <Zap className="w-6 h-6" />, color: '#FFFC00' },
  { name: 'Pinterest', icon: <Tv className="w-6 h-6" />, color: '#E60023' },
  { name: 'Discord', icon: <MessageSquare className="w-6 h-6" />, color: '#5865F2' },
  { name: 'Twitch', icon: <Mic className="w-6 h-6" />, color: '#9146FF' },
];

function GlassCard({
  children,
  className = '',
  color = '#9945FF',
}: {
  children: React.ReactNode;
  className?: string;
  color?: string;
}) {
  return (
    <div
      className={`relative group rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl transition-all duration-500 hover:border-white/[0.12] ${className}`}
    >
      <div
        className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${color}20, transparent 60%)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white relative overflow-hidden">
      {/* Background orbs */}
      <div className="fixed top-[-20%] left-[-10%] w-[800px] h-[800px] bg-[#9945FF]/[0.03] rounded-full blur-[200px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-[#00E5FF]/[0.03] rounded-full blur-[200px] pointer-events-none" />
      <div className="fixed top-[40%] right-[20%] w-[400px] h-[400px] bg-[#FF6B9D]/[0.02] rounded-full blur-[150px] pointer-events-none" />

      {/* ============ HERO ============ */}
      <AnimatedSection className="relative z-10 pt-36 pb-20 px-6">
        <AnimatedContainer className="max-w-5xl mx-auto text-center">
          <AnimatedItem>
            <Badge variant="info" size="lg" className="mb-8 px-4 py-1.5">
              <Sparkles className="w-3.5 h-3.5 mr-2 inline-block" />
              Everything in one platform
            </Badge>
          </AnimatedItem>

          <AnimatedItem>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black font-heading tracking-tight leading-[0.95] mb-8">
              Everything You Need
              <br />
              to{' '}
              <AnimatedGradientText from="#9945FF" via="#00E5FF" to="#FF6B9D">
                Go Viral
              </AnimatedGradientText>
            </h1>
          </AnimatedItem>

          <AnimatedItem>
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              ClipFlow combines AI-powered clipping, cinematic processing, and
              cross-platform analytics into a single workflow that turns raw
              footage into a viral content engine.
            </p>
          </AnimatedItem>

          <AnimatedItem>
            <motion.div
              className="flex flex-wrap items-center justify-center gap-4 mt-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <Link href="/signup">
                <Button
                  variant="rainbow"
                  size="xl"
                  className="gap-2 shadow-[0_0_40px_rgba(153,69,255,0.3)]"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/demo">
                <Button variant="secondary" size="xl" className="gap-2">
                  <Play className="w-5 h-5" />
                  Watch Demo
                </Button>
              </Link>
            </motion.div>
          </AnimatedItem>

          {/* Trusted by bar */}
          <AnimatedItem>
            <motion.div
              className="mt-16 pt-12 border-t border-white/[0.04]"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-xs text-gray-600 font-mono tracking-widest uppercase mb-6">
                Trusted by creators at
              </p>
              <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
                {['Morning Brew', 'H3 Podcast', 'MrBeast', 'The Verge', 'Nas Daily'].map(
                  (name) => (
                    <span
                      key={name}
                      className="text-sm text-gray-500 font-bold tracking-tight opacity-50 hover:opacity-80 transition-opacity"
                    >
                      {name}
                    </span>
                  )
                )}
              </div>
            </motion.div>
          </AnimatedItem>
        </AnimatedContainer>
      </AnimatedSection>

      {/* ============ FEATURE CATEGORIES ============ */}
      <AnimatedSection className="relative z-10 px-6 py-24">
        <AnimatedContainer className="max-w-7xl mx-auto">
          <AnimatedItem>
            <div className="text-center mb-16">
              <Badge variant="primary" size="lg" className="mb-4">
                Feature Categories
              </Badge>
              <h2 className="text-3xl md:text-5xl font-black font-heading tracking-tight mb-4">
                Four Pillars. Infinite{' '}
                <AnimatedGradientText from="#00E5FF" via="#9945FF" to="#FF6B9D">
                  Possibilities
                </AnimatedGradientText>
              </h2>
              <p className="text-gray-400 max-w-xl mx-auto">
                Every feature is designed to work together — from AI ingestion to
                platform optimization.
              </p>
            </div>
          </AnimatedItem>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {featureCategories.map((category, catIdx) => (
              <AnimatedItem key={category.title}>
                <GlassCard color={category.color} className="p-6 h-full">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/[0.06]">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{
                          backgroundColor: `${category.color}15`,
                          color: category.color,
                        }}
                      >
                        {category.features[0].icon}
                      </div>
                      <h3 className="text-lg font-bold font-heading">{category.title}</h3>
                    </div>

                    <div className="space-y-5 flex-1">
                      {category.features.map((feature, featIdx) => (
                        <motion.div
                          key={feature.title}
                          className="group/feature"
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: catIdx * 0.1 + featIdx * 0.05 }}
                        >
                          <div className="flex gap-3">
                            <div
                              className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-colors duration-300"
                              style={{
                                backgroundColor: `${category.color}10`,
                                color: category.color,
                              }}
                            >
                              {feature.icon}
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-white/90 mb-1">
                                {feature.title}
                              </h4>
                              <p className="text-xs text-gray-500 leading-relaxed">
                                {feature.desc}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </GlassCard>
              </AnimatedItem>
            ))}
          </div>
        </AnimatedContainer>
      </AnimatedSection>

      {/* ============ DEEP DIVE ============ */}
      <AnimatedSection className="relative z-10 px-6 py-24">
        <AnimatedContainer className="max-w-7xl mx-auto">
          <AnimatedItem>
            <div className="text-center mb-16">
              <Badge variant="info" size="lg" className="mb-4">
                Deep Dive
              </Badge>
              <h2 className="text-3xl md:text-5xl font-black font-heading tracking-tight mb-4">
                Engineered for{' '}
                <AnimatedGradientText from="#FF6B9D" via="#9945FF" to="#00E5FF">
                  Performance
                </AnimatedGradientText>
              </h2>
              <p className="text-gray-400 max-w-xl mx-auto">
                Here&apos;s how ClipFlow delivers unmatched speed, quality, and
                intelligence at every layer.
              </p>
            </div>
          </AnimatedItem>

          <div className="space-y-24">
            {deepDiveFeatures.map((feature, idx) => (
              <AnimatedItem key={feature.name}>
                <motion.div
                  className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center ${
                    feature.imageSide === 'right' ? '' : ''
                  }`}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                >
                  {/* Content side */}
                  <div
                    className={`order-2 ${
                      feature.imageSide === 'right' ? 'lg:order-1' : 'lg:order-2'
                    }`}
                  >
                    <div className="max-w-lg">
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                        style={{
                          backgroundColor: `${feature.gradient}15`,
                          color: feature.gradient,
                          boxShadow: `0 0 40px ${feature.gradient}20`,
                        }}
                      >
                        {feature.icon}
                      </div>

                      <h3
                        className="text-3xl md:text-4xl font-black font-heading tracking-tight mb-4"
                        style={{
                          background: `linear-gradient(135deg, ${feature.gradient}, #ffffff)`,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                        }}
                      >
                        {feature.name}
                      </h3>

                      <p className="text-gray-400 leading-relaxed mb-8 text-base">
                        {feature.description}
                      </p>

                      <div className="space-y-3 mb-8">
                        {feature.bullets.map((bullet) => (
                          <div key={bullet} className="flex items-start gap-3">
                            <div
                              className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                              style={{ backgroundColor: `${feature.gradient}20` }}
                            >
                              <CheckCircle2
                                className="w-3.5 h-3.5"
                                style={{ color: feature.gradient }}
                              />
                            </div>
                            <span className="text-sm text-gray-300">{bullet}</span>
                          </div>
                        ))}
                      </div>

                      <Link href={feature.cta}>
                        <Button
                          variant="ghost"
                          className="group gap-2 px-0 hover:bg-transparent hover:text-white"
                          style={{ color: feature.gradient }}
                        >
                          Learn more
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Visual side */}
                  <div
                    className={`order-1 ${
                      feature.imageSide === 'right' ? 'lg:order-2' : 'lg:order-1'
                    }`}
                  >
                    <GlassCard color={feature.gradient} className="p-1">
                      <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-white/[0.03] to-white/[0.01] p-8 md:p-12 flex items-center justify-center min-h-[300px]">
                        <motion.div
                          className="text-center"
                          animate={
                            {
                              // subtle breathing effect
                            }
                          }
                        >
                          <div
                            className="w-28 h-28 md:w-36 md:h-36 rounded-3xl flex items-center justify-center mx-auto mb-6"
                            style={{
                              backgroundColor: `${feature.gradient}10`,
                              color: feature.gradient,
                              boxShadow: `0 0 80px ${feature.gradient}15`,
                            }}
                          >
                            <div className="scale-[2] md:scale-[2.5]">
                              {feature.icon}
                            </div>
                          </div>
                          <div className="h-2 w-32 md:w-48 mx-auto rounded-full bg-white/[0.04] overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
                              style={{ backgroundColor: feature.gradient }}
                              initial={{ width: '0%' }}
                              whileInView={{ width: '85%' }}
                              viewport={{ once: true }}
                              transition={{ duration: 1.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            />
                          </div>
                          <p className="text-xs text-gray-600 mt-3 font-mono">Performance index</p>
                        </motion.div>
                      </div>
                    </GlassCard>
                  </div>
                </motion.div>
              </AnimatedItem>
            ))}
          </div>
        </AnimatedContainer>
      </AnimatedSection>

      {/* ============ INTEGRATION SHOWCASE ============ */}
      <AnimatedSection className="relative z-10 px-6 py-24">
        <AnimatedContainer className="max-w-7xl mx-auto">
          <AnimatedItem>
            <div className="text-center mb-16">
              <Badge variant="success" size="lg" className="mb-4">
                Integrations
              </Badge>
              <h2 className="text-3xl md:text-5xl font-black font-heading tracking-tight mb-4">
                Ship to Every{' '}
                <AnimatedGradientText from="#00FFA3" via="#00E5FF" to="#9945FF">
                  Platform
                </AnimatedGradientText>
              </h2>
              <p className="text-gray-400 max-w-xl mx-auto">
                One click publishes natively to every major platform with
                platform-optimized formats, captions, and metadata.
              </p>
            </div>
          </AnimatedItem>

          <AnimatedItem>
            <GlassCard className="p-8 md:p-12">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
                {platforms.map((platform, idx) => (
                  <motion.div
                    key={platform.name}
                    className="flex flex-col items-center gap-3 p-5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300 cursor-default group/platform"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.04 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover/platform:scale-110"
                      style={{
                        backgroundColor: `${platform.color}10`,
                        color: platform.color,
                      }}
                    >
                      {platform.icon}
                    </div>
                    <span className="text-xs font-bold text-gray-400 group-hover/platform:text-white transition-colors">
                      {platform.name}
                    </span>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-white/[0.04] text-center">
                <p className="text-sm text-gray-500">
                  Plus Zapier, Make, REST API, and Webhooks — connect your entire stack.
                </p>
              </div>
            </GlassCard>
          </AnimatedItem>
        </AnimatedContainer>
      </AnimatedSection>

      {/* ============ CTA ============ */}
      <AnimatedSection className="relative z-10 px-6 py-32">
        <AnimatedContainer className="max-w-4xl mx-auto text-center">
          <AnimatedItem>
            <GlassCard
              color="#9945FF"
              className="p-12 md:p-20 border-[#9945FF]/10 hover:border-[#9945FF]/20"
            >
              <div className="relative">
                <motion.div
                  className="absolute -top-20 -right-20 w-60 h-60 bg-[#9945FF]/10 rounded-full blur-[100px] pointer-events-none"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                  className="absolute -bottom-20 -left-20 w-60 h-60 bg-[#00E5FF]/10 rounded-full blur-[100px] pointer-events-none"
                  animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.2, 0.4] }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                />

                <div className="relative z-10">
                  <Badge variant="premium" size="lg" className="mb-6">
                    Get Started Today
                  </Badge>

                  <h2 className="text-4xl md:text-6xl font-black font-heading tracking-tight leading-[1.05] mb-6">
                    Ready to Transform{' '}
                    <AnimatedGradientText from="#00E5FF" via="#9945FF" to="#FF6B9D">
                      Your Content?
                    </AnimatedGradientText>
                  </h2>

                  <p className="text-gray-400 text-lg max-w-lg mx-auto mb-10">
                    Join 50,000+ creators who turned their content into a
                    rian growth engine. Start free — no credit card required.
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-4">
                    <Link href="/signup">
                      <motion.div
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <Button
                          variant="rainbow"
                          size="xl"
                          className="gap-2 shadow-[0_0_40px_rgba(153,69,255,0.3)] text-base px-10"
                        >
                          Start Free Trial
                          <ArrowRight className="w-5 h-5" />
                        </Button>
                      </motion.div>
                    </Link>
                    <Link href="/pricing">
                      <Button variant="secondary" size="xl">
                        View Pricing
                      </Button>
                    </Link>
                  </div>

                  <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-600">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#00FFA3]" />
                      No credit card
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#00FFA3]" />
                      14-day free trial
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#00FFA3]" />
                      Cancel anytime
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#00FFA3]" />
                      24/7 support
                    </span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </AnimatedItem>
        </AnimatedContainer>
      </AnimatedSection>
    </div>
  );
}
