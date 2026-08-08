'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  end: number;
  label: string;
  prefix?: string;
  suffix?: string;
  duration?: number;
}

export default function AnimatedCounter({ end, label, prefix = '', suffix = '', duration = 2000 }: Props) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start    = performance.now();
          const animate  = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * end));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration]);

  const display = count >= 1000
    ? count >= 1_000_000
      ? (count / 1_000_000).toFixed(1) + 'M'
      : (count / 1000).toFixed(0) + 'K'
    : count.toString();

  return (
    <div ref={ref} style={{ textAlign: 'center' }}>
      <div style={{
        fontSize: '2.5rem',
        fontWeight: 800,
        background: 'linear-gradient(135deg, #00FFFF, #8B5CF6)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        lineHeight: 1.1,
        fontFamily: 'Inter, sans-serif',
      }}>
        {prefix}{display}{suffix}
      </div>
      <div style={{
        marginTop: '0.35rem',
        fontSize: '0.85rem',
        color: 'rgba(255,255,255,0.55)',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        fontWeight: 500,
      }}>
        {label}
      </div>
    </div>
  );
}
