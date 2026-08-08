'use client';

import { motion } from 'framer-motion';
import { Settings, Eye, Search, Cookie } from 'lucide-react';

export default function CookiePolicyPage() {
  const sections = [
    { id: 'what-are-cookies', title: '1. What Are Cookies?' },
    { id: 'how-we-use', title: '2. How We Use Them' },
    { id: 'third-party', title: '3. Third-Party Cookies' },
    { id: 'control', title: '4. Managing Your Preferences' },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-32 pb-24 selection:bg-[#00E5FF]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-12">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="sticky top-32">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Contents</h3>
            <nav className="flex flex-col space-y-2">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="text-gray-500 hover:text-[#00E5FF] transition-colors duration-200 text-sm"
                >
                  {section.title}
                </a>
              ))}
            </nav>
            <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-lg backdrop-blur-md">
              <Cookie className="w-6 h-6 text-[#00E5FF] mb-2" />
              <p className="text-xs text-gray-400">
                Last updated: May 26, 2026
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 max-w-4xl"
        >
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Cookie Policy</h1>
            <p className="text-xl text-gray-400 leading-relaxed">
              To provide our high-performance SaaS experience, ClipFlow uses cookies and similar tracking technologies. This policy explains what they are and why we use them.
            </p>
          </div>

          <div className="space-y-12 text-gray-300 leading-relaxed">
            <section id="what-are-cookies" className="scroll-mt-32">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <Search className="w-6 h-6 text-[#9945FF]" />
                1. What Are Cookies?
              </h2>
              <p className="mb-4">
                Cookies are small data files placed on your device when you visit our website or use our application. 
                They allow us to remember your state, maintain your session during long video rendering processes, and understand how you interact with our platform.
              </p>
            </section>

            <section id="how-we-use" className="scroll-mt-32">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <Settings className="w-6 h-6 text-[#00FFA3]" />
                2. How We Use Them
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                  <h4 className="text-white font-medium mb-1">Essential Cookies</h4>
                  <p className="text-sm text-gray-400">Required for the core functionality of ClipFlow. Includes authentication tokens, CSRF protection, and load balancer routing. Cannot be disabled.</p>
                </div>
                <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                  <h4 className="text-white font-medium mb-1">Performance & Analytics</h4>
                  <p className="text-sm text-gray-400">Help us understand how the UI performs. We track rendering times, error rates in the video player, and general application health.</p>
                </div>
                <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                  <h4 className="text-white font-medium mb-1">Functional Preferences</h4>
                  <p className="text-sm text-gray-400">Remembers your dark/light mode settings, default export resolution (e.g., 1080p, 4K), and timeline preferences.</p>
                </div>
              </div>
            </section>

            <section id="third-party" className="scroll-mt-32">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <Eye className="w-6 h-6 text-[#00E5FF]" />
                3. Third-Party Cookies
              </h2>
              <p className="mb-4">
                We may allow carefully vetted third-party services (such as Stripe for secure payment processing or PostHog for product analytics) to set cookies on your device. These are strictly limited to providing necessary services to ClipFlow.
              </p>
            </section>

            <section id="control" className="scroll-mt-32">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <Settings className="w-6 h-6 text-[#9945FF]" />
                4. Managing Your Preferences
              </h2>
              <p className="mb-4">
                You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept essential cookies, you will not be able to log in or use the video editor. 
                You can manage non-essential cookies via the "Cookie Preferences" link in your account settings.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
