'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import { Search, LayoutDashboard, Video, Calendar, Palette, Settings, Sparkles, Folder, LogOut, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function CommandPalette({ open, setOpen }: { open: boolean; setOpen: (o: boolean) => void }) {
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [setOpen]);

  const runCommand = React.useCallback(
    (command: () => unknown) => {
      setOpen(false);
      command();
    },
    [setOpen]
  );

  return (
    <AnimatePresence>
      {open && (
        <Command.Dialog 
          open={open} 
          onOpenChange={setOpen}
          label="Global Command Menu"
          className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/40 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-full max-w-2xl bg-[#0F1115] border border-white/10 rounded-xl overflow-hidden shadow-2xl flex flex-col"
          >
            <div className="flex items-center px-4 py-3 border-b border-white/5 bg-[#14161B]">
              <Search className="w-5 h-5 text-gray-400 mr-3" />
              <Command.Input 
                autoFocus 
                placeholder="Search projects, actions, or jump to..." 
                className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-gray-500 font-mono text-sm"
              />
              <div className="flex items-center gap-1">
                <kbd className="bg-white/10 px-2 py-0.5 rounded text-[10px] font-mono text-gray-400 border border-white/5">ESC</kbd>
              </div>
            </div>

            <Command.List className="max-h-[300px] overflow-y-auto p-2 scrollbar-hide">
              <Command.Empty className="py-6 text-center text-sm text-gray-500 font-mono">
                No results found.
              </Command.Empty>

              <Command.Group heading={<div className="px-3 py-2 text-[10px] font-bold tracking-wider text-gray-500 uppercase">Suggestions</div>}>
                <Command.Item onSelect={() => runCommand(() => router.push('/dashboard'))} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white aria-selected:bg-[#00E5FF]/10 aria-selected:text-[#00E5FF] cursor-pointer transition-colors">
                  <LayoutDashboard className="w-4 h-4" /> Go to Dashboard
                </Command.Item>
                <Command.Item onSelect={() => runCommand(() => router.push('/projects'))} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white aria-selected:bg-[#00E5FF]/10 aria-selected:text-[#00E5FF] cursor-pointer transition-colors">
                  <Folder className="w-4 h-4" /> View All Projects
                </Command.Item>
                <Command.Item onSelect={() => runCommand(() => router.push('/brand-kit'))} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white aria-selected:bg-[#00E5FF]/10 aria-selected:text-[#00E5FF] cursor-pointer transition-colors">
                  <Palette className="w-4 h-4" /> Open Brand Kit
                </Command.Item>
              </Command.Group>

              <Command.Group heading={<div className="px-3 py-2 text-[10px] font-bold tracking-wider text-gray-500 uppercase mt-2">Actions</div>}>
                <Command.Item onSelect={() => runCommand(() => router.push('/dashboard'))} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#00FFA3] aria-selected:bg-[#00FFA3]/10 cursor-pointer transition-colors">
                  <Sparkles className="w-4 h-4" /> Create New AI Clip
                </Command.Item>
              </Command.Group>

              <Command.Group heading={<div className="px-3 py-2 text-[10px] font-bold tracking-wider text-gray-500 uppercase mt-2">Settings</div>}>
                <Command.Item onSelect={() => runCommand(() => router.push('/settings'))} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white aria-selected:bg-white/10 cursor-pointer transition-colors">
                  <Settings className="w-4 h-4" /> Account Settings
                </Command.Item>
                <Command.Item onSelect={() => runCommand(() => router.push('/settings'))} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white aria-selected:bg-white/10 cursor-pointer transition-colors">
                  <CreditCard className="w-4 h-4" /> Billing & Usage
                </Command.Item>
                <Command.Item onSelect={() => runCommand(() => console.log('logout'))} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:text-red-300 aria-selected:bg-red-500/10 cursor-pointer transition-colors">
                  <LogOut className="w-4 h-4" /> Sign Out
                </Command.Item>
              </Command.Group>
            </Command.List>
          </motion.div>
        </Command.Dialog>
      )}
    </AnimatePresence>
  );
}
