'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Mail, MessageSquare, Building2, ArrowRight, Send, Check,
  Sparkles, Clock, Home, MapPin, Globe,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AnimatedContainer,
  AnimatedItem,
  AnimatedCard,
  AnimatedGradientText,
  AnimatedSection,
} from '@/components/AnimatedSection';

const contactMethods = [
  {
    icon: <Mail className="w-6 h-6" />,
    title: 'General Inquiries',
    value: 'hello@clipflow.ai',
    desc: 'For general questions, partnerships, and non-urgent matters.',
    color: '#00E5FF',
  },
  {
    icon: <MessageSquare className="w-6 h-6" />,
    title: 'Support',
    value: '@ClipFlowSupport',
    desc: 'Fastest response on Twitter. Average reply time is under 2 hours.',
    color: '#1DA1F2',
  },
  {
    icon: <Building2 className="w-6 h-6" />,
    title: 'Enterprise Sales',
    value: 'enterprise@clipflow.ai',
    desc: 'Custom SLA, dedicated support, and volume pricing for organizations.',
    color: '#9945FF',
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: 'Discord Community',
    value: 'discord.gg/clipflow',
    desc: 'Real-time help from the community and engineering team.',
    color: '#5865F2',
  },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white relative overflow-hidden">
      <div className="fixed top-[-10%] left-[-5%] w-[600px] h-[600px] bg-[#00E5FF]/[0.03] rounded-full blur-[200px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#9945FF]/[0.03] rounded-full blur-[200px] pointer-events-none" />

      {/* Hero */}
      <AnimatedSection className="relative z-10 pt-36 pb-16 px-6">
        <AnimatedContainer className="max-w-7xl mx-auto">
          <AnimatedItem>
            <div className="flex items-center gap-2 text-sm text-gray-500 font-mono mb-6">
              <Link href="/" className="hover:text-white transition-colors flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5" /> Home
              </Link>
              <span>/</span>
              <span className="text-[#00E5FF]">Contact</span>
            </div>
          </AnimatedItem>
          <AnimatedItem>
            <Badge variant="info" size="lg" className="mb-6 px-4 py-1.5">
              <Sparkles className="w-3.5 h-3.5 mr-2 inline-block" />
              Get in Touch
            </Badge>
          </AnimatedItem>
          <AnimatedItem>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black font-heading tracking-tight leading-[0.95] mb-6">
              <AnimatedGradientText from="#00E5FF" via="#9945FF" to="#FF6B9D">
                Get in Touch
              </AnimatedGradientText>
            </h1>
          </AnimatedItem>
          <AnimatedItem>
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl leading-relaxed">
              Have a question, need support, or want to scale your video workflow?
              We&apos;re here to help. Average response time: under 2 hours.
            </p>
          </AnimatedItem>
        </AnimatedContainer>
      </AnimatedSection>

      <div className="relative z-10 px-6 pb-24">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12">
          {/* Left — Contact info */}
          <AnimatedContainer>
            <AnimatedItem>
              <div className="space-y-6 mb-10">
                {contactMethods.map((method, i) => (
                  <motion.div
                    key={method.title}
                    className="flex items-start gap-4 group cursor-default"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                  >
                    <div
                      className="mt-1 p-3.5 rounded-2xl border transition-all duration-300"
                      style={{ backgroundColor: `${method.color}10`, borderColor: `${method.color}20`, color: method.color }}
                    >
                      {method.icon}
                    </div>
                    <div className="pt-1">
                      <h3 className="text-base font-bold font-heading text-white">{method.title}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">{method.desc}</p>
                      <p className="text-sm font-mono mt-1" style={{ color: method.color }}>{method.value}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatedItem>

            {/* Office hours */}
            <AnimatedItem>
              <div className="p-6 rounded-2xl border border-white/[0.04] bg-white/[0.01]">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-5 h-5 text-[#00E5FF]" />
                  <h3 className="text-base font-bold font-heading">Office Hours & Response Time</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
                    <span className="text-gray-400">Email response time</span>
                    <span className="text-white font-medium">&lt; 4 hours</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
                    <span className="text-gray-400">Twitter response time</span>
                    <span className="text-white font-medium">&lt; 1 hour</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
                    <span className="text-gray-400">Enterprise support</span>
                    <span className="text-white font-medium">24/7 — 15 min SLA</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-400">Office hours (EST)</span>
                    <span className="text-white font-medium">Mon–Fri, 9AM–8PM</span>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {['99.9% Uptime', '24h Response', 'SOC 2'].map((badge) => (
                    <span key={badge} className="flex items-center gap-1.5 text-xs text-gray-600 font-mono">
                      <Check className="w-3 h-3 text-[#00FFA3]" /> {badge}
                    </span>
                  ))}
                </div>
              </div>
            </AnimatedItem>
          </AnimatedContainer>

          {/* Right — Form */}
          <AnimatedContainer>
            <AnimatedItem>
              <div className="p-8 md:p-10 rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00E5FF] to-transparent" />

                {submitted ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-20 h-20 rounded-full bg-[#00FFA3]/20 border border-[#00FFA3]/30 flex items-center justify-center mb-6">
                      <Check className="w-10 h-10 text-[#00FFA3]" />
                    </div>
                    <h3 className="text-2xl font-bold font-heading mb-2">Message Sent!</h3>
                    <p className="text-gray-400 text-center">We&apos;ll get back to you within 24 hours.</p>
                  </div>
                ) : (
                  <>
                    <h3 className="text-xl font-bold font-heading mb-6 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-[#00E5FF]" />
                      Send Us a Message
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Name</label>
                          <input
                            type="text"
                            required
                            placeholder="Your name"
                            className="w-full bg-black/40 border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF]/30 transition-all placeholder:text-gray-600"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email</label>
                          <input
                            type="email"
                            required
                            placeholder="you@example.com"
                            className="w-full bg-black/40 border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF]/30 transition-all placeholder:text-gray-600"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Subject</label>
                        <select
                          required
                          className="w-full bg-black/40 border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00E5FF] transition-all appearance-none"
                        >
                          <option className="bg-[#0A0B0E]" value="">Select a subject</option>
                          <option className="bg-[#0A0B0E]" value="support">Technical Support</option>
                          <option className="bg-[#0A0B0E]" value="sales">Enterprise Sales</option>
                          <option className="bg-[#0A0B0E]" value="partnership">Partnership</option>
                          <option className="bg-[#0A0B0E]" value="press">Press & Media</option>
                          <option className="bg-[#0A0B0E]" value="other">Other</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Message</label>
                        <textarea
                          rows={5}
                          required
                          placeholder="Tell us how we can help..."
                          className="w-full bg-black/40 border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF]/30 transition-all resize-none placeholder:text-gray-600"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-white text-black hover:bg-gray-200 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 group"
                      >
                        Send Message
                        <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </form>
                  </>
                )}
              </div>
            </AnimatedItem>
          </AnimatedContainer>
        </div>
      </div>
    </div>
  );
}
