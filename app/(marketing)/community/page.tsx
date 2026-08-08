'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Users, MessageSquare, TrendingUp, Zap, Globe, ArrowUpRight,
  ExternalLink, Calendar, MapPin, Star, Sparkles, Home, Gamepad2,
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

const stats = [
  { value: '50K+', label: 'Community Members', icon: <Users className="w-6 h-6" />, color: '#9945FF' },
  { value: '1.2B+', label: 'Clips Shared', icon: <TrendingUp className="w-6 h-6" />, color: '#00E5FF' },
  { value: '98.7%', label: 'Uptime Score', icon: <Zap className="w-6 h-6" />, color: '#00FFA3' },
  { value: '24/7', label: 'Support Coverage', icon: <Globe className="w-6 h-6" />, color: '#FF6B9D' },
];

const platforms = [
  {
    name: 'Discord',
    desc: 'Real-time chat with the community and engineering team. Get help, share workflows, and beta test new features.',
    members: '24,500+',
    icon: <MessageSquare className="w-7 h-7" />,
    color: '#5865F2',
    bg: '#5865F210',
    href: '#',
  },
  {
    name: 'Twitter / X',
    desc: 'Follow @ClipFlow for product updates, creator spotlights, and AI video research threads.',
    members: '18,200+',
    icon: <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
    color: '#1DA1F2',
    bg: '#1DA1F210',
    href: '#',
  },
  {
    name: 'GitHub',
    desc: 'Open-source SDKs, API examples, and community-contributed integrations. Star us and contribute.',
    members: '3,800+',
    icon: <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>,
    color: '#ffffff',
    bg: '#ffffff10',
    href: '#',
  },
  {
    name: 'YouTube',
    desc: 'Tutorials, case studies, and deep dives into the AI clipping engine. Learn from the best.',
    members: '12,100+',
    icon: <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>,
    color: '#FF0000',
    bg: '#FF000010',
    href: '#',
  },
];

const creators = [
  { name: 'Alex Rivera', handle: '@alexrivera', role: 'Tech Creator', followers: '1.2M', color: '#9945FF' },
  { name: 'Sophie Chen', handle: '@sophiecreates', role: 'Digital Artist', followers: '890K', color: '#00E5FF' },
  { name: 'Marcus Webb', handle: '@marcuswebb', role: 'Podcaster', followers: '2.1M', color: '#00FFA3' },
  { name: 'Priya Sharma', handle: '@priyacreates', role: 'Educator', followers: '650K', color: '#FF6B9D' },
  { name: 'Jordan Lee', handle: '@jordanclips', role: 'Gaming Creator', followers: '3.4M', color: '#9945FF' },
  { name: 'Taylor Brooks', handle: '@taylorb', role: 'Producer', followers: '780K', color: '#00E5FF' },
];

const events = [
  { title: 'ClipFlow Creator Summit 2026', date: 'Jun 15, 2026', location: 'San Francisco, CA', type: 'In-Person', color: '#9945FF' },
  { title: 'AI Video Hackathon', date: 'Jul 8-10, 2026', location: 'Virtual', type: 'Online', color: '#00E5FF' },
  { title: 'Community AMA — Product Roadmap', date: 'Jul 22, 2026', location: 'Discord', type: 'Online', color: '#00FFA3' },
  { title: 'ClipFlow x VidCon 2026', date: 'Aug 12-15, 2026', location: 'Anaheim, CA', type: 'In-Person', color: '#9945FF' },
];

export default function CommunityPage() {
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
              <span className="text-[#9945FF]">Community</span>
            </div>
          </AnimatedItem>
          <AnimatedItem>
            <Badge variant="primary" size="lg" className="mb-6 px-4 py-1.5">
              <Users className="w-3.5 h-3.5 mr-2 inline-block" />
              12,402 Creators Online
            </Badge>
          </AnimatedItem>
          <AnimatedItem>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black font-heading tracking-tight leading-[0.95] mb-6">
              <AnimatedGradientText from="#9945FF" via="#00E5FF" to="#FF6B9D">
                Join the Community
              </AnimatedGradientText>
            </h1>
          </AnimatedItem>
          <AnimatedItem>
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl leading-relaxed">
              Connect with the world&apos;s top creators, agencies, and brands engineering virality
              at scale. Get exclusive insights, beta access, and instant support.
            </p>
          </AnimatedItem>
          <AnimatedItem>
            <div className="flex flex-wrap gap-4 mt-8">
              <Button variant="rainbow" size="xl" className="gap-2">
                <MessageSquare className="w-5 h-5" /> Join the Discord
              </Button>
              <Button variant="secondary" size="xl" className="gap-2">
                Explore the Forum <ArrowUpRight className="w-4 h-4" />
              </Button>
            </div>
          </AnimatedItem>
        </AnimatedContainer>
      </AnimatedSection>

      <div className="relative z-10 px-6 pb-24 space-y-32">
        <div className="max-w-7xl mx-auto">
          {/* Stats */}
          <AnimatedContainer>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-24">
              {stats.map((stat, i) => (
                <AnimatedCard key={stat.label} index={i}>
                  <div
                    className="p-6 rounded-2xl border border-white/[0.04] bg-white/[0.01] text-center hover:border-white/[0.08] transition-all duration-300"
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                      {stat.icon}
                    </div>
                    <div className="text-3xl md:text-4xl font-black mb-1">{stat.value}</div>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                </AnimatedCard>
              ))}
            </div>
          </AnimatedContainer>

          {/* Platform cards */}
          <AnimatedContainer className="mb-24">
            <AnimatedItem className="text-center mb-12">
              <Badge variant="info" size="lg" className="mb-4">Our Platforms</Badge>
              <h2 className="text-3xl md:text-5xl font-black font-heading tracking-tight mb-4">
                Where to Find{' '}
                <AnimatedGradientText from="#00E5FF" via="#9945FF" to="#FF6B9D">
                  Us
                </AnimatedGradientText>
              </h2>
              <p className="text-gray-400">Join thousands of creators across every major platform.</p>
            </AnimatedItem>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {platforms.map((p, i) => (
                <AnimatedCard key={p.name} index={i}>
                  <Link
                    href={p.href}
                    className="block h-full p-6 rounded-2xl border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/[0.08] transition-all duration-300 group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: p.bg, color: p.color }}>
                        {p.icon}
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-lg font-bold font-heading mb-1 flex items-center gap-2">
                      {p.name}
                    </h3>
                    <p className="text-xs text-gray-500 mb-3 leading-relaxed line-clamp-2">{p.desc}</p>
                    <span className="text-xs font-mono" style={{ color: p.color }}>{p.members} members</span>
                  </Link>
                </AnimatedCard>
              ))}
            </div>
          </AnimatedContainer>

          {/* Featured creators */}
          <AnimatedContainer className="mb-24">
            <AnimatedItem className="text-center mb-12">
              <Badge variant="primary" size="lg" className="mb-4">Featured Members</Badge>
              <h2 className="text-3xl md:text-5xl font-black font-heading tracking-tight mb-4">
                Meet Our{' '}
                <AnimatedGradientText from="#9945FF" via="#FF6B9D" to="#00E5FF">
                  Community
                </AnimatedGradientText>
              </h2>
            </AnimatedItem>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {creators.map((c, i) => (
                <AnimatedCard key={c.name} index={i}>
                  <div className="p-5 rounded-2xl border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/[0.08] transition-all duration-300 flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shrink-0"
                      style={{ backgroundColor: `${c.color}15`, color: c.color }}
                    >
                      {c.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-white truncate">{c.name}</h4>
                      <p className="text-xs text-gray-500">{c.handle} · {c.role}</p>
                      <p className="text-xs font-mono" style={{ color: c.color }}>{c.followers} followers</p>
                    </div>
                  </div>
                </AnimatedCard>
              ))}
            </div>
          </AnimatedContainer>

          {/* Events calendar */}
          <AnimatedContainer>
            <AnimatedItem className="text-center mb-12">
              <Badge variant="success" size="lg" className="mb-4">
                <Calendar className="w-3.5 h-3.5 mr-1 inline-block" /> Events
              </Badge>
              <h2 className="text-3xl md:text-5xl font-black font-heading tracking-tight mb-4">
                Upcoming{' '}
                <AnimatedGradientText from="#00FFA3" via="#00E5FF" to="#9945FF">
                  Events
                </AnimatedGradientText>
              </h2>
            </AnimatedItem>
            <div className="max-w-3xl mx-auto space-y-4">
              {events.map((event, i) => (
                <AnimatedItem key={event.title}>
                  <motion.div
                    className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-2xl border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/[0.08] transition-all duration-300"
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-1 h-12 rounded-full shrink-0" style={{ backgroundColor: event.color }} />
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-white truncate">{event.title}</h4>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {event.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {event.location}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant={event.type === 'In-Person' ? 'primary' : 'info'}
                      size="sm"
                      className="shrink-0"
                    >
                      {event.type}
                    </Badge>
                  </motion.div>
                </AnimatedItem>
              ))}
            </div>
          </AnimatedContainer>
        </div>
      </div>
    </div>
  );
}
