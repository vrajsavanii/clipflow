/**
 * Caption Styles & Language Detection
 * Defines all supported caption presets and auto-detection logic
 */

export type CaptionStyleId =
  | 'neon_cyberpunk'
  | 'fire_word'
  | 'minimal_clean'
  | 'bold_impact'
  | 'karaoke_highlight'
  | 'retro_vhs'
  | 'podcast_studio'
  | 'tiktok_gradient'
  | 'hinglish_podcast';

export interface CaptionStyle {
  id: CaptionStyleId;
  name: string;
  description: string;
  preview: {
    textColor: string;
    highlightColor: string;
    strokeColor: string;
    background: string;
    fontWeight: string;
    textTransform: string;
    glow?: string;
    animation?: string;
  };
  ffmpegStyle: string; // description for FFmpeg subtitle rendering
  badge?: string;
  badgeColor?: string;
}

export const CAPTION_STYLES: CaptionStyle[] = [
  {
    id: 'neon_cyberpunk',
    name: 'Neon Cyberpunk',
    description: 'Electric cyan words with purple glow — maximum viral impact',
    badge: '🔥 Popular',
    badgeColor: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    preview: {
      textColor: '#FFFFFF',
      highlightColor: '#00E5FF',
      strokeColor: '#000000',
      background: 'linear-gradient(135deg, #0A0B0E 0%, #111827 100%)',
      fontWeight: '900',
      textTransform: 'uppercase',
      glow: '0 0 20px rgba(0,229,255,0.6)',
      animation: 'word-pop',
    },
    ffmpegStyle: 'FontName=Outfit,FontSize=80,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,Bold=1,Outline=4,MarginV=120',
  },
  {
    id: 'fire_word',
    name: 'Fire Word',
    description: 'Each spoken word bursts in flame orange — high energy',
    badge: '⚡ Trending',
    badgeColor: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    preview: {
      textColor: '#FFFFFF',
      highlightColor: '#FF6B00',
      strokeColor: '#000000',
      background: 'linear-gradient(135deg, #1A0A00 0%, #0F0F0F 100%)',
      fontWeight: '900',
      textTransform: 'uppercase',
      glow: '0 0 25px rgba(255,107,0,0.8)',
      animation: 'word-scale',
    },
    ffmpegStyle: 'FontName=Outfit,FontSize=85,PrimaryColour=&H0000A5FF,OutlineColour=&H00000000,Bold=1,Outline=4,MarginV=120',
  },
  {
    id: 'minimal_clean',
    name: 'Minimal Clean',
    description: 'White semi-transparent lower-third — professional & sleek',
    preview: {
      textColor: '#FFFFFF',
      highlightColor: '#FFFFFF',
      strokeColor: 'transparent',
      background: 'linear-gradient(135deg, #111111 0%, #1C1C1C 100%)',
      fontWeight: '600',
      textTransform: 'none',
      animation: 'fade-in',
    },
    ffmpegStyle: 'FontName=Inter,FontSize=65,PrimaryColour=&H00FFFFFF,OutlineColour=&H80000000,Bold=0,Outline=2,MarginV=150',
  },
  {
    id: 'bold_impact',
    name: 'Bold Impact',
    description: 'Giant all-caps black text with thick white stroke — maximum readability',
    preview: {
      textColor: '#000000',
      highlightColor: '#FFFF00',
      strokeColor: '#FFFFFF',
      background: '#FFFFFF',
      fontWeight: '900',
      textTransform: 'uppercase',
      animation: 'word-pop',
    },
    ffmpegStyle: 'FontName=Outfit,FontSize=90,PrimaryColour=&H00000000,OutlineColour=&H00FFFFFF,Bold=1,Outline=6,MarginV=120',
  },
  {
    id: 'karaoke_highlight',
    name: 'Karaoke Highlight',
    description: 'Active word fills with color as spoken — immersive karaoke style',
    badge: '🎤 New',
    badgeColor: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    preview: {
      textColor: 'rgba(255,255,255,0.4)',
      highlightColor: '#9945FF',
      strokeColor: '#000000',
      background: 'linear-gradient(135deg, #0D0B1A 0%, #111827 100%)',
      fontWeight: '800',
      textTransform: 'uppercase',
      glow: '0 0 15px rgba(153,69,255,0.7)',
      animation: 'karaoke-fill',
    },
    ffmpegStyle: 'FontName=Outfit,FontSize=75,PrimaryColour=&H00FF45FF,OutlineColour=&H00000000,Bold=1,Outline=4,MarginV=120',
  },
  {
    id: 'retro_vhs',
    name: 'Retro VHS',
    description: 'Glitchy scanline aesthetic with pink/cyan split — nostalgic viral',
    preview: {
      textColor: '#FF00FF',
      highlightColor: '#00FFFF',
      strokeColor: '#000000',
      background: 'linear-gradient(135deg, #0A0010 0%, #100020 100%)',
      fontWeight: '700',
      textTransform: 'uppercase',
      glow: '2px 0 8px rgba(255,0,255,0.6)',
      animation: 'glitch',
    },
    ffmpegStyle: 'FontName=Courier,FontSize=75,PrimaryColour=&H00FF00FF,OutlineColour=&H00000000,Bold=1,Outline=4,MarginV=120',
  },
  {
    id: 'podcast_studio',
    name: 'Podcast Studio',
    description: 'Elegant lower-third with speaker name badge — premium podcast look',
    preview: {
      textColor: '#E5E7EB',
      highlightColor: '#10B981',
      strokeColor: '#000000',
      background: 'linear-gradient(135deg, #111827 0%, #1F2937 100%)',
      fontWeight: '600',
      textTransform: 'none',
      animation: 'slide-up',
    },
    ffmpegStyle: 'FontName=Inter,FontSize=60,PrimaryColour=&H00E5E7EB,OutlineColour=&H00000000,Bold=0,Outline=2,MarginV=180',
  },
  {
    id: 'tiktok_gradient',
    name: 'TikTok Gradient',
    description: 'Active word pulses with gradient fill — built for TikTok virality',
    badge: '📱 TikTok',
    badgeColor: 'text-pink-400 bg-pink-400/10 border-pink-400/20',
    preview: {
      textColor: '#FFFFFF',
      highlightColor: '#FE2C55',
      strokeColor: '#000000',
      background: 'linear-gradient(135deg, #1A0A10 0%, #0F0F0F 100%)',
      fontWeight: '900',
      textTransform: 'uppercase',
      glow: '0 0 20px rgba(254,44,85,0.6)',
      animation: 'word-pop',
    },
    ffmpegStyle: 'FontName=Outfit,FontSize=80,PrimaryColour=&H002CC5FE,OutlineColour=&H00000000,Bold=1,Outline=4,MarginV=120',
  },
  {
    id: 'hinglish_podcast',
    name: 'Hinglish Podcast',
    description: 'Sentence case bold white text with heavy black stroke — optimized for Hinglish shorts',
    badge: '🎙️ Podcast',
    badgeColor: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    preview: {
      textColor: '#FFFFFF',
      highlightColor: '#FFFF00',
      strokeColor: '#000000',
      background: 'transparent',
      fontWeight: '900',
      textTransform: 'none',
      animation: 'word-pop',
    },
    ffmpegStyle: 'FontName=Outfit,FontSize=85,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,Bold=1,Outline=6,MarginV=150',
  },
];

// ─── Language Detection ──────────────────────────────────────────────────────

export interface DetectedLanguage {
  code: string;
  name: string;
  flag: string;
  rtl: boolean;
  recommended_style: CaptionStyleId;
}

const LANGUAGE_MAP: Record<string, DetectedLanguage> = {
  en:      { code: 'en',      name: 'English',    flag: '🇺🇸', rtl: false, recommended_style: 'neon_cyberpunk' },
  hi:      { code: 'hi',      name: 'Hindi',      flag: '🇮🇳', rtl: false, recommended_style: 'bold_impact'    },
  'hi-Latn':{ code: 'hi-Latn', name: 'Hinglish',   flag: '🇮🇳', rtl: false, recommended_style: 'hinglish_podcast'  },
  es:      { code: 'es',      name: 'Spanish',    flag: '🇪🇸', rtl: false, recommended_style: 'fire_word'      },
  pt:      { code: 'pt',      name: 'Portuguese', flag: '🇧🇷', rtl: false, recommended_style: 'tiktok_gradient' },
  fr:      { code: 'fr',      name: 'French',     flag: '🇫🇷', rtl: false, recommended_style: 'podcast_studio' },
  de:      { code: 'de',      name: 'German',     flag: '🇩🇪', rtl: false, recommended_style: 'minimal_clean'  },
  it:      { code: 'it',      name: 'Italian',    flag: '🇮🇹', rtl: false, recommended_style: 'fire_word'      },
  ar:      { code: 'ar',      name: 'Arabic',     flag: '🇸🇦', rtl: true,  recommended_style: 'bold_impact'    },
  zh:      { code: 'zh',      name: 'Chinese',    flag: '🇨🇳', rtl: false, recommended_style: 'minimal_clean'  },
  ja:      { code: 'ja',      name: 'Japanese',   flag: '🇯🇵', rtl: false, recommended_style: 'retro_vhs'      },
  ko:      { code: 'ko',      name: 'Korean',     flag: '🇰🇷', rtl: false, recommended_style: 'karaoke_highlight' },
  ru:      { code: 'ru',      name: 'Russian',    flag: '🇷🇺', rtl: false, recommended_style: 'bold_impact'    },
  id:      { code: 'id',      name: 'Indonesian', flag: '🇮🇩', rtl: false, recommended_style: 'neon_cyberpunk' },
  tr:      { code: 'tr',      name: 'Turkish',    flag: '🇹🇷', rtl: false, recommended_style: 'fire_word'      },
};

export function getLanguageInfo(code: string | null | undefined): DetectedLanguage {
  if (!code) return LANGUAGE_MAP['en'];
  // Normalise: hi-Latn means Hinglish (Hindi written in Latin script)
  const normalised = code.toLowerCase();
  if (LANGUAGE_MAP[normalised]) return LANGUAGE_MAP[normalised];
  const base = normalised.split('-')[0];
  return LANGUAGE_MAP[base] || {
    code: base,
    name: code,
    flag: '🌐',
    rtl: false,
    recommended_style: 'neon_cyberpunk',
  };
}

/**
 * Given a raw language code from Whisper and a transcript sample, determine
 * if the content is actually Hinglish (Hindi words written in Latin/English script).
 * Returns the refined language code ('hi-Latn' for Hinglish, original otherwise).
 */
export function detectHinglish(languageCode: string, transcriptSample: string): string {
  if (!languageCode.startsWith('hi')) return languageCode;
  // Count Latin characters vs Devanagari characters
  const latinChars = (transcriptSample.match(/[a-zA-Z]/g) || []).length;
  const devanagariChars = (transcriptSample.match(/[\u0900-\u097F]/g) || []).length;
  const total = latinChars + devanagariChars;
  if (total === 0) return languageCode;
  // If more than 60% Latin script, it’s Hinglish
  return latinChars / total > 0.6 ? 'hi-Latn' : languageCode;
}

export function getStyleById(id: CaptionStyleId | string): CaptionStyle {
  return CAPTION_STYLES.find(s => s.id === id) || CAPTION_STYLES[0];
}
