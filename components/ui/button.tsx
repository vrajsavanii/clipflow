import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] select-none',
  {
    variants: {
      variant: {
        default: 'bg-white text-black hover:bg-gray-200 shadow-lg hover:shadow-xl',
        primary: 'bg-gradient-to-r from-[#9945FF] to-[#00E5FF] text-white hover:opacity-90 shadow-[0_0_20px_rgba(0,229,255,0.2)]',
        secondary: 'bg-white/10 text-white hover:bg-white/20 border border-white/10',
        ghost: 'bg-transparent text-gray-400 hover:text-white hover:bg-white/5',
        destructive: 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20',
        outline: 'bg-transparent border border-white/20 text-white hover:bg-white/5 hover:border-white/40',
        link: 'text-[#00E5FF] underline-offset-4 hover:underline bg-transparent',
        cyan: 'bg-gradient-to-r from-[#00E5FF] to-[#0099FF] text-black hover:shadow-[0_0_20px_rgba(0,229,255,0.4)]',
        purple: 'bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] text-white hover:shadow-[0_0_20px_rgba(139,92,246,0.4)]',
        green: 'bg-gradient-to-r from-[#00FFA3] to-[#00D4AA] text-black hover:shadow-[0_0_20px_rgba(0,255,163,0.4)]',
        pink: 'bg-gradient-to-r from-[#FF6B9D] to-[#FF0055] text-white hover:shadow-[0_0_20px_rgba(255,107,157,0.4)]',
        rainbow: 'relative text-white overflow-hidden bg-gradient-to-r from-[#9945FF] via-[#00E5FF] to-[#9945FF] bg-[length:300%_300%] animate-[gradient-shift_4s_ease-in-out_infinite]',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-6 text-base',
        xl: 'h-14 px-8 text-lg',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
