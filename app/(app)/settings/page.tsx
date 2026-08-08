'use client';

import { useState, useEffect, useMemo } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, CreditCard, Key, Bell, Shield, LogOut,
  CheckCircle, AlertCircle, Loader2, UploadCloud,
  Plus, Moon, Save, Trash2, Sparkles, Zap,
  Eye, EyeOff, Copy, ExternalLink, HardDrive,
  Clock, ArrowUpRight, ChevronRight, X
} from 'lucide-react';
import { staggerContainer, fadeInUp } from '@/lib/animations';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const TABS = [
  { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
  { id: 'brand', label: 'Brand Kit', icon: <Sparkles className="w-4 h-4" /> },
  { id: 'billing', label: 'Billing', icon: <CreditCard className="w-4 h-4" /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
  { id: 'api', label: 'API Keys', icon: <Key className="w-4 h-4" /> },
  { id: 'danger', label: 'Danger Zone', icon: <Shield className="w-4 h-4" /> },
];

function TabButton({ tab, active, onClick }: { tab: typeof TABS[0]; active: boolean; onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative',
        active
          ? 'text-white bg-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]'
          : 'text-gray-400 hover:text-white hover:bg-white/[0.03]'
      )}
    >
      {active && (
        <motion.div
          layoutId="settingsTab"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-gradient-to-b from-[#9945FF] to-[#00E5FF] shadow-[0_0_8px_rgba(0,229,255,0.4)]"
          transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        />
      )}
      <span className={cn('transition-colors', active ? 'text-[#00E5FF]' : 'text-gray-500 group-hover:text-gray-300')}>
        {tab.icon}
      </span>
      {tab.label}
    </motion.button>
  );
}

function GlassCard({ children, className, glow }: { children: React.ReactNode; className?: string; glow?: string }) {
  return (
    <div className={cn(
      'glass-panel p-5 md:p-6 rounded-2xl border border-white/5 relative overflow-hidden',
      className
    )}>
      {glow && (
        <div className={cn(
          'absolute top-0 right-0 w-32 h-32 rounded-full blur-[80px] opacity-[0.05] pointer-events-none',
          glow
        )} />
      )}
      {children}
    </div>
  );
}

function SectionTitle({ icon, title, desc }: { icon: React.ReactNode; title: string; desc?: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <h3 className="text-base font-bold text-white font-heading">{title}</h3>
        {desc && <p className="text-xs text-gray-500 font-mono mt-0.5">{desc}</p>}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showApi, setShowApi] = useState<Record<string, boolean>>({});
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [name, setName] = useState('');
  const [notifications, setNotifications] = useState({
    email: true,
    inApp: true,
    slack: false,
    marketing: false,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push('/login'); return; }
        if (!cancelled) setUser(user);
        setName(user.email?.split('@')[0] || 'User');

        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (!cancelled && profileData) {
          setProfile(profileData);
        } else if (!cancelled) {
          const defaults = {
            id: user.id,
            plan: 'starter',
            credits_used: 0,
            credits_limit: 120,
          };
          const { error } = await supabase.from('profiles').upsert(defaults);
          if (!error) setProfile(defaults);
        }
      } catch (err) {
        console.error('Settings load error:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [supabase, router]);

  const handleSaveProfile = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    setSaving(false);
    toast.success('Profile updated', { position: 'bottom-right', duration: 3000 });
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 500));
    setSaving(false);
    toast.success('Notification preferences saved', { position: 'bottom-right', duration: 3000 });
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== user?.email) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 1500));
    setSaving(false);
    toast.error('Account deletion request submitted', { position: 'bottom-right' });
    setShowDeleteModal(false);
    setDeleteConfirm('');
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success('API key copied to clipboard', { position: 'bottom-right' });
  };

  const userInitial = user?.email?.charAt(0).toUpperCase() || 'U';
  const plan = profile?.plan || 'free';
  const minutesUsed = profile?.minutes_used_this_month || 0;
  const minutesLimit = profile?.minutes_limit || 30;
  const creditsRemaining = profile?.credits_remaining ?? 5;
  const storageUsed = profile?.storage_used_mb || 0;
  const storageLimit = 5120;

  const usagePct = Math.min(100, Math.round((minutesUsed / minutesLimit) * 100));
  const storagePct = Math.min(100, Math.round((storageUsed / storageLimit) * 100));
  const isPro = plan === 'pro';

  const apiKeys = [
    { name: 'Production', key: 'cf_live_948f2a938c4b2e1f7d3c6a', created: '2 days ago', status: 'active' as const },
    { name: 'Development', key: 'cf_test_3b7e1d9a452c8f0e6b2a', created: '2 weeks ago', status: 'active' as const },
    { name: 'Staging', key: 'cf_stag_1a2b3c4d5e6f7g8h9i0j', created: '1 month ago', status: 'revoked' as const },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Loader2 className="w-10 h-10 text-[#00E5FF] animate-spin" />
            <div className="absolute inset-0 w-10 h-10 animate-ping rounded-full bg-[#00E5FF]/20" />
          </div>
          <p className="text-gray-400 text-sm font-mono">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="max-w-7xl mx-auto space-y-6 pb-12"
    >
      {/* Header */}
      <motion.div variants={fadeInUp}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#9945FF]/10 border border-[#9945FF]/30 flex items-center justify-center">
            <User className="w-5 h-5 text-[#9945FF]" />
          </div>
          <div>
            <h1 className="text-3xl font-black font-heading tracking-tight text-white">Settings</h1>
            <p className="text-sm text-gray-400">Manage your account, billing, and preferences.</p>
          </div>
        </div>
      </motion.div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <motion.div variants={fadeInUp} className="w-full md:w-56 shrink-0 space-y-1">
          <div className="glass-panel p-3 rounded-2xl border border-white/5">
            {TABS.map(tab => (
              <TabButton key={tab.id} tab={tab} active={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} />
            ))}
            <div className="pt-3 mt-3 border-t border-white/5">
              <motion.button
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </motion.button>
            </div>
          </div>

          {/* Theme Info */}
          <div className="glass-panel p-4 rounded-2xl border border-white/5">
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-[#00E5FF]" />
              <span className="text-xs font-bold text-white">Dark Theme</span>
            </div>
            <p className="text-[10px] text-gray-500 font-mono mt-1">Forced dark mode active</p>
          </div>
        </motion.div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-6">

          {/* ===== PROFILE TAB ===== */}
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <GlassCard glow="bg-[#00E5FF]">
                  <SectionTitle icon={<User className="w-4 h-4 text-[#00E5FF]" />} title="Personal Information" desc="Update your profile details" />

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-6 mb-6 border-b border-white/5">
                    <div className="relative group">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#9945FF] via-[#00E5FF] to-[#00FFA3] flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-[#9945FF]/20">
                        {userInitial}
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#9945FF] border-2 border-[#050505] flex items-center justify-center cursor-pointer shadow-lg"
                      >
                        <UploadCloud className="w-3.5 h-3.5 text-white" />
                      </motion.div>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{user?.email}</p>
                      <p className="text-xs text-gray-500 font-mono mt-0.5">Member since {new Date(user?.created_at || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Display Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full bg-[#050505] border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[#00E5FF]/50 transition-all shadow-inner"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email</label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full bg-white/5 border border-transparent rounded-xl py-2.5 px-4 text-sm text-gray-500 cursor-not-allowed shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-5">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="flex items-center gap-2 bg-gradient-to-r from-[#9945FF] to-[#00E5FF] text-black px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-[#9945FF]/20 hover:shadow-[#00E5FF]/30 transition-all disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {saving ? 'Saving...' : 'Save Changes'}
                    </motion.button>
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {/* ===== BRAND KIT TAB ===== */}
            {activeTab === 'brand' && (
              <motion.div
                key="brand"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <GlassCard glow="bg-[#FF6B9D]">
                  <div className="flex items-center justify-between mb-5">
                    <SectionTitle icon={<Sparkles className="w-4 h-4 text-[#FF6B9D]" />} title="Brand Kit" desc="Customize your exported clips" />
                    {!isPro && (
                      <Badge variant="premium" size="sm" className="hidden sm:flex">Pro Feature</Badge>
                    )}
                  </div>

                  <div className={cn("space-y-6", !isPro && "opacity-50 pointer-events-none")}>
                    {/* Logo Upload */}
                    <div>
                      <h4 className="text-sm font-bold text-white mb-3">Custom Watermark / Logo</h4>
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center border-dashed">
                          <Plus className="w-5 h-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 font-mono">Upload a transparent PNG to overlay on your clips.</p>
                          <motion.button className="mt-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold text-white transition-all border border-white/5">
                            Upload Logo
                          </motion.button>
                        </div>
                      </div>
                    </div>

                    {/* Brand Colors */}
                    <div className="pt-6 border-t border-white/5">
                      <h4 className="text-sm font-bold text-white mb-3">Brand Colors</h4>
                      <div className="flex gap-3">
                        {['#9945FF', '#00E5FF', '#00FFA3', '#FF6B9D', '#FFB020'].map((color, i) => (
                          <motion.div
                            key={color}
                            whileHover={{ scale: 1.1 }}
                            className="w-8 h-8 rounded-full border-2 border-transparent cursor-pointer"
                            style={{ backgroundColor: color, borderColor: i === 1 ? 'white' : 'transparent' }}
                          />
                        ))}
                        <div className="w-8 h-8 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:bg-white/5 transition-colors">
                          <Plus className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </div>

                    {/* Custom Font */}
                    <div className="pt-6 border-t border-white/5">
                      <h4 className="text-sm font-bold text-white mb-3">Custom Fonts</h4>
                      <select className="w-full max-w-xs bg-[#050505] border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[#FF6B9D]/50 transition-all shadow-inner appearance-none">
                        <option>Inter (Default)</option>
                        <option>Bebas Neue (Bold & Punchy)</option>
                        <option>Montserrat (Clean)</option>
                        <option>Upload Custom Font (.TTF / .OTF)</option>
                      </select>
                    </div>
                  </div>

                  {!isPro && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-10 rounded-2xl">
                      <div className="text-center bg-[#111317] p-6 rounded-2xl border border-white/10 shadow-2xl max-w-sm">
                        <Sparkles className="w-8 h-8 text-[#9945FF] mx-auto mb-3" />
                        <h4 className="text-lg font-bold text-white">Unlock Brand Kits</h4>
                        <p className="text-xs text-gray-400 mt-2 mb-4">Upgrade to Creator Pro to customize your clips with your own fonts, colors, and logos.</p>
                        <button className="w-full py-2.5 bg-gradient-to-r from-[#9945FF] to-[#00E5FF] text-black text-sm font-bold rounded-xl shadow-lg hover:shadow-[#9945FF]/30 transition-all">
                          Upgrade to Pro
                        </button>
                      </div>
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            )}

            {/* ===== BILLING TAB ===== */}
            {activeTab === 'billing' && (
              <motion.div
                key="billing"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <GlassCard glow="bg-[#9945FF]">
                  <SectionTitle icon={<CreditCard className="w-4 h-4 text-[#9945FF]" />} title="Plan & Subscription" desc="Manage your billing and usage" />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-gradient-to-r from-[#9945FF]/10 to-[#00E5FF]/5 border border-[#9945FF]/20">
                    <div>
                      <Badge variant={isPro ? 'premium' : 'primary'} size="lg" className="mb-2">
                        {isPro ? 'PRO' : 'FREE'}
                      </Badge>
                      <h2 className="text-2xl font-black font-heading text-white">{isPro ? 'Professional' : 'Starter'} Plan</h2>
                      <p className="text-sm text-gray-400 mt-1 font-mono">
                        {isPro ? 'Next billing: ' + new Date(Date.now() + 30 * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : `${minutesUsed} / ${minutesLimit} minutes used this month`}
                      </p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <div className="text-3xl font-black font-mono text-white">
                        {isPro ? '$49' : '$0'}
                        <span className="text-sm text-gray-500 font-normal">/{isPro ? 'mo' : 'forever'}</span>
                      </div>
                      {!isPro && (
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#9945FF] to-[#00E5FF] text-black text-xs font-bold shadow-lg shadow-[#9945FF]/20 hover:shadow-[#00E5FF]/30 transition-all"
                        >
                          <Sparkles className="w-4 h-4" />
                          Upgrade to Pro
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </motion.button>
                      )}
                    </div>
                  </div>

                  {isPro && (
                    <div className="flex gap-3 mt-5">
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="px-5 py-2.5 rounded-xl bg-white text-black text-sm font-bold hover:bg-gray-200 transition-colors shadow-sm">
                        Manage Subscription
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="px-5 py-2.5 rounded-xl border border-white/10 text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                        View Invoices
                      </motion.button>
                    </div>
                  )}

                  {/* Usage */}
                  <div className="mt-6 pt-6 border-t border-white/5 space-y-5">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Usage This Cycle</h4>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-gray-400 font-mono">AI Processing Minutes</span>
                          <span className="text-white font-bold font-mono">{minutesUsed} / {minutesLimit} min</span>
                        </div>
                        <div className="w-full h-2.5 bg-[#050505] rounded-full overflow-hidden border border-white/5">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${usagePct}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className={cn(
                              'h-full rounded-full relative',
                              usagePct >= 80 ? 'bg-red-500' : usagePct >= 60 ? 'bg-yellow-400' : 'bg-gradient-to-r from-[#9945FF] to-[#00E5FF]'
                            )}
                          >
                            <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
                          </motion.div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-gray-400 font-mono">Cloud Storage</span>
                          <span className="text-white font-bold font-mono">
                            {storageUsed >= 1024 ? (storageUsed / 1024).toFixed(1) : storageUsed} MB / {storageLimit >= 1024 ? (storageLimit / 1024).toFixed(1) : storageLimit} GB
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-[#050505] rounded-full overflow-hidden border border-white/5">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${storagePct}%` }}
                            transition={{ duration: 1, delay: 0.3 }}
                            className={cn(
                              'h-full rounded-full relative',
                              storagePct >= 80 ? 'bg-red-500' : storagePct >= 60 ? 'bg-yellow-400' : 'bg-gradient-to-r from-[#00E5FF] to-[#00FFA3]'
                            )}
                          >
                            <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
                          </motion.div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 rounded-xl bg-[#00FFA3]/5 border border-[#00FFA3]/10">
                      <Zap className="w-5 h-5 text-[#00FFA3]" />
                      <div>
                        <p className="text-xs font-bold text-white">{creditsRemaining} credits remaining</p>
                        <p className="text-[10px] text-gray-500 font-mono mt-0.5">Credits reset at the start of each billing cycle</p>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {/* ===== NOTIFICATIONS TAB ===== */}
            {activeTab === 'notifications' && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <GlassCard glow="bg-[#00FFA3]">
                  <SectionTitle icon={<Bell className="w-4 h-4 text-[#00FFA3]" />} title="Notification Preferences" desc="Choose how you want to be notified" />

                  <div className="space-y-4">
                    {[
                      { id: 'email' as const, label: 'Email Notifications', desc: 'Receive updates about your clips and account via email', icon: '📧' },
                      { id: 'inApp' as const, label: 'In-App Notifications', desc: 'Show notifications inside the dashboard', icon: '🔔' },
                      { id: 'slack' as const, label: 'Slack Integration', desc: 'Send updates to your Slack workspace', icon: '💬' },
                      { id: 'marketing' as const, label: 'Marketing & Product Updates', desc: 'Tips, new features, and product announcements', icon: '✨' },
                    ].map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{item.icon}</span>
                          <div>
                            <p className="text-sm font-bold text-white">{item.label}</p>
                            <p className="text-xs text-gray-500 font-mono mt-0.5">{item.desc}</p>
                          </div>
                        </div>
                        <Switch
                          checked={notifications[item.id]}
                          onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, [item.id]: checked }))}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end pt-5">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSaveNotifications}
                      disabled={saving}
                      className="flex items-center gap-2 bg-gradient-to-r from-[#9945FF] to-[#00E5FF] text-black px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-[#9945FF]/20 hover:shadow-[#00E5FF]/30 transition-all disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {saving ? 'Saving...' : 'Save Preferences'}
                    </motion.button>
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {/* ===== API KEYS TAB ===== */}
            {activeTab === 'api' && (
              <motion.div
                key="api"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <GlassCard glow="bg-[#9945FF]">
                  <SectionTitle icon={<Key className="w-4 h-4 text-[#9945FF]" />} title="API Keys" desc="Manage programmatic access to your workspace" />

                  <div className="flex justify-between items-center mb-5 pb-5 border-b border-white/5">
                    <p className="text-xs text-gray-400 font-mono">Keys are read-only. Generate new keys from the developer dashboard.</p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-2 bg-gradient-to-r from-[#9945FF] to-[#00E5FF] text-black px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-[#9945FF]/20 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Generate Key
                    </motion.button>
                  </div>

                  <div className="space-y-4">
                    {apiKeys.map((keyItem) => (
                      <div key={keyItem.name} className={cn(
                        'p-4 rounded-xl border transition-all',
                        keyItem.status === 'active' ? 'bg-[#050505] border-white/10' : 'bg-[#050505]/50 border-white/5 opacity-60'
                      )}>
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              'w-2 h-2 rounded-full',
                              keyItem.status === 'active' ? 'bg-[#00FFA3] shadow-[0_0_8px_#00FFA3]' : 'bg-gray-500'
                            )} />
                            <span className="font-bold text-sm text-white">{keyItem.name}</span>
                          </div>
                          <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Created: {keyItem.created}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 flex items-center gap-2 bg-black border border-white/10 rounded-lg px-3 py-2">
                            <span className="text-sm text-gray-500 font-mono truncate">
                              {showApi[keyItem.name] ? keyItem.key : keyItem.key.slice(0, 12) + '••••••••••••'}
                            </span>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              onClick={() => setShowApi(prev => ({ ...prev, [keyItem.name]: !prev[keyItem.name] }))}
                              className="p-1 text-gray-500 hover:text-white transition-colors"
                            >
                              {showApi[keyItem.name] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </motion.button>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleCopyKey(keyItem.key)}
                            className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-all border border-white/10 flex items-center gap-1.5"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            Copy
                          </motion.button>
                          {keyItem.status === 'active' && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-all border border-red-500/20"
                            >
                              Revoke
                            </motion.button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Webhooks Info */}
                  <div className="mt-6 p-5 rounded-xl bg-gradient-to-r from-[#9945FF]/10 to-[#00E5FF]/10 border border-[#9945FF]/20 flex items-start gap-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#9945FF] rounded-full blur-[80px] opacity-10 translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                    <AlertCircle className="w-5 h-5 text-[#9945FF] shrink-0 mt-0.5 relative z-10" />
                    <div className="relative z-10">
                      <h4 className="text-sm font-bold text-white">Webhook Endpoints</h4>
                      <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                        Configure endpoints to receive events for <code className="bg-black/50 border border-white/10 px-1.5 py-0.5 rounded text-[#00E5FF] font-mono">video.render.completed</code>{' '}
                        and <code className="bg-black/50 border border-white/10 px-1.5 py-0.5 rounded text-[#00E5FF] font-mono">clip.analyzed</code>.
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="mt-3 text-xs font-bold bg-white/10 px-4 py-2 rounded-lg border border-white/10 hover:bg-white/20 transition-all text-white"
                      >
                        <Plus className="w-3 h-3 inline mr-1" />
                        Add Endpoint
                      </motion.button>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {/* ===== DANGER ZONE TAB ===== */}
            {activeTab === 'danger' && (
              <motion.div
                key="danger"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <GlassCard glow="bg-red-500" className="border-red-500/10">
                  <SectionTitle icon={<Shield className="w-4 h-4 text-red-400" />} title="Danger Zone" desc="Irreversible actions" />

                  <div className="space-y-6">
                    <div className="p-5 rounded-xl bg-red-500/[0.03] border border-red-500/10">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h4 className="text-base font-bold text-white">Delete Account</h4>
                          <p className="text-sm text-gray-400 mt-1">
                            Permanently delete your account and all associated data. This action cannot be undone.
                          </p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-red-400 font-mono">
                            <AlertCircle className="w-3.5 h-3.5" />
                            All clips, projects, and billing data will be erased
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setShowDeleteModal(true)}
                          className="shrink-0 px-6 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-sm font-bold transition-all flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Account
                        </motion.button>
                      </div>
                    </div>

                    <div className="p-5 rounded-xl bg-[#00E5FF]/5 border border-[#00E5FF]/10">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/10 flex items-center justify-center border border-[#00E5FF]/20 shrink-0">
                          <ExternalLink className="w-5 h-5 text-[#00E5FF]" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">Export Data</h4>
                          <p className="text-xs text-gray-400 mt-1">Download all your clips, projects, and settings as a JSON archive.</p>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="mt-3 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-300 hover:text-white transition-all"
                          >
                            Export My Data
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-[#0D0E12] border border-red-500/20 rounded-2xl w-full max-w-md shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                    <Trash2 className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-white">Delete Account</h2>
                    <p className="text-xs text-red-400 font-mono mt-0.5">This action is irreversible</p>
                  </div>
                </div>
                <motion.button whileHover={{ scale: 1.1 }} onClick={() => setShowDeleteModal(false)} className="text-gray-400 hover:text-white p-1">
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-gray-300 leading-relaxed">
                  To confirm, please type <strong className="text-red-400">{user?.email}</strong> below:
                </p>
                <input
                  type="text"
                  value={deleteConfirm}
                  onChange={e => setDeleteConfirm(e.target.value)}
                  placeholder={user?.email || 'Enter your email'}
                  className="w-full bg-[#111317] border border-red-500/30 rounded-xl py-2.5 px-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-red-500/50 transition-all"
                />
                <div className="flex items-start gap-3 p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-400 font-mono leading-relaxed">
                    This will permanently delete your account, all clips, projects, and billing data. You will not be able to recover any data after this.
                  </p>
                </div>
              </div>
              <div className="p-6 border-t border-white/5 flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm font-bold text-gray-400 hover:text-white hover:border-white/20 transition-all"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirm !== user?.email || saving}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold shadow-lg shadow-red-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  {saving ? 'Deleting...' : 'Delete Forever'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
