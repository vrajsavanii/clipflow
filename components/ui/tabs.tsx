'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface TabsProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
  className?: string
}

function Tabs({ value, onValueChange, children, className }: TabsProps) {
  return (
    <div className={cn('w-full', className)} data-value={value}>
      {children}
    </div>
  )
}

interface TabsListProps {
  children: React.ReactNode
  className?: string
}

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'inline-flex items-center gap-1 p-1 bg-white/5 border border-white/10 rounded-xl',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
TabsList.displayName = 'TabsList'

interface TabsTriggerProps {
  value: string
  children: React.ReactNode
  className?: string
  icon?: React.ReactNode
  disabled?: boolean
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ value, children, className, icon, disabled, ...props }, ref) => {
    const isActive = React.useContext(TabsContext) === value
    return (
      <button
        ref={ref}
        role="tab"
        disabled={disabled}
        onClick={() => {
          const ctx = React.useContext(TabsSetContext)
          ctx?.(value)
        }}
        className={cn(
          'relative inline-flex items-center gap-2 px-3 py-2 text-sm font-bold rounded-lg transition-all duration-200',
          isActive
            ? 'bg-white/10 text-white shadow-sm'
            : 'text-gray-500 hover:text-gray-300 hover:bg-white/5',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        {...props}
      >
        {icon && <span className="w-4 h-4">{icon}</span>}
        {children}
      </button>
    )
  }
)
TabsTrigger.displayName = 'TabsTrigger'

interface TabsContentProps {
  value: string
  children: React.ReactNode
  className?: string
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ value, children, className, ...props }, ref) => {
    const isActive = React.useContext(TabsContext) === value
    if (!isActive) return null
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className={cn('mt-4', className)}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)
TabsContent.displayName = 'TabsContent'

const TabsContext = React.createContext<string>('')
const TabsSetContext = React.createContext<((v: string) => void) | null>(null)

function TabsWrapper({ value, onValueChange, children, className }: TabsProps) {
  return (
    <TabsContext.Provider value={value}>
      <TabsSetContext.Provider value={onValueChange}>
        <div className={className}>{children}</div>
      </TabsSetContext.Provider>
    </TabsContext.Provider>
  )
}

export { TabsWrapper as Tabs, TabsList, TabsTrigger, TabsContent }
