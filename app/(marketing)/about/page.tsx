'use client';

import { motion } from 'framer-motion';
import {
  Rocket, Target, Zap, Eye, Heart, Shield, Users,
  ChevronRight, Quote, Sparkles, Award, TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AnimatedContainer, AnimatedItem, AnimatedCard,
  AnimatedGradientText, AnimatedSection, AnimatedNumber,
} from '@/components/AnimatedSection';
import { fadeInUp } from '@/lib/animations';

const TEAM = [
  { name: 'Vraj Savani', role: 'CEO & Founder', bio: 'Ex-ML engineer. Obsessed with video intelligence.', color: '#9945FF' },
  { name: 'Sarah Jenkins', role: 'CTO', bio: 'Built video pipelines at Netflix scale.', color: '#00E5FF' },
  { name: 'Marcus Chen', role: 'Head of AI', bio: 'PhD in computer vision. 15 patents.', color: '#00FFA3' },
  { name: 'Elena Rostova', role: 'VP of Product', bio: 'Shipped products used by 50M+ creators.', color: '#FF6B9D' },
];

const values = [
  {
    icon: <Zap className="w-7 h-7" />,
    title: 'Innovation',
    description: 'We push the boundaries of what AI can do with video. Every week brings a breakthrough in our pipeline.',
    color: '#9945FF',
  },
  {
    icon: <Rocket className="w-7 h-7" />,
    title: 'Speed',
    description: 'Ship fast, iterate faster. We deploy multiple times a day and measure everything in milliseconds.',
    color: '#00E5FF',
  },
  {
    icon: <Award className="w-7 h-7" />,
    title: 'Quality',
    description: 'Pixel-perfect output, 99.9% uptime, and an obsessive attention to the creator experience.',
    color: '#00FFA3',
  },
  {
    icon: <Shield className="w-7 h-7" />,
    title: 'Transparency',
    description: 'We build in public. Every bug, every feature, every decision is shared with our community.',
    color: '#FF6B9D',
  },
];

const stats = [
  { value: 50, suffix: 'M+', label: 'Views Processed', icon: <Eye className="w-5 h-5" />, color: '#9945FF' },
  { value: 5, suffix: 'M+', label: 'Clips Generated', icon: <TrendingUp className="w-5 h-5" />, color: '#00E5FF' },
  { value: 50, suffix: 'K+', label: 'Active Creators', icon: <Users className="w-5 h-5" />, color: '#00FFA3' },
  { value: 99.9, suffix: '%', label: 'Platform Uptime', icon: <Heart className="w-5 h-5" />, color: '#FF6B9D' },
];

const milestones = [
  { year: '2023', event: 'ClipFlow founded with a vision to revolutionize video editing', icon: <Rocket className="w-3.5 h-3.5" /> },
  { year: '2024 Q1', event: 'Launched viral hook detection engine powered by LLaMA 3.3', icon: <Sparkles className="w-3.5 h-3.5" /> },
  { year: '2024 Q2', event: 'Crossed 10,000 active creators and 1M clips generated', icon: <Users className="w-3.5 h-3.5" /> },
  { year: '2024 Q3', event: 'Raised $12M Series A to scale the AI pipeline', icon: <TrendingUp className="w-3.5 h-3.5" /> },
  { year: '2025', event: 'Launched V3 engine with real-time 4K processing', icon: <Zap className="w-3.5 h-3.5" /> },
];

const timelineColors = ['#9945FF', '#00E5FF', '#00FFA3', '#9945FF', '#00E5FF'];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white relative overflow-hidden">
      {/* Ambient background orbs */}
      <motion.div
        className="absolute top-[-10%] right-[-5%] w-[50vw] h-[50vw] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(153,69,255,0.08) 0%, transparent 70%)' }}
        animate={{ x: [0, 30, -20, 0], y: [0, -40, 20, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-[-10%] left-[-5%] w-[45vw] h-[45vw] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,229,255,0.06) 0%, transparent 70%)' }}
        animate={{ x: [0, -30, 20, 0], y: [0, 40, -20, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="max-w-7xl mx-auto px-6 pt-32 pb-20 relative z-10 space-y-32">

        {/* ─── Hero ─── */}
        <AnimatedContainer className="text-center max-w-4xl mx-auto pt-8">
          <AnimatedItem>
            <motion.div whileHover={{ scale: 1.05 }} className="inline-block mb-6">
              <Badge variant="primary" size="lg" className="cursor-default">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Our Story
              </Badge>
            </motion.div>
          </AnimatedItem>
          <AnimatedItem>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black font-heading tracking-tight leading-[1.02] mb-8">
              About{' '}
              <AnimatedGradientText from="#9945FF" via="#00E5FF" to="#0066FF">
                ClipFlow
              </AnimatedGradientText>
            </h1>
          </AnimatedItem>
          <AnimatedItem>
            <p className="text-lg md:text-xl text-gray-400 leading-relaxed max-w-3xl mx-auto">
              We are building the intelligence layer for video — empowering creators and enterprises
              to instantly parse, clip, and synthesize hours of footage into viral moments at the speed of thought.
            </p>
          </AnimatedItem>
        </AnimatedContainer>

        {/* ─── Stats ─── */}
        <AnimatedContainer className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, idx) => (
              <AnimatedCard key={idx} index={idx} className="glass-card rounded-2xl p-6 md:p-8 text-center group">
                <motion.div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
                  whileHover={{ rotate: [0, -10, 10, -5, 0], scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                >
                  {stat.icon}
                </motion.div>
                <div className="text-3xl md:text-4xl font-black font-heading text-white mb-1">
                  <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              </AnimatedCard>
            ))}
          </div>
        </AnimatedContainer>

        {/* ─── Our Story / Mission ─── */}
        <AnimatedContainer className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <AnimatedItem>
              <motion.div whileHover={{ scale: 1.02 }} className="glass-card rounded-3xl p-8 md:p-10 relative overflow-hidden group">
                <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity duration-700" style={{ background: 'radial-gradient(circle, #9945FF, transparent)' }} />
                <div className="relative z-10">
                  <Badge variant="primary" size="sm" className="mb-4">Our Mission</Badge>
                  <h2 className="text-3xl md:text-4xl font-black font-heading tracking-tight mb-6">
                    Democratizing{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9945FF] to-[#00E5FF]">
                      Video Intelligence
                    </span>
                  </h2>
                  <p className="text-gray-400 leading-relaxed text-base md:text-lg">
                    Video is the highest bandwidth communication medium in human history. Yet the tools to extract value
                    from it remain stuck in the dark ages of manual editing. ClipFlow was founded in 2023 by Vraj Savani
                    with a singular belief: AI can unlock the full potential of every frame.
                  </p>
                  <div className="mt-6 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <Quote className="w-5 h-5 text-[#9945FF] mb-2" />
                    <p className="text-sm text-gray-400 italic">
                      &ldquo;We want to make every creator feel like they have a million-dollar post-production team in their pocket.&rdquo;
                    </p>
                    <p className="text-xs text-gray-500 mt-2 font-mono">— Vraj Savani, CEO</p>
                  </div>
                </div>
              </motion.div>
            </AnimatedItem>
            <motion.div variants={fadeInUp} transition={{ delay: 0.15 }}>
              <div className="space-y-4">
                {milestones.map((m, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.08 }}
                    className="flex items-start gap-4 p-4 rounded-xl glass-card group hover:border-white/10 transition-all duration-300"
                  >
                    <motion.div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                      style={{ backgroundColor: `${timelineColors[idx]}15`, color: timelineColors[idx] }}
                      whileHover={{ scale: 1.15, rotate: 5 }}
                    >
                      {m.icon}
                    </motion.div>
                    <div>
                      <span className="text-xs font-bold font-mono" style={{ color: timelineColors[idx] }}>{m.year}</span>
                      <p className="text-sm text-gray-300 font-medium mt-0.5">{m.event}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </AnimatedContainer>

        {/* ─── Company Values ─── */}
        <AnimatedContainer>
          <AnimatedItem className="text-center mb-14">
            <Badge variant="info" size="sm" className="mb-4">Our Values</Badge>
            <h2 className="text-4xl md:text-5xl font-black font-heading tracking-tight mb-4">
              What We{' '}
              <AnimatedGradientText from="#00E5FF" via="#9945FF" to="#FF6B9D">
                Believe
              </AnimatedGradientText>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Four principles that guide every decision, every feature, and every line of code.
            </p>
          </AnimatedItem>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map((v, idx) => (
              <AnimatedCard key={idx} index={idx} className="glass-card rounded-2xl p-6 md:p-8 group relative overflow-hidden">
                <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full blur-[80px] opacity-0 group-hover:opacity-30 transition-opacity duration-500"
                  style={{ background: `radial-gradient(circle, ${v.color}, transparent)` }}
                />
                <div className="relative z-10">
                  <motion.div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                    style={{ backgroundColor: `${v.color}15`, color: v.color, border: `1px solid ${v.color}25` }}
                    whileHover={{ rotate: [0, -10, 10, -5, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {v.icon}
                  </motion.div>
                  <h3 className="text-xl font-bold font-heading text-white mb-3">{v.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{v.description}</p>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </AnimatedContainer>

        {/* ─── Team ─── */}
        <AnimatedContainer>
          <AnimatedItem className="text-center mb-14">
            <Badge variant="primary" size="sm" className="mb-4">The Team</Badge>
            <h2 className="text-4xl md:text-5xl font-black font-heading tracking-tight mb-4">
              Behind the{' '}
              <AnimatedGradientText from="#00FFA3" via="#00E5FF" to="#0066FF">
                Magic
              </AnimatedGradientText>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              A distributed team of engineers, creators, and researchers building the future of video.
            </p>
          </AnimatedItem>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEAM.map((member, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: idx * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -8, transition: { duration: 0.25 } }}
                className="glass-card rounded-2xl overflow-hidden group"
              >
                <motion.div
                  className="h-56 flex items-center justify-center relative overflow-hidden"
                  style={{ backgroundColor: `${member.color}12` }}
                >
                  <motion.div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: `${member.color}20`, color: member.color }}
                    whileHover={{ scale: 1.2, rotate: 10 }}
                  >
                    <Users className="w-10 h-10" />
                  </motion.div>
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `radial-gradient(circle at 50% 50%, ${member.color}15, transparent 70%)` }}
                  />
                </motion.div>
                <div className="p-6 relative">
                  <div
                    className="absolute top-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: `linear-gradient(90deg, transparent, ${member.color}, transparent)` }}
                  />
                  <h4 className="text-lg font-bold font-heading text-white">{member.name}</h4>
                  <p className="text-sm font-mono mt-1" style={{ color: member.color }}>{member.role}</p>
                  <p className="text-xs text-gray-500 mt-2">{member.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatedContainer>

        {/* ─── CTA ─── */}
        <AnimatedContainer className="text-center">
          <AnimatedItem>
            <motion.div
              className="glass-card rounded-3xl p-10 md:p-16 relative overflow-hidden group"
              whileHover={{ boxShadow: '0 0 80px rgba(153,69,255,0.1)' }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#9945FF]/8 via-transparent to-[#00E5FF]/8" />
              <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-[150px] opacity-20 group-hover:opacity-40 transition-opacity duration-700"
                style={{ background: 'radial-gradient(circle, #9945FF, transparent)' }}
              />
              <div className="relative z-10">
                <Badge variant="premium" size="lg" className="mb-6">Join the Movement</Badge>
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-black font-heading tracking-tight mb-6">
                  Ready to Join Our{' '}
                  <AnimatedGradientText from="#9945FF" via="#00E5FF" to="#0066FF">
                    Community?
                  </AnimatedGradientText>
                </h2>
                <p className="text-gray-400 max-w-2xl mx-auto mb-8 text-lg">
                  Stop editing. Start creating. Join 50,000+ creators who trust ClipFlow to power their content.
                </p>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                  <Button variant="rainbow" size="xl" asChild>
                    <Link href="/login">
                      Start Creating <ChevronRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </AnimatedItem>
        </AnimatedContainer>

      </div>
    </div>
  );
}
