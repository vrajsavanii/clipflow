'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HardDrive, UploadCloud, Search, Filter, MoreVertical,
  Play, FileVideo, Music, Image, Grid3X3, List,
  Folder, Download, Trash2, Star, Clock, ArrowUpDown,
  AlertCircle, Film, Loader2, ExternalLink, Share2,
} from 'lucide-react';
import { staggerContainer, fadeInUp, fadeInScale, gridContainer, gridItem, spring } from '@/lib/animations';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/EmptyState';

export interface MediaFile {
  id: string;
  name: string;
  size: string;
  sizeBytes: number;
  date: string;
  timestamp: number;
  duration: string;
  durationSec: number;
  type: 'video' | 'audio' | 'image';
  starred: boolean;
  views: string;
  thumbnail: string | null;
  url: string;
}



const FOLDERS = [
  { id: 'all', label: 'All Media', icon: <HardDrive className="w-4 h-4" /> },
  { id: 'videos', label: 'Videos', icon: <FileVideo className="w-4 h-4" /> },
  { id: 'images', label: 'Images', icon: <Image className="w-4 h-4" /> },
  { id: 'audio', label: 'Audio', icon: <Music className="w-4 h-4" /> },
  { id: 'starred', label: 'Starred', icon: <Star className="w-4 h-4" /> },
];

const typeIcons: Record<string, React.ReactNode> = {
  video: <FileVideo className="w-4 h-4 text-red-400" />,
  image: <Image className="w-4 h-4 text-blue-400" />,
  audio: <Music className="w-4 h-4 text-green-400" />,
};

export default function MediaClient({ initialFiles }: { initialFiles: MediaFile[] }) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFolder, setActiveFolder] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date');
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const filteredFiles = useMemo(() => {
    let result = [...initialFiles];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(f => f.name.toLowerCase().includes(q));
    }

    if (activeFolder === 'videos') result = result.filter(f => f.type === 'video');
    else if (activeFolder === 'images') result = result.filter(f => f.type === 'image');
    else if (activeFolder === 'audio') result = result.filter(f => f.type === 'audio');
    else if (activeFolder === 'starred') result = result.filter(f => f.starred);

    switch (sortBy) {
      case 'name': result.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'date': result.sort((a, b) => b.timestamp - a.timestamp); break;
      case 'size': result.sort((a, b) => b.sizeBytes - a.sizeBytes); break;
    }

    return result;
  }, [searchQuery, activeFolder, sortBy]);

  const formatSize = (size: string) => size;

  const totalFiles = initialFiles.length;
  const totalSize = initialFiles.reduce((acc, f) => acc + f.sizeBytes, 0);
  const totalSizeStr = totalSize > 1024 * 1024 * 1024
    ? `${(totalSize / (1024 * 1024 * 1024)).toFixed(1)} GB`
    : `${(totalSize / (1024 * 1024)).toFixed(0)} MB`;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="max-w-7xl mx-auto space-y-8 pb-12"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center">
            <HardDrive className="w-5 h-5 text-[#00E5FF]" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">Media Library</h1>
            <p className="text-sm text-gray-400">
              {totalFiles} files &middot; {totalSizeStr} used
            </p>
          </div>
        </div>
        <Button variant="primary" size="lg" className="gap-2 shadow-[0_0_20px_rgba(0,229,255,0.2)]">
          <UploadCloud className="w-4 h-4" /> Upload Media
        </Button>
      </motion.div>

      {/* Toolbar */}
      <motion.div variants={fadeInUp} className="glass-panel rounded-2xl border border-white/5 p-2 flex flex-col md:flex-row gap-3">
        {/* Folders */}
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {FOLDERS.map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFolder(f.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                activeFolder === f.id
                  ? 'bg-white/10 text-white shadow-inner border border-white/10'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              {f.icon} {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 group">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-[#00E5FF] transition-colors" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#050505] border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-[#00E5FF]/50 focus:ring-1 focus:ring-[#00E5FF]/50 transition-all placeholder:text-gray-600 shadow-inner"
            />
          </div>

          <div className="relative hidden sm:block">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="appearance-none bg-[#050505] border border-white/10 rounded-xl py-2 pl-4 pr-10 text-sm text-gray-300 focus:outline-none focus:border-[#9945FF]/50 cursor-pointer shadow-inner"
            >
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="size">Sort by Size</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="flex items-center bg-[#050505] border border-white/10 rounded-xl p-1 shadow-inner">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white/10 text-[#00E5FF] shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white/10 text-[#00E5FF] shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Files Area */}
      {filteredFiles.length === 0 ? (
        <motion.div variants={fadeInScale}>
          <EmptyState
            title={searchQuery ? 'No matching files' : 'Your media library is empty'}
            description={searchQuery ? 'Try a different search term.' : 'Upload your first video to get started.'}
            icon={<Film className="w-10 h-10" />}
            primaryAction={searchQuery ? {
              label: 'Clear Search',
              onClick: () => setSearchQuery(''),
            } : {
              label: 'Upload Media',
              href: '/dashboard',
            }}
          />
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          {viewMode === 'grid' ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              variants={gridContainer}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
            >
              {filteredFiles.map((file, i) => (
                <motion.div
                  key={file.id}
                  variants={gridItem}
                  onHoverStart={() => setHoveredId(file.id)}
                  onHoverEnd={() => setHoveredId(null)}
                  className="group glass-panel rounded-xl border border-white/5 hover:border-white/20 transition-all overflow-hidden cursor-pointer"
                >
                  <div className="aspect-video bg-gradient-to-br from-[#111317] to-[#0A0B0E] relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    {file.type === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                          animate={hoveredId === file.id ? { scale: 1.1, opacity: 1 } : { scale: 0.9, opacity: 0.8 }}
                          className="w-10 h-10 rounded-full bg-[#00E5FF]/20 backdrop-blur-md border border-[#00E5FF]/50 flex items-center justify-center"
                        >
                          <Play className="w-5 h-5 text-[#00E5FF] ml-0.5" />
                        </motion.div>
                      </div>
                    )}
                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md rounded-lg p-1.5 border border-white/10">
                      {typeIcons[file.type]}
                    </div>
                    <div className="absolute bottom-2 right-2 text-[10px] font-mono bg-black/80 backdrop-blur-sm px-1.5 py-0.5 rounded text-white border border-white/10">
                      {file.duration}
                    </div>
                    {file.starred && (
                      <div className="absolute top-2 right-2">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h4 className="text-sm font-medium text-white group-hover:text-[#00E5FF] transition-colors truncate">
                      {file.name}
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5 font-mono">
                      {formatSize(file.size)} &middot; {file.date}
                    </p>
                    {file.type === 'video' && (
                      <p className="text-[10px] text-gray-600 mt-0.5 font-mono">{file.views} views</p>
                    )}
                    <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {file.type === 'video' && file.url !== '#' && (
                        <a href={file.url} download target="_blank" rel="noreferrer" className="flex-1 py-1 text-[10px] font-bold bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 text-[#00E5FF] rounded-lg transition-all text-center">
                          Download
                        </a>
                      )}
                      <button className="p-1 text-gray-500 hover:text-white rounded-lg hover:bg-white/10 transition-all">
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              {filteredFiles.map((file, i) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.025 }}
                  className="group glass-panel rounded-xl border border-white/5 hover:border-white/15 transition-all p-3 flex items-center gap-4 cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                    {typeIcons[file.type]}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-white group-hover:text-[#00E5FF] transition-colors truncate">
                      {file.name}
                    </h4>
                    <p className="text-xs text-gray-500 font-mono">{formatSize(file.size)}</p>
                  </div>

                  {file.type === 'video' && file.views !== '--' && (
                    <div className="text-xs text-gray-600 font-mono hidden lg:block">{file.views} views</div>
                  )}

                  <div className="text-xs text-gray-500 font-mono hidden md:block">{file.date}</div>
                  <div className="text-xs text-gray-600 font-mono hidden sm:block">{file.duration}</div>

                    <div className="flex items-center gap-1">
                    {file.starred && <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />}
                    {file.type === 'video' && file.url !== '#' && (
                      <a href={file.url} download target="_blank" rel="noreferrer" className="p-1.5 text-[#00E5FF] hover:bg-[#00E5FF]/10 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button className="p-1.5 text-gray-500 hover:text-white rounded-lg hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100">
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Load More */}
      {filteredFiles.length > 0 && filteredFiles.length >= 20 && (
        <motion.div variants={fadeInUp} className="flex justify-center pt-4">
          <button className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold text-gray-300 hover:text-white transition-all flex items-center gap-2">
            <Loader2 className="w-4 h-4" /> Load More
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
