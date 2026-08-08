import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'bg-white/10 text-white border border-white/10',
        primary: 'bg-[#9945FF]/10 text-[#9945FF] border border-[#9945FF]/20',
        secondary: 'bg-white/5 text-gray-400 border border-white/10',
        success: 'bg-[#00FFA3]/10 text-[#00FFA3] border border-[#00FFA3]/20',
        warning: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
        danger: 'bg-red-500/10 text-red-400 border border-red-500/20',
        info: 'bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20',
        outline: 'bg-transparent border border-white/20 text-gray-300',
        premium: 'bg-gradient-to-r from-[#9945FF] to-[#00E5FF] text-white border-transparent shadow-lg',
      },
      size: {
        default: 'px-2.5 py-0.5 text-xs',
        sm: 'px-2 py-0.5 text-[10px]',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}

export interface SparkScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function SparkScoreBadge({ score, size = 'md', className }: SparkScoreBadgeProps) {
  const rounded = Math.min(100, Math.max(0, Math.round(score)));

  let bgClass = 'bg-white/10 text-gray-400 border border-white/10';
  if (rounded >= 80) {
    bgClass = 'bg-gradient-to-r from-[#00FF88] to-[#00FFCC] text-black font-black shadow-[0_0_15px_rgba(0,255,136,0.4)] border-transparent';
  } else if (rounded >= 60) {
    bgClass = 'bg-gradient-to-r from-[#00D4FF] to-[#8B5CF6] text-white font-extrabold shadow-[0_0_15px_rgba(0,212,255,0.3)] border-transparent';
  } else if (rounded >= 40) {
    bgClass = 'bg-gradient-to-r from-[#FF9F0A] to-[#FF6B35] text-white font-bold border-transparent';
  }

  const sizeClasses = {
    sm: 'h-6 px-2 text-[11px] gap-1',
    md: 'h-8 px-3 text-xs gap-1.5',
    lg: 'w-12 h-12 rounded-full text-base flex flex-col items-center justify-center p-0',
  }[size];

  return (
    <div className={cn('inline-flex items-center justify-center rounded-full font-heading tracking-tight', bgClass, sizeClasses, className)}>
      <span>⚡</span>
      <span>{rounded}</span>
    </div>
  );
}

export { Badge, badgeVariants }
