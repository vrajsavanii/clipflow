import * as React from 'react'
import { cn } from '@/lib/utils'

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
  initials?: string
  size?: 'sm' | 'default' | 'lg' | 'xl'
  status?: 'online' | 'offline' | 'busy' | 'away' | 'none'
  gradient?: boolean
}

const sizes = {
  sm: 'w-8 h-8 text-xs',
  default: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
}

const statusColors = {
  online: 'bg-[#00FFA3]',
  offline: 'bg-gray-500',
  busy: 'bg-red-500',
  away: 'bg-yellow-400',
  none: 'hidden',
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, initials, size = 'default', status = 'none', gradient = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center rounded-full shrink-0',
          sizes[size],
          gradient
            ? 'bg-gradient-to-tr from-[#9945FF] to-[#00E5FF]'
            : 'bg-white/10',
          className
        )}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={alt || ''}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <span className="font-bold text-white leading-none">
            {initials || '?'}
          </span>
        )}
        {status !== 'none' && (
          <span
            className={cn(
              'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#050505]',
              statusColors[status]
            )}
          />
        )}
      </div>
    )
  }
)
Avatar.displayName = 'Avatar'

export { Avatar }
