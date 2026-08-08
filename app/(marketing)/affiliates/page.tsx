'use client';

import { motion } from 'framer-motion';
import { DollarSign, BarChart3, Link as LinkIcon, Gift, ArrowRight } from 'lucide-react';
import { useState } from 'react';

export default function AffiliatesPage() {
  const [referrals, setReferrals] = useState(50);
  const avgSubscriptionValue = 49;
  const commissionRate = 0.30;
  
  const monthlyEarnings = Math.round(referrals * avgSubscriptionValue * commissionRate);

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/20 text-[#00E5FF] text-xs font-medium mb-6">
              <DollarSign className="w-3 h-3" />
              <span>Partner Program</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
              Turn your audience into <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#00FFA3]">recurring revenue.</span>
            </h1>
            <p className="text-xl text-gray-400 mb-8 leading-relaxed">
              Join the ClipFlow Partner Program and earn a massive 30% recurring commission for life. The best AI product converts itself.
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center mr-4">
                  <span className="text-[#00FFA3] text-sm">✓</span>
                </div>
                <span className="text-gray-300">30% Lifetime Recurring Commission</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center mr-4">
                  <span className="text-[#00FFA3] text-sm">✓</span>
                </div>
                <span className="text-gray-300">90-Day Cookie Tracking</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center mr-4">
                  <span className="text-[#00FFA3] text-sm">✓</span>
                </div>
                <span className="text-gray-300">Instant Monthly Payouts</span>
              </div>
            </div>

            <button className="px-8 py-4 rounded-full bg-[#00E5FF] text-black font-bold text-lg hover:bg-[#00E5FF]/90 transition-all hover:scale-105 duration-300 flex items-center">
              Apply to Partner <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </motion.div>

          {/* Calculator Card */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-32 bg-[#00E5FF]/10 blur-[100px] pointer-events-none rounded-full" />
            
            <h3 className="text-2xl font-bold mb-2">Earnings Calculator</h3>
            <p className="text-gray-400 text-sm mb-8">Estimate your monthly recurring payout based on active referrals.</p>

            <div className="mb-8">
              <div className="flex justify-between text-sm mb-4">
                <span className="text-gray-300">Active Referrals</span>
                <span className="font-bold text-[#00E5FF]">{referrals} Users</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="500" 
                value={referrals}
                onChange={(e) => setReferrals(parseInt(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#00E5FF]"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>1</span>
                <span>500+</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-black/50 border border-white/5 mb-4">
              <div className="text-sm text-gray-400 mb-1">Estimated Monthly Earnings</div>
              <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                ${monthlyEarnings.toLocaleString()}
                <span className="text-xl text-gray-500 font-normal">/mo</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 text-center">
              *Calculated using our $49/mo Pro plan average. Enterprise referrals pay out custom amounts.
            </p>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
            <LinkIcon className="w-8 h-8 text-[#9945FF] mb-4" />
            <h4 className="text-lg font-bold mb-2">1. Get your Link</h4>
            <p className="text-sm text-gray-400">Apply to the program and receive your custom tracking dashboard and unique affiliate link immediately.</p>
          </div>
          <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
            <BarChart3 className="w-8 h-8 text-[#00E5FF] mb-4" />
            <h4 className="text-lg font-bold mb-2">2. Share with Audience</h4>
            <p className="text-sm text-gray-400">Drop your link in YouTube descriptions, Twitter threads, or your newsletter. We provide high-converting assets.</p>
          </div>
          <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
            <Gift className="w-8 h-8 text-[#00FFA3] mb-4" />
            <h4 className="text-lg font-bold mb-2">3. Earn Forever</h4>
            <p className="text-sm text-gray-400">Get paid on the 1st of every month via Stripe or PayPal. You earn 30% for as long as the user stays active.</p>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
