'use client';

import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, PlayCircle, Plus } from 'lucide-react';
import Link from 'next/link';
import { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon: ReactNode;
  primaryAction: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  demoAction?: {
    label: string;
    onClick: () => void;
  };
  features?: string[];
}

export function EmptyState({ 
  title, 
  description, 
  icon, 
  primaryAction, 
  demoAction,
  features 
}: EmptyStateProps) {
  return (
    <div className="w-full relative overflow-hidden">
      {/* Background Neural Effects */}
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-[#9945FF] rounded-full blur-[100px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-[#00E5FF] rounded-full blur-[100px]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-50 mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 glass-panel border border-white/5 rounded-3xl p-8 md:p-16 text-center max-w-4xl mx-auto shadow-2xl">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-[#111317] to-[#050505] border border-white/10 shadow-inner flex items-center justify-center mb-6 relative group"
        >
          <div className="absolute inset-0 bg-[#00E5FF]/20 rounded-2xl blur-xl group-hover:bg-[#00E5FF]/40 transition-colors pointer-events-none"></div>
          <div className="text-[#00E5FF] scale-150 relative z-10">{icon}</div>
        </motion.div>

        <motion.h2 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl md:text-5xl font-black font-heading mb-4 text-white tracking-tight"
        >
          {title}
        </motion.h2>

        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-gray-400 text-lg max-w-xl mx-auto leading-relaxed mb-10"
        >
          {description}
        </motion.p>

        {features && features.length > 0 && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4 mb-10"
          >
            {features.map((feature, i) => (
              <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5 text-sm text-gray-300">
                <Sparkles className="w-4 h-4 text-[#9945FF]" />
                {feature}
              </div>
            ))}
          </motion.div>
        )}

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row justify-center gap-4"
        >
          {primaryAction.href ? (
            <Link 
              href={primaryAction.href}
              className="px-8 py-4 bg-gradient-to-r from-[#9945FF] to-[#00E5FF] hover:opacity-90 transition-opacity rounded-xl text-black font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,229,255,0.3)] group"
            >
              {primaryAction.label}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : (
            <button 
              onClick={primaryAction.onClick}
              className="px-8 py-4 bg-gradient-to-r from-[#9945FF] to-[#00E5FF] hover:opacity-90 transition-opacity rounded-xl text-black font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,229,255,0.3)] group"
            >
              <Plus className="w-5 h-5" />
              {primaryAction.label}
            </button>
          )}

          {demoAction && (
            <button 
              onClick={demoAction.onClick}
              className="px-8 py-4 bg-[#111317] border border-white/10 hover:bg-white/5 transition-colors rounded-xl text-white font-bold flex items-center justify-center gap-2"
            >
              <PlayCircle className="w-5 h-5 text-[#00E5FF]" />
              {demoAction.label}
            </button>
          )}
        </motion.div>
      </div>
    </div>
  );
}
