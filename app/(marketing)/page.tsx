'use client';

import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import {
  Sparkles, ArrowRight, PlayCircle, Star, Play, Clock, Zap, Check,
  X, Link2, Brain, Share2, Target, Type, Film, TrendingUp, Quote,
  ChevronDown, Plus, Minus, Users, Eye, BarChart3, Video, Hash,
  MessageSquare, Activity, ExternalLink, AlertTriangle, CheckCircle,
  Upload, Wand2, Layers, Navigation,
} from 'lucide-react';
import { AnimatedSection, AnimatedContainer, AnimatedItem, AnimatedCard, AnimatedGradientText, AnimatedNumber } from '@/components/AnimatedSection';
import { GradientBorder } from '@/components/AmbientBackground';
import { staggerContainer, fadeInUp, fadeInScale, cardHover, scaleIn, listContainer, listItem, staggerContainerSlow } from '@/lib/animations';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
const DemoResultsSection = dynamic(() => import('@/components/DemoResultsSection'), { ssr: false });

/* ─── Particle Grid ─── */
const ParticleGrid = dynamic(() => Promise.resolve(function ParticleGridComponent() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const pseudoRandom = (i: number) => {
    const x = Math.sin(i * 9999) * 10000;
    return x - Math.floor(x);
  };
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:48px_48px]" />
      {mounted && [...Array(25)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{
            top: `${(pseudoRandom(i) * 100).toFixed(2)}%`,
            left: `${(pseudoRandom(i + 25) * 100).toFixed(2)}%`,
            backgroundColor: ['#9945FF', '#00E5FF', '#00FFA3', '#FF6B9D'][i % 4],
            boxShadow: `0 0 4px ${['#9945FF', '#00E5FF', '#00FFA3', '#FF6B9D'][i % 4]}`,
          }}
          animate={{
            y: [0, -40, 0],
            opacity: [0, 0.9, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 4 + pseudoRandom(i + 50) * 6,
            repeat: Infinity,
            delay: pseudoRandom(i + 75) * 8,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}), { ssr: false });

/* ─── Floating Element ─── */
function FloatingElement({ children, x, y, delay = 0, duration = 6 }: { children: React.ReactNode; x: string; y: string; delay?: number; duration?: number }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ top: y, left: x }}
      animate={{ y: [0, -20, 0], rotate: [0, 5, -5, 0] }}
      transition={{ duration, repeat: Infinity, delay, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
}

/* ─── Animated Counter ─── */
function AnimatedCounter({ value, suffix = '', label, prefix = '' }: { value: number; suffix?: string; label: string; prefix?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center"
    >
      <motion.div
        className="text-4xl md:text-5xl font-black font-heading bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400"
        initial={{ scale: 0.5, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
      >
        {prefix}
        <motion.span
          initial={{ count: 0 } as any}
          whileInView={{ count: value } as any}
          viewport={{ once: true }}
          transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {value.toLocaleString('en-US')}
        </motion.span>
        {suffix}
      </motion.div>
      <p className="text-sm text-gray-400 mt-1">{label}</p>
    </motion.div>
  );
}

/* ─── Testimonial Card ─── */
function TestimonialCard({ quote, author, role, avatar, delay = 0 }: { quote: string; author: string; role: string; avatar: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -8, transition: { duration: 0.25 } }}
      className="glass-panel p-8 rounded-2xl border border-white/5 hover:border-[#9945FF]/20 transition-all duration-300 relative group"
    >
      <Quote className="w-8 h-8 text-[#9945FF]/30 absolute top-6 right-6" />
      <p className="text-gray-300 leading-relaxed mb-6 relative z-10">&ldquo;{quote}&rdquo;</p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#9945FF] to-[#00E5FF] p-[2px]">
          <div className="w-full h-full rounded-full bg-[#0A0B0E] overflow-hidden relative">
            <Image src={avatar} alt={author} fill className="object-cover" />
          </div>
        </div>
        <div>
          <p className="text-sm font-bold text-white">{author}</p>
          <p className="text-xs text-gray-500">{role}</p>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Feature Card ─── */
function FeatureCard({ icon, title, description, index = 0, color = '#00E5FF' }: { icon: React.ReactNode; title: string; description: string; index?: number; color?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } }}
      className="glass-panel p-8 rounded-2xl border border-white/5 hover:border-[#00E5FF]/20 transition-all duration-300 group relative overflow-hidden feature-card-accent"
    >
      <div
        className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[80px] opacity-0 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${color}, transparent)` }}
      />
      <motion.div
        className="w-12 h-12 bg-[#111317] rounded-xl flex items-center justify-center border border-white/10 mb-6 shadow-inner group-hover:scale-110 transition-transform duration-300"
        whileHover={{ rotate: [0, -10, 10, -5, 0] }}
        transition={{ duration: 0.5 }}
      >
        {icon}
      </motion.div>
      <h3 className="text-xl font-bold font-heading mb-3 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 transition-all duration-300">
        {title}
      </h3>
      <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
}

/* ─── Accordion Item ─── */
function AccordionItem({ question, answer, index = 0 }: { question: string; answer: string; index?: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="border border-white/5 rounded-xl overflow-hidden glass-panel"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-white/[0.02]"
      >
        <span className="font-bold text-white text-sm md:text-base pr-4">{question}</span>
        <motion.div
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0 w-6 h-6 rounded-full bg-white/5 flex items-center justify-center"
        >
          <Plus className="w-3.5 h-3.5 text-gray-400" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 text-sm text-gray-400 leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const [statsData, setStatsData] = useState({ users: 50000, clips: 5000000, hoursProcessed: 47 });
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setStatsData(data))
      .catch(console.error);
  }, []);

  const counters = [
    { value: statsData.hoursProcessed, suffix: '+', label: 'Hours Processed', prefix: '' },
    { value: 98, suffix: '%', label: 'Hook Accuracy', prefix: '' },
    { value: statsData.clips, suffix: '+', label: 'Shorts Created', prefix: '' },
  ];

  const steps = [
    { icon: <Link2 className="w-7 h-7" />, title: 'Paste Any Link', description: 'Drop a YouTube, TikTok, or any video URL. Or upload directly — ClipFlow supports 50+ formats up to 4K.', color: '#9945FF' },
    { icon: <Brain className="w-7 h-7" />, title: 'AI Analyzes Deeply', description: 'Our engine runs transcription, visual scene detection, facial emotion mapping, and hook scoring across every frame.', color: '#00E5FF' },
    { icon: <Zap className="w-7 h-7" />, title: 'Export Viral Clips', description: 'Get perfectly cropped 9:16 shorts with dynamic captions, b-roll, and viral score predictions — ready to post.', color: '#00FFA3' },
  ];

  const features = [
    { icon: <Sparkles className="w-6 h-6 text-[#00E5FF]" />, title: 'AI Hook Detection', description: 'Our retention model pinpoints the exact moments that trigger maximum watch time. No more guessing what works.', color: '#00E5FF' },
    { icon: <Target className="w-6 h-6 text-[#00FFA3]" />, title: 'Smart Auto-Framing', description: 'Zero-jitter active speaker tracking that hard-cuts the frame like a pro editor. No motion sickness, just pure focus.', color: '#00FFA3' },
    { icon: <Type className="w-6 h-6 text-[#9945FF]" />, title: 'Dynamic Captions', description: 'Auto-generated, stylized captions that sync perfectly with speech. Multiple themes, colors, and animation styles.', color: '#9945FF' },
    { icon: <Film className="w-6 h-6 text-[#FF6B9D]" />, title: 'B-Roll Injection', description: 'AI finds contextual stock footage and inserts it at precisely the right moments to keep visual engagement high.', color: '#FF6B9D' },
    { icon: <Share2 className="w-6 h-6 text-[#00E5FF]" />, title: 'Multi-Platform Export', description: 'Export in 9:16, 1:1, or 16:9. Optimized presets for TikTok, Instagram Reels, YouTube Shorts, and more.', color: '#00E5FF' },
    { icon: <TrendingUp className="w-6 h-6 text-[#00FFA3]" />, title: 'Viral Score Prediction', description: 'Each clip gets a proprietary virality score based on retention data, pacing analysis, and trend matching.', color: '#00FFA3' },
  ];

  const testimonials = [
    { quote: 'I went from spending 12 hours editing shorts to literally 5 minutes. The AI knows exactly where to cut. My retention went up 80% overnight.', author: 'Sarah Chen', role: 'Lifestyle Creator — 2.3M Followers', avatar: 'https://i.pravatar.cc/150?img=32' },
    { quote: 'We manage 12 client channels and ClipFlow single-handedly replaced 3 editors on our team. The ROI is absolutely insane.', author: 'Marcus Williams', role: 'Founder — ViralVault Agency', avatar: 'https://i.pravatar.cc/150?img=68' },
    { quote: 'The hook detection is like having a million-dollar editor in your pocket. I\'ve never seen my Shorts numbers go this crazy before.', author: 'Priya Patel', role: 'Tech Reviewer — 890K Subscribers', avatar: 'https://i.pravatar.cc/150?img=44' },
  ];

  const faqs = [
    { question: 'What is ClipFlow and how does it work?', answer: 'ClipFlow is an AI-powered video clipping platform that automatically analyzes long-form videos and extracts the most engaging short-form clips. Simply paste a link or upload a video, our AI handles transcription, scene detection, hook analysis, and exports perfectly formatted shorts ready for TikTok, Reels, and YouTube Shorts.' },
    { question: 'What platforms can I export my clips to?', answer: 'ClipFlow supports direct export to TikTok, Instagram Reels, YouTube Shorts, and Twitter/X. You can also download in MP4 format optimized for each platform\'s preferred aspect ratio and encoding settings.' },
    { question: 'How long does processing take?', answer: 'Processing time depends on video length. A 20-minute video typically processes in under 5 minutes on our standard tier, or as fast as 42 seconds on GPU-accelerated servers. You\'ll get a notification the moment your clips are ready.' },
    { question: 'Is there a free plan?', answer: 'Yes! The Starter plan is free forever and includes 2 hours of video processing per month, standard AI extraction, and 720p exports with watermarking. Upgrade to Pro for unlimited processing and 4K exports.' },
    { question: 'Can I customize the captions and branding?', answer: 'Pro and Agency plans include full customization — custom fonts, brand colors, logo watermarks, caption animation styles, and the ability to save brand kits for consistent output across all your clips.' },
    { question: 'What kind of videos work best with ClipFlow?', answer: 'Any content with spoken dialogue works great — podcasts, educational content, vlogs, reviews, interviews, and commentary. The AI is optimized for videos with clear speech and varied emotional delivery, which produces the best hook detection results.' },
  ];

  const stats = [
    { icon: <Users className="w-5 h-5" />, value: statsData.users, suffix: '+', label: 'Active Creators' },
    { icon: <Video className="w-5 h-5" />, value: statsData.clips, suffix: '+', label: 'Clips Generated' },
    { icon: <Hash className="w-5 h-5" />, value: statsData.hoursProcessed, suffix: '', label: 'Hours Processed' },
    { icon: <BarChart3 className="w-5 h-5" />, value: 99.9, suffix: '%', label: 'Uptime SLA' },
  ];

  return (
    <div className="relative overflow-hidden bg-[#050505] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Clipflow AI",
            "operatingSystem": "All",
            "applicationCategory": "MultimediaApplication",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "description": "AI-powered short-form video repurposing platform that converts long YouTube podcasts, webinars, and interviews into high-retention 9:16 vertical shorts for TikTok, Instagram Reels, and YouTube Shorts."
          })
        }}
      />
      <ParticleGrid />

      {/* ════════════════════════════════════════════ */}
      {/* 1. HERO SECTION */}
      {/* ════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative z-10 pt-24 sm:pt-32 lg:pt-40 pb-20 px-6 text-center min-h-[90vh] md:min-h-screen flex items-center justify-center">
        {/* Floating background elements */}
        <FloatingElement x="10%" y="20%" delay={0} duration={7}>
          <div className="w-16 h-16 rounded-2xl bg-[#9945FF]/10 border border-[#9945FF]/20 backdrop-blur-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-[#9945FF]" />
          </div>
        </FloatingElement>
        <FloatingElement x="85%" y="15%" delay={1.5} duration={8}>
          <div className="w-12 h-12 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/20 backdrop-blur-xl flex items-center justify-center">
            <Play className="w-5 h-5 text-[#00E5FF]" />
          </div>
        </FloatingElement>
        <FloatingElement x="8%" y="60%" delay={3} duration={6}>
          <div className="w-20 h-20 rounded-3xl bg-[#00FFA3]/10 border border-[#00FFA3]/20 backdrop-blur-xl flex items-center justify-center">
            <Zap className="w-8 h-8 text-[#00FFA3]" />
          </div>
        </FloatingElement>
        <FloatingElement x="80%" y="65%" delay={2} duration={9}>
          <div className="w-14 h-14 rounded-full bg-[#FF6B9D]/10 border border-[#FF6B9D]/20 backdrop-blur-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-[#FF6B9D]" />
          </div>
        </FloatingElement>

        <motion.div className="max-w-6xl mx-auto space-y-10 relative z-10" style={{ y: heroY, opacity: heroOpacity }}>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs font-bold font-mono text-gray-300 backdrop-blur-md"
          >
            <motion.span
              className="flex h-2 w-2 relative"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FFA3] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00FFA3]" />
            </motion.span>
            Now in Public Beta
            <span className="text-[10px] text-[#00E5FF] font-bold ml-1">— {statsData.users.toLocaleString()}+ creators onboard</span>
          </motion.div>

          {/* Hero Title */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-[90px] font-black tracking-tighter leading-[0.9] font-heading"
          >
            {['Turn', 'Hours', 'of'].map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 40, rotateX: -20 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="inline-block mr-[0.15em]"
              >
                {word}
              </motion.span>
            ))}
            <br />
            <motion.span
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="inline-block"
            >
              <AnimatedGradientText from="#9945FF" via="#00E5FF" to="#00FFA3" className="bg-clip-text text-transparent">
                Viral Shorts
              </AnimatedGradientText>
            </motion.span>
            <br />
            <motion.span
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="inline-block"
            >
              in{' '}
              <AnimatedGradientText from="#00E5FF" via="#00FFA3" to="#9945FF" className="bg-clip-text text-transparent">
                Minutes
              </AnimatedGradientText>
              <motion.span
                className="inline-block w-1 h-[0.8em] bg-[#00E5FF] ml-1 align-middle"
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
              />
            </motion.span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto font-sans leading-relaxed"
          >
            ClipFlow&apos;s AI retention engine automatically hunts, crops, and jump-cuts your long-form videos into optimized viral shorts — no editing skills required.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/dashboard"
                className="group relative w-full sm:w-auto px-10 py-5 bg-white text-black font-bold text-lg rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(255,255,255,0.3)] overflow-hidden"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6 }}
                />
                <span className="relative z-10 flex items-center gap-2">
                  Start Clipping Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="#demo"
                className="w-full sm:w-auto px-10 py-5 bg-[#111317] border border-white/10 text-white font-bold text-lg rounded-xl hover:bg-white/5 transition-all flex items-center justify-center gap-2 group"
              >
                <PlayCircle className="w-5 h-5 text-[#00E5FF] group-hover:scale-110 transition-transform" />
                <span>Watch Demo</span>
              </Link>
            </motion.div>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="pt-10 flex flex-col items-center gap-4"
          >
            <div className="flex -space-x-3">
              {['https://i.pravatar.cc/150?img=68', 'https://i.pravatar.cc/150?img=32', 'https://i.pravatar.cc/150?img=12', 'https://i.pravatar.cc/150?img=44', 'https://i.pravatar.cc/150?img=25'].map((img, i) => (
                <motion.div key={i} className="w-12 h-12 rounded-full border-2 border-[#050505] overflow-hidden relative" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 + i * 0.05 }}>
                  <Image src={img} alt="Creator" fill className="object-cover" />
                </motion.div>
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400 font-mono">
              <motion.div className="flex gap-0.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1 + i * 0.1 }}>
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  </motion.div>
                ))}
              </motion.div>
              <span className="hidden sm:inline">—</span>
              Trusted by <span className="text-white font-bold">{statsData.users.toLocaleString()}+</span> creators. <span className="text-[#00FFA3] font-bold">{statsData.hoursProcessed.toLocaleString()}+</span> hours processed.
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════ */}
      {/* 2. SOCIAL PROOF / TRUST BAR */}
      {/* ════════════════════════════════════════════ */}
      <AnimatedSection className="py-20 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-xs font-mono text-gray-500 text-center mb-10 uppercase tracking-widest"
          >
            Trusted by {statsData.users.toLocaleString()}+ creators worldwide
          </motion.p>

          {/* Logo Wall */}
          <motion.div
            className="flex flex-wrap justify-center items-center gap-8 md:gap-16 mb-16 opacity-50 hover:opacity-80 transition-all duration-500"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {['YouTube', 'TikTok', 'Instagram', 'Twitter', 'LinkedIn', 'Snapchat'].map((logo, i) => (
              <motion.div key={i} variants={fadeInUp} className="text-xl md:text-2xl font-black tracking-tighter text-white/40 hover:text-white/80 transition-colors font-heading">
                {logo}
              </motion.div>
            ))}
          </motion.div>

          {/* Animated Counters */}
          <div className="grid grid-cols-3 gap-8 md:gap-16 max-w-3xl mx-auto">
            {counters.map((c, i) => (
              <AnimatedCounter key={i} value={c.value} suffix={c.suffix} label={c.label} prefix={c.prefix} />
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ════════════════════════════════════════════ */}
      {/* 3. PROBLEM / SOLUTION SECTION */}
      {/* ════════════════════════════════════════════ */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <AnimatedContainer className="text-center mb-16 space-y-4">
          <AnimatedItem>
            <Badge variant="primary" className="text-xs font-bold font-mono">Why Creators Switch</Badge>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="text-4xl md:text-6xl font-black font-heading tracking-tight leading-[1.1]">
              The Old Way vs.{' '}
              <AnimatedGradientText from="#00E5FF" via="#00FFA3" to="#9945FF">
                The ClipFlow Way
              </AnimatedGradientText>
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Stop spending hours manually editing. Let AI do the heavy lifting.
            </p>
          </AnimatedItem>
        </AnimatedContainer>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Old Way */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="glass-panel p-8 rounded-2xl border border-red-500/10 relative overflow-hidden group"
          >
            <div className="absolute -top-20 -left-20 w-40 h-40 rounded-full blur-[80px] bg-red-500/5 pointer-events-none" />
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <Badge variant="danger" size="sm">Manual Editing</Badge>
                  <h3 className="text-xl font-bold font-heading text-white mt-1">The Old Way</h3>
                </div>
              </div>
              <ul className="space-y-4">
                {['Watch hours of footage manually', 'Mark timestamps by hand', 'Trim and cut frame-by-frame', 'Add captions manually', 'Export and reformat for each platform'].map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.05 }}
                    className="flex items-center gap-3 text-gray-400"
                  >
                    <div className="w-5 h-5 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                      <X className="w-3 h-3 text-red-400" />
                    </div>
                    {item}
                  </motion.li>
                ))}
              </ul>
              <div className="pt-4 border-t border-red-500/10">
                <p className="text-2xl font-black font-heading text-red-400">4-8 hours</p>
                <p className="text-xs text-gray-500">per 20-minute video</p>
              </div>
            </div>
          </motion.div>

          {/* ClipFlow Way */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="glass-panel p-8 rounded-2xl border border-[#00FFA3]/10 relative overflow-hidden group"
          >
            <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[80px] bg-[#00FFA3]/10 pointer-events-none" />
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#00FFA3]/10 border border-[#00FFA3]/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-[#00FFA3]" />
                </div>
                <div>
                  <Badge variant="success" size="sm">AI Powered</Badge>
                  <h3 className="text-xl font-bold font-heading text-white mt-1">The ClipFlow Way</h3>
                </div>
              </div>
              <ul className="space-y-4">
                {['Paste any video link or upload', 'AI transcribes and analyzes in seconds', 'Hook detection scores every segment', 'Auto-captions + b-roll injection', 'Export all platforms in one click'].map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.05 }}
                    className="flex items-center gap-3 text-gray-300"
                  >
                    <div className="w-5 h-5 rounded-full bg-[#00FFA3]/10 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-[#00FFA3]" />
                    </div>
                    {item}
                  </motion.li>
                ))}
              </ul>
              <div className="pt-4 border-t border-[#00FFA3]/10">
                <p className="text-2xl font-black font-heading text-[#00FFA3]">5 minutes</p>
                <p className="text-xs text-gray-500">per 20-minute video</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════ */}
      {/* 4. HOW IT WORKS */}
      {/* ════════════════════════════════════════════ */}
      <section className="py-32 px-6 relative border-y border-white/5 bg-[#0A0B0E] overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <AnimatedContainer className="text-center mb-20 space-y-4">
            <AnimatedItem>
              <Badge variant="info" className="text-xs font-bold font-mono">Simple Workflow</Badge>
            </AnimatedItem>
            <AnimatedItem>
              <h2 className="text-4xl md:text-6xl font-black font-heading tracking-tight leading-[1.1]">
                Three Clicks to{' '}
                <AnimatedGradientText from="#9945FF" via="#00E5FF" to="#00FFA3">
                  Viral
                </AnimatedGradientText>
              </h2>
            </AnimatedItem>
            <AnimatedItem>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                No learning curve. No complex settings. Just paste, analyze, and post.
              </p>
            </AnimatedItem>
          </AnimatedContainer>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-16 left-[calc(16.66%+2rem)] right-[calc(16.66%+2rem)] h-[2px]">
              <motion.div
                className="h-full bg-gradient-to-r from-[#9945FF] via-[#00E5FF] to-[#00FFA3]"
                initial={{ scaleX: 0, transformOrigin: 'left' }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                style={{ transformOrigin: 'left' }}
              />
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
                  style={{
                    left: `${16.66 + i * 33.33}%`,
                    backgroundColor: [steps[0].color, steps[1].color, steps[2].color][i],
                    boxShadow: `0 0 12px ${[steps[0].color, steps[1].color, steps[2].color][i]}60`,
                  }}
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8 + i * 0.3, type: 'spring', stiffness: 200 }}
                />
              ))}
            </div>

            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.6, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -8 }}
                className="glass-panel p-8 rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-300 text-center relative group"
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-white border-2 border-[#050505] z-10"
                  style={{ backgroundColor: step.color, boxShadow: `0 0 20px ${step.color}40` }}
                >
                  {i + 1}
                </div>
                <motion.div
                  className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center border"
                  style={{ backgroundColor: step.color + '15', borderColor: step.color + '30' }}
                  whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 0.4 }}
                >
                  <div style={{ color: step.color }}>{step.icon}</div>
                </motion.div>
                <h3 className="text-xl font-bold font-heading text-white mb-3">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════ */}
      {/* 5. FEATURES GRID */}
      {/* ════════════════════════════════════════════ */}
      <section className="py-32 px-6 max-w-7xl mx-auto" id="features">
        <AnimatedContainer className="text-center mb-16 space-y-4 max-w-3xl mx-auto">
          <AnimatedItem>
            <Badge variant="premium" className="text-xs font-bold font-mono">Next-Gen AI Pipeline</Badge>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="text-4xl md:text-6xl font-black font-heading tracking-tight leading-[1.1]">
              Everything You Need to{' '}
              <AnimatedGradientText from="#00E5FF" via="#00FFA3" to="#9945FF">
                Go Viral
              </AnimatedGradientText>
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Stop manually doing the work of an entire post-production team. Our AI handles everything.
            </p>
          </AnimatedItem>
        </AnimatedContainer>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <FeatureCard key={i} icon={f.icon} title={f.title} description={f.description} index={i} color={f.color} />
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════ */}
      {/* 6. DEMO / PREVIEW SECTION */}
      {/* ════════════════════════════════════════════ */}
      <DemoResultsSection />

      {/* ════════════════════════════════════════════ */}
      {/* 7. TESTIMONIALS */}
      {/* ════════════════════════════════════════════ */}
      <section className="py-32 px-6 max-w-7xl mx-auto" id="testimonials">
        <AnimatedContainer className="text-center mb-16 space-y-4">
          <AnimatedItem>
            <Badge variant="info" className="text-xs font-bold font-mono">Creator Love</Badge>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="text-4xl md:text-6xl font-black font-heading tracking-tight">
              Trusted by{' '}
              <AnimatedGradientText from="#00E5FF" via="#9945FF" to="#FF6B9D">
                Top Creators
              </AnimatedGradientText>
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              From solo YouTubers to multi-platform agencies, ClipFlow is the secret weapon behind the internet&apos;s most viral content.
            </p>
          </AnimatedItem>
        </AnimatedContainer>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <TestimonialCard quote={testimonials[0].quote} author={testimonials[0].author} role={testimonials[0].role} avatar={testimonials[0].avatar} delay={0} />
          <TestimonialCard quote={testimonials[1].quote} author={testimonials[1].author} role={testimonials[1].role} avatar={testimonials[1].avatar} delay={0.1} />
          <TestimonialCard quote={testimonials[2].quote} author={testimonials[2].author} role={testimonials[2].role} avatar={testimonials[2].avatar} delay={0.2} />
        </div>
      </section>

      {/* ════════════════════════════════════════════ */}
      {/* 8. PRICING PREVIEW */}
      {/* ════════════════════════════════════════════ */}
      <section className="py-32 px-6 max-w-7xl mx-auto" id="pricing">
        <AnimatedContainer className="text-center mb-16 space-y-4">
          <AnimatedItem>
            <Badge className="bg-gradient-to-r from-[#9945FF]/20 to-[#00E5FF]/20 border border-[#9945FF]/30 text-transparent bg-clip-text bg-gradient-to-r from-[#9945FF] to-[#00E5FF] text-xs font-bold font-mono">
              Simple Pricing
            </Badge>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="text-4xl md:text-6xl font-black font-heading tracking-tight leading-[1.1]">
              Scale{' '}
              <AnimatedGradientText from="#00E5FF" via="#00FFA3" to="#9945FF">
                Without Limits
              </AnimatedGradientText>
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
              Start for free. Upgrade when you&apos;re going viral. No hidden fees, no surprises.
            </p>
          </AnimatedItem>
          
          <AnimatedItem>
            <div className="flex items-center justify-center gap-4 mt-8">
              <span className={`text-sm font-bold ${billingCycle === 'monthly' ? 'text-white' : 'text-gray-500'}`}>Monthly</span>
              <button 
                onClick={() => setBillingCycle(b => b === 'monthly' ? 'yearly' : 'monthly')}
                className="w-14 h-7 rounded-full bg-white/10 relative border border-white/20 transition-colors"
              >
                <motion.div 
                  className="w-5 h-5 bg-white rounded-full absolute top-[3px]"
                  animate={{ left: billingCycle === 'monthly' ? '4px' : '30px' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
              <span className={`text-sm font-bold flex items-center gap-2 ${billingCycle === 'yearly' ? 'text-white' : 'text-gray-500'}`}>
                Yearly <Badge variant="success" size="sm" className="bg-[#00FFA3]/20 text-[#00FFA3] border-[#00FFA3]/30">Save 20%</Badge>
              </span>
            </div>
          </AnimatedItem>
        </AnimatedContainer>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-8">
          {/* Starter */}
          <AnimatedCard className="glass-panel p-8 rounded-3xl border border-white/5 flex flex-col h-full hover:border-white/10 transition-colors" index={0}>
            <div className="mb-8">
              <h3 className="text-2xl font-bold font-heading text-white">Starter</h3>
              <div className="mt-4 flex items-baseline text-5xl font-black font-heading">
                $0<span className="text-lg text-gray-500 ml-1 font-sans font-normal">/mo</span>
              </div>
              <p className="mt-4 text-sm text-gray-400">Perfect for trying out the AI engine.</p>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {['2 hours of video upload', 'Standard AI Extraction', '720p Exports'].map((feat, i) => (
                <li key={i} className="flex gap-3 text-sm text-gray-300"><Check className="w-4 h-4 text-[#00E5FF] shrink-0" /> {feat}</li>
              ))}
              <li className="flex gap-3 text-sm text-gray-500"><Check className="w-4 h-4 text-gray-700 shrink-0" /> Watermarked clips</li>
            </ul>
            <Link href="/login" className="w-full block text-center py-4 rounded-xl font-bold text-sm bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-white">Get Started Free</Link>
          </AnimatedCard>

          {/* Pro */}
          <div className="glass-panel p-8 rounded-3xl border border-[#9945FF]/50 relative flex flex-col h-full shadow-[0_0_50px_rgba(153,69,255,0.15)] scale-[1.02] md:scale-105 z-10 bg-[#0A0B0E] pricing-popular">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-[#9945FF] to-[#00E5FF] text-white text-[10px] font-bold rounded-full uppercase tracking-widest flex items-center gap-1 shadow-lg">
              <Sparkles className="w-3 h-3" /> Most Popular
            </div>
            <div className="mb-8 mt-2">
              <h3 className="text-2xl font-bold font-heading text-white">Creator Pro</h3>
              <div className="mt-4 flex items-baseline text-5xl font-black font-heading">
                ${billingCycle === 'yearly' ? '24' : '29'}<span className="text-lg text-gray-500 ml-1 font-sans font-normal">/mo</span>
              </div>
              <p className="mt-4 text-sm text-gray-400">For daily content creators scaling up.</p>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {['30 hours of video upload', 'Advanced Hook AI', '4K Ultra HD Exports', 'No Watermarks', 'Auto-Scheduler Access'].map((feat, i) => (
                <li key={i} className="flex gap-3 text-sm text-white"><Check className="w-4 h-4 text-[#9945FF] shrink-0" /> {feat}</li>
              ))}
            </ul>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Link href="/login" className="w-full block text-center py-4 rounded-xl font-bold text-sm btn-premium-rainbow text-white shadow-lg">Start 7-Day Free Trial</Link>
            </motion.div>
            <Link href="/pricing" className="w-full block text-center mt-3 text-xs text-gray-500 hover:text-gray-300 transition-colors font-mono">Compare plans →</Link>
          </div>

          {/* Enterprise */}
          <AnimatedCard className="glass-panel p-8 rounded-3xl border border-white/5 flex flex-col h-full hover:border-white/10 transition-colors" index={2}>
            <div className="mb-8">
              <h3 className="text-2xl font-bold font-heading text-white">Enterprise</h3>
              <div className="mt-4 flex items-baseline text-5xl font-black font-heading">
                Custom<span className="text-lg text-gray-500 ml-1 font-sans font-normal"></span>
              </div>
              <p className="mt-4 text-sm text-gray-400">For agencies and teams at scale.</p>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {['Unlimited video upload', 'Custom Brand Kits', 'Team Collaboration', 'Priority API Access', 'Dedicated Support'].map((feat, i) => (
                <li key={i} className="flex gap-3 text-sm text-gray-300"><Check className="w-4 h-4 text-[#00E5FF] shrink-0" /> {feat}</li>
              ))}
            </ul>
            <Link href="/contact" className="w-full block text-center py-4 rounded-xl font-bold text-sm bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-white">Contact Sales</Link>
          </AnimatedCard>
        </div>
      </section>

      {/* ════════════════════════════════════════════ */}
      {/* 9. FAQ SECTION */}
      {/* ════════════════════════════════════════════ */}
      <section className="py-32 px-6 max-w-3xl mx-auto" id="faq">
        <AnimatedContainer className="text-center mb-16 space-y-4">
          <AnimatedItem>
            <Badge variant="secondary" className="text-xs font-bold font-mono">Got Questions?</Badge>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="text-4xl md:text-5xl font-black font-heading tracking-tight">
              Frequently Asked{' '}
              <AnimatedGradientText from="#9945FF" via="#00E5FF" to="#FF6B9D">
                Questions
              </AnimatedGradientText>
            </h2>
          </AnimatedItem>
        </AnimatedContainer>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} question={faq.question} answer={faq.answer} index={i} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-gray-400 text-sm mb-4">Still have questions? We&apos;re here to help.</p>
          <Link href="/contact">
            <Button variant="secondary" size="lg" className="gap-2">
              <MessageSquare className="w-4 h-4" /> Contact Support
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════ */}
      {/* 10. FINAL CTA SECTION */}
      {/* ════════════════════════════════════════════ */}
      <section className="relative z-10 max-w-5xl mx-auto pb-32 px-6 text-center">
        <motion.div
          className="bg-gradient-to-br from-[#111317] to-[#0A0B0E] border border-white/10 rounded-[2rem] p-12 md:p-24 space-y-8 relative overflow-hidden shadow-2xl group"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Animated gradient orbs */}
          <motion.div
            className="absolute -top-40 -left-40 w-[400px] h-[400px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(153,69,255,0.12), transparent)' }}
            animate={{ scale: [1, 1.3, 1], x: [0, 30, 0], y: [0, -30, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -bottom-40 -right-40 w-[400px] h-[400px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(0,229,255,0.1), transparent)' }}
            animate={{ scale: [1.2, 1, 1.2], x: [0, -20, 0], y: [0, 20, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[600px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(0,255,163,0.06), transparent)' }}
            animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          />

          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay pointer-events-none" />

          <h2 className="text-5xl md:text-7xl font-black tracking-tight font-heading relative z-10 leading-[1.1]">
            Ready to{' '}
            <AnimatedGradientText from="#9945FF" via="#00E5FF" to="#FF6B9D">
              Go Viral
            </AnimatedGradientText>
            ?
          </h2>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto font-sans relative z-10">
            Join 50,000+ creators who have automated their short-form content pipeline with AI.
            It takes 30 seconds to start.
          </p>

          <motion.div
            className="flex flex-col sm:flex-row justify-center relative z-10 pt-8 gap-4"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeInUp} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/login"
                className="group relative px-12 py-5 bg-white text-black font-bold text-lg rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.3)] transition-all overflow-hidden inline-flex items-center gap-2"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6 }}
                />
                <span className="relative z-10">Start Clipping Now</span>
                <motion.div className="relative z-10" animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
              </Link>
            </motion.div>
            <motion.div variants={fadeInUp} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="#demo"
                className="px-12 py-5 bg-[#111317] border border-white/10 text-white font-bold text-lg rounded-xl hover:bg-white/5 transition-all inline-flex items-center justify-center gap-2"
              >
                <PlayCircle className="w-5 h-5 text-[#00E5FF]" />
                See It In Action
              </Link>
            </motion.div>
          </motion.div>
          <motion.p
            className="text-sm text-gray-500 font-mono relative z-10 pt-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            No credit card required for free tier. Unlimited access to all core features.
          </motion.p>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════ */}
      {/* 11. STATISTICS / FOOTER BAR */}
      {/* ════════════════════════════════════════════ */}
      <section className="py-20 px-6 border-t border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="text-center space-y-2"
              >
                <motion.div
                  className="w-10 h-10 rounded-xl mx-auto flex items-center justify-center"
                  style={{ backgroundColor: ['#9945FF40', '#00E5FF40', '#00FFA340', '#FF6B9D40'][i] }}
                >
                  {stat.icon}
                </motion.div>
                <motion.div className="text-3xl md:text-4xl font-black font-heading bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
                  <motion.span
                    initial={{ count: 0 } as any}
                    whileInView={{ count: stat.value } as any}
                    viewport={{ once: true }}
                    transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {typeof stat.value === 'number' ? stat.value.toLocaleString('en-US') : stat.value}
                  </motion.span>
                  {stat.suffix}
                </motion.div>
                <p className="text-xs text-gray-500 font-mono">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
