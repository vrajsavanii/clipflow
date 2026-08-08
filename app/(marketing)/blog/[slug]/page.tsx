import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock, Calendar, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PostData {
  slug: string;
  title: string;
  metaTitle: string;
  metaDesc: string;
  category: string;
  date: string;
  readTime: string;
  targetKeyword: string;
  content: {
    intro: string;
    sections: Array<{
      heading: string;
      body: string;
      bullets?: string[];
    }>;
    conclusion: string;
  };
}

const BLOG_DATA: Record<string, PostData> = {
  'podcast-to-tiktok-shorts-ai': {
    slug: 'podcast-to-tiktok-shorts-ai',
    title: 'How to Turn a 1-Hour Podcast into 10 Viral TikToks (AI Guide)',
    metaTitle: 'How to Turn a 1-Hour Podcast into 10 Viral TikToks (AI Guide)',
    metaDesc: 'Step-by-step guide to repurposing podcast episodes into viral TikTok clips using AI. Includes hook templates, caption tips, and the exact ClipFlow AI workflow.',
    category: 'Strategy',
    date: 'February 2026',
    readTime: '6 min read',
    targetKeyword: 'podcast to tiktok shorts',
    content: {
      intro: 'Podcasters spend hours researching, recording, and editing episodes, yet 80% of potential listeners scroll right past static audiograms. Short-form video platforms like TikTok, Instagram Reels, and YouTube Shorts require high-energy, 9:16 vertical clips with dynamic captions and emotional hooks.',
      sections: [
        {
          heading: '1. Why Full-Length Podcasts Fail on Mobile Feeds',
          body: 'Mobile feeds are built for micro-retention. Viewers decide to stay or scroll within the first 1.5 seconds. Long introductions, sponsor reads, and warm-up banter immediately trigger a swipe-away.',
          bullets: [
            'First 3 Seconds: Must deliver a provocative claim or emotional peak',
            'Aspect Ratio: 16:9 landscape videos lose 68% of screen real estate on mobile',
            'Captions: 85% of mobile short-form video is watched on mute',
          ],
        },
        {
          heading: '2. The Automated 3-Step AI Repurposing Workflow',
          body: 'Instead of manually scrubbing timelines for 4 hours in Premiere Pro, ClipFlow AI automates the entire pipeline from YouTube URL to ready-to-post MP4 shorts.',
          bullets: [
            'Step 1: Paste YouTube URL or podcast audio file into ClipFlow',
            'Step 2: Groq Whisper STT transcribes speech with word-level timestamps',
            'Step 3: SparkScore™ AI detects emotional hooks and auto-crops to 9:16 vertical video',
          ],
        },
        {
          heading: '3. Optimizing Caption Typography for TikTok Retention',
          body: 'Word-by-word animated captions maintain high visual velocity. Using high-contrast strokes and active word highlights increases average watch duration by up to 34%.',
        },
      ],
      conclusion: 'Stop wasting hours manually trimming long-form recordings. Turn your next 1-hour podcast into 10 viral vertical shorts automatically with ClipFlow AI.',
    },
  },
  'opus-clip-alternative-free': {
    slug: 'opus-clip-alternative-free',
    title: 'Opus Clip vs ClipFlow AI: Which Free AI Clipper Wins in 2026?',
    metaTitle: 'Opus Clip vs ClipFlow AI: Which Free AI Clipper Wins in 2026?',
    metaDesc: 'Unbiased comparison of Opus Clip vs ClipFlow AI. Side-by-side: clip quality, pricing, caption styles, SparkScore™ vs virality ratings, and which tool actually wins on free tier.',
    category: 'Comparison',
    date: 'February 2026',
    readTime: '7 min read',
    targetKeyword: 'opus clip alternative free',
    content: {
      intro: 'As short-form content dominates social media, creators are searching for the best AI video clippers. While Opus Clip popularized automated clip generation, its paywalls, watermark restrictions on free tiers, and black-box scoring have led creators to seek better alternatives.',
      sections: [
        {
          heading: '1. Free Tier Policy: Watermarks vs Clean Exports',
          body: 'Most competitors restrict free users by placing heavy branded watermarks over exports. ClipFlow AI offers a completely watermark-free Starter plan so creators can build their authentic brand without compromise.',
        },
        {
          heading: '2. Virality Analytics: SparkScore™ Transparency',
          body: 'Opus Clip provides a generic score, whereas ClipFlow AI breaks down SparkScore™ (0–100) across hook strength, emotional intensity, pacing quality, and actionable editing tips.',
        },
        {
          heading: '3. Processing Speed & Cloud Architecture',
          body: 'Powered by Groq Whisper Large v3 and 24/7 dedicated worker nodes, ClipFlow AI processes 1 hour of video in under 2 minutes.',
        },
      ],
      conclusion: 'For creators seeking clean exports, transparent virality analytics, and 24/7 speed, ClipFlow AI stands out as the premiere free Opus Clip alternative.',
    },
  },
  'animated-captions-short-form-video-retention': {
    slug: 'animated-captions-short-form-video-retention',
    title: '5 Animated Caption Styles That 3x Retention on Short-Form Video',
    metaTitle: '5 Animated Caption Styles That 3x Retention on Short-Form Video',
    metaDesc: 'Research-backed look at how animated word-by-word captions affect watch time on TikTok and Reels. Includes 5 styles to test and when to use each one.',
    category: 'Design',
    date: 'January 2026',
    readTime: '5 min read',
    targetKeyword: 'animated captions TikTok retention',
    content: {
      intro: 'Over 85% of mobile social video is consumed with audio off or at low volume. Subtitles are no longer an optional accessibility feature — they are the primary visual driver of viewer retention.',
      sections: [
        {
          heading: '1. Cyberpunk Neon (Cyan Highlight)',
          body: 'High contrast cyan highlighting over bold black-stroked text creates an energetic, tech-forward aesthetic ideal for podcast highlights and news breakdowns.',
        },
        {
          heading: '2. Fire Starter (Orange/Red Accent)',
          body: 'Energetic orange and red word highlights draw instant focus to high-emotion phrases, debate points, and intense story climaxes.',
        },
        {
          heading: '3. Minimal Pro (Clean White Inter)',
          body: 'Sleek, minimalist typography designed for B2B founders, educators, and professional interview highlights.',
        },
      ],
      conclusion: 'Experiment with these 5 caption presets in the ClipFlow AI editor to discover which style drives maximum retention for your audience.',
    },
  },
  'what-is-sparkscore-viral-prediction-ai': {
    slug: 'what-is-sparkscore-viral-prediction-ai',
    title: 'What is SparkScore™? How AI Predicts Video Virality Before You Post',
    metaTitle: 'What is SparkScore™? How AI Predicts Video Virality Before You Post',
    metaDesc: 'Deep dive into SparkScore™ — ClipFlow AI\'s proprietary virality algorithm. Learn how it scores clips from 0-100 and what factors predict viral performance on TikTok, Reels, and Shorts.',
    category: 'Data Insights',
    date: 'January 2026',
    readTime: '6 min read',
    targetKeyword: 'AI virality score video',
    content: {
      intro: 'Posting content without understanding its viral potential leads to unpredictable engagement. SparkScore™ is ClipFlow AI\'s proprietary algorithmic scoring engine designed to analyze speech flow and emotional retention factors.',
      sections: [
        {
          heading: '1. Hook Intensity (30% Weight)',
          body: 'Evaluates the first 3 seconds of a clip for provocative statements, intriguing questions, or emotional claims that stop the scroll.',
        },
        {
          heading: '2. Narrative Coherence & Pacing (25% Weight)',
          body: 'Ensures the clip delivers a self-contained story arc with a clear setup, tension build, and satisfying payoff.',
        },
      ],
      conclusion: 'Leverage SparkScore™ predictions to publish only your highest-retention clips.',
    },
  },
  '916-vertical-video-auto-crop-ai': {
    slug: '916-vertical-video-auto-crop-ai',
    title: '9:16 Video Framing Guide: Why Auto-Crop AI Matters for Vertical Shorts',
    metaTitle: '9:16 Video Framing Guide: Why Auto-Crop AI Matters for Vertical Shorts',
    metaDesc: 'Why mobile-first framing is the #1 factor in short-form retention. How AI 9:16 auto-crop works, and why it beats manual editing for TikTok, Reels, and YouTube Shorts.',
    category: 'Engineering',
    date: 'January 2026',
    readTime: '5 min read',
    targetKeyword: '9:16 video crop AI automatic',
    content: {
      intro: 'Landscape 16:9 video recorded for YouTube desktop viewers wastes up to 68% of screen area when viewed vertically on mobile smartphones.',
      sections: [
        {
          heading: '1. Active Speaker Centering',
          body: 'ClipFlow AI employs FFmpeg video cropping filter algorithms (`crop=ih*9/16:ih:(iw-ow)/2:0`) to ensure speakers remain perfectly centered in the 9:16 frame.',
        },
      ],
      conclusion: 'Auto-crop your landscape videos to 9:16 vertical shorts effortlessly with ClipFlow AI.',
    },
  },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_DATA[slug];

  if (!post) {
    return { title: 'Article Not Found | ClipFlow AI' };
  }

  return {
    title: post.metaTitle,
    description: post.metaDesc,
    keywords: [post.targetKeyword, 'AI video clipper', 'viral shorts AI', 'ClipFlow AI blog'],
    openGraph: {
      title: post.metaTitle,
      description: post.metaDesc,
      type: 'article',
      url: `https://clipflow-omega.vercel.app/blog/${slug}`,
    },
    alternates: {
      canonical: `https://clipflow-omega.vercel.app/blog/${slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = BLOG_DATA[slug];

  if (!post) {
    notFound();
  }

  return (
    <article className="min-h-screen pt-28 pb-20 px-4 max-w-4xl mx-auto text-gray-200">
      <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-[#00E5FF] hover:underline mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to Blog
      </Link>

      <div className="flex items-center gap-3 mb-4">
        <span className="px-3 py-1 bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20 rounded-full text-xs font-bold uppercase">
          {post.category}
        </span>
        <span className="text-xs text-gray-400 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" /> {post.date}
        </span>
        <span className="text-xs text-gray-400 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" /> {post.readTime}
        </span>
      </div>

      <h1 className="text-3xl md:text-5xl font-black font-heading text-white tracking-tight leading-tight mb-6">
        {post.title}
      </h1>

      <p className="text-lg text-gray-300 border-l-4 border-[#00E5FF] pl-4 py-1 italic mb-10 bg-white/[0.02] rounded-r-lg">
        {post.content.intro}
      </p>

      <div className="space-y-10 text-gray-300 leading-relaxed font-sans">
        {post.content.sections.map((section, idx) => (
          <section key={idx} className="glass-panel p-6 md:p-8 rounded-2xl border border-white/5 space-y-4">
            <h2 className="text-xl md:text-2xl font-bold font-heading text-white">
              {section.heading}
            </h2>
            <p>{section.body}</p>
            {section.bullets && (
              <ul className="space-y-2 mt-4">
                {section.bullets.map((bullet, bIdx) => (
                  <li key={bIdx} className="flex items-start gap-2.5 text-sm text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-[#00FFA3] shrink-0 mt-0.5" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <div className="mt-12 glass-panel p-8 rounded-2xl border border-[#00E5FF]/20 text-center space-y-4 bg-gradient-to-b from-[#00E5FF]/5 to-transparent">
        <h3 className="text-2xl font-bold text-white font-heading">Ready to Automate Your Shorts Pipeline?</h3>
        <p className="text-sm text-gray-400 max-w-lg mx-auto">
          Start converting your podcasts and YouTube videos into viral vertical shorts with SparkScore™ AI.
        </p>
        <div className="pt-2">
          <Button asChild size="lg" className="bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-black font-bold">
            <Link href="/dashboard">
              <Sparkles className="w-4 h-4 mr-2" /> Start Clipping Free
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
