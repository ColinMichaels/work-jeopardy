import type { GameMediaReference } from '../types/game-config';

export type ResolvedMediaType = GameMediaReference['type'] | 'youtube';

function parseUrlCandidate(value: string): URL | null {
  try {
    return new URL(value, 'https://work-jeopardy.local');
  } catch {
    return null;
  }
}

function parseYouTubeStartSeconds(url: URL): number | null {
  const rawValue = url.searchParams.get('start') ?? url.searchParams.get('t');

  if (!rawValue) {
    return null;
  }

  const numericValue = Number.parseInt(rawValue, 10);
  return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : null;
}

function extractYouTubeVideoId(url: URL): string | null {
  const host = url.hostname.replace(/^www\./, '').toLowerCase();
  const pathname = url.pathname.replace(/^\/+/, '');

  if (host === 'youtu.be') {
    return pathname.split('/')[0] || null;
  }

  if (!host.endsWith('youtube.com') && host !== 'youtube-nocookie.com') {
    return null;
  }

  if (pathname === 'watch') {
    return url.searchParams.get('v');
  }

  const pathSegments = pathname.split('/');

  if (pathSegments[0] === 'embed' || pathSegments[0] === 'shorts' || pathSegments[0] === 'live') {
    return pathSegments[1] || null;
  }

  return null;
}

export function getYouTubeEmbedUrl(
  source: string,
  options?: {
    autoplay?: boolean;
  },
): string | null {
  const parsedUrl = parseUrlCandidate(source);

  if (!parsedUrl) {
    return null;
  }

  const videoId = extractYouTubeVideoId(parsedUrl);

  if (!videoId) {
    return null;
  }

  const embedUrl = new URL(`https://www.youtube-nocookie.com/embed/${videoId}`);
  embedUrl.searchParams.set('rel', '0');
  embedUrl.searchParams.set('playsinline', '1');

  const startSeconds = parseYouTubeStartSeconds(parsedUrl);

  if (startSeconds) {
    embedUrl.searchParams.set('start', String(startSeconds));
  }

  if (options?.autoplay) {
    embedUrl.searchParams.set('autoplay', '1');
  }

  return embedUrl.toString();
}

export function getResolvedMediaType(media: GameMediaReference): ResolvedMediaType {
  if (media.type === 'video' && getYouTubeEmbedUrl(media.src)) {
    return 'youtube';
  }

  return media.type;
}

export function getMediaLabel(media: GameMediaReference, index: number): string {
  const resolvedType = getResolvedMediaType(media);

  if (resolvedType === 'youtube') {
    return `YouTube ${index + 1}`;
  }

  return `${resolvedType.charAt(0).toUpperCase()}${resolvedType.slice(1)} ${index + 1}`;
}
