'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export function LiveTimer({ createdAt, progress, className = '' }: { createdAt: string; progress: number; className?: string }) {
  const [elapsed, setElapsed] = useState<string>('00:00');
  const [eta, setEta] = useState<string>('Estimating...');

  useEffect(() => {
    const startMs = new Date(createdAt || Date.now()).getTime();

    const interval = setInterval(() => {
      const nowMs = Date.now();
      const diffSec = Math.max(0, Math.floor((nowMs - startMs) / 1000));
      
      const mins = Math.floor(diffSec / 60);
      const secs = diffSec % 60;
      setElapsed(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);

      // Calculate estimated time remaining based on 5-minute max processing target
      const maxTargetSec = 300; // 5 minutes max target for 1 hour video
      const remainingSec = Math.max(0, maxTargetSec - diffSec);

      if (progress >= 100) {
        setEta('Done');
      } else if (diffSec > 900 && progress < 90) {
        setEta('Waiting for Worker Server...');
      } else if (progress <= 15) {
        setEta('Queued (~5m left)');
      } else if (remainingSec > 60) {
        setEta(`~${Math.ceil(remainingSec / 60)}m left`);
      } else if (remainingSec > 0) {
        setEta(`~${Math.ceil(remainingSec)}s left`);
      } else {
        setEta('Almost done...');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [createdAt, progress]);

  const isStalled = eta === 'Waiting for Worker Server...';

  return (
    <div className={`flex items-center gap-2 font-mono text-[10px] sm:text-xs ${className}`}>
      <div className={`flex items-center gap-1 ${isStalled ? 'text-red-400' : 'text-[#00E5FF]'}`}>
        <Clock className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${!isStalled && 'animate-pulse'}`} />
        <span>{elapsed}</span>
      </div>
      <span className="text-gray-600">|</span>
      <span className={isStalled ? 'text-red-400 font-bold' : 'text-[#9945FF]'}>{eta}</span>
    </div>
  );
}
