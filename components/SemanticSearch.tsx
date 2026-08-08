'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2, Sparkles } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { getRelativeTime } from '@/lib/time';

export function SemanticSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
  }, [supabase.auth]);

  useEffect(() => {
    if (!query.trim() || !userId) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, userId })
        });
        const data = await res.json();
        if (data.clips) {
          setResults(data.clips);
        }
      } catch (e) {
        console.error("Search failed", e);
      } finally {
        setIsSearching(false);
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(timer);
  }, [query, userId]);

  return (
    <div className="relative w-full z-20 mb-8">
      <div className="relative flex items-center">
        <div className="absolute left-4 text-gray-400">
          {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Semantic Search: 'find my clip about money mindset'..."
          className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#B026FF]/50 transition-all shadow-lg backdrop-blur-md font-medium"
        />
        <div className="absolute right-4 text-[#B026FF]">
          <Sparkles className="w-5 h-5" />
        </div>
      </div>

      {/* Results Dropdown */}
      {results.length > 0 && query.trim() !== '' && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#0A0B0E]/95 backdrop-blur-xl border border-white/10 rounded-xl p-2 shadow-2xl overflow-hidden max-h-96 overflow-y-auto">
          {results.map((clip) => (
            <div key={clip.id} className="flex gap-4 items-start p-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer group">
              <div className="w-24 h-36 bg-white/5 rounded-md overflow-hidden relative flex-shrink-0 border border-white/5 group-hover:border-white/20 transition-all">
                {clip.thumbnail_url ? (
                  <img src={clip.thumbnail_url} alt="Thumbnail" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">No Thumb</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white truncate pr-4">{clip.hook || 'Untitled Clip'}</h4>
                  <span className="text-xs font-mono text-[#00E5FF] bg-[#00E5FF]/10 px-2 py-0.5 rounded-full">
                    {(clip.similarity * 100).toFixed(0)}% Match
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">{clip.transcript_segment}</p>
                <div className="mt-3 flex items-center gap-3 text-xs text-gray-500 font-mono">
                  <span>{clip.duration_sec}s</span>
                  <span>•</span>
                  <span>{getRelativeTime(clip.created_at)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
