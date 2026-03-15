import { useEffect, useMemo, useState } from 'react';
import type { GameMediaReference } from '../types/game-config';
import { buildDomId } from '../lib/dom-ids';
import { getMediaLabel, getResolvedMediaType } from '../lib/media-utils';
import { MediaViewer } from './MediaViewer';
import { Tooltip } from './Tooltip';

interface ClueMediaPanelProps {
  media: GameMediaReference[];
  clueTitle: string;
  activeLightboxIndex: number | null;
  canOpenLightbox: boolean;
  compact?: boolean;
  displayMode?: 'panel' | 'stage-controls';
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
  const lightboxId = buildDomId('clue-media-lightbox', clueTitle);

  if (!activeMedia) {
    return null;
  }

  return (
    <div
      id={`${lightboxId}-overlay`}
      className="scene-overlay-enter fixed inset-0 z-[70] bg-[#0a33c8]"
    >
      <div
        id={lightboxId}
        className="scene-stage-enter clue-stage-scene flex h-full min-h-0 flex-col"
      >
        <div
          id={`${lightboxId}-header`}
          className="flex shrink-0 flex-wrap items-start justify-between gap-3 px-4 py-4 sm:px-6 sm:py-5"
        >
          <div id={`${lightboxId}-meta`} className="flex flex-wrap items-center gap-2">
            <span className="clue-stage-chip">Clue Media</span>
            <span className="clue-stage-chip">{clueTitle}</span>
            <span className="clue-stage-chip">
              {getResolvedMediaType(activeMedia) === 'youtube'
                ? 'YouTube'
                : getResolvedMediaType(activeMedia)}
            </span>
          </div>

          <div id={`${lightboxId}-controls`} className="flex flex-wrap items-center justify-end gap-2">
            {media.length > 1 && canClose ? (
              media.map((entry, index) => {
                const isActive = index === activeLightboxIndex;

                return (
                  <button
                    id={buildDomId(lightboxId, 'item', index + 1)}
                    key={`${entry.type}-${entry.src}-${index}`}
                    type="button"
                    onClick={() => onSelectMedia(index)}
                    className={[
                      'clue-stage-chip clue-stage-chip--interactive',
                      isActive ? 'clue-stage-chip--accent' : '',
                    ].join(' ')}
                  >
                    {getMediaLabel(entry, index)}
                  </button>
                );
              })
            ) : null}
            {canClose ? (
              <button
                id={`${lightboxId}-close`}
                type="button"
                onClick={onClose}
                className="clue-stage-chip clue-stage-chip--interactive"
              >
                Close
              </button>
            ) : null}
          </div>
        </div>

        <div
          id={`${lightboxId}-body`}
          className="min-h-0 flex-1 overflow-hidden px-4 pb-4 sm:px-6 sm:pb-6"
        >
          <div id={`${lightboxId}-viewer`} className="h-full overflow-hidden">
            <MediaViewer
              media={activeMedia}
              title={`${clueTitle} media`}
              mode="lightbox"
              autoplay={shouldAutoplay}
            />
          </div>
        </div>

        {activeMedia.alt ? (
          <div id={`${lightboxId}-caption`} className="shrink-0 px-4 pb-4 sm:px-6 sm:pb-6">
            <p className="mx-auto max-w-[min(92vw,1400px)] text-center text-sm leading-6 text-slate-100/88 [text-shadow:0_2px_0_rgba(0,0,0,0.28),0_8px_20px_rgba(0,0,0,0.24)]">
              {activeMedia.alt}
            </p>
          </div>
        ) : null}
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
  displayMode = 'panel',
  shouldAutoplay = false,
  playbackEnabled = true,
  onOpenLightbox,
  onCloseLightbox,
}: ClueMediaPanelProps) {
  const [previewIndex, setPreviewIndex] = useState(0);
  const mediaPanelId = buildDomId('clue-media', clueTitle, displayMode);

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
  const shouldRenderLightbox = playbackEnabled && activeLightboxIndex !== null;

  if (displayMode === 'stage-controls') {
    if (!canOpenLightbox && !shouldRenderLightbox) {
      return null;
    }

    return (
      <>
        {canOpenLightbox ? (
          <div
            id={`${mediaPanelId}-stage-controls`}
            className="flex flex-wrap items-center justify-end gap-2"
          >
            {media.length > 1
              ? media.map((entry, index) => {
                  const isActive = index === previewIndex;

                  return (
                    <button
                      id={buildDomId(mediaPanelId, 'stage-item', index + 1)}
                      key={`${entry.type}-${entry.src}-${index}`}
                      type="button"
                      onClick={() => setPreviewIndex(index)}
                      className={[
                        'clue-stage-chip clue-stage-chip--interactive',
                        isActive ? 'clue-stage-chip--accent' : '',
                      ].join(' ')}
                    >
                      {getMediaLabel(entry, index)}
                    </button>
                  );
                })
              : null}

            <Tooltip
              content={
                playbackEnabled
                  ? 'Open this clue media as a full-screen stage view.'
                  : 'Show this clue media on the shared gameboard window.'
              }
            >
              <button
                id={`${mediaPanelId}-show`}
                type="button"
                onClick={() => onOpenLightbox(previewIndex)}
                className="clue-stage-chip clue-stage-chip--interactive"
              >
                {playbackEnabled ? 'Show Media' : 'Show On Board'}
              </button>
            </Tooltip>
          </div>
        ) : null}

        {shouldRenderLightbox ? (
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

  return (
    <>
      <div id={`${mediaPanelId}-panel`} className="panel-inset mt-6 p-4">
        <div id={`${mediaPanelId}-panel-header`} className="flex items-start justify-between gap-3">
          <div id={`${mediaPanelId}-panel-meta`}>
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
                id={`${mediaPanelId}-expand`}
                type="button"
                onClick={() => onOpenLightbox(previewIndex)}
                className={[
                  playbackEnabled ? 'control-button' : 'secondary-button',
                  'px-3 py-1.5 text-[11px] tracking-[0.16em]',
                ].join(' ')}
              >
                {playbackEnabled ? 'Expand' : 'Show On Board'}
              </button>
            </Tooltip>
          ) : null}
        </div>

        <div
          id={`${mediaPanelId}-preview`}
          className="mt-4 overflow-hidden rounded-[1.5rem] border border-white/10 bg-[rgba(2,8,33,0.8)]"
        >
          <MediaViewer
            media={previewMedia}
            title={`${clueTitle} media`}
            compact={compact}
            autoplay={shouldAutoplayPreview}
            playbackEnabled={playbackEnabled}
          />
        </div>

        {previewMedia.alt ? (
          <p id={`${mediaPanelId}-preview-caption`} className="mt-3 text-sm leading-6 text-slate-200">
            {previewMedia.alt}
          </p>
        ) : null}

        {media.length > 1 ? (
          <div id={`${mediaPanelId}-preview-items`} className="mt-4 flex flex-wrap gap-2">
            {media.map((entry, index) => {
              const isActive = index === previewIndex;

              return (
                <button
                  id={buildDomId(mediaPanelId, 'preview-item', index + 1)}
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

      {shouldRenderLightbox ? (
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
