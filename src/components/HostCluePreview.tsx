import type { ResolvedClue } from '../models/game';
import { formatCurrencyValue } from '../lib/score-utils';
import { ClueMediaPanel } from './ClueMediaPanel';
import { PanelWindowButton } from './PanelWindowButton';
import { Tooltip } from './Tooltip';

interface HostCluePreviewProps {
  clueEntry: ResolvedClue | null;
  isRevealed: boolean;
  activeMediaIndex: number | null;
  onReveal: () => void;
  onOpenMedia: (index: number) => void;
  onCloseMedia: () => void;
  onHide?: () => void;
}

export function HostCluePreview({
  clueEntry,
  isRevealed,
  activeMediaIndex,
  onReveal,
  onOpenMedia,
  onCloseMedia,
  onHide,
}: HostCluePreviewProps) {
  const clue = clueEntry?.clue ?? null;
  const currentClue = clueEntry?.clue ?? null;
  const canReveal = Boolean(currentClue) && !isRevealed;

  return (
    <section className="panel-inset relative p-3">
      {onHide ? (
        <div className="absolute right-4 top-4 z-10">
          <PanelWindowButton label="Hide clue preview" onClick={onHide} />
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="panel-heading">Clue Preview</p>
        </div>
        <div className="flex items-center gap-2">
          {clue?.dailyDouble ? <span className="brand-tag">Daily Double</span> : null}
          {clue ? <span className="brand-tag">{formatCurrencyValue(clue.value)}</span> : null}
        </div>
      </div>

      {clueEntry ? (
        <div className="mt-4 space-y-3">
          <div className="panel-inset p-3">
            <p className="panel-heading">{clueEntry.categoryTitle}</p>
            <p className="mt-2 text-xl font-bold leading-snug text-slate-50">
              {currentClue?.answer}
            </p>
          </div>

          {currentClue?.notes ? (
            <div className="panel-inset p-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                Host Notes
              </p>
              <p className="mt-2 text-xs leading-5 text-slate-200">{currentClue.notes}</p>
            </div>
          ) : null}

          {currentClue?.media?.length ? (
            <ClueMediaPanel
              media={currentClue.media}
              clueTitle={clueEntry.categoryTitle}
              activeLightboxIndex={activeMediaIndex}
              canOpenLightbox
              compact
              shouldAutoplay={isRevealed}
              playbackEnabled={false}
              onOpenLightbox={onOpenMedia}
              onCloseLightbox={onCloseMedia}
            />
          ) : null}

          <Tooltip
            content={
              canReveal
                ? 'Click to reveal the correct response to the board players see.'
                : 'The correct response is already live on the board.'
            }
            className="w-full"
          >
            {canReveal ? (
              <button
                type="button"
                onClick={onReveal}
                className="w-full rounded-[1.2rem] border border-amber-300/35 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 p-3 text-left transition hover:border-amber-200/60 hover:bg-amber-300/10 focus:outline-none focus:ring-4 focus:ring-amber-200/25"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-100/80">
                      Host Preview
                    </p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-amber-200/85">
                      Click To Reveal On Board
                    </p>
                  </div>
                  <span className="brand-tag px-2 py-1 text-[10px] tracking-[0.16em]">Private</span>
                </div>

                <p className="mt-2 text-lg font-bold leading-snug text-amber-50">
                  {currentClue?.question}
                </p>
              </button>
            ) : (
              <div className="rounded-[1.2rem] border border-emerald-300/25 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-100/80">
                      Host Preview
                    </p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-emerald-200/85">
                      Live On Board
                    </p>
                  </div>
                  <span className="brand-tag px-2 py-1 text-[10px] tracking-[0.16em]">Live</span>
                </div>

                <p className="mt-2 text-lg font-bold leading-snug text-emerald-50">
                  {currentClue?.question}
                </p>
              </div>
            )}
          </Tooltip>
        </div>
      ) : (
        <div className="panel-muted mt-4 px-3 py-8 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-slate-300">
            Select A Clue To Preview It Here
          </p>
        </div>
      )}
    </section>
  );
}
