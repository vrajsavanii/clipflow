export interface VideoValidationResult {
  valid: boolean;
  platform: string;
  videoId?: string;
}

export function validateVideoUrl(url: string): VideoValidationResult {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase();
    const pathname = parsedUrl.pathname;

    // YouTube
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
      let videoId;
      if (hostname.includes('youtu.be')) {
        videoId = pathname.slice(1);
      } else {
        videoId = parsedUrl.searchParams.get('v');
      }
      return { valid: true, platform: 'YouTube', videoId: videoId || undefined };
    }

    // Loom
    if (hostname.includes('loom.com')) {
      const match = pathname.match(/\/share\/([a-zA-Z0-9]+)/);
      return { valid: true, platform: 'Loom', videoId: match ? match[1] : undefined };
    }

    // Zoom
    if (hostname.includes('zoom.us')) {
      return { valid: true, platform: 'Zoom' };
    }

    // Vimeo
    if (hostname.includes('vimeo.com')) {
      const match = pathname.match(/\/(\d+)/);
      return { valid: true, platform: 'Vimeo', videoId: match ? match[1] : undefined };
    }

    // Google Drive
    if (hostname.includes('drive.google.com')) {
      const match = pathname.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      return { valid: true, platform: 'Google Drive', videoId: match ? match[1] : undefined };
    }

    // Riverside.fm
    if (hostname.includes('riverside.fm')) {
      return { valid: true, platform: 'Riverside.fm' };
    }

    // StreamYard
    if (hostname.includes('streamyard.com')) {
      return { valid: true, platform: 'StreamYard' };
    }

    // Direct MP4
    if (pathname.endsWith('.mp4')) {
      return { valid: true, platform: 'Direct MP4' };
    }

    return { valid: false, platform: 'Unknown' };
  } catch (error) {
    return { valid: false, platform: 'Invalid URL' };
  }
}
