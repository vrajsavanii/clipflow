'use client';

import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Trash2 } from 'lucide-react';
import { deleteProjectAction } from '@/app/actions/project';
import { useRouter } from 'next/navigation';

export function ProjectDropdown({ projectId, className }: { projectId: string, className?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to the project page
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    setIsDeleting(true);
    try {
      await deleteProjectAction(projectId);
      router.refresh();
      // It will unmount once deleted, so no need to reset state
    } catch (err) {
      alert('Failed to delete project');
      setIsDeleting(false);
      setIsOpen(false);
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(!isOpen);
  };

  return (
    <div className={className || "absolute top-2 right-2 z-30"} ref={menuRef}>
      <button 
        onClick={handleToggle}
        className="p-1.5 bg-black/60 hover:bg-black/80 text-gray-400 hover:text-white rounded-lg backdrop-blur-md transition-all border border-white/10 opacity-0 group-hover:opacity-100"
        title="Project Options"
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-36 bg-[#14161B] border border-white/10 rounded-xl shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-full text-left px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {isDeleting ? (
              <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      )}
    </div>
  );
}
