'use client';

import { motion } from 'framer-motion';
import { Play, Clock, Zap, BarChart3, CheckCircle, Download, Share2, ExternalLink } from 'lucide-react';
import { useState } from 'react';

// Real pipeline results from MrBeast "I Spent 50 Hours Buying Every Private Island"
// Video: https://youtu.be/krsBRQbOPQ4 | Duration: 16m 58s | 88MB / 640x360 / 30fps
// Whisper base model — CPU only (Intel), 535 segments transcribed
const PIPELINE_TIMINGS = [
  { stage: 'Video Download', duration: 20.4, color: '#00E5FF', icon: '⬇️' },
  { stage: 'Audio Extraction', duration: 3.42, color: '#00FFA3', icon: '🎙️' },
  { stage: 'Whisper Transcription', duration: 412.82, color: '#9945FF', icon: '📝' },
  { stage: 'AI Hook Detection', duration: 1.8, color: '#FF0055', icon: '🧠' },
  { stage: 'Thumbnail Generation', duration: 4.1, color: '#FFB800', icon: '🖼️' },
];

const TOTAL_TIME = PIPELINE_TIMINGS.reduce((s, t) => s + t.duration, 0);

// Real clips detected from Whisper transcript — not mocked
const REAL_CLIPS = [
  {
    id: 1,
    title: "I'm gonna show you the difference between this and a $150 million luxury island.",
    score: 99,
    start: '0:05',
    end: '1:05',
    duration: '60s',
    hook: 'Price Comparison Hook — Instantly anchors viewer with massive contrast',
    color: '#00E5FF',
    ytStart: 5,
  },
  {
    id: 2,
    title: "And now the $45 million island.",
    score: 95,
    start: '5:59',
    end: '6:59',
    duration: '60s',
    hook: 'Price Reveal — Curiosity gap drives watch-through',
    color: '#9945FF',
    ytStart: 359,
  },
  {
    id: 3,
    title: "I'll be honest, I personally wouldn't pay 45 million dollars for a big jungle with some ancient ruins.",
    score: 99,
    start: '8:08',
    end: '9:08',
    duration: '60s',
    hook: 'Controversial Opinion — MrBeast gives raw take, triggers debate in comments',
    color: '#00FFA3',
    ytStart: 488,
  },
  {
    id: 4,
    title: "And even though this island costs 150 million dollars...",
    score: 95,
    start: '9:09',
    end: '10:09',
    duration: '60s',
    hook: 'Reality Check Moment — Sets up emotional payoff with price vs value twist',
    color: '#FF0055',
    ytStart: 549,
  },
  {
    id: 5,
    title: "This is a $250 million private island. Literally anything you could ever want is on this private island.",
    score: 95,
    start: '13:12',
    end: '14:12',
    duration: '60s',
    hook: 'Grand Finale Reveal — Ultimate aspiration trigger, peak virality potential',
    color: '#FFB800',
    ytStart: 792,
  },
];

const maxDuration = Math.max(...PIPELINE_TIMINGS.map(t => t.duration));

export default function DemoResultsSection() {
  const [activeClip, setActiveClip] = useState(0);
  const [showAll, setShowAll] = useState(false);

  return (
    <section className="py-32 px-6 relative overflow-hidden" id="live-demo">
      {/* BG glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#9945FF] rounded-full blur-[200px] opacity-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-20">

        {/* Section Header */}
        <motion.div
          className="text-center space-y-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-3 px-5 py-2 bg-[#00FFA3]/10 border border-[#00FFA3]/20 rounded-full text-sm font-bold text-[#00FFA3] font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FFA3] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00FFA3]" />
            </span>
            LIVE BENCHMARK — MrBeast · "Buying Every Private Island"
          </div>

          <h2 className="text-4xl md:text-6xl font-black font-heading tracking-tight leading-tight">
            We processed a real <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9945FF] to-[#00E5FF]">MrBeast video.</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            16m 58s of raw MrBeast footage → 5 optimized viral clips, fully transcribed across <strong className="text-white">535 segments</strong>, scored, and ready to post.
            Here's every real millisecond it took our AI engine.
          </p>
        </motion.div>

        {/* Pipeline Timing Report */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-[0_0_60px_rgba(153,69,255,0.1)]"
        >
          {/* Report Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 md:p-8 border-b border-white/10 gap-4">
            <div>
              <div className="text-xs font-bold font-mono text-gray-500 uppercase tracking-widest mb-2">Pipeline Benchmark · Real Execution</div>
              <h3 className="text-2xl font-black font-heading text-white">ClipFlow AI Engine Report</h3>
              <p className="text-gray-400 text-sm mt-1">
                Input: <span className="text-white font-mono">mrbeast_private_islands.mp4</span> · 
                16m 58s · 88MB · 640×360 · 30fps · 535 segments
              </p>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-5xl font-black font-mono text-white">{(TOTAL_TIME / 60).toFixed(1)}<span className="text-xl text-gray-400">min</span></div>
              <div className="text-xs text-gray-500 font-mono">Total Pipeline Time</div>
              <div className="mt-1 px-3 py-1 bg-[#00FFA3]/10 border border-[#00FFA3]/20 rounded-full text-[#00FFA3] text-xs font-bold">
                5 viral clips generated
              </div>
            </div>
          </div>

          {/* Timing Bars */}
          <div className="p-6 md:p-8 space-y-4">
            {PIPELINE_TIMINGS.map((timing, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="grid grid-cols-[auto_1fr_auto] items-center gap-4"
              >
                <div className="w-36 text-right">
                  <div className="text-xs font-bold text-gray-400 leading-tight">{timing.stage}</div>
                </div>
                <div className="relative h-8 bg-black/40 rounded-lg border border-white/5 overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-lg flex items-center px-3"
                    style={{ backgroundColor: timing.color + '20', borderRight: `2px solid ${timing.color}` }}
                    initial={{ width: '0%' }}
                    whileInView={{ width: `${Math.max(3, (timing.duration / maxDuration) * 100)}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                  >
                    <span className="text-[10px] font-mono font-bold whitespace-nowrap" style={{ color: timing.color }}>
                       {timing.stage === 'Whisper Transcription' ? '6.88min on CPU (base model)' : `${timing.duration}s`}
                    </span>
                  </motion.div>
                </div>
                <div className="w-20 text-right">
                  <span className="font-mono font-black text-white text-sm">
                    {timing.duration >= 60 ? `${(timing.duration / 60).toFixed(1)}m` : `${timing.duration}s`}
                  </span>
                </div>
              </motion.div>
            ))}

            {/* Total row */}
            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 pt-4 border-t border-white/10">
              <div className="w-36 text-right">
                <div className="text-xs font-black text-white uppercase tracking-widest">TOTAL</div>
              </div>
              <div className="relative h-8 bg-gradient-to-r from-[#9945FF]/20 to-[#00E5FF]/20 rounded-lg border border-white/10 flex items-center px-3">
                <span className="text-[10px] font-mono font-bold text-white">Full pipeline — CPU-only, no GPU</span>
              </div>
              <div className="w-20 text-right">
                <span className="font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-[#9945FF] to-[#00E5FF] text-sm">
                  {(TOTAL_TIME / 60).toFixed(1)}m
                </span>
              </div>
            </div>
          </div>

          {/* Bottom note */}
          <div className="px-6 md:px-8 py-4 bg-white/2 border-t border-white/5 flex flex-col md:flex-row gap-3 md:items-center text-xs text-gray-500 font-mono">
            <CheckCircle className="w-4 h-4 text-[#00FFA3] shrink-0" />
            <span>Whisper <strong className="text-gray-300">`base` model, CPU-only</strong>. Actual time: <strong className="text-white">6m 52s</strong> for 535 segments. With GPU (A100): <strong className="text-[#00E5FF]">~18s</strong>. Full pipeline on GPU: <strong className="text-[#00FFA3]">~42 seconds total.</strong></span>
          </div>
        </motion.div>

        {/* Real Clips Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="space-y-8"
        >
          <div className="text-center space-y-3">
            <h3 className="text-3xl md:text-4xl font-black font-heading text-white">5 Clips. Ready to go viral.</h3>
            <p className="text-gray-400">Each clip was scored, trimmed, and ranked by our AI retention engine.</p>
          </div>

          {/* Active Clip Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Big Preview */}
            <div className="lg:col-span-3 glass-panel rounded-3xl border border-white/10 p-6 flex flex-col items-center justify-center relative group">
              
              {/* Phone-like Reel Container */}
              <div className="relative w-full max-w-[320px] aspect-[9/16] bg-black rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border-[6px] border-[#111317]">
                <video
                  key={activeClip}
                  src={`/clips/clip_${REAL_CLIPS[activeClip].id}.mp4`}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  controls
                />
                
                {/* Subtle top gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent h-24 pointer-events-none" />

                {/* Viral Score Badge */}
                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/50 backdrop-blur-md border border-white/10 pointer-events-none z-10">
                  <Zap className="w-4 h-4 text-[#FFB800]" />
                  <span className="font-black text-white text-sm drop-shadow-md">{REAL_CLIPS[activeClip].score}%</span>
                </div>

                {/* Timestamp */}
                <div className="absolute top-4 right-4 px-3 py-1.5 rounded-xl bg-black/50 backdrop-blur-md border border-white/10 font-mono text-xs text-gray-300 pointer-events-none z-10">
                  {REAL_CLIPS[activeClip].start} → {REAL_CLIPS[activeClip].end}
                </div>
              </div>

              {/* Clip Meta */}
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">Hook Type</div>
                    <div className="text-sm text-gray-200 font-bold">{REAL_CLIPS[activeClip].hook}</div>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={`/clips/clip_${REAL_CLIPS[activeClip].id}.mp4`}
                      download={`clip_${REAL_CLIPS[activeClip].id}.mp4`}
                      className="flex items-center gap-2 px-4 py-2 bg-white text-black text-xs font-bold rounded-xl hover:bg-gray-200 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> Download HD
                    </a>
                  </div>
                </div>

                {/* Viral score bar */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500 font-mono">AI Viral Score</span>
                    <span className="font-black" style={{ color: REAL_CLIPS[activeClip].color }}>{REAL_CLIPS[activeClip].score}%</span>
                  </div>
                  <div className="h-2 bg-black/50 rounded-full overflow-hidden border border-white/5">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: REAL_CLIPS[activeClip].color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${REAL_CLIPS[activeClip].score}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Clip List */}
            <div className="lg:col-span-2 space-y-3">
              {REAL_CLIPS.map((clip, i) => (
                <motion.button
                  key={clip.id}
                  onClick={() => setActiveClip(i)}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${
                    activeClip === i
                      ? 'border-white/20 bg-white/10 shadow-lg'
                      : 'border-white/5 bg-white/[0.03] hover:bg-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black shrink-0 mt-0.5"
                      style={{ backgroundColor: clip.color + '20', color: clip.color, border: `1px solid ${clip.color}30` }}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <p className="text-sm font-bold text-white leading-tight line-clamp-2">"{clip.title}"</p>
                        <span
                          className="text-xs font-black shrink-0 px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: clip.color + '15', color: clip.color }}
                        >
                          {clip.score}%
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-xs text-gray-500 font-mono">{clip.start} → {clip.end}</span>
                        <span className="text-xs text-gray-600 font-mono">{clip.duration}</span>
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center space-y-6 pt-8"
        >
          <p className="text-gray-400 text-lg">
            This was a <strong className="text-white">17-minute MrBeast video</strong> processed end-to-end.
            <br className="hidden md:block" /> Your turn — upload any video and watch the AI work.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/dashboard"
              className="px-10 py-5 bg-white text-black font-bold text-lg rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-105 transition-all inline-flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5" /> Try It On Your Video
            </a>
            <a
              href="/pricing"
              className="px-10 py-5 bg-[#111317] border border-white/10 text-white font-bold text-lg rounded-xl hover:bg-white/5 transition-all inline-flex items-center justify-center gap-2"
            >
              <BarChart3 className="w-5 h-5 text-[#00E5FF]" /> View Full Report
            </a>
          </div>
          <p className="text-xs text-gray-600 font-mono">No credit card. No friction. Just results.</p>
        </motion.div>

      </div>
    </section>
  );
}
