import { useEffect, useMemo, useState } from 'react';
import type { GameMediaReference } from '../types/game-config';
import { getMediaLabel, getResolvedMediaType } from '../lib/media-utils';
import { MediaViewer } from './MediaViewer';
import { Tooltip } from './Tooltip';

interface ClueMediaPanelProps {
  media: GameMediaReference[];
  clueTitle: string;
  activeLightboxIndex: number | null;
  canOpenLightbox: boolean;
  compact?: boolean;
  shouldAutoplay?: boolean;
  playbackEnabled?: boolean;
  onOpenLightbox: (index: number) => void;
  onCloseLightbox: () => void;
}

interface ClueMediaLightboxProps {
  media: GameMediaReference[];
  clueTitle: string;
  activeLightboxIndex: number;
  canClose: boolean;
  shouldAutoplay: boolean;
  onSelectMedia: (index: number) => void;
  onClose: () => void;
}

function ClueMediaLightbox({
  media,
  clueTitle,
  activeLightboxIndex,
  canClose,
  shouldAutoplay,
  onSelectMedia,
  onClose,
}: ClueMediaLightboxProps) {
  const activeMedia = media[activeLightboxIndex];

  if (!activeMedia) {
    return null;
  }

  return (
    <div className="scene-overlay-enter fixed inset-0 z-[70] bg-slate-950/92 p-4 backdrop-blur-md sm:p-6">
      <div className="modal-shell scene-stage-enter mx-auto flex h-full max-w-7xl flex-col overflow-hidden">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
          <div>
            <p className="brand-overline text-xs font-semibold uppercase tracking-[0.45em]">
              Clue Media
            </p>
            <h3 className="brand-title mt-2 text-2xl font-black uppercase tracking-[0.12em] sm:text-3xl">
              {clueTitle}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="brand-tag">
              {getResolvedMediaType(activeMedia) === 'youtube'
                ? 'YouTube'
                : getResolvedMediaType(activeMedia)}
            </span>
            {canClose ? (
              <button type="button" onClick={onClose} className="secondary-button">
                Close
              </button>
            ) : null}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {media.length > 1 && canClose ? (
            <div className="mb-4 flex flex-wrap gap-2">
              {media.map((entry, index) => {
                const isActive = index === activeLightboxIndex;

                return (
                  <button
                    key={`${entry.type}-${entry.src}-${index}`}
                    type="button"
                    onClick={() => onSelectMedia(index)}
                    className={[
                      'rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] transition',
                      isActive
                        ? 'border-amber-300/45 bg-amber-300/10 text-amber-50'
                        : 'border-white/10 bg-white/5 text-slate-200 hover:border-sky-300/30',
                    ].join(' ')}
                  >
                    {getMediaLabel(entry, index)}
                  </button>
                );
              })}
            </div>
          ) : null}

          <div className="overflow-hidden rounded-[1.7rem] border border-white/10 bg-[rgba(2,8,33,0.86)]">
            <MediaViewer
              media={activeMedia}
              title={`${clueTitle} media`}
              mode="lightbox"
              autoplay={shouldAutoplay}
            />
          </div>

          {activeMedia.alt ? (
            <p className="mt-4 text-sm leading-6 text-slate-200">{activeMedia.alt}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function ClueMediaPanel({
  media,
  clueTitle,
  activeLightboxIndex,
  canOpenLightbox,
  compact = false,
  shouldAutoplay = false,
  playbackEnabled = true,
  onOpenLightbox,
  onCloseLightbox,
}: ClueMediaPanelProps) {
  const [previewIndex, setPreviewIndex] = useState(0);

  useEffect(() => {
    setPreviewIndex(0);
  }, [media]);

  useEffect(() => {
    if (previewIndex >= media.length) {
      setPreviewIndex(0);
    }
  }, [media.length, previewIndex]);

  useEffect(() => {
    if (activeLightboxIndex !== null && media[activeLightboxIndex]) {
      setPreviewIndex(activeLightboxIndex);
    }
  }, [activeLightboxIndex, media]);

  const previewMedia = useMemo(
    () => media[previewIndex] ?? media[0],
    [media, previewIndex],
  );

  if (!previewMedia) {
    return null;
  }

  const shouldAutoplayPreview =
    playbackEnabled && shouldAutoplay && activeLightboxIndex === null;
  const shouldAutoplayLightbox =
    playbackEnabled && shouldAutoplay && activeLightboxIndex !== null;

  return (
    <>
      <div className="panel-inset mt-6 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              Clue Media
            </p>
            <div className="mt-1 space-y-1">
              <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">
                {media.length} item{media.length === 1 ? '' : 's'}
              </p>
              {!playbackEnabled ? (
                <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">
                  Playback On Gameboard
                </p>
              ) : null}
            </div>
          </div>

          {canOpenLightbox ? (
            <Tooltip
              content={
                playbackEnabled
                  ? 'Open this clue media in a larger synced lightbox view.'
                  : 'Show this clue media on the shared gameboard window.'
              }
            >
              <button
                type="button"
                onClick={() => onOpenLightbox(previewIndex)}
                className="secondary-button"
              >
                {playbackEnabled ? 'Expand' : 'Show On Board'}
              </button>
            </Tooltip>
          ) : null}
        </div>

        <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-white/10 bg-[rgba(2,8,33,0.8)]">
          <MediaViewer
            media={previewMedia}
            title={`${clueTitle} media`}
            compact={compact}
            autoplay={shouldAutoplayPreview}
            playbackEnabled={playbackEnabled}
          />
        </div>

        {previewMedia.alt ? (
          <p className="mt-3 text-sm leading-6 text-slate-200">{previewMedia.alt}</p>
        ) : null}

        {media.length > 1 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {media.map((entry, index) => {
              const isActive = index === previewIndex;

              return (
                <button
                  key={`${entry.type}-${entry.src}-${index}`}
                  type="button"
                  onClick={() => setPreviewIndex(index)}
                  className={[
                    'rounded-full border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] transition',
                    isActive
                      ? 'border-amber-300/45 bg-amber-300/10 text-amber-50'
                      : 'border-white/10 bg-white/5 text-slate-200 hover:border-sky-300/30',
                  ].join(' ')}
                >
                  {getMediaLabel(entry, index)}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {playbackEnabled && activeLightboxIndex !== null ? (
        <ClueMediaLightbox
          media={media}
          clueTitle={clueTitle}
          activeLightboxIndex={activeLightboxIndex}
          canClose={canOpenLightbox}
          shouldAutoplay={shouldAutoplayLightbox}
          onSelectMedia={onOpenLightbox}
          onClose={onCloseLightbox}
        />
      ) : null}
    </>
  );
}
