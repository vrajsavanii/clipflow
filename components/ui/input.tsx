import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, iconPosition = 'left', ...props }, ref) => {
    return (
      <div className="relative w-full">
        {icon && (
          <div
            className={cn(
              'absolute inset-y-0 flex items-center pointer-events-none text-gray-500',
              iconPosition === 'left' ? 'left-3' : 'right-3'
            )}
          >
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            'flex h-10 w-full rounded-xl border border-white/10 bg-[#0A0B0E] px-3 py-2 text-sm text-white placeholder:text-gray-600',
            'focus:outline-none focus:border-[#00E5FF]/50 focus:ring-1 focus:ring-[#00E5FF]/50',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'transition-all duration-200',
            icon && iconPosition === 'left' && 'pl-10',
            icon && iconPosition === 'right' && 'pr-10',
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
