'use client';

import { motion } from 'framer-motion';

export default function DashboardLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 relative z-10">
      {/* Welcome Banner Mock */}
      <div className="flex flex-col gap-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-white/10"></div>
          <div className="space-y-2">
            <div className="h-6 w-64 bg-white/10 rounded-lg"></div>
            <div className="h-3 w-48 bg-white/5 rounded"></div>
          </div>
        </motion.div>
        <div className="h-8 w-48 bg-[#9945FF]/10 rounded-full"></div>
      </div>

      {/* Metrics Row Mock */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-panel p-5 rounded-2xl border border-white/5"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="h-3 w-20 bg-white/10 rounded"></div>
              <div className="w-10 h-10 rounded-xl bg-white/5"></div>
            </div>
            <div className="h-8 w-24 bg-white/10 rounded mb-2"></div>
            <div className="h-3 w-16 bg-white/5 rounded"></div>
          </motion.div>
        ))}
      </div>

      {/* Main Grid Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Action Widget Mock */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut', delay: 0.2 }}
            className="glass-panel h-32 rounded-2xl border border-white/10 bg-white/5"
          />

          {/* Recent Projects Mock */}
          <div className="space-y-4">
            <div className="flex justify-between items-end px-1">
              <div className="h-5 w-32 bg-white/10 rounded"></div>
              <div className="h-3 w-16 bg-white/5 rounded"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.06 }}
                  className="glass-panel h-40 rounded-2xl border border-white/5 bg-white/5"
                >
                  <div className="p-4 space-y-3">
                    <div className="flex gap-3">
                      <div className="w-20 h-20 rounded-xl bg-white/10"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 bg-white/10 rounded"></div>
                        <div className="h-3 w-1/2 bg-white/5 rounded"></div>
                        <div className="h-6 w-24 bg-[#00E5FF]/10 rounded"></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut', delay: 0.4 }}
            className="glass-panel h-64 rounded-2xl border border-white/5 bg-white/5"
          />
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut', delay: 0.5 }}
            className="glass-panel h-48 rounded-2xl border border-white/5 bg-white/5"
          />
        </div>
      </div>
    </div>
  );
}
