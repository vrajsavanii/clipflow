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

export { Badge, badgeVariants }
