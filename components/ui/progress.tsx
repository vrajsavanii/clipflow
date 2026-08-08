'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ProgressProps {
  value: number
  max?: number
  className?: string
  barClassName?: string
  variant?: 'default' | 'gradient' | 'success' | 'warning' | 'danger'
  showLabel?: boolean
  size?: 'sm' | 'default' | 'lg'
  animated?: boolean
}

const variants = {
  default: 'bg-white/20',
  gradient: 'bg-gradient-to-r from-[#9945FF] via-[#00E5FF] to-[#00FFA3]',
  success: 'bg-[#00FFA3]',
  warning: 'bg-yellow-400',
  danger: 'bg-red-500',
}

const sizes = {
  sm: 'h-1',
  default: 'h-2',
  lg: 'h-3',
}

function Progress({
  value,
  max = 100,
  className,
  barClassName,
  variant = 'gradient',
  showLabel = false,
  size = 'default',
  animated = true,
}: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between text-xs font-mono text-gray-500 mb-1.5">
          <span>{Math.round(pct)}%</span>
          <span>{max}</span>
        </div>
      )}
      <div
        className={cn(
          'w-full rounded-full overflow-hidden bg-white/10 border border-white/5',
          sizes[size]
        )}
      >
        <motion.div
          className={cn(
            'h-full rounded-full relative',
            variants[variant],
            barClassName
          )}
          initial={animated ? { width: 0 } : undefined}
          animate={{ width: `${pct}%` }}
          transition={{
            duration: 0.8,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {variant === 'gradient' && (
            <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
          )}
        </motion.div>
      </div>
    </div>
  )
}

export { Progress }
