'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Video, BarChart, Palette, Calendar, HardDrive,
  Zap, Users, Settings, Search, Bell, Sparkles, Plus, Menu, X, Cpu,
  CreditCard, Command, AlertCircle
} from 'lucide-react';
import { CommandPalette } from '@/components/CommandPalette';
import { PageTransition } from '@/components/PageTransition';

import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface UserProfile {
  name: string;
  initial: string;
  plan: string;
  minutesLimit: number;
  minutesUsed: number;
  creditsRemaining: number;
}

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/projects': 'Projects',
  '/analytics': 'Analytics',
  '/brand-kit': 'Brand Kit',
  '/schedule': 'Auto Schedule',
  '/media': 'Media Library',
  '/machines': 'GPU Machines',
  '/integrations': 'Integrations',
  '/settings': 'Settings',
};

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.035 } },
};

const staggerItem = {
  hidden: { opacity: 0, x: -16 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const },
  },
};

function NavLink({
  item,
  isActive,
  onNav,
}: {
  item: { name: string; href: string; icon: React.ReactNode };
  isActive: boolean;
  onNav: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onNav}
      className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
        isActive
          ? 'bg-white/[0.06] text-white font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]'
          : 'text-gray-400 hover:text-white hover:bg-white/[0.03]'
      }`}
    >
      {isActive && (
        <motion.div
          layoutId="activeNav"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
          style={{
            background: 'linear-gradient(to bottom, #9945FF, #00E5FF)',
            boxShadow: '0 0 12px rgba(0, 229, 255, 0.4)',
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        />
      )}
      <span
        className={`shrink-0 transition-colors ${
          isActive ? 'text-[#00E5FF]' : 'text-gray-500 group-hover:text-gray-300'
        }`}
      >
        {item.icon}
      </span>
      <span className="text-sm font-medium tracking-tight">{item.name}</span>
    </Link>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(false);

  const toggleSidebar = useCallback(() => setIsSidebarOpen((p) => !p), []);
  const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);
  const openCmd = useCallback(() => setCmdOpen(true), []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCmdOpen(true);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadProfile() {
      try {
        setProfileLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          if (!cancelled) setProfileLoading(false);
          return;
        }
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (error && error.code !== 'PGRST116') throw error;
        if (!cancelled) {
          if (profile) {
            setUserProfile({
              name: user.email?.split('@')[0] || 'User',
              initial: (user.email?.[0] || 'U').toUpperCase(),
              plan: profile.plan || 'starter',
              minutesLimit: profile.credits_limit || 120,
              minutesUsed: profile.credits_used || 0,
              creditsRemaining: (profile.credits_limit || 120) - (profile.credits_used || 0),
            });
          } else {
            const defaults = {
              id: user.id,
              plan: 'starter',
              credits_used: 0,
              credits_limit: 120,
            };
            const { error: upsertError } = await supabase.from('profiles').upsert(defaults);
            if (upsertError) throw upsertError;
            setUserProfile({
              name: user.email?.split('@')[0] || 'User',
              initial: (user.email?.[0] || 'U').toUpperCase(),
              plan: 'starter',
              minutesLimit: 120,
              minutesUsed: 0,
              creditsRemaining: 120,
            });
          }
        }
      } catch (err: any) {
        const errorMsg = err?.message || err?.details || (typeof err === 'object' ? JSON.stringify(err) : String(err));
        console.error('Profile load error:', errorMsg, err);
        if (!cancelled) {
          setUserProfile((prev) => prev || {
            name: 'User',
            initial: 'U',
            plan: 'starter',
            minutesLimit: 120,
            minutesUsed: 0,
            creditsRemaining: 120,
          });
        }
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    }
    loadProfile();
    return () => { cancelled = true; };
  }, [supabase]);

  const mainNav = [
    { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="w-[18px] h-[18px]" /> },
    { name: 'Projects', href: '/projects', icon: <Video className="w-[18px] h-[18px]" /> },
    { name: 'Analytics', href: '/analytics', icon: <BarChart className="w-[18px] h-[18px]" /> },
  ];

  const toolsNav = [
    { name: 'Brand Kit', href: '/brand-kit', icon: <Palette className="w-[18px] h-[18px]" /> },
    { name: 'Auto Schedule', href: '/schedule', icon: <Calendar className="w-[18px] h-[18px]" /> },
    { name: 'Media Library', href: '/media', icon: <HardDrive className="w-[18px] h-[18px]" /> },
    { name: 'GPU Machines', href: '/machines', icon: <Cpu className="w-[18px] h-[18px]" /> },
    { name: 'Integrations', href: '/integrations', icon: <Zap className="w-[18px] h-[18px]" /> },
  ];

  const spaceNav = [
    { name: 'Workspace', href: '/settings', icon: <Users className="w-[18px] h-[18px]" /> },
    { name: 'Settings', href: '/settings', icon: <Settings className="w-[18px] h-[18px]" /> },
  ];

  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname?.startsWith(href + '/'));

  const pageTitle =
    pageTitles[pathname] ||
    pathname?.split('/').filter(Boolean).pop()?.replace(/-/g, ' ') ||
    'Dashboard';

  const minutesRemaining = userProfile
    ? Math.max(0, userProfile.minutesLimit - userProfile.minutesUsed)
    : 0;

  const planBadgeVariant = userProfile?.plan === 'pro' ? 'premium' : 'primary';

  return (

    <div className="relative flex h-screen w-screen overflow-hidden bg-[#050505] text-white">
      <CommandPalette open={cmdOpen} setOpen={setCmdOpen} />

      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="glow-orb bg-[#9945FF] w-[50vw] h-[50vw] top-[-10%] left-[-5%]" />
        <div className="glow-orb bg-[#00E5FF] w-[40vw] h-[40vw] bottom-[-10%] right-[-5%]" />
        <div className="glow-orb bg-[#FF6B9D] w-[30vw] h-[30vw] top-[40%] right-[15%]" />
        <div className="glow-orb bg-[#00FFA3] w-[25vw] h-[25vw] top-[10%] right-[35%] opacity-60" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '256px 256px',
          }}
        />
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={closeSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`
          fixed md:relative inset-y-0 left-0 z-50
          w-[260px] flex flex-col shrink-0
          bg-[#0A0B0E]/90 backdrop-blur-2xl
          border-r border-white/[0.04]
          shadow-2xl shadow-black/50
          transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/[0.04] px-5">
          <Link href="/dashboard" onClick={closeSidebar} className="flex items-center gap-2.5 group">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#9945FF] to-[#00E5FF] shadow-lg shadow-[#9945FF]/25 group-hover:shadow-[#00E5FF]/40 transition-shadow duration-300">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-heading text-xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              ClipFlow
            </span>
          </Link>
          <button
            className="flex md:hidden text-gray-500 hover:text-white transition-colors"
            onClick={closeSidebar}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* New Project */}
        <div className="px-4 pt-4 pb-3">
          <Button
            variant="cyan"
            size="default"
            className="w-full gap-2 shadow-[0_0_20px_rgba(0,229,255,0.12)] hover:shadow-[0_0_30px_rgba(0,229,255,0.25)]"
            onClick={() => { closeSidebar(); setCmdOpen(true); }}
          >
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 pb-4 scrollbar-hide">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="space-y-5"
          >
            <div>
              <div className="px-3 mb-1.5 text-[10px] font-bold tracking-[0.12em] text-gray-500 uppercase">
                Main
              </div>
              <nav className="space-y-0.5">
                {mainNav.map((item) => (
                  <motion.div key={item.name} variants={staggerItem}>
                    <NavLink item={item} isActive={isActive(item.href)} onNav={closeSidebar} />
                  </motion.div>
                ))}
              </nav>
            </div>

            <div>
              <div className="px-3 mb-1.5 text-[10px] font-bold tracking-[0.12em] text-gray-500 uppercase">
                AI Tools
              </div>
              <nav className="space-y-0.5">
                {toolsNav.map((item) => (
                  <motion.div key={item.name} variants={staggerItem}>
                    <NavLink item={item} isActive={isActive(item.href)} onNav={closeSidebar} />
                  </motion.div>
                ))}
              </nav>
            </div>

            <div>
              <div className="px-3 mb-1.5 text-[10px] font-bold tracking-[0.12em] text-gray-500 uppercase">
                Space
              </div>
              <nav className="space-y-0.5">
                {spaceNav.map((item) => (
                  <motion.div key={item.name} variants={staggerItem}>
                    <NavLink item={item} isActive={isActive(item.href)} onNav={closeSidebar} />
                  </motion.div>
                ))}
              </nav>
            </div>
          </motion.div>
        </div>

        {/* User Profile Card */}
        <div className="shrink-0 border-t border-white/[0.04] p-4">
          <Link href="/settings" onClick={closeSidebar} className="block group">
            <div className="flex items-center gap-3 rounded-xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/[0.04] p-2.5 transition-all duration-200 hover:bg-white/[0.05] hover:border-white/[0.08]">
              {profileLoading ? (
                <>
                  <div className="h-9 w-9 shrink-0 rounded-full bg-white/[0.04] animate-pulse" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-20 rounded bg-white/[0.04] animate-pulse" />
                    <div className="h-2 w-14 rounded bg-white/[0.03] animate-pulse" />
                  </div>
                </>
              ) : profileError ? (
                <div className="flex items-center gap-3 text-sm text-red-400 py-1">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>Could not load profile</span>
                </div>
              ) : userProfile ? (
                <>
                  <Avatar initials={userProfile.initial} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate group-hover:text-[#00E5FF] transition-colors">
                      {userProfile.name}
                    </p>
                    <Badge variant={planBadgeVariant} size="sm" className="mt-0.5">
                      {userProfile.plan === 'pro' ? 'PRO' : 'FREE'}
                    </Badge>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3 text-sm text-gray-500 py-1">
                  <span>Not signed in</span>
                </div>
              )}
            </div>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="relative z-10 flex flex-1 flex-col min-w-0">
        {/* Header */}
        <header className="relative z-20 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-white/[0.04] bg-[#050505]/40 backdrop-blur-2xl px-4 md:px-6">
          {/* Left: Hamburger + Page Title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              className="flex md:hidden text-gray-400 hover:text-white p-1 -ml-1 transition-colors"
              onClick={toggleSidebar}
              aria-label="Toggle sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="font-heading text-base font-bold tracking-tight truncate md:text-lg md:font-black">
              {pageTitle}
            </span>
          </div>

          {/* Center: Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md">
            <Input
              readOnly
              icon={<Search className="h-4 w-4 text-gray-600 group-hover:text-gray-400 transition-colors" />}
              placeholder="Search or jump to..."
              onClick={openCmd}
              className="cursor-pointer rounded-full border-white/[0.06] bg-white/[0.04] text-sm text-gray-500 placeholder:text-gray-600 hover:border-white/[0.12] hover:bg-white/[0.06] hover:text-gray-400 transition-all duration-200"
            />
            <kbd className="hidden sm:flex items-center gap-1 rounded border border-white/[0.06] bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-mono text-gray-500 -ml-10 mt-2.5 h-fit z-10">
              <Command className="h-3 w-3" />
              K
            </kbd>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <Link
              href="/settings"
              className="hidden sm:flex items-center gap-1.5 rounded-full border border-[#9945FF]/20 bg-[#9945FF]/8 px-3 py-1 text-xs font-mono text-[#9945FF] transition-all hover:bg-[#9945FF]/15"
            >
              <CreditCard className="h-3.5 w-3.5" />
              <span className="font-bold">
                {profileLoading ? '...' : `${minutesRemaining}m`}
              </span>
              <span className="text-[#9945FF]/60 hidden xl:inline">left</span>
            </Link>

            <button className="relative flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.06] bg-white/[0.04] text-gray-400 transition-all hover:bg-white/[0.08] hover:text-white">
              <Bell className="h-4 w-4" />
              <motion.span
                className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#FF0055]"
                style={{ boxShadow: '0 0 8px rgba(255, 0, 85, 0.5)' }}
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut', delay: 2 }}
              />
            </button>

            <button
              onClick={openCmd}
              className="btn-premium-cyan flex h-8 w-8 items-center justify-center rounded-full shadow-[0_0_15px_rgba(0,229,255,0.1)] hover:shadow-[0_0_25px_rgba(0,229,255,0.25)] transition-all duration-300"
              aria-label="Create new"
            >
              <Plus className="h-4 w-4 text-black" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="relative flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>

  );
}
