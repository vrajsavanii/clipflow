'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, Sparkles, ChevronDown, Zap, Star } from 'lucide-react';
import { Footer } from '@/components/Footer';
import { AmbientBackground } from '@/components/AmbientBackground';
import { Button } from '@/components/ui/button';

const navLinks = [
  { name: 'Features', href: '/features' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Blog', href: '/blog' },
  { name: 'Documentation', href: '/documentation' },
  { name: 'Changelog', href: '/changelog' },
];

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans selection:bg-[#00E5FF]/30 selection:text-white">
      <AmbientBackground variant="marketing" />

      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 shadow-2xl shadow-black/20'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 md:h-20 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2.5 group">
            <motion.div
              whileHover={{ scale: 1.1, rotate: -5 }}
              className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-gradient-to-br from-[#9945FF] to-[#00E5FF] flex items-center justify-center font-bold text-black font-heading text-lg md:text-xl shadow-lg shadow-[#9945FF]/25 group-hover:shadow-[#00E5FF]/40 transition-all duration-300"
            >
              C
            </motion.div>
            <span className="font-heading font-black text-xl md:text-2xl tracking-tight">
              <span className="text-white group-hover:text-[#00E5FF] transition-colors">Clip</span>
              <span className="text-[#9945FF]">Flow</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((item, i) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
              >
                <Link
                  href={item.href}
                  className="relative px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                >
                  {item.name}
                </Link>
              </motion.div>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:flex text-sm font-bold text-gray-300 hover:text-white transition-colors px-4 py-2"
            >
              Log in
            </Link>
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center gap-2 text-sm font-bold bg-gradient-to-r from-[#9945FF] to-[#00E5FF] text-white px-5 py-2.5 rounded-xl hover:shadow-[0_0_25px_rgba(0,229,255,0.3)] transition-all shadow-lg"
              >
                <Sparkles className="w-4 h-4" />
                Start Free Trial
              </Link>
            </motion.div>
            <button
              className="md:hidden p-2 text-gray-400 hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <motion.div
          initial={false}
          animate={mobileMenuOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
          className="md:hidden overflow-hidden bg-[#0A0B0E]/95 backdrop-blur-xl border-b border-white/5"
        >
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all"
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-3 space-y-2 border-t border-white/5 mt-3">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center px-4 py-3 text-sm font-bold text-gray-300 hover:text-white border border-white/10 rounded-xl"
              >
                Log in
              </Link>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center px-4 py-3 text-sm font-bold bg-gradient-to-r from-[#9945FF] to-[#00E5FF] text-white rounded-xl"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.header>

      <main className="flex-1 relative z-10">{children}</main>

      <Footer />
    </div>
  );
}
