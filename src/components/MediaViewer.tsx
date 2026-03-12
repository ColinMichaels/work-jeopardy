import type { GameMediaReference } from '../types/game-config';
import { getResolvedMediaType, getYouTubeEmbedUrl } from '../lib/media-utils';

interface MediaViewerProps {
  media: GameMediaReference;
  title: string;
  mode?: 'inline' | 'lightbox';
  compact?: boolean;
  autoplay?: boolean;
  playbackEnabled?: boolean;
}

function PlaybackPlaceholder({
  label,
  frameHeightClass,
}: {
  label: string;
  frameHeightClass: string;
}) {
  return (
    <div
      className={`flex items-center justify-center bg-slate-950/70 px-6 py-8 ${frameHeightClass || 'min-h-[140px]'}`}
    >
      <div className="max-w-xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
          {label}
        </p>
        <p className="mt-3 text-sm leading-6 text-slate-200">
          Playback is routed to the shared gameboard window.
        </p>
      </div>
    </div>
  );
}

export function MediaViewer({
  media,
  title,
  mode = 'inline',
  compact = false,
  autoplay = false,
  playbackEnabled = true,
}: MediaViewerProps) {
  const resolvedType = getResolvedMediaType(media);
  const isLightbox = mode === 'lightbox';
  const frameHeightClass =
    resolvedType === 'audio'
      ? ''
      : isLightbox
        ? 'min-h-[50vh] sm:min-h-[62vh]'
        : compact
          ? 'min-h-[220px] sm:min-h-[260px]'
          : 'min-h-[280px] sm:min-h-[360px]';

  if (resolvedType === 'image') {
    return (
      <div className={`flex items-center justify-center bg-slate-950/70 ${frameHeightClass}`}>
        <img
          src={media.src}
          alt={media.alt ?? title}
          loading={isLightbox ? 'eager' : 'lazy'}
          className="max-h-[78vh] w-full object-contain"
        />
      </div>
    );
  }

  if (resolvedType === 'youtube') {
    if (!playbackEnabled) {
      return <PlaybackPlaceholder label="YouTube" frameHeightClass={frameHeightClass} />;
    }

    const embedUrl = getYouTubeEmbedUrl(media.src, { autoplay });

    return (
      <div className={`bg-slate-950/70 ${frameHeightClass}`}>
        <iframe
          key={`${media.src}-${autoplay ? 'autoplay' : 'manual'}`}
          src={embedUrl ?? media.src}
          title={title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="aspect-video h-full w-full border-0"
        />
      </div>
    );
  }

  if (resolvedType === 'video') {
    if (!playbackEnabled) {
      return <PlaybackPlaceholder label="Video" frameHeightClass={frameHeightClass} />;
    }

    return (
      <div className={`bg-slate-950/70 ${frameHeightClass}`}>
        <video
          key={`${media.src}-${autoplay ? 'autoplay' : 'manual'}`}
          controls
          autoPlay={autoplay}
          playsInline
          preload="metadata"
          className="aspect-video h-full w-full bg-slate-950 object-contain"
        >
          <source src={media.src} />
          Your browser could not play this video source.
        </video>
      </div>
    );
  }

  if (!playbackEnabled) {
    return <PlaybackPlaceholder label="Audio" frameHeightClass="" />;
  }

  return (
    <div className="flex min-h-[140px] items-center justify-center bg-slate-950/70 px-6 py-8">
      <div className="w-full max-w-2xl space-y-4">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
          Audio
        </p>
        <audio
          key={`${media.src}-${autoplay ? 'autoplay' : 'manual'}`}
          controls
          autoPlay={autoplay}
          preload="metadata"
          className="w-full"
        >
          <source src={media.src} />
          Your browser could not play this audio source.
        </audio>
      </div>
    </div>
  );
}
