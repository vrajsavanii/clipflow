'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase, MapPin, ArrowRight, Code, Laptop, Zap, Heart,
  Users, Coffee, Home, Globe, Star, Sparkles, Clock,
  CheckCircle2, DollarSign,
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

const values = [
  {
    icon: <Zap className="w-7 h-7" />,
    title: 'Ship at Light Speed',
    desc: 'We move fast. Our deploy pipeline runs 50+ times a day. If you can build it today, don\'t wait until tomorrow.',
    color: '#00E5FF',
  },
  {
    icon: <Code className="w-7 h-7" />,
    title: 'Hard Problems Only',
    desc: 'Real-time 4K processing through multimodal LLMs isn\'t trivial. We solve impossible constraints daily.',
    color: '#9945FF',
  },
  {
    icon: <Heart className="w-7 h-7" />,
    title: 'Creator Obsessed',
    desc: 'Every line of code we write exists to make creators more successful. Their growth is our north star.',
    color: '#FF6B9D',
  },
  {
    icon: <Users className="w-7 h-7" />,
    title: 'Radical Ownership',
    desc: 'No red tape, no micromanagement. You own your projects from ideation to production and beyond.',
    color: '#00FFA3',
  },
];

const benefits = [
  { icon: <DollarSign className="w-5 h-5" />, title: 'Competitive Compensation', desc: 'Top-tier salary + meaningful equity packages.', color: '#9945FF' },
  { icon: <Heart className="w-5 h-5" />, title: 'Health & Wellness', desc: 'Full medical, dental, and vision coverage — 100% premium paid.', color: '#00E5FF' },
  { icon: <Clock className="w-5 h-5" />, title: 'Unlimited PTO', desc: 'Take the time you need. Minimum 3 weeks required annually.', color: '#00FFA3' },
  { icon: <Laptop className="w-5 h-5" />, title: 'Home Office Stipend', desc: '$2,000 setup budget plus $500/month for remote expenses.', color: '#FF6B9D' },
  { icon: <Globe className="w-5 h-5" />, title: 'Remote-First Culture', desc: 'Work from anywhere. We have team members in 12+ countries.', color: '#9945FF' },
  { icon: <Coffee className="w-5 h-5" />, title: 'Team Offsites', desc: 'Bi-annual company retreats. Past locations: Tokyo, Lisbon, Tulum.', color: '#00E5FF' },
];

const positions = [
  {
    title: 'Senior AI Engineer — Video Models',
    dept: 'Engineering',
    location: 'San Francisco / Remote',
    type: 'Full-time',
    desc: 'Design and train next-generation video understanding models. Work on hook detection, viral scoring, and real-time clip generation.',
    color: '#9945FF',
  },
  {
    title: 'Founding Product Designer',
    dept: 'Design',
    location: 'New York / Remote',
    type: 'Full-time',
    desc: 'Own the end-to-end product experience. From AI workflow UX to micro-interactions that delight millions of creators.',
    color: '#00E5FF',
  },
  {
    title: 'Senior Full-Stack Engineer',
    dept: 'Engineering',
    location: 'Remote (US)',
    type: 'Full-time',
    desc: 'Build the platform that powers millions of clips. Deep work on our rendering pipeline, real-time dashboard, and API surface.',
    color: '#00FFA3',
  },
  {
    title: 'Enterprise Account Executive',
    dept: 'Sales',
    location: 'Remote (US)',
    type: 'Full-time',
    desc: 'Own the full sales cycle for enterprise media companies. Help global brands scale their video content operations.',
    color: '#FF6B9D',
  },
  {
    title: 'Developer Advocate',
    dept: 'DevRel',
    location: 'London / Remote',
    type: 'Full-time',
    desc: 'Build SDKs, write docs, create tutorials, and grow our developer community. You are the bridge between our API and the world.',
    color: '#00E5FF',
  },
  {
    title: 'Infrastructure Engineer — Rust',
    dept: 'Engineering',
    location: 'Remote (Global)',
    type: 'Full-time',
    desc: 'Optimize our Rust-based FFmpeg pipeline for zero-copy frame processing. Push the limits of video encoding performance.',
    color: '#9945FF',
  },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white relative overflow-hidden">
      <div className="fixed top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#9945FF]/[0.03] rounded-full blur-[200px] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-[#00E5FF]/[0.03] rounded-full blur-[200px] pointer-events-none" />

      {/* Hero */}
      <AnimatedSection className="relative z-10 pt-36 pb-16 px-6">
        <AnimatedContainer className="max-w-7xl mx-auto text-center">
          <AnimatedItem>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 font-mono mb-6">
              <Link href="/" className="hover:text-white transition-colors flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5" /> Home
              </Link>
              <span>/</span>
              <span className="text-[#9945FF]">Careers</span>
            </div>
          </AnimatedItem>
          <AnimatedItem>
            <Badge variant="primary" size="lg" className="mb-6 px-4 py-1.5">
              <Sparkles className="w-3.5 h-3.5 mr-2 inline-block" />
              We&apos;re hiring
            </Badge>
          </AnimatedItem>
          <AnimatedItem>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black font-heading tracking-tight leading-[0.95] mb-6">
              <AnimatedGradientText from="#9945FF" via="#00E5FF" to="#00FFA3">
                Join the Team
              </AnimatedGradientText>
            </h1>
          </AnimatedItem>
          <AnimatedItem>
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              We&apos;re looking for the top 1% of talent to build the infrastructure that will
              power the next generation of video intelligence. If you do your best work when
              the stakes are high, you belong here.
            </p>
          </AnimatedItem>
        </AnimatedContainer>
      </AnimatedSection>

      <div className="relative z-10 px-6 pb-24 space-y-32">
        <div className="max-w-7xl mx-auto">
          {/* Culture / Values */}
          <AnimatedContainer>
            <AnimatedItem className="text-center mb-12">
              <Badge variant="info" size="lg" className="mb-4">Our Culture</Badge>
              <h2 className="text-3xl md:text-5xl font-black font-heading tracking-tight mb-4">
                What We{' '}
                <AnimatedGradientText from="#00E5FF" via="#9945FF" to="#FF6B9D">
                  Believe
                </AnimatedGradientText>
              </h2>
              <p className="text-gray-400 max-w-xl mx-auto">
                These principles guide every decision we make, from product to hiring.
              </p>
            </AnimatedItem>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {values.map((v, i) => (
                <AnimatedCard key={v.title} index={i}>
                  <div className="p-6 rounded-2xl border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/[0.08] transition-all duration-300 h-full">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${v.color}15`, color: v.color }}>
                      {v.icon}
                    </div>
                    <h3 className="text-base font-bold font-heading mb-2">{v.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
                  </div>
                </AnimatedCard>
              ))}
            </div>
          </AnimatedContainer>

          {/* Benefits */}
          <AnimatedContainer>
            <AnimatedItem className="text-center mb-12">
              <Badge variant="success" size="lg" className="mb-4">Benefits</Badge>
              <h2 className="text-3xl md:text-5xl font-black font-heading tracking-tight mb-4">
                Why Work at{' '}
                <AnimatedGradientText from="#00FFA3" via="#00E5FF" to="#9945FF">
                  ClipFlow
                </AnimatedGradientText>
              </h2>
            </AnimatedItem>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {benefits.map((b, i) => (
                <AnimatedCard key={b.title} index={i}>
                  <div className="flex items-start gap-4 p-5 rounded-2xl border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/[0.08] transition-all duration-300">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${b.color}15`, color: b.color }}>
                      {b.icon}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-white mb-0.5">{b.title}</h4>
                      <p className="text-xs text-gray-500">{b.desc}</p>
                    </div>
                  </div>
                </AnimatedCard>
              ))}
            </div>
          </AnimatedContainer>

          {/* Open positions */}
          <AnimatedContainer>
            <AnimatedItem className="text-center mb-12">
              <Badge variant="primary" size="lg" className="mb-4">Open Roles</Badge>
              <h2 className="text-3xl md:text-5xl font-black font-heading tracking-tight mb-4">
                Open{' '}
                <AnimatedGradientText from="#9945FF" via="#00E5FF" to="#FF6B9D">
                  Positions
                </AnimatedGradientText>
              </h2>
              <p className="text-gray-400">6 roles across engineering, design, sales, and DevRel.</p>
            </AnimatedItem>
            <div className="space-y-4">
              {positions.map((role, i) => (
                <AnimatedItem key={role.title}>
                  <motion.div
                    className="group p-6 rounded-2xl border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/[0.08] transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6"
                    whileHover={{ x: 4 }}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: role.color }} />
                        <h3 className="text-base md:text-lg font-bold font-heading group-hover:text-[#00E5FF] transition-colors">
                          {role.title}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-500 mb-3 line-clamp-2">{role.desc}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5" /> {role.dept}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" /> {role.location}
                        </span>
                        <Badge variant="outline" size="sm">{role.type}</Badge>
                      </div>
                    </div>
                    <div className="shrink-0">
                      <Button variant="secondary" size="lg" className="gap-2 w-full md:w-auto">
                        Apply Now <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                </AnimatedItem>
              ))}
            </div>
          </AnimatedContainer>

          {/* Apply CTA */}
          <AnimatedContainer>
            <AnimatedItem>
              <div className="p-12 md:p-16 rounded-3xl border border-[#9945FF]/10 bg-gradient-to-br from-[#9945FF]/5 via-transparent to-[#00E5FF]/5 text-center relative overflow-hidden">
                <div className="absolute top-[-30%] left-[-10%] w-80 h-80 bg-[#9945FF]/5 rounded-full blur-[120px] pointer-events-none" />
                <div className="relative z-10">
                  <h2 className="text-3xl md:text-5xl font-black font-heading tracking-tight mb-4">
                    Don&apos;t See the Right Role?
                  </h2>
                  <p className="text-gray-400 max-w-lg mx-auto mb-8">
                    We&apos;re always looking for exceptional talent. Send us your resume and
                    tell us how you can contribute to ClipFlow&apos;s mission.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-4">
                    <Link href="/contact">
                      <Button variant="rainbow" size="xl" className="gap-2">
                        Send Your Resume <ArrowRight className="w-5 h-5" />
                      </Button>
                    </Link>
                    <Link href="/about">
                      <Button variant="secondary" size="xl">Learn About Us</Button>
                    </Link>
                  </div>
                </div>
              </div>
            </AnimatedItem>
          </AnimatedContainer>
        </div>
      </div>
    </div>
  );
}
