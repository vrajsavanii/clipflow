'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, X, Sparkles, Zap, BarChart, Video, Globe, Palette,
  Smartphone, Clock, Users, ArrowRight, HelpCircle, Star, ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

const plans = [
  {
    name: 'Starter',
    tagline: 'Perfect for getting started',
    monthlyPrice: '$0',
    annualPrice: '$0',
    period: '/mo',
    description: 'Free forever. No credit card needed.',
    cta: 'Get Started Free',
    href: '/login',
    popular: false,
    features: [
      { text: '30 minutes of processing per month', included: true },
      { text: '5 credits per month', included: true },
      { text: 'Basic AI captions', included: true },
      { text: '720p export quality', included: true },
      { text: 'Community support', included: true },
      { text: 'Custom brand kit', included: false },
      { text: 'Bulk export', included: false },
      { text: 'Priority support', included: false },
    ],
  },
  {
    name: 'Pro',
    tagline: 'For serious creators',
    monthlyPrice: '$29',
    annualPrice: '$23',
    period: '/mo',
    description: 'Everything you need to scale your content.',
    cta: 'Start Free Trial',
    href: '/login',
    popular: true,
    features: [
      { text: '300 minutes of processing per month', included: true },
      { text: '100 credits per month', included: true },
      { text: 'All AI caption styles', included: true },
      { text: '1080p export quality', included: true },
      { text: 'Priority support', included: true },
      { text: 'Custom brand kit', included: true },
      { text: 'Bulk export', included: true },
      { text: 'Priority support', included: true },
    ],
  },
  {
    name: 'Enterprise',
    tagline: 'Built for teams',
    monthlyPrice: 'Custom',
    annualPrice: 'Custom',
    period: '',
    description: 'Tailored solutions for organizations.',
    cta: 'Contact Sales',
    href: '/contact',
    popular: false,
    features: [
      { text: 'Unlimited processing', included: true },
      { text: 'Unlimited credits', included: true },
      { text: 'Custom AI model fine-tuning', included: true },
      { text: '4K export quality', included: true },
      { text: 'Dedicated support team', included: true },
      { text: 'Team workspace', included: true },
      { text: 'API access & webhooks', included: true },
      { text: '99.9% SLA guarantee', included: true },
    ],
  },
];

const featureRows = [
  { label: 'Processing per month', starter: '30 min', pro: '300 min', enterprise: 'Unlimited' },
  { label: 'Credits per month', starter: '5', pro: '100', enterprise: 'Unlimited' },
  { label: 'Export quality', starter: '720p', pro: '1080p', enterprise: '4K' },
  { label: 'AI captions', starter: true, pro: true, enterprise: true },
  { label: 'Custom brand kit', starter: false, pro: true, enterprise: true },
  { label: 'Bulk export', starter: false, pro: true, enterprise: true },
  { label: 'Priority support', starter: false, pro: true, enterprise: true },
  { label: 'Dedicated support', starter: false, pro: false, enterprise: true },
  { label: 'Team workspace', starter: false, pro: false, enterprise: true },
  { label: 'API access', starter: false, pro: false, enterprise: true },
  { label: 'Custom AI model', starter: false, pro: false, enterprise: true },
  { label: 'SLA guarantee', starter: false, pro: false, enterprise: true },
];

const faqItems = [
  {
    q: 'How does the free plan work?',
    a: 'The Starter plan gives you 30 minutes of processing and 5 credits per month at no cost. No credit card required. You can upgrade to Pro anytime to unlock more processing power and features.',
  },
  {
    q: 'What happens when I hit my processing limit?',
    a: 'Your processing will pause until the next billing cycle or until you upgrade to a higher tier. You can monitor your usage in the dashboard. Pro users get alerts at 80% and 100% usage.',
  },
  {
    q: 'Can I switch between plans?',
    a: 'Yes, you can upgrade or downgrade at any time. Upgrades take effect immediately. Downgrades apply at the start of your next billing cycle. No penalties or hidden fees.',
  },
  {
    q: 'Do you offer refunds?',
    a: 'Yes! We offer a 7-day money-back guarantee on all paid plans. If you\'re not satisfied, contact our support team for a full refund — no questions asked.',
  },
  {
    q: 'Can I use ClipFlow for commercial projects?',
    a: 'Absolutely. Both Pro and Enterprise plans include full commercial usage rights. Your clips are yours to publish, monetize, and distribute anywhere.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit cards, PayPal, and for Enterprise plans we support wire transfers and net-30 invoicing. All payments are processed securely through Stripe.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
};

function CheckIcon({ className }: { className?: string }) {
  return (
    <div className={`w-5 h-5 rounded-full bg-[#00FFA3]/20 flex items-center justify-center shrink-0 ${className ?? ''}`}>
      <Check className="w-3 h-3 text-[#00FFA3]" />
    </div>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <div className={`w-5 h-5 rounded-full bg-white/5 flex items-center justify-center shrink-0 ${className ?? ''}`}>
      <X className="w-3 h-3 text-gray-600" />
    </div>
  );
}

function PricingCard({ plan, index, annual }: { plan: typeof plans[0]; index: number; annual: boolean }) {
  const price = annual ? plan.annualPrice : plan.monthlyPrice;

  return (
    <motion.div
      variants={itemVariants}
      className="relative group"
    >
      {plan.popular && (
        <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-[#9945FF] via-[#00E5FF] to-[#9945FF] opacity-40 blur-sm animate-pulse z-0" />
      )}
      <div className={`relative z-10 h-full flex flex-col rounded-2xl border p-8 transition-all duration-300 ${
        plan.popular
          ? 'border-[#9945FF]/40 bg-[#0A0B0E] shadow-[0_0_60px_rgba(153,69,255,0.15)]'
          : 'border-white/5 bg-[#0A0B0E]/80 hover:border-white/20 hover:shadow-[0_0_40px_rgba(153,69,255,0.05)]'
      }`}>
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />

        {plan.popular && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
            <Badge variant="premium" size="sm" className="gap-1 px-4 py-1">
              <Sparkles className="w-3 h-3" /> Most Popular
            </Badge>
          </div>
        )}

        <div className="mb-6 relative z-10">
          <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
          <p className="text-sm text-gray-500 mb-4">{plan.tagline}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-black text-white">{price}</span>
            {plan.period && (
              <span className="text-gray-500 text-sm">{plan.period}</span>
            )}
          </div>
          {annual && plan.monthlyPrice !== 'Custom' && price !== 'Custom' ? (
            <p className="text-xs text-[#00FFA3] mt-1 font-medium">
              ${parseInt(plan.monthlyPrice.replace('$', ''), 10) * 12 - parseInt(plan.annualPrice.replace('$', ''), 10) * 12}/yr saved
            </p>
          ) : (
            <p className="text-xs text-gray-600 mt-1">{plan.description}</p>
          )}
        </div>

        <Link href={plan.href} className="block mb-8 relative z-10">
          <Button
            variant={plan.popular ? 'primary' : 'secondary'}
            size="xl"
            className="w-full text-sm"
          >
            {plan.cta}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>

        <ul className="space-y-3 flex-1 relative z-10">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-start gap-3 text-sm">
              {feature.included ? (
                <CheckIcon />
              ) : (
                <XIcon />
              )}
              <span className={feature.included ? 'text-gray-300' : 'text-gray-600'}>
                {feature.text}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

function FeatureTable() {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={containerVariants}
      className="overflow-x-auto"
    >
      <table className="w-full min-w-[600px] border-collapse">
        <thead>
          <tr className="border-b border-white/5">
            <th className="text-left py-4 pr-8 text-sm font-bold text-gray-400">Feature</th>
            <th className="text-center py-4 px-4 text-sm font-bold text-gray-400">Starter</th>
            <th className="text-center py-4 px-4 text-sm font-bold text-[#9945FF]">Pro</th>
            <th className="text-center py-4 pl-4 text-sm font-bold text-gray-400">Enterprise</th>
          </tr>
        </thead>
        <tbody>
          {featureRows.map((row, i) => (
            <motion.tr
              key={i}
              variants={itemVariants}
              className="border-b border-white/[0.03] transition-colors hover:bg-white/[0.02]"
            >
              <td className="py-4 pr-8 text-sm text-gray-300">{row.label}</td>
              <td className="py-4 px-4 text-center">
                {typeof row.starter === 'boolean' ? (
                  row.starter ? <CheckIcon className="mx-auto" /> : <XIcon className="mx-auto" />
                ) : (
                  <span className="text-sm text-gray-400">{row.starter}</span>
                )}
              </td>
              <td className="py-4 px-4 text-center">
                {typeof row.pro === 'boolean' ? (
                  row.pro ? <CheckIcon className="mx-auto" /> : <XIcon className="mx-auto" />
                ) : (
                  <span className="text-sm text-gray-300 font-medium">{row.pro}</span>
                )}
              </td>
              <td className="py-4 pl-4 text-center">
                {typeof row.enterprise === 'boolean' ? (
                  row.enterprise ? <CheckIcon className="mx-auto" /> : <XIcon className="mx-auto" />
                ) : (
                  <span className="text-sm text-gray-300">{row.enterprise}</span>
                )}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
}

function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="max-w-3xl mx-auto space-y-3">
      {faqItems.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <motion.div
            key={i}
            variants={itemVariants}
            className="rounded-xl border border-white/5 bg-[#0A0B0E]/60 backdrop-blur-sm overflow-hidden transition-colors hover:border-white/10"
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="w-full flex items-center justify-between p-5 text-left"
            >
              <span className="text-sm font-bold text-white pr-4">{item.q}</span>
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="shrink-0"
              >
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </motion.div>
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-5 text-sm text-gray-400 leading-relaxed">{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-32 pb-24 px-6 relative overflow-hidden">
      <div className="absolute top-32 left-1/4 w-[800px] h-[800px] bg-[#9945FF]/5 rounded-full blur-[200px] pointer-events-none" />
      <div className="absolute -bottom-40 right-1/4 w-[600px] h-[600px] bg-[#00E5FF]/5 rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <motion.div variants={itemVariants}>
            <Badge variant="primary" size="sm" className="mb-6 gap-1">
              <Star className="w-3 h-3" /> Pricing
            </Badge>
          </motion.div>
          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl font-black tracking-tight leading-[1.05] mb-6"
          >
            Simple,{' '}
            <span className="bg-gradient-to-r from-[#9945FF] via-[#00E5FF] to-[#00FFA3] bg-clip-text text-transparent">
              Transparent
            </span>{' '}
            Pricing
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="text-lg text-gray-400 leading-relaxed"
          >
            No hidden fees, no surprise charges. Start free and upgrade when you are ready.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="flex items-center justify-center gap-3 mb-12"
        >
          <motion.span
            variants={itemVariants}
            className={`text-sm font-medium transition-colors ${!annual ? 'text-white' : 'text-gray-500'}`}
          >
            Monthly
          </motion.span>
          <motion.div variants={itemVariants}>
            <Switch
              checked={annual}
              onCheckedChange={setAnnual}
              size="default"
            />
          </motion.div>
          <motion.div variants={itemVariants} className="flex items-center gap-2">
            <span className={`text-sm font-medium transition-colors ${annual ? 'text-white' : 'text-gray-500'}`}>
              Annual
            </span>
            <Badge variant="success" size="sm">Save 20%</Badge>
          </motion.div>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-start max-w-6xl mx-auto mb-32"
        >
          {plans.map((plan, i) => (
            <PricingCard key={i} plan={plan} index={i} annual={annual} />
          ))}
        </motion.div>

        <div className="max-w-5xl mx-auto mb-32">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={containerVariants}
            className="text-center mb-16"
          >
            <motion.h2
              variants={itemVariants}
              className="text-3xl md:text-5xl font-black tracking-tight mb-4"
            >
              Compare{' '}
              <span className="bg-gradient-to-r from-[#00E5FF] to-[#00FFA3] bg-clip-text text-transparent">
                Plans
              </span>
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-gray-400 text-lg max-w-2xl mx-auto"
            >
              Every feature you need to turn long-form video into viral clips.
            </motion.p>
          </motion.div>
          <FeatureTable />
        </div>

        <div className="mb-32">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={containerVariants}
            className="text-center mb-16"
          >
            <motion.h2
              variants={itemVariants}
              className="text-3xl md:text-5xl font-black tracking-tight mb-4"
            >
              Frequently Asked{' '}
              <span className="bg-gradient-to-r from-[#9945FF] to-[#00E5FF] bg-clip-text text-transparent">
                Questions
              </span>
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-gray-400 text-lg"
            >
              Everything you need to know about ClipFlow pricing.
            </motion.p>
          </motion.div>
          <FAQ />
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={containerVariants}
          className="max-w-2xl mx-auto text-center"
        >
          <motion.div
            variants={itemVariants}
            className="rounded-2xl border border-white/5 bg-[#0A0B0E]/60 backdrop-blur-sm p-10 md:p-14"
          >
            <HelpCircle className="w-10 h-10 text-[#00E5FF] mx-auto mb-4" />
            <h3 className="text-2xl md:text-3xl font-bold mb-3">Still have questions?</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Our team is ready to help you find the perfect plan for your needs.
            </p>
            <Link href="/contact">
              <Button variant="primary" size="xl">
                Contact Us
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
