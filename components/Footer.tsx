'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative border-t border-white/5 bg-[#050505] pt-24 pb-12 overflow-hidden mt-24">
      {/* Subtle Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#9945FF] rounded-full blur-[120px] opacity-10 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#00E5FF] rounded-full blur-[120px] opacity-10 -translate-y-1/2 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 lg:gap-8 mb-16">
          
          {/* Brand & Newsletter */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-[#9945FF] to-[#00E5FF] flex items-center justify-center font-bold text-black font-heading text-xl">C</div>
              <span className="font-heading font-black text-xl tracking-tight text-white">ClipFlow</span>
            </Link>
            <p className="text-sm text-gray-400 max-w-sm font-sans leading-relaxed">
              The AI-native creator operating system. Automate your short-form content pipeline and scale your brand without lifting a finger.
            </p>
            
            <div className="pt-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-3">Subscribe to updates</h4>
              <div className="flex items-center gap-2">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="bg-[#111317] border border-white/10 rounded-lg py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[#00E5FF]/50 transition-all w-full max-w-xs"
                />
                <button className="p-2.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/5 transition-colors text-white shrink-0">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest">Product</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link href="/features" className="hover:text-[#00E5FF] transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-[#00E5FF] transition-colors">Pricing</Link></li>
              <li><Link href="/changelog" className="hover:text-[#00E5FF] transition-colors">Changelog <span className="ml-2 text-[10px] bg-[#9945FF]/20 text-[#9945FF] px-1.5 py-0.5 rounded uppercase font-bold">New</span></Link></li>
              <li><Link href="/roadmap" className="hover:text-[#00E5FF] transition-colors">Roadmap</Link></li>
              <li><Link href="/integrations" className="hover:text-[#00E5FF] transition-colors">Integrations</Link></li>
            </ul>
          </div>

          {/* Resources Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest">Resources</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link href="/documentation" className="hover:text-[#00E5FF] transition-colors">Documentation</Link></li>
              <li><Link href="/api-reference" className="hover:text-[#00E5FF] transition-colors">API Reference</Link></li>
              <li><Link href="/blog" className="hover:text-[#00E5FF] transition-colors">Blog & Guides</Link></li>
              <li><Link href="/community" className="hover:text-[#00E5FF] transition-colors">Creator Community</Link></li>
              <li><Link href="/affiliates" className="hover:text-[#00E5FF] transition-colors">Affiliate Program</Link></li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest">Company</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link href="/about" className="hover:text-[#00E5FF] transition-colors">About Us</Link></li>
              <li><Link href="/careers" className="hover:text-[#00E5FF] transition-colors">Careers</Link></li>
              <li><Link href="/contact" className="hover:text-[#00E5FF] transition-colors">Contact</Link></li>
              <li><Link href="/brand" className="hover:text-[#00E5FF] transition-colors">Brand Assets</Link></li>
              <li><Link href="/status" className="hover:text-[#00E5FF] transition-colors flex items-center gap-2">System Status <span className="w-1.5 h-1.5 rounded-full bg-[#00FFA3] animate-pulse"></span></Link></li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest">Legal</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link href="/legal/privacy" className="hover:text-[#00E5FF] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/legal/terms" className="hover:text-[#00E5FF] transition-colors">Terms of Service</Link></li>
              <li><Link href="/legal/data-processing" className="hover:text-[#00E5FF] transition-colors">Data Processing</Link></li>
              <li><Link href="/legal/cookies" className="hover:text-[#00E5FF] transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-gray-500 font-mono">
            &copy; {new Date().getFullYear()} ClipFlow AI Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
