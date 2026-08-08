'use client';

import { motion } from 'framer-motion';
import { Shield, Lock, FileText, Database, User, Globe } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const sections = [
    { id: 'data-collection', title: '1. Data We Collect' },
    { id: 'video-processing', title: '2. Video & Audio Processing' },
    { id: 'data-usage', title: '3. How We Use Your Data' },
    { id: 'data-sharing', title: '4. Data Sharing & Disclosure' },
    { id: 'user-rights', title: '5. Your Rights (GDPR & CCPA)' },
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
              <Shield className="w-6 h-6 text-[#00E5FF] mb-2" />
              <p className="text-xs text-gray-400">
                Last updated: May 26, 2026<br />
                Effective date: June 1, 2026
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
            <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Privacy Policy</h1>
            <p className="text-xl text-gray-400 leading-relaxed">
              At ClipFlow, we treat your data with the same precision and care as our AI models treat your videos. This policy outlines exactly how we handle your personal information, video assets, and biometric data.
            </p>
          </div>

          <div className="space-y-12 text-gray-300 leading-relaxed">
            <section id="data-collection" className="scroll-mt-32">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <Database className="w-6 h-6 text-[#9945FF]" />
                1. Data We Collect
              </h2>
              <p className="mb-4">
                We collect information that you provide directly to us when you create an account, upload videos, or communicate with our support team. This includes:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-400">
                <li>Account information: Name, email address, and billing details.</li>
                <li>Content data: Raw video files, audio tracks, and metadata associated with your uploads.</li>
                <li>Usage metrics: Interactions with our clipping interface, export preferences, and API usage.</li>
              </ul>
            </section>

            <section id="video-processing" className="scroll-mt-32">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <Globe className="w-6 h-6 text-[#00FFA3]" />
                2. Video & Audio Processing
              </h2>
              <p className="mb-4">
                As an AI video clipping platform, our core functionality requires processing your media.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-400">
                <li><strong className="text-gray-200">Facial Tracking & Biometrics:</strong> Our AI temporarily analyzes facial landmarks to center subjects (auto-framing). We do not store biometric templates or sell facial recognition data.</li>
                <li><strong className="text-gray-200">Audio Transcription:</strong> We transcribe audio to generate captions and identify highlights. Transcripts are stored securely alongside your project files.</li>
                <li><strong className="text-gray-200">Temporary Storage:</strong> Intermediate processing files are automatically purged from our GPU clusters within 24 hours of successful export.</li>
              </ul>
            </section>

            <section id="data-usage" className="scroll-mt-32">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-[#00E5FF]" />
                3. How We Use Your Data
              </h2>
              <p className="mb-4">
                We strictly use your data to provide, maintain, and improve the ClipFlow platform.
                Your private videos are never used to train our foundational AI models unless you explicitly opt-in via your organization's workspace settings.
              </p>
            </section>

            <section id="data-sharing" className="scroll-mt-32">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <Lock className="w-6 h-6 text-[#9945FF]" />
                4. Data Sharing & Disclosure
              </h2>
              <p className="mb-4">
                We do not sell your personal data. We only share information with essential third-party service providers (e.g., AWS for storage, Stripe for payments) under strict confidentiality agreements.
              </p>
            </section>

            <section id="user-rights" className="scroll-mt-32">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <User className="w-6 h-6 text-[#00FFA3]" />
                5. Your Rights (GDPR & CCPA)
              </h2>
              <p className="mb-4">
                Depending on your location, you may have rights to access, correct, delete, or restrict the processing of your data. You can export your data or delete your ClipFlow account permanently from the dashboard at any time. For specific requests, contact legal@clipflow.ai.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
