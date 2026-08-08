'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { deleteProjectAction } from '@/app/actions/project';
import { useRouter } from 'next/navigation';

export function DashboardDeleteButton({ projectId }: { projectId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to the project page
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    setIsDeleting(true);
    try {
      await deleteProjectAction(projectId);
      router.refresh();
    } catch (err) {
      alert('Failed to delete project');
      setIsDeleting(false);
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className="absolute top-2 right-2 z-20 p-2 bg-black/60 hover:bg-red-500/80 text-gray-400 hover:text-white rounded-lg backdrop-blur-md transition-all border border-white/10 opacity-0 group-hover:opacity-100 disabled:opacity-50"
      title="Delete Project"
    >
      {isDeleting ? (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : (
        <Trash2 className="w-4 h-4" />
      )}
    </button>
  );
}
