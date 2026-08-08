'use client';

import { useState, useEffect, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Type, PaintBucket, ImageIcon, Save, CheckCircle,
  Plus, Loader2, X, Sparkles, Wand2, MonitorPlay,
  Palette, Eye, RotateCcw, AlertCircle, Globe,
} from 'lucide-react';
import { toast } from 'sonner';
import { staggerContainer, fadeInUp, fadeInScale, spring } from '@/lib/animations';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const FONTS = ['Outfit', 'Inter', 'Montserrat', 'Bebas Neue', 'Roboto', 'Poppins', 'Playfair Display', 'Oswald', 'Anton', 'DM Sans'];
const WEIGHTS = [
  { label: 'Black (900)', value: '900' },
  { label: 'Extra Bold (800)', value: '800' },
  { label: 'Bold (700)', value: '700' },
  { label: 'Semi Bold (600)', value: '600' },
  { label: 'Medium (500)', value: '500' },
];

interface BrandKit {
  primary_font: string;
  font_weight: string;
  text_case: 'uppercase' | 'sentence';
  highlight_color: string;
  text_color: string;
  stroke_color: string;
  logo_url: string | null;
}

const DEFAULT: BrandKit = {
  primary_font: 'Outfit',
  font_weight: '900',
  text_case: 'uppercase',
  highlight_color: '#00E5FF',
  text_color: '#FFFFFF',
  stroke_color: '#000000',
  logo_url: null,
};

const PRESETS = [
  { name: 'Cyber Neon', font: 'Outfit', weight: '900', highlight: '#00E5FF', text: '#FFFFFF', stroke: '#000000' },
  { name: 'Fire Starter', font: 'Anton', weight: '900', highlight: '#FF6B00', text: '#FFFFFF', stroke: '#000000' },
  { name: 'Minimal Pro', font: 'Inter', weight: '600', highlight: '#FFFFFF', text: '#FFFFFF', stroke: '#111111' },
  { name: 'Viral Pink', font: 'Poppins', weight: '800', highlight: '#FF0055', text: '#FFFFFF', stroke: '#220000' },
  { name: 'Green Machine', font: 'DM Sans', weight: '700', highlight: '#00FFA3', text: '#FFFFFF', stroke: '#001A0E' },
];

export default function BrandKitPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activePreset, setActivePreset] = useState<number | null>(null);

  const [primaryFont, setPrimaryFont] = useState(DEFAULT.primary_font);
  const [fontWeight, setFontWeight] = useState(DEFAULT.font_weight);
  const [textCase, setTextCase] = useState<'uppercase' | 'sentence'>(DEFAULT.text_case);
  const [highlightColor, setHighlightColor] = useState(DEFAULT.highlight_color);
  const [textColor, setTextColor] = useState(DEFAULT.text_color);
  const [strokeColor, setStrokeColor] = useState(DEFAULT.stroke_color);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isGeneratingPalette, setIsGeneratingPalette] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUser(user);

      const { data: kit } = await supabase
        .from('brand_kits')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (kit) {
        setPrimaryFont(kit.primary_font || DEFAULT.primary_font);
        setFontWeight(kit.font_weight || DEFAULT.font_weight);
        setTextCase(kit.text_case || DEFAULT.text_case);
        setHighlightColor(kit.highlight_color || DEFAULT.highlight_color);
        setTextColor(kit.text_color || DEFAULT.text_color);
        setStrokeColor(kit.stroke_color || DEFAULT.stroke_color);
        setLogoUrl(kit.logo_url || null);
      }
      setLoading(false);
    })();
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoPreview(null);
    setLogoUrl(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const applyPreset = (idx: number) => {
    const p = PRESETS[idx];
    setPrimaryFont(p.font);
    setFontWeight(p.weight);
    setHighlightColor(p.highlight);
    setTextColor(p.text);
    setStrokeColor(p.stroke);
    setActivePreset(idx);
  };

  const generateAIPalette = () => {
    setIsGeneratingPalette(true);
    setTimeout(() => {
      const palettes = [
        { highlight: '#00FFA3', text: '#FFFFFF', stroke: '#111111' },
        { highlight: '#FF0055', text: '#FDFDFD', stroke: '#220000' },
        { highlight: '#9945FF', text: '#F0E5FF', stroke: '#1A0B2E' },
        { highlight: '#FFD700', text: '#FFFFFF', stroke: '#1A1A00' },
        { highlight: '#00BFFF', text: '#FFFFFF', stroke: '#001A2E' },
      ];
      const random = palettes[Math.floor(Math.random() * palettes.length)];
      setHighlightColor(random.highlight);
      setTextColor(random.text);
      setStrokeColor(random.stroke);
      setIsGeneratingPalette(false);
      toast.success('AI palette generated!');
    }, 1000);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      let uploadedLogoUrl = logoUrl;

      if (logoPreview && logoPreview.startsWith('data:')) {
        const blob = await (await fetch(logoPreview)).blob();
        const ext = blob.type.split('/')[1] || 'png';
        const storagePath = `brand-kit/${user.id}/logo.${ext}`;
        const { error: upErr } = await supabase.storage
          .from('clipflow-videos')
          .upload(storagePath, blob, { upsert: true, contentType: blob.type });
        if (!upErr) {
          const { data: { publicUrl } } = supabase.storage.from('clipflow-videos').getPublicUrl(storagePath);
          uploadedLogoUrl = publicUrl;
        }
      }

      const { error } = await supabase.from('brand_kits').upsert({
        user_id: user.id,
        primary_font: primaryFont,
        font_weight: fontWeight,
        text_case: textCase,
        highlight_color: highlightColor,
        text_color: textColor,
        stroke_color: strokeColor,
        logo_url: uploadedLogoUrl,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

      if (error) throw error;
      setSaved(true);
      toast.success('Brand Kit saved successfully!');
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save brand kit');
    } finally {
      setSaving(false);
    }
  };

  const resetDefaults = () => {
    setPrimaryFont(DEFAULT.primary_font);
    setFontWeight(DEFAULT.font_weight);
    setTextCase(DEFAULT.text_case);
    setHighlightColor(DEFAULT.highlight_color);
    setTextColor(DEFAULT.text_color);
    setStrokeColor(DEFAULT.stroke_color);
    setActivePreset(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-[#00E5FF] animate-spin" />
          <p className="text-gray-400 text-sm font-mono">Loading your brand kit...</p>
        </div>
      </div>
    );
  }

  const previewWord = textCase === 'uppercase' ? 'CONTENT' : 'Content';
  const previewRest = textCase === 'uppercase' ? 'THAT GOES' : 'that goes';
  const previewViral = textCase === 'uppercase' ? 'VIRAL' : 'viral';

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="max-w-7xl mx-auto space-y-8 pb-12 relative z-10 h-full flex flex-col"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">Brand Kit</h1>
          <p className="text-sm text-gray-400 mt-1">Define your visual identity. Applied to all newly generated clips automatically.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={resetDefaults}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-gray-300 hover:text-white transition-all"
          >
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-gradient-to-r from-[#9945FF] to-[#00E5FF] hover:opacity-90 px-6 py-2.5 rounded-xl text-black text-sm font-bold shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left: Controls */}
        <div className="lg:col-span-7 space-y-6">

          {/* Presets */}
          <motion.div variants={fadeInUp} className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4 shadow-xl">
            <div className="flex items-center gap-3 pb-3 border-b border-white/5">
              <div className="w-8 h-8 rounded-lg bg-[#0088FF]/10 flex items-center justify-center border border-[#0088FF]/20">
                <Sparkles className="w-4 h-4 text-[#0088FF]" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-white">Quick Presets</h2>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p, i) => (
                <button
                  key={p.name}
                  onClick={() => applyPreset(i)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    activePreset === i
                      ? 'bg-[#00E5FF]/10 border-[#00E5FF]/40 text-[#00E5FF]'
                      : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                  }`}
                  style={{ borderLeftColor: p.highlight, borderLeftWidth: 3 }}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Typography */}
          <motion.div variants={fadeInUp} className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00E5FF] rounded-full blur-[80px] opacity-5 pointer-events-none" />

            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/10 flex items-center justify-center border border-[#00E5FF]/20 shadow-inner">
                <Type className="w-5 h-5 text-[#00E5FF]" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-white">Typography</h2>
                <p className="text-xs text-gray-500 font-mono">Caption font settings</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Primary Font</label>
                <select
                  value={primaryFont}
                  onChange={e => { setPrimaryFont(e.target.value); setActivePreset(null); }}
                  className="w-full bg-[#050505] border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-[#00E5FF]/50 transition-all shadow-inner"
                >
                  {FONTS.map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Font Weight</label>
                <select
                  value={fontWeight}
                  onChange={e => { setFontWeight(e.target.value); setActivePreset(null); }}
                  className="w-full bg-[#050505] border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-[#00E5FF]/50 transition-all shadow-inner"
                >
                  {WEIGHTS.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Text Case</label>
              <div className="flex gap-4">
                {[
                  { val: 'uppercase' as const, label: 'UPPERCASE', preview: 'ALL CAPS' },
                  { val: 'sentence' as const, label: 'Sentence case', preview: 'Sentence' },
                ].map(opt => (
                  <label
                    key={opt.val}
                    className={`flex items-center gap-3 cursor-pointer p-3 border rounded-xl flex-1 transition-all bg-white/5 ${
                      textCase === opt.val ? 'border-[#00E5FF]/50' : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div
                      onClick={() => { setTextCase(opt.val); setActivePreset(null); }}
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shadow-inner ${
                        textCase === opt.val ? 'border-[#00E5FF]' : 'border-gray-500'
                      }`}
                    >
                      {textCase === opt.val && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]" />
                      )}
                    </div>
                    <div>
                      <span className="text-sm font-bold text-gray-200">{opt.label}</span>
                      <p className="text-[10px] text-gray-500 mt-0.5">{opt.preview}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Colors */}
          <motion.div variants={fadeInUp} className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#9945FF] rounded-full blur-[80px] opacity-10 pointer-events-none" />

            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#9945FF]/10 flex items-center justify-center border border-[#9945FF]/20 shadow-inner">
                  <PaintBucket className="w-5 h-5 text-[#9945FF]" />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-white">Color Palette</h2>
                  <p className="text-xs text-gray-500 font-mono">Accent colors and strokes</p>
                </div>
              </div>
              <button
                onClick={generateAIPalette}
                disabled={isGeneratingPalette}
                className="flex items-center gap-2 bg-[#9945FF]/10 border border-[#9945FF]/30 text-[#9945FF] hover:bg-[#9945FF]/20 px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-wait"
              >
                {isGeneratingPalette ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                {isGeneratingPalette ? 'Generating...' : 'AI Palette'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
              {[
                { label: 'Highlight Color', value: highlightColor, set: setHighlightColor },
                { label: 'Text Color', value: textColor, set: setTextColor },
                { label: 'Stroke Color', value: strokeColor, set: setStrokeColor },
              ].map(c => (
                <div key={c.label} className="space-y-3">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{c.label}</label>
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-xl border border-white/10 overflow-hidden shadow-inner shrink-0">
                      <input
                        type="color"
                        value={c.value}
                        onChange={(e) => { c.set(e.target.value); setActivePreset(null); }}
                        className="absolute inset-[-10px] w-20 h-20 cursor-pointer"
                      />
                    </div>
                    <input
                      type="text"
                      value={c.value.toUpperCase()}
                      onChange={(e) => { c.set(e.target.value); setActivePreset(null); }}
                      className="w-full bg-[#050505] border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white font-mono focus:border-[#00E5FF]/50 focus:outline-none shadow-inner uppercase"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Logo */}
          <motion.div variants={fadeInUp} className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6 shadow-xl">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <div className="w-10 h-10 rounded-xl bg-[#00FFA3]/10 flex items-center justify-center border border-[#00FFA3]/20 shadow-inner">
                <ImageIcon className="w-5 h-5 text-[#00FFA3]" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-white">Watermark Logo</h2>
                <p className="text-xs text-gray-500 font-mono">Optional logo overlay on exported clips</p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div
                onClick={() => fileRef.current?.click()}
                className="w-28 h-28 rounded-2xl border-2 border-dashed border-white/20 bg-[#050505] hover:bg-white/5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors relative overflow-hidden group shadow-inner shrink-0"
              >
                {(logoPreview || logoUrl) ? (
                  <img src={logoPreview || logoUrl!} alt="Logo" className="w-full h-full object-contain p-2" />
                ) : (
                  <>
                    <Plus className="w-6 h-6 text-gray-500 group-hover:text-white transition-colors" />
                    <span className="text-xs text-gray-500 font-bold">Upload</span>
                  </>
                )}
                <input type="file" ref={fileRef} accept="image/png,image/jpeg" className="hidden" onChange={handleLogoUpload} />
              </div>

              {(logoPreview || logoUrl) && (
                <div className="flex-1 space-y-3">
                  <p className="text-sm text-gray-400">Logo will be placed at the top center of exported videos.</p>
                  <button
                    onClick={removeLogo}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-bold hover:bg-red-500/20 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>
              )}
              {!(logoPreview || logoUrl) && (
                <p className="text-xs text-gray-500 self-center">Upload a transparent PNG for best results.</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Right: Live Preview */}
        <div className="lg:col-span-5 h-[650px] lg:sticky lg:top-6">
          <motion.div variants={fadeInScale} className="glass-panel w-full h-full rounded-[2.5rem] border-[8px] border-[#1C1E26] bg-black relative shadow-2xl overflow-hidden flex flex-col items-center justify-center ring-1 ring-white/10 group">
            {/* Phone Notch */}
            <div className="absolute top-0 inset-x-0 h-7 bg-[#1C1E26] rounded-b-3xl w-40 mx-auto z-20 flex justify-center items-end pb-1.5">
              <div className="w-12 h-1.5 bg-black/50 rounded-full border border-white/5" />
            </div>

            {/* UI Overlay */}
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

            {/* Simulated Video BG */}
            <img
              src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop"
              alt="Preview BG"
              className="absolute inset-0 w-full h-full object-cover opacity-40 blur-[2px] scale-105 group-hover:scale-100 transition-transform duration-1000"
            />

            {/* Live Preview Elements */}
            <div className="relative z-20 flex flex-col items-center justify-center w-full h-full text-center px-8" style={{ fontFamily: primaryFont }}>
              {(logoPreview || logoUrl) && (
                <div className="absolute top-16 w-16 h-16 opacity-80 mix-blend-screen drop-shadow-2xl">
                  <img src={logoPreview || logoUrl!} alt="Watermark" className="w-full h-full object-contain" />
                </div>
              )}

              <div className="absolute top-1/2 -translate-y-1/2 w-full px-6 flex flex-col items-center gap-2">
                <motion.div
                  className="flex flex-col items-center gap-1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <span
                    className="text-[36px] leading-tight drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]"
                    style={{
                      fontWeight,
                      color: textColor,
                      WebkitTextStroke: `3px ${strokeColor}`,
                    }}
                  >
                    CREATE
                  </span>

                  <span
                    className="text-[42px] leading-tight z-10 drop-shadow-[0_0_20px_rgba(0,0,0,0.3)]"
                    style={{
                      fontWeight,
                      color: highlightColor,
                      WebkitTextStroke: `2px ${strokeColor}`,
                      transform: 'rotate(-2deg)',
                      textShadow: `0 0 20px ${highlightColor}60`,
                    }}
                  >
                    {previewWord}
                  </span>

                  <span
                    className="text-[32px] leading-tight drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]"
                    style={{
                      fontWeight,
                      color: textColor,
                      WebkitTextStroke: `3px ${strokeColor}`,
                    }}
                  >
                    {previewRest}
                  </span>

                  <span
                    className="text-[44px] leading-tight drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                    style={{
                      fontWeight,
                      backgroundImage: `linear-gradient(to bottom right, ${highlightColor}, #ffffff)`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      WebkitTextStroke: `3px ${strokeColor}`,
                    }}
                  >
                    {previewViral}
                  </span>
                </motion.div>
              </div>
            </div>

            {/* Phone Footer */}
            <div className="absolute bottom-6 inset-x-6 flex justify-between items-end z-20 pointer-events-none">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md" />
                  <span className="text-white text-sm font-bold drop-shadow-md">@creator</span>
                </div>
                <p className="text-white/80 text-xs drop-shadow-md w-48 line-clamp-2">
                  Your exported clips will look like this on mobile feeds.
                </p>
              </div>
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg" />
                ))}
              </div>
            </div>

            {/* Live Indicator */}
            <div className="absolute top-4 right-6 z-20 flex items-center gap-2 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] text-white font-mono font-bold uppercase tracking-widest">Live</span>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}


