'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Orb {
  color: string;
  size: number;
  top: string;
  left: string;
  delay: number;
  duration: number;
}

interface AmbientBackgroundProps {
  variant?: 'default' | 'dashboard' | 'marketing' | 'minimal';
  className?: string;
  orbs?: Orb[];
}

const defaultOrbs: Orb[] = [
  { color: '#9945FF', size: 400, top: '-10%', left: '-5%', delay: 0, duration: 20 },
  { color: '#00E5FF', size: 350, top: '40%', left: '70%', delay: 3, duration: 25 },
  { color: '#0066FF', size: 300, top: '70%', left: '20%', delay: 6, duration: 22 },
  { color: '#9945FF', size: 250, top: '20%', left: '50%', delay: 9, duration: 18 },
];

const dashboardOrbs: Orb[] = [
  { color: '#9945FF', size: 300, top: '-8%', left: '-3%', delay: 0, duration: 22 },
  { color: '#00E5FF', size: 250, top: '50%', left: '80%', delay: 4, duration: 20 },
  { color: '#00FFA3', size: 200, top: '80%', left: '10%', delay: 8, duration: 25 },
];

const minimalOrbs: Orb[] = [
  { color: '#9945FF', size: 250, top: '-5%', left: '10%', delay: 0, duration: 20 },
  { color: '#00E5FF', size: 200, top: '60%', left: '75%', delay: 5, duration: 22 },
];

export function AmbientBackground({
  variant = 'default',
  className,
  orbs,
}: AmbientBackgroundProps) {
  let activeOrbs: Orb[];
  switch (variant) {
    case 'dashboard':
      activeOrbs = dashboardOrbs;
      break;
    case 'minimal':
      activeOrbs = minimalOrbs;
      break;
    case 'marketing':
      activeOrbs = defaultOrbs;
      break;
    default:
      activeOrbs = orbs || defaultOrbs;
  }

  return (
    <div className={cn('fixed inset-0 pointer-events-none overflow-hidden -z-10', className)}>
      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Glowing orbs */}
      {activeOrbs.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-[120px]"
          style={{
            width: orb.size,
            height: orb.size,
            top: orb.top,
            left: orb.left,
            background: `radial-gradient(circle, ${orb.color}40 0%, ${orb.color}10 50%, transparent 70%)`,
          }}
          animate={{
            x: [0, 40, -30, 20, 0],
            y: [0, -50, 30, -20, 0],
            scale: [1, 1.15, 0.95, 1.1, 1],
            opacity: [0.3, 0.5, 0.25, 0.45, 0.3],
          }}
          transition={{
            duration: orb.duration,
            delay: orb.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Vignette overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80 pointer-events-none" />
    </div>
  );
}

export function GradientBorder({ className }: { className?: string }) {
  return (
    <div
      className={cn('absolute inset-0 rounded-[inherit] pointer-events-none overflow-hidden', className)}
    >
      <motion.div
        className="absolute inset-[-1px] rounded-[inherit] opacity-50"
        style={{
          background: 'conic-gradient(from 0deg, #9945FF, #00E5FF, #0066FF, #9945FF)',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          padding: '1px',
        }}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

export function NoiseOverlay({ className, opacity = 0.4 }: { className?: string; opacity?: number }) {
  return (
    <div
      className={cn('absolute inset-0 pointer-events-none mix-blend-overlay', className)}
      style={{
        opacity,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        backgroundSize: '256px 256px',
      }}
    />
  );
}
