'use client';

import { useEffect, useRef, useCallback } from 'react';

interface AutoRefreshProps {
  intervalMs?: number;
  onTick?: () => void;
}

/**
 * Calls onTick at interval WITHOUT a full page router.refresh().
 * If no onTick provided, does nothing (use SSE/polling hooks instead).
 */
export function AutoRefresh({ intervalMs = 5000, onTick }: AutoRefreshProps) {
  const savedCallback = useRef(onTick);
  savedCallback.current = onTick;

  const tick = useCallback(() => {
    savedCallback.current?.();
  }, []);

  useEffect(() => {
    if (!onTick) return;
    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
  }, [onTick, intervalMs, tick]);

  return null;
}
