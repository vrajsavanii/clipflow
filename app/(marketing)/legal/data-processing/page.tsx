'use client';

import { motion } from 'framer-motion';
import { Server, Activity, Network, ShieldCheck } from 'lucide-react';

export default function DataProcessingPage() {
  const sections = [
    { id: 'definitions', title: '1. Definitions' },
    { id: 'processing', title: '2. Processing of Personal Data' },
    { id: 'subprocessors', title: '3. Subprocessors' },
    { id: 'security', title: '4. Security Measures' },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-32 pb-24 selection:bg-[#00FFA3]/30">
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
                  className="text-gray-500 hover:text-[#00FFA3] transition-colors duration-200 text-sm"
                >
                  {section.title}
                </a>
              ))}
            </nav>
            <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-lg backdrop-blur-md">
              <ShieldCheck className="w-6 h-6 text-[#00FFA3] mb-2" />
              <p className="text-xs text-gray-400">
                Last updated: May 26, 2026<br />
                Applicable Framework: GDPR, CCPA
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
            <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Data Processing Agreement (DPA)</h1>
            <p className="text-xl text-gray-400 leading-relaxed">
              This DPA forms part of the Terms of Service between ClipFlow and the Customer, reflecting our commitment to rigorous data protection standards for high-volume video processing.
            </p>
          </div>

          <div className="space-y-12 text-gray-300 leading-relaxed">
            <section id="definitions" className="scroll-mt-32">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <Network className="w-6 h-6 text-[#00E5FF]" />
                1. Definitions
              </h2>
              <p className="mb-4">
                "Personal Data", "Data Controller", "Data Processor", "Data Subject" shall have the same meaning as in the General Data Protection Regulation (GDPR). 
                ClipFlow acts as a Data Processor regarding the video content and metadata uploaded by the Customer (Data Controller).
              </p>
            </section>

            <section id="processing" className="scroll-mt-32">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <Activity className="w-6 h-6 text-[#9945FF]" />
                2. Processing of Personal Data
              </h2>
              <p className="mb-4">
                ClipFlow shall process Personal Data only on documented instructions from the Customer, including for the purpose of providing the AI video clipping service. 
                Nature of processing includes: GPU-accelerated video rendering, audio-to-text transcription, semantic analysis, and facial point tracking (for auto-framing purposes only).
              </p>
            </section>

            <section id="subprocessors" className="scroll-mt-32">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <Server className="w-6 h-6 text-[#00FFA3]" />
                3. Subprocessors
              </h2>
              <p className="mb-4">
                The Customer provides general authorization for ClipFlow to engage Subprocessors. ClipFlow currently utilizes the following essential infrastructure providers:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-400">
                <li>Amazon Web Services (AWS) - Cloud infrastructure and S3 video storage.</li>
                <li>CoreWeave - High-performance GPU computing clusters.</li>
                <li>OpenAI / Anthropic - Optional semantic analysis endpoints.</li>
              </ul>
            </section>

            <section id="security" className="scroll-mt-32">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-[#00E5FF]" />
                4. Security Measures
              </h2>
              <p className="mb-4">
                ClipFlow implements robust technical and organizational measures to ensure a level of security appropriate to the risk, including AES-256 encryption for data at rest (videos, transcripts) and TLS 1.3 for data in transit. 
                Processing environments are isolated within virtual private clouds.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
