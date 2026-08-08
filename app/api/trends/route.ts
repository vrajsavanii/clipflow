import { NextResponse } from 'next/server';

// YouTube Trending RSS feed
const YT_TRENDING_RSS = 'https://www.youtube.com/feeds/videos.xml?chart=mostpopular&hl=en&regionCode=US';

interface TrendItem {
  title: string;
  videoId: string;
  published: string;
  author: string;
  thumbnail: string;
}

async function fetchYouTubeTrends(): Promise<TrendItem[]> {
  try {
    const res = await fetch(YT_TRENDING_RSS, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    if (!res.ok) return [];
    const xml = await res.text();

    // Parse entries from the XML
    const entries: TrendItem[] = [];
    const entryMatches = xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g);
    for (const match of entryMatches) {
      const entry = match[1];
      const title = entry.match(/<title>([\s\S]*?)<\/title>/)?.[1] || '';
      const videoId = entry.match(/<yt:videoId>([\s\S]*?)<\/yt:videoId>/)?.[1] || '';
      const published = entry.match(/<published>([\s\S]*?)<\/published>/)?.[1] || '';
      const author = entry.match(/<name>([\s\S]*?)<\/name>/)?.[1] || '';

      if (videoId) {
        entries.push({
          title: title.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"'),
          videoId,
          published,
          author: author.replace(/&amp;/g, '&'),
          thumbnail: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
        });
      }
      if (entries.length >= 8) break;
    }
    return entries;
  } catch {
    return [];
  }
}

// Categorize trends by detecting keywords in titles
function categorizeTrend(title: string): { hook: string; category: string; emoji: string } {
  const lower = title.toLowerCase();

  if (/\b(secret|truth|exposed|they don't want|nobody talks)\b/.test(lower))
    return { hook: 'Expose Hook', category: 'Controversy', emoji: '🔥' };
  if (/\b(\d+\s*(ways|tips|tricks|steps|reasons|things|hacks))\b/.test(lower))
    return { hook: 'List Hook', category: 'Education', emoji: '📋' };
  if (/\b(i tried|we tried|day in|my|24 hours)\b/.test(lower))
    return { hook: 'Day In Life', category: 'Lifestyle', emoji: '📅' };
  if (/\b(how (to|i|we)|tutorial|guide|learn)\b/.test(lower))
    return { hook: 'Tutorial Hook', category: 'Education', emoji: '🎓' };
  if (/\b(react|watching|first time|surprised)\b/.test(lower))
    return { hook: 'Reaction Hook', category: 'Entertainment', emoji: '😮' };
  if (/\b(million|billion|rich|money|income|passive|invest)\b/.test(lower))
    return { hook: 'Money Hook', category: 'Finance', emoji: '💰' };
  if (/\b(vs|vs\.|versus|battle|compared)\b/.test(lower))
    return { hook: 'Comparison Hook', category: 'Versus', emoji: '⚔️' };

  return { hook: 'Story Hook', category: 'General', emoji: '💡' };
}

export async function GET() {
  const trends = await fetchYouTubeTrends();

  const enriched = trends.map((t) => ({
    ...t,
    ...categorizeTrend(t.title),
  }));

  // If YouTube RSS fails (e.g. blocked), return curated mock data
  if (enriched.length === 0) {
    return NextResponse.json({
      source: 'mock',
      trends: [
        { title: '"Day in the life" formats outperforming all other hooks by 42% this week', hook: 'Day In Life', category: 'Lifestyle', emoji: '📅' },
        { title: 'Reaction videos to AI tools getting 3x average views', hook: 'Reaction Hook', category: 'Entertainment', emoji: '😮' },
        { title: '"I tried X for 30 days" content surging across all niches', hook: 'Story Hook', category: 'General', emoji: '💡' },
        { title: 'Finance & money revelation hooks dominating Shorts', hook: 'Money Hook', category: 'Finance', emoji: '💰' },
        { title: 'Controversial takes under 60 seconds hitting the algorithm hard', hook: 'Expose Hook', category: 'Controversy', emoji: '🔥' },
      ]
    });
  }

  return NextResponse.json({ source: 'youtube', trends: enriched });
}
