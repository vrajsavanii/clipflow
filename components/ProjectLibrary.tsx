'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Plus, Filter, MoreVertical, 
  Play, Download, Trash2, Clock, CheckCircle2, AlertCircle, LayoutGrid, List,
  FolderOpen, Flame, Share2, Sparkles, Video, Image
} from 'lucide-react';
import { EmptyState } from './EmptyState';

import { ProjectDropdown } from '@/components/ProjectDropdown';

export function ProjectLibrary({ initialProjects }: { initialProjects: any[] }) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Ready' | 'Processing' | 'Failed'>('All');
  const [activeFolder, setActiveFolder] = useState<'all' | 'recent' | 'favorites' | 'archived'>('all');

  // Filter projects
  const filteredProjects = initialProjects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'All' ? true : p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col h-full space-y-8">
      
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black font-heading tracking-tight text-white flex items-center gap-3">
            Media Library <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs font-mono font-bold text-gray-400 border border-white/10">{initialProjects.length}</span>
          </h1>
          <p className="text-sm text-gray-400 mt-2">Manage your processed media, sort by viral potential, and bulk export to platforms.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Link href="/dashboard" className="hidden md:flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#9945FF] to-[#00E5FF] hover:opacity-90 rounded-xl text-black font-bold text-sm shadow-[0_0_20px_rgba(0,229,255,0.2)] transition-all">
            <Plus className="w-4 h-4" /> New Project
          </Link>
        </div>
      </div>

      {/* Advanced Toolbar */}
      <div className="glass-panel p-2 rounded-2xl border border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 bg-[#0A0B0E]/60 backdrop-blur-xl">
        
        {/* Smart Folders */}
        <div className="flex gap-1 overflow-x-auto w-full md:w-auto no-scrollbar">
          {[
            { id: 'all', label: 'All Projects', icon: <FolderOpen className="w-4 h-4" /> },
            { id: 'recent', label: 'Recently Processed', icon: <Clock className="w-4 h-4" /> },
            { id: 'favorites', label: 'High Viral Score', icon: <Flame className="w-4 h-4" /> },
          ].map(folder => (
            <button 
              key={folder.id}
              onClick={() => setActiveFolder(folder.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                activeFolder === folder.id 
                  ? 'bg-white/10 text-white shadow-inner border border-white/10' 
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              {folder.icon} {folder.label}
            </button>
          ))}
        </div>

        {/* Filters & View Toggle */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64 group">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-[#00E5FF] transition-colors" />
            <input 
              type="text" 
              placeholder="Search projects or tags..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#050505] border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-[#00E5FF]/50 focus:ring-1 focus:ring-[#00E5FF]/50 transition-all placeholder:text-gray-600 shadow-inner"
            />
          </div>
          <div className="relative hidden sm:block">
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="appearance-none bg-[#050505] border border-white/10 rounded-xl py-2 pl-4 pr-10 text-sm text-gray-300 focus:outline-none focus:border-[#9945FF]/50 cursor-pointer shadow-inner"
            >
              <option value="All">All Statuses</option>
              <option value="Ready">Ready to Post</option>
              <option value="Processing">Processing</option>
              <option value="Failed">Failed</option>
            </select>
            <Filter className="w-3.5 h-3.5 text-gray-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="hidden lg:flex items-center bg-[#050505] border border-white/10 rounded-xl p-1 shadow-inner ml-2">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white/10 text-[#00E5FF] shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white/10 text-[#00E5FF] shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Projects Grid/List */}
      {filteredProjects.length === 0 ? (
        <div className="py-12">
          <EmptyState 
            title={searchQuery ? 'No matching projects' : 'Your library is empty'}
            description={searchQuery ? 'We couldn\'t find any projects matching your search or filter criteria. Try clearing them.' : 'Upload your first long-form video to start generating viral short-form clips instantly.'}
            icon={<FolderOpen className="w-10 h-10" />}
            primaryAction={searchQuery ? {
              label: 'Clear Filters',
              onClick: () => { setSearchQuery(''); setFilterStatus('All'); }
            } : {
              label: 'Create Project',
              href: '/dashboard'
            }}
          />
        </div>
      ) : (
        <motion.div 
          layout
          className={
            viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12" 
              : "flex flex-col gap-3 pb-12"
          }
        >
          <AnimatePresence>
            {filteredProjects.map((project) => {
              // Simulated AI data for visual richness
              const mockViralScore = Math.floor(Math.random() * 30) + 70; 
              
              return (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                key={project.id} 
                className={`glass-panel border border-white/5 overflow-hidden group hover:border-[#00E5FF]/40 transition-all duration-500 hover:shadow-[0_8px_30px_rgba(0,229,255,0.15)] bg-gradient-to-b from-[#0A0B0E] to-[#050505]
                  ${viewMode === 'grid' ? 'rounded-3xl flex flex-col' : 'rounded-2xl flex flex-row h-28 items-center pr-4'}
                `}
              >
                {/* Thumbnail Area */}
                <div className={`relative ${project.img} ${viewMode === 'grid' ? 'aspect-[16/10] w-full p-4 flex flex-col justify-between' : 'w-48 h-full p-3 flex flex-col justify-between shrink-0 border-r border-white/5'}`}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="flex justify-between items-start relative z-10 w-full">
                    <div className="flex flex-col gap-2">
                      {/* Status Badge */}
                      {project.status === 'Ready' && (
                        <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-[#00FFA3]/20 text-[#00FFA3] border border-[#00FFA3]/30 backdrop-blur-md flex items-center gap-1.5 shadow-sm uppercase tracking-widest w-fit">
                          <CheckCircle2 className="w-3 h-3" /> Ready
                        </span>
                      )}
                      {project.status === 'Processing' && (
                        <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 backdrop-blur-md flex items-center gap-1.5 shadow-sm uppercase tracking-widest w-fit">
                          <span className="animate-pulse flex h-2 w-2 rounded-full bg-yellow-500"></span> Processing
                        </span>
                      )}

                      {/* Platform Tags (Mock) */}
                      {project.status === 'Ready' && viewMode === 'grid' && (
                        <div className="flex gap-1">
                           <div className="w-5 h-5 rounded bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center"><Video className="w-3 h-3 text-red-500" /></div>
                           <div className="w-5 h-5 rounded bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center"><Image className="w-3 h-3 text-pink-500" /></div>
                        </div>
                      )}
                    </div>

                    <ProjectDropdown projectId={project.id} className="relative z-30 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {/* Play Overlay */}
                  {project.status === 'Ready' && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity scale-90 group-hover:scale-100 duration-500">
                      <Link href={`/clips/${project.id}`} className="w-12 h-12 rounded-full bg-[#00E5FF]/20 flex items-center justify-center backdrop-blur-md border border-[#00E5FF]/50 hover:bg-[#00E5FF]/40 transition-colors shadow-[0_0_30px_rgba(0,229,255,0.4)] relative">
                        <div className="absolute inset-0 bg-[#00E5FF] rounded-full blur-md opacity-20"></div>
                        <Play className="w-5 h-5 text-[#00E5FF] ml-1 relative z-10" />
                      </Link>
                    </div>
                  )}

                  {/* Duration & Views Badge */}
                  <div className="relative z-10 flex justify-between items-end w-full">
                    <span className="px-2 py-1 bg-black/60 rounded-md text-[10px] font-mono backdrop-blur-md border border-white/10 text-white shadow-sm">
                      <Clock className="w-3 h-3 inline mr-1" /> {project.duration}
                    </span>
                  </div>
                </div>

                {/* Content Area */}
                <div className={`${viewMode === 'grid' ? 'p-5 flex flex-col gap-4 flex-1' : 'flex-1 min-w-0 px-6 py-2 flex items-center justify-between'}`}>
                  
                  <div className={`${viewMode === 'grid' ? '' : 'flex flex-col justify-center min-w-0 w-1/3'}`}>
                    <Link href={project.status === 'Ready' ? `/clips/${project.id}` : '#'} className="font-bold text-lg text-white hover:text-[#00E5FF] transition-colors truncate block font-heading">
                      {project.title}
                    </Link>
                    <div className="flex items-center gap-3 text-xs text-gray-500 font-mono mt-1">
                      <span>{project.time}</span>
                    </div>
                  </div>

                  {/* AI Metadata Area */}
                  {project.status === 'Ready' && (
                    <div className={`${viewMode === 'grid' ? 'grid grid-cols-2 gap-3 mb-2' : 'flex items-center gap-6 w-1/3'}`}>
                      <div className="space-y-1">
                        <div className="text-[10px] text-gray-500 font-mono uppercase">AI Viral Score</div>
                        <div className="flex items-center gap-1.5 text-sm font-bold font-mono text-white">
                           <Flame className={`w-4 h-4 ${mockViralScore > 90 ? 'text-[#FF0055]' : 'text-yellow-500'}`} /> {mockViralScore}.4%
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] text-gray-500 font-mono uppercase">Yield</div>
                        <div className="flex items-center gap-1.5 text-sm font-bold font-mono text-[#00E5FF]">
                           <Sparkles className="w-4 h-4" /> {project.clips} clips
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Footer / Actions Area */}
                  {project.status === 'Processing' ? (
                    <div className={`${viewMode === 'grid' ? 'space-y-2 mt-auto' : 'w-64 ml-4 shrink-0'}`}>
                      <div className="flex justify-between text-[10px] font-mono text-[#9945FF] font-bold uppercase tracking-widest">
                        <span>LLaMA 3.3 Analysis</span>
                        <span>{project.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-[#050505] rounded-full overflow-hidden border border-white/5 shadow-inner">
                        <div 
                          className="h-full bg-gradient-to-r from-[#9945FF] to-[#00E5FF] transition-all duration-1000 ease-out shadow-[0_0_15px_#00E5FF] relative"
                          style={{ width: `${project.progress}%` }}
                        >
                          <div className="absolute inset-0 bg-white/20 animate-[shimmer_1s_infinite]"></div>
                        </div>
                      </div>
                    </div>
                  ) : project.status === 'Ready' ? (
                    <div className={`${viewMode === 'grid' ? 'mt-auto flex items-center gap-2 pt-4 border-t border-white/5' : 'flex items-center gap-3 shrink-0'}`}>
                      <Link href={`/clips/${project.id}`} className="flex-1 text-center py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold text-white transition-all hover:border-white/20 shadow-sm">
                        Open Studio
                      </Link>

                    </div>
                  ) : null}

                  {viewMode === 'list' && (
                    <ProjectDropdown projectId={project.id} className="relative z-30 shrink-0" />
                  )}
                </div>
              </motion.div>
            )})}
          </AnimatePresence>
        </motion.div>
      )}
      
      {/* Infinite Scroll Mock */}
      {filteredProjects.length > 0 && (
        <div className="py-8 flex justify-center">
          <div className="w-8 h-8 border-2 border-[#00E5FF] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}
