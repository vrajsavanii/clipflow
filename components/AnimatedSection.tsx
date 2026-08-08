'use client';

import { motion, type Variants } from 'framer-motion';
import { useRef } from 'react';
import { cn } from '@/lib/utils';
import { fadeInUp, staggerContainer } from '@/lib/animations';

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  variants?: Variants;
  delay?: number;
  once?: boolean;
  as?: 'section' | 'div' | 'article' | 'header' | 'footer';
  id?: string;
}

export function AnimatedSection({
  children,
  className,
  variants = fadeInUp,
  delay = 0,
  once = true,
  as = 'section',
  id,
}: AnimatedSectionProps) {
  const Component = motion[as];
  return (
    <Component
      id={id}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-60px' }}
      variants={variants}
      className={className}
      transition={{ delay }}
    >
      {children}
    </Component>
  );
}

interface AnimatedContainerProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  once?: boolean;
}

export function AnimatedContainer({
  children,
  className,
  delay = 0,
  once = true,
}: AnimatedContainerProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-40px' }}
      variants={staggerContainer}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedItemProps {
  children: React.ReactNode;
  className?: string;
  variants?: Variants;
}

export function AnimatedItem({
  children,
  className,
  variants = fadeInUp,
}: AnimatedItemProps) {
  return (
    <motion.div variants={variants} className={className}>
      {children}
    </motion.div>
  );
}

interface AnimatedTextProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';
}

export function AnimatedText({
  children,
  className,
  delay = 0,
  as = 'p',
}: AnimatedTextProps) {
  const Component = motion[as];
  return (
    <Component
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay }}
      className={className}
    >
      {children}
    </Component>
  );
}

interface AnimatedNumberProps {
  value: number;
  className?: string;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export function AnimatedNumber({
  value,
  className,
  duration = 2,
  prefix = '',
  suffix = '',
  decimals = 0,
}: AnimatedNumberProps) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className={className}
    >
      <motion.span
        initial={{ count: 0 } as any}
        whileInView={{ count: value } as any}
        viewport={{ once: true }}
        transition={{ duration, ease: [0.16, 1, 0.3, 1] }}
      >
        {prefix}{value.toFixed(decimals)}{suffix}
      </motion.span>
    </motion.span>
  );
}

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  index?: number;
}

export function AnimatedCard({
  children,
  className,
  delay = 0,
  index = 0,
}: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{
        duration: 0.5,
        delay: delay + index * 0.08,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{
        y: -6,
        scale: 1.02,
        transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
      }}
      className={cn('transition-shadow duration-300', className)}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedGradientTextProps {
  children: React.ReactNode;
  className?: string;
  from?: string;
  via?: string;
  to?: string;
}

export function AnimatedGradientText({
  children,
  className,
  from = '#9945FF',
  via = '#00E5FF',
  to = '#0066FF',
}: AnimatedGradientTextProps) {
  return (
    <motion.span
      className={cn('bg-clip-text text-transparent', className)}
      style={{
        backgroundImage: `linear-gradient(135deg, ${from}, ${via}, ${to})`,
        backgroundSize: '200% 200%',
      }}
      animate={{
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.span>
  );
}
