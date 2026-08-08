'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Download, Image as ImageIcon, Palette, Type, Check,
  Home, Sparkles, ArrowDownToLine,
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

const colors = [
  { name: 'Void Black', hex: '#050505', text: 'text-white', usage: 'Primary background' },
  { name: 'Neon Cyan', hex: '#00E5FF', text: 'text-black', usage: 'Accent, interactive elements' },
  { name: 'Deep Purple', hex: '#9945FF', text: 'text-white', usage: 'Brand primary, CTAs' },
  { name: 'Matrix Green', hex: '#00FFA3', text: 'text-black', usage: 'Success states, accents' },
  { name: 'Rose Pink', hex: '#FF6B9D', text: 'text-white', usage: 'Secondary accent' },
  { name: 'Surface Gray', hex: '#1A1A1A', text: 'text-white', usage: 'Card backgrounds' },
];

const logos = [
  { name: 'ClipFlow — Dark', bg: 'bg-[#050505]', text: 'text-white', accent: 'text-[#00E5FF]' },
  { name: 'ClipFlow — Light', bg: 'bg-white', text: 'text-black', accent: 'text-[#9945FF]' },
  { name: 'ClipFlow — Purple', bg: 'bg-[#9945FF]', text: 'text-white', accent: 'text-white/80' },
  { name: 'ClipFlow — Cyan', bg: 'bg-[#00E5FF]', text: 'text-black', accent: 'text-black/80' },
];

const guidelines = [
  { title: 'Clear Space', desc: 'Maintain a minimum clear space equal to the height of the "C" on all sides of the logo.' },
  { title: 'Minimum Size', desc: 'Never display the logo smaller than 32px wide for digital or 0.5in for print.' },
  { title: 'Background Usage', desc: 'Use the dark variant on light backgrounds and the light variant on dark backgrounds.' },
  { title: 'Do Not Modify', desc: 'Do not stretch, rotate, recolor, or add effects to the logo. Always use provided files.' },
];

const brandAssets = [
  { name: 'Logo — SVG', desc: 'Vector format for web and design tools', format: 'SVG', size: '12 KB', color: '#9945FF' },
  { name: 'Logo — PNG', desc: 'Raster format with transparent background', format: 'PNG', size: '48 KB', color: '#00E5FF' },
  { name: 'Logo — Dark BG', desc: 'White logo variant for dark backgrounds', format: 'SVG', size: '8 KB', color: '#00FFA3' },
  { name: 'Logo — Icon Only', desc: 'Mark-only variant for favicons and avatars', format: 'SVG', size: '4 KB', color: '#FF6B9D' },
  { name: 'Brand Pattern', desc: 'Subtle background pattern for sections', format: 'PNG', size: '120 KB', color: '#9945FF' },
  { name: 'Brand Guide PDF', desc: 'Complete brand guidelines document', format: 'PDF', size: '2.4 MB', color: '#00E5FF' },
];

export default function BrandPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white relative overflow-hidden">
      <div className="fixed top-[-15%] left-[-5%] w-[700px] h-[700px] bg-[#9945FF]/[0.03] rounded-full blur-[200px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#00E5FF]/[0.03] rounded-full blur-[180px] pointer-events-none" />

      {/* Hero */}
      <AnimatedSection className="relative z-10 pt-36 pb-16 px-6">
        <AnimatedContainer className="max-w-7xl mx-auto">
          <AnimatedItem>
            <div className="flex items-center gap-2 text-sm text-gray-500 font-mono mb-6">
              <Link href="/" className="hover:text-white transition-colors flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5" /> Home
              </Link>
              <span>/</span>
              <span className="text-[#00E5FF]">Brand</span>
            </div>
          </AnimatedItem>
          <AnimatedItem>
            <Badge variant="info" size="lg" className="mb-6 px-4 py-1.5">
              <Sparkles className="w-3.5 h-3.5 mr-2 inline-block" />
              Brand Assets
            </Badge>
          </AnimatedItem>
          <AnimatedItem>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black font-heading tracking-tight leading-[0.95] mb-6">
              <AnimatedGradientText from="#00E5FF" via="#9945FF" to="#FF6B9D">
                Brand Assets
              </AnimatedGradientText>
            </h1>
          </AnimatedItem>
          <AnimatedItem>
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl leading-relaxed">
              Bold. Fast. Intelligent. Download official ClipFlow brand assets for
              use in your content, presentations, and integrations.
            </p>
          </AnimatedItem>
        </AnimatedContainer>
      </AnimatedSection>

      <div className="relative z-10 px-6 pb-24 space-y-32">
        <div className="max-w-7xl mx-auto">
          {/* Logo downloads */}
          <AnimatedContainer>
            <AnimatedItem className="flex items-center gap-3 mb-8">
              <ImageIcon className="w-7 h-7 text-[#00E5FF]" />
              <h2 className="text-3xl md:text-4xl font-black font-heading">Logos</h2>
            </AnimatedItem>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {logos.map((logo, i) => (
                <AnimatedCard key={logo.name} index={i}>
                  <div className={`${logo.bg} p-8 rounded-2xl border border-white/[0.06] flex flex-col items-center justify-center min-h-[160px] group`}>
                    <div className={`text-2xl md:text-3xl font-black tracking-tighter mb-6 ${logo.text}`}>
                      Clip<span className={logo.accent}>Flow</span>
                    </div>
                    <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-full transition-all text-xs opacity-0 group-hover:opacity-100">
                      <Download className="w-3.5 h-3.5" /> SVG
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-3 text-center">{logo.name}</p>
                </AnimatedCard>
              ))}
            </div>
          </AnimatedContainer>

          {/* Color palette */}
          <AnimatedContainer>
            <AnimatedItem className="flex items-center gap-3 mb-8">
              <Palette className="w-7 h-7 text-[#9945FF]" />
              <h2 className="text-3xl md:text-4xl font-black font-heading">Color Palette</h2>
            </AnimatedItem>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {colors.map((c, i) => (
                <AnimatedCard key={c.name} index={i}>
                  <div
                    className={`h-28 rounded-2xl flex items-end p-4 border border-white/[0.06] ${c.text}`}
                    style={{ backgroundColor: c.hex }}
                  >
                    <span className="font-mono text-xs font-bold opacity-80">{c.hex}</span>
                  </div>
                  <div className="mt-3">
                    <h4 className="text-sm font-bold">{c.name}</h4>
                    <p className="text-[10px] text-gray-500">{c.usage}</p>
                  </div>
                </AnimatedCard>
              ))}
            </div>
          </AnimatedContainer>

          {/* Typography */}
          <AnimatedContainer>
            <AnimatedItem className="flex items-center gap-3 mb-8">
              <Type className="w-7 h-7 text-[#00FFA3]" />
              <h2 className="text-3xl md:text-4xl font-black font-heading">Typography</h2>
            </AnimatedItem>
            <AnimatedItem>
              <div className="p-8 md:p-10 rounded-2xl border border-white/[0.04] bg-white/[0.01] space-y-8">
                <div className="border-b border-white/[0.04] pb-8">
                  <p className="text-xs text-gray-500 mb-3 font-mono">Primary Font — Inter</p>
                  <h1 className="text-4xl md:text-6xl font-black tracking-tight">
                    The quick brown fox jumps over the lazy dog.
                  </h1>
                </div>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-500 mb-4 font-mono">Weights</p>
                    <div className="space-y-2">
                      <p className="font-light text-lg">Light 300</p>
                      <p className="font-normal text-lg">Regular 400</p>
                      <p className="font-medium text-lg">Medium 500</p>
                      <p className="font-semibold text-lg">Semi Bold 600</p>
                      <p className="font-bold text-lg">Bold 700</p>
                      <p className="font-black text-lg">Black 800</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-4 font-mono">Usage</p>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
                        <span className="text-gray-400">Headings</span>
                        <span className="font-black">Black 800</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
                        <span className="text-gray-400">Subheadings</span>
                        <span className="font-bold">Bold 700</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
                        <span className="text-gray-400">Body</span>
                        <span className="font-normal">Regular 400</span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-gray-400">Code / Mono</span>
                        <span className="font-mono text-sm">JetBrains Mono</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedItem>
          </AnimatedContainer>

          {/* Usage guidelines */}
          <AnimatedContainer>
            <AnimatedItem className="flex items-center gap-3 mb-8">
              <Check className="w-7 h-7 text-[#FF6B9D]" />
              <h2 className="text-3xl md:text-4xl font-black font-heading">Logo Usage Guidelines</h2>
            </AnimatedItem>
            <div className="grid sm:grid-cols-2 gap-4">
              {guidelines.map((g, i) => (
                <AnimatedCard key={g.title} index={i}>
                  <div className="p-5 rounded-2xl border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/[0.08] transition-all duration-300 h-full">
                    <h3 className="text-sm font-bold font-heading mb-2">{g.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{g.desc}</p>
                  </div>
                </AnimatedCard>
              ))}
            </div>
          </AnimatedContainer>

          {/* Download grid */}
          <AnimatedContainer>
            <AnimatedItem className="flex items-center gap-3 mb-8">
              <ArrowDownToLine className="w-7 h-7 text-[#00E5FF]" />
              <h2 className="text-3xl md:text-4xl font-black font-heading">Download All Assets</h2>
            </AnimatedItem>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {brandAssets.map((asset, i) => (
                <AnimatedCard key={asset.name} index={i}>
                  <div className="p-5 rounded-2xl border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/[0.08] transition-all duration-300 flex items-center justify-between gap-4 group">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: asset.color }} />
                        <h4 className="text-sm font-bold text-white truncate">{asset.name}</h4>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{asset.desc}</p>
                      <p className="text-[10px] text-gray-600 font-mono mt-0.5">{asset.format} · {asset.size}</p>
                    </div>
                    <button className="w-10 h-10 rounded-xl border border-white/[0.06] flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/[0.06] transition-all shrink-0">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </AnimatedCard>
              ))}
            </div>
          </AnimatedContainer>
        </div>
      </div>
    </div>
  );
}
