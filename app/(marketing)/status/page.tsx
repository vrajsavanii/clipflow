'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2, Activity, Server, Clock, AlertTriangle,
  Home, Database, Globe, Zap, Cloud,
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

const services = [
  { name: 'API Gateway', status: 'operational', uptime: '99.99%', icon: <Globe className="w-5 h-5" />, color: '#00E5FF' },
  { name: 'Web Dashboard', status: 'operational', uptime: '100%', icon: <Server className="w-5 h-5" />, color: '#9945FF' },
  { name: 'Worker Cluster', status: 'operational', uptime: '99.95%', icon: <Zap className="w-5 h-5" />, color: '#00FFA3' },
  { name: 'Storage & CDN', status: 'operational', uptime: '99.99%', icon: <Database className="w-5 h-5" />, color: '#FF6B9D' },
  { name: 'AI Inference', status: 'operational', uptime: '99.90%', icon: <Cloud className="w-5 h-5" />, color: '#00E5FF' },
  { name: 'Webhook Delivery', status: 'operational', uptime: '99.99%', icon: <Activity className="w-5 h-5" />, color: '#9945FF' },
];

const incidents = [
  {
    title: 'Elevated Latency — EU Region',
    date: 'April 8, 2026',
    status: 'resolved',
    color: '#00FFA3',
    desc: 'We identified and resolved an issue causing elevated latency for video ingestion in the eu-west-1 region. All systems operating normally.',
  },
  {
    title: 'Transcription API Degraded',
    date: 'March 15, 2026',
    status: 'resolved',
    color: '#00FFA3',
    desc: 'A downstream dependency caused slower transcription times for approximately 15 minutes. Issue mitigated and service fully restored.',
  },
  {
    title: 'Scheduled Maintenance — Worker Upgrade',
    date: 'February 28, 2026',
    status: 'maintenance',
    color: '#00E5FF',
    desc: 'Planned maintenance to upgrade the worker cluster to v3.2. Approximately 5 minutes of downtime during the window.',
  },
  {
    title: 'CDN Edge Node Outage',
    date: 'January 12, 2026',
    status: 'resolved',
    color: '#00FFA3',
    desc: 'One of our CDN edge providers experienced a regional outage. Traffic was automatically rerouted. No data loss occurred.',
  },
];

const uptimeData = [
  { label: 'Jan', value: 99.99 },
  { label: 'Feb', value: 100 },
  { label: 'Mar', value: 99.95 },
  { label: 'Apr', value: 99.99 },
  { label: 'May', value: 100 },
  { label: 'Jun', value: 99.99 },
];

export default function StatusPage() {
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
              <span className="text-[#00E5FF]">Status</span>
            </div>
          </AnimatedItem>
          <AnimatedItem>
            <Badge variant="success" size="lg" className="mb-6 px-4 py-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 mr-2 inline-block" />
              All Systems Operational
            </Badge>
          </AnimatedItem>
          <AnimatedItem>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black font-heading tracking-tight leading-[0.95] mb-6">
              <AnimatedGradientText from="#00E5FF" via="#00FFA3" to="#9945FF">
                System Status
              </AnimatedGradientText>
            </h1>
          </AnimatedItem>
          <AnimatedItem>
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl leading-relaxed">
              Current operational status of all ClipFlow services and APIs.
              We monitor every endpoint, worker, and model endpoint in real time.
            </p>
          </AnimatedItem>
        </AnimatedContainer>
      </AnimatedSection>

      <div className="relative z-10 px-6 pb-24">
        <div className="max-w-5xl mx-auto space-y-16">
          {/* Current status indicator + key metrics */}
          <AnimatedContainer>
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              {[
                { icon: <Activity className="w-5 h-5" />, label: 'API Response Time', value: '42ms', color: '#00E5FF' },
                { icon: <Server className="w-5 h-5" />, label: 'Active Workers', value: '1,402', color: '#9945FF' },
                { icon: <Clock className="w-5 h-5" />, label: 'Last Incident', value: '48 days ago', color: '#00FFA3' },
              ].map((m, i) => (
                <AnimatedCard key={m.label} index={i}>
                  <div className="p-5 rounded-2xl border border-white/[0.04] bg-white/[0.01]">
                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-2">
                      <span style={{ color: m.color }}>{m.icon}</span> {m.label}
                    </div>
                    <div className="text-2xl md:text-3xl font-black">{m.value}</div>
                  </div>
                </AnimatedCard>
              ))}
            </div>
          </AnimatedContainer>

          {/* Uptime chart */}
          <AnimatedContainer>
            <AnimatedItem>
              <h2 className="text-2xl font-bold font-heading mb-6">Uptime History</h2>
            </AnimatedItem>
            <AnimatedItem>
              <div className="p-6 md:p-8 rounded-2xl border border-white/[0.04] bg-white/[0.01]">
                <div className="flex items-end justify-between gap-2 h-40 mb-4">
                  {uptimeData.map((m) => {
                    const height = m.value === 100 ? 100 : m.value;
                    return (
                      <div key={m.label} className="flex-1 flex flex-col items-center gap-2">
                        <span className="text-[10px] text-gray-600 font-mono">{m.value}%</span>
                        <div
                          className="w-full rounded-lg transition-all duration-500 hover:opacity-80"
                          style={{
                            height: `${height}%`,
                            background: `linear-gradient(to top, ${m.value >= 100 ? '#00FFA3' : '#00E5FF'}, ${m.value >= 100 ? '#00FFA3' : '#9945FF'})`,
                            opacity: 0.7,
                          }}
                        />
                        <span className="text-[10px] text-gray-600 font-mono">{m.label}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-600">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#00FFA3]" /> 100% uptime</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#9945FF]" /> &lt; 100%</span>
                </div>
              </div>
            </AnimatedItem>
          </AnimatedContainer>

          {/* Service cards */}
          <AnimatedContainer>
            <AnimatedItem>
              <h2 className="text-2xl font-bold font-heading mb-6">Services</h2>
            </AnimatedItem>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((s, i) => (
                <AnimatedCard key={s.name} index={i}>
                  <div className="p-5 rounded-2xl border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/[0.08] transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${s.color}15`, color: s.color }}>
                        {s.icon}
                      </div>
                      <span className={`flex items-center gap-1.5 text-xs font-medium ${
                        s.status === 'operational' ? 'text-[#00FFA3]' : 'text-yellow-400'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${
                          s.status === 'operational' ? 'bg-[#00FFA3]' : 'bg-yellow-400'
                        }`} />
                        {s.status === 'operational' ? 'Operational' : 'Degraded'}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold font-heading mb-1">{s.name}</h3>
                    <p className="text-xs text-gray-500 font-mono">{s.uptime} uptime</p>
                  </div>
                </AnimatedCard>
              ))}
            </div>
          </AnimatedContainer>

          {/* Incident timeline */}
          <AnimatedContainer>
            <AnimatedItem>
              <h2 className="text-2xl font-bold font-heading mb-6">Incident History</h2>
            </AnimatedItem>
            <div className="space-y-4">
              {incidents.map((incident, i) => (
                <AnimatedItem key={incident.title}>
                  <div className="p-5 rounded-2xl border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-300">
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center gap-1">
                        <div
                          className="w-3 h-3 rounded-full shrink-0 mt-1"
                          style={{
                            backgroundColor: incident.color,
                            boxShadow: `0 0 8px ${incident.color}40`,
                          }}
                        />
                        <div className="w-px flex-1 bg-white/[0.04]" />
                      </div>
                      <div className="flex-1 min-w-0 pb-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                          <h3 className="text-sm font-bold text-white">{incident.title}</h3>
                          <Badge
                            variant={incident.status === 'resolved' ? 'success' : 'info'}
                            size="sm"
                          >
                            {incident.status === 'resolved' ? 'Resolved' : 'Maintenance'}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">{incident.date}</p>
                        <p className="text-sm text-gray-400 leading-relaxed">{incident.desc}</p>
                      </div>
                    </div>
                  </div>
                </AnimatedItem>
              ))}
            </div>
          </AnimatedContainer>

          {/* Subscribe */}
          <AnimatedContainer>
            <AnimatedItem>
              <div className="p-8 md:p-10 rounded-2xl border border-white/[0.04] bg-white/[0.01] text-center">
                <h3 className="text-xl font-bold font-heading mb-3">Stay Updated</h3>
                <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
                  Subscribe to get notification emails when incidents occur or services are degraded.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="flex-1 w-full bg-black/40 border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00E5FF] transition-all placeholder:text-gray-600"
                  />
                  <Button variant="primary" size="lg" className="w-full sm:w-auto">Subscribe</Button>
                </div>
              </div>
            </AnimatedItem>
          </AnimatedContainer>
        </div>
      </div>
    </div>
  );
}
