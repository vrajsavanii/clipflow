'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Calendar, Clock, Sparkles, ChevronRight,
  Search, Tag, BookOpen, TrendingUp, BarChart3, Cpu,
  Lightbulb, ChevronDown,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AnimatedContainer, AnimatedItem, AnimatedCard,
  AnimatedGradientText,
} from '@/components/AnimatedSection';
import { staggerContainer, fadeInUp } from '@/lib/animations';

const CATEGORIES = ['All', 'Strategy', 'Product Update', 'Case Study', 'Data Insights', 'Engineering'];

const POSTS = [
  {
    id: 1,
    slug: 'podcast-to-tiktok-shorts-ai',
    title: 'How to Turn a 1-Hour Podcast into 10 Viral TikToks (AI Guide)',
    excerpt: 'Step-by-step guide to repurposing podcast episodes into viral TikTok clips using AI. Includes hook templates, caption tips, and the exact ClipFlow AI workflow.',
    category: 'Strategy',
    date: 'Feb 2026',
    readTime: '6 min read',
    color: '#00E5FF',
  },
  {
    id: 2,
    slug: 'opus-clip-alternative-free',
    title: 'Opus Clip vs ClipFlow AI: Which Free AI Clipper Wins in 2026?',
    excerpt: 'Unbiased comparison of Opus Clip vs ClipFlow AI. Side-by-side: clip quality, pricing, caption styles, SparkScore™ vs virality ratings, and clean free tier exports.',
    category: 'Comparison',
    date: 'Feb 2026',
    readTime: '7 min read',
    color: '#9945FF',
  },
  {
    id: 3,
    slug: 'animated-captions-short-form-video-retention',
    title: '5 Animated Caption Styles That 3x Retention on Short-Form Video',
    excerpt: 'Research-backed look at how animated word-by-word captions affect watch time on TikTok and Reels. Includes 5 styles to test and when to use each one.',
    category: 'Design',
    date: 'Jan 2026',
    readTime: '5 min read',
    color: '#00FFA3',
  },
  {
    id: 4,
    slug: 'what-is-sparkscore-viral-prediction-ai',
    title: 'What is SparkScore™? How AI Predicts Video Virality Before You Post',
    excerpt: 'Deep dive into SparkScore™ — ClipFlow AI\'s proprietary virality algorithm. Learn how it scores clips from 0-100 and what factors predict viral performance.',
    category: 'Data Insights',
    date: 'Jan 2026',
    readTime: '6 min read',
    color: '#FF6B9D',
  },
  {
    id: 5,
    slug: '916-vertical-video-auto-crop-ai',
    title: '9:16 Video Framing Guide: Why Auto-Crop AI Matters for Vertical Shorts',
    excerpt: 'Why mobile-first framing is the #1 factor in short-form retention. How AI 9:16 auto-crop works, and why it beats manual editing for TikTok and Reels.',
    category: 'Engineering',
    date: 'Jan 2026',
    readTime: '5 min read',
    color: '#FFD700',
  },
];

const categoryIcons: Record<string, React.ReactNode> = {
  'All': <BookOpen className="w-3.5 h-3.5" />,
  'Strategy': <Lightbulb className="w-3.5 h-3.5" />,
  'Product Update': <Sparkles className="w-3.5 h-3.5" />,
  'Case Study': <BarChart3 className="w-3.5 h-3.5" />,
  'Data Insights': <TrendingUp className="w-3.5 h-3.5" />,
  'Engineering': <Cpu className="w-3.5 h-3.5" />,
};

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(6);

  const filtered = POSTS.filter((post) => {
    const matchesCategory = activeCategory === 'All' || post.category === activeCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const visiblePosts = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <div className="min-h-screen bg-[#050505] text-white relative overflow-hidden">
      {/* Ambient background */}
      <motion.div
        className="absolute top-[-8%] left-1/4 w-[40vw] h-[40vw] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(153,69,255,0.06) 0%, transparent 70%)' }}
        animate={{ x: [0, 20, -15, 0], y: [0, -25, 15, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-[-10%] right-1/4 w-[35vw] h-[35vw] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,229,255,0.04) 0%, transparent 70%)' }}
        animate={{ x: [0, -20, 15, 0], y: [0, 25, -15, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="max-w-7xl mx-auto px-6 pt-32 pb-24 relative z-10">

        {/* ─── Hero ─── */}
        <AnimatedContainer className="text-center max-w-4xl mx-auto mb-16">
          <AnimatedItem>
            <motion.div whileHover={{ scale: 1.05 }} className="inline-block mb-6">
              <Badge variant="info" size="lg" className="cursor-default">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                The ClipFlow Journal
              </Badge>
            </motion.div>
          </AnimatedItem>
          <AnimatedItem>
            <h1 className="text-4xl md:text-7xl lg:text-8xl font-black font-heading tracking-tight leading-[1.05] mb-6">
              The{' '}
              <AnimatedGradientText from="#00E5FF" via="#9945FF" to="#FF6B9D">
                Viral Playbook
              </AnimatedGradientText>
            </h1>
          </AnimatedItem>
          <AnimatedItem>
            <p className="text-lg md:text-xl text-gray-400 leading-relaxed max-w-3xl mx-auto">
              Unfair advantages, algorithm insights, and product updates for modern creators
              engineering virality at scale.
            </p>
          </AnimatedItem>
        </AnimatedContainer>

        {/* ─── Search & Filter ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 space-y-5"
        >
          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setVisibleCount(6); }}
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm
                         focus:outline-none focus:border-[#00E5FF]/50 focus:bg-white/[0.05] transition-all
                         text-white placeholder:text-gray-600"
            />
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap gap-2 justify-center">
            {CATEGORIES.map((cat, i) => (
              <motion.button
                key={cat}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => { setActiveCategory(cat); setVisibleCount(6); }}
                className={`group inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold
                  transition-all duration-300 ${
                  activeCategory === cat
                    ? 'bg-white text-black shadow-lg'
                    : 'bg-white/[0.03] text-gray-400 hover:text-white hover:bg-white/10 border border-white/5'
                }`}
              >
                <span className={activeCategory === cat ? 'text-black' : 'text-gray-500 group-hover:text-current'}>
                  {categoryIcons[cat]}
                </span>
                {cat}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* ─── Blog Grid ─── */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {visiblePosts.map((post, index) => (
              <motion.article
                key={post.id}
                layout
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: index * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -8, transition: { duration: 0.25 } }}
                className="glass-card rounded-2xl p-6 group cursor-pointer flex flex-col relative overflow-hidden"
              >
                {/* Color accent line */}
                <motion.div
                  className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(90deg, ${post.color}, transparent)` }}
                />

                {/* Hover glow */}
                <div
                  className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"
                  style={{ background: `radial-gradient(circle, ${post.color}, transparent)` }}
                />

                <div className="relative z-10 flex flex-col h-full">
                  {/* Top row: badge + meta */}
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border"
                      style={{
                        color: post.color,
                        borderColor: `${post.color}30`,
                        backgroundColor: `${post.color}10`,
                      }}
                    >
                      <Tag className="w-2.5 h-2.5" />
                      {post.category}
                    </span>
                    <div className="flex items-center gap-2.5 text-[11px] text-gray-500 font-mono">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {post.date}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className="text-lg font-bold font-heading text-white mb-3 leading-snug group-hover:transition-all">
                    <Link href={`/blog/${post.slug}`} className="hover:text-[#00E5FF] transition-colors">
                      {post.title}
                    </Link>
                  </h2>

                  {/* Excerpt */}
                  <p className="text-sm text-gray-400 leading-relaxed mb-6 flex-1 line-clamp-3">
                    {post.excerpt}
                  </p>

                  {/* Read article link */}
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#00E5FF] group-hover:translate-x-1 transition-transform duration-200 mt-auto pt-4 border-t border-white/5">
                    <Link href={`/blog/${post.slug}`} className="flex items-center gap-1.5 w-full">
                      Read Article
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No articles found matching your search.</p>
            <Button
              variant="ghost"
              className="mt-4"
              onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
            >
              Clear filters
            </Button>
          </motion.div>
        )}

        {/* ─── Load More ─── */}
        {hasMore && (
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setVisibleCount((prev) => prev + 3)}
                className="group"
              >
                Load More Articles
                <ChevronDown className="w-4 h-4 ml-2 group-hover:translate-y-0.5 transition-transform" />
              </Button>
            </motion.div>
          </motion.div>
        )}

        {/* Total count */}
        <motion.p
          className="text-center text-xs text-gray-600 mt-6 font-mono"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Showing {visiblePosts.length} of {filtered.length} articles
        </motion.p>

      </div>
    </div>
  );
}
