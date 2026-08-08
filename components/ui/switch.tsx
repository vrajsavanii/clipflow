'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface SwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  className?: string
  size?: 'default' | 'sm'
  label?: string
}

const sizes = {
  sm: { track: 'w-8 h-5', thumb: 'w-3.5 h-3.5', translateX: 'translate-x-3' },
  default: { track: 'w-11 h-6', thumb: 'w-5 h-5', translateX: 'translate-x-5' },
}

function Switch({
  checked,
  onCheckedChange,
  disabled = false,
  className,
  size = 'default',
  label,
}: SwitchProps) {
  const s = sizes[size]

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'inline-flex items-center gap-3',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <motion.div
        className={cn(
          s.track,
          'rounded-full p-0.5 transition-colors duration-200',
          checked
            ? 'bg-gradient-to-r from-[#9945FF] to-[#00E5FF]'
            : 'bg-white/10 border border-white/10'
        )}
        animate={checked ? 'on' : 'off'}
      >
        <motion.div
          className={cn(
            s.thumb,
            'bg-white rounded-full shadow-md'
          )}
          animate={checked ? { x: size === 'sm' ? 12 : 20 } : { x: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </motion.div>
      {label && (
        <span className="text-sm text-gray-400">{label}</span>
      )}
    </button>
  )
}

export { Switch }
