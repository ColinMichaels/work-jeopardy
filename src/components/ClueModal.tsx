import type { ResolvedClue } from '../models/game';
import type { TeamState } from '../models/team';
import { formatCurrencyValue } from '../lib/score-utils';
import { ClueMediaPanel } from './ClueMediaPanel';
import { Tooltip } from './Tooltip';

interface ClueModalProps {
  clueEntry: ResolvedClue | null;
  isRevealed: boolean;
  teams: TeamState[];
  activeTeamId: string | null;
  subtractOnIncorrect: boolean;
  variant?: 'interactive' | 'presentation';
  activeMediaIndex: number | null;
  onSelectTeam: (teamId: string) => void;
  onReveal: () => void;
  onMarkCorrect: () => void;
  onMarkIncorrect: () => void;
  onClose: () => void;
  onRestoreClue: () => void;
  onOpenMedia: (index: number) => void;
  onCloseMedia: () => void;
}

export function ClueModal({
  clueEntry,
  isRevealed,
  teams,
  activeTeamId,
  subtractOnIncorrect,
  variant = 'interactive',
  activeMediaIndex,
  onSelectTeam,
  onReveal,
  onMarkCorrect,
  onMarkIncorrect,
  onClose,
  onRestoreClue,
  onOpenMedia,
  onCloseMedia,
}: ClueModalProps) {
  if (!clueEntry) {
    return null;
  }

  const { clue, categoryTitle } = clueEntry;
  const isPresentation = variant === 'presentation';

  return (
    <div className="scene-overlay-enter fixed inset-0 z-50 bg-slate-950/85 p-2 backdrop-blur-sm sm:p-4">
      <div className="modal-shell scene-stage-enter mx-auto flex h-full max-h-full max-w-[min(96vw,1320px)] min-h-0 flex-col overflow-hidden">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-4 py-3 sm:px-5 sm:py-4">
          <div>
            <p className="brand-overline text-[11px] font-semibold uppercase tracking-[0.36em]">
              {categoryTitle}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2.5">
              <h2 className="brand-title text-[clamp(1.7rem,4vw,2.75rem)] font-black">
                {formatCurrencyValue(clue.value)}
              </h2>
              {clue.dailyDouble ? <span className="brand-tag px-2 py-1 text-[10px] tracking-[0.16em]">Daily Double</span> : null}
            </div>
          </div>

          {!isPresentation ? (
            <Tooltip content="Close the current clue and return to the board.">
              <button
                type="button"
                onClick={onClose}
                className="secondary-button px-3 py-1.5 text-[10px] tracking-[0.14em]"
              >
                Close
              </button>
            </Tooltip>
          ) : null}
        </div>

        <div
          className={[
            'grid min-h-0 flex-1 gap-4 overflow-hidden p-3 sm:p-4',
            isPresentation ? '' : 'xl:grid-cols-[minmax(0,1fr)_290px]',
          ].join(' ')}
        >
          <section className="panel-inset flex min-h-0 flex-col p-4 sm:p-5">
            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
              <p className="brand-overline text-[11px] font-semibold uppercase tracking-[0.28em]">Clue</p>
              <p className="brand-title mt-4 text-[clamp(1.8rem,5vh,4rem)] font-bold leading-[1.05]">
                {clue.answer}
              </p>

              {!isPresentation && clue.notes ? (
                <div className="panel-inset mt-4 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Host Notes
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-200">{clue.notes}</p>
                </div>
              ) : null}

              {clue.media?.length ? (
                <ClueMediaPanel
                  media={clue.media}
                  clueTitle={categoryTitle}
                  activeLightboxIndex={activeMediaIndex}
                  canOpenLightbox={!isPresentation}
                  shouldAutoplay={isRevealed || activeMediaIndex !== null}
                  onOpenLightbox={onOpenMedia}
                  onCloseLightbox={onCloseMedia}
                />
              ) : null}
            </div>

            <div className="panel-inset mt-4 max-h-[32vh] shrink-0 overflow-y-auto border-amber-300/20 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 p-4 sm:max-h-[36vh]">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-100/80">
                  Correct Response
                </p>
                {!isRevealed && !isPresentation ? (
                  <Tooltip content="Reveal the correct Jeopardy-style response for the room.">
                    <button
                      type="button"
                      onClick={onReveal}
                      className="control-button px-3 py-1.5 text-[10px] tracking-[0.14em]"
                    >
                      Reveal
                    </button>
                  </Tooltip>
                ) : null}
              </div>

              {isRevealed ? (
                <p className="brand-title mt-3 text-[clamp(1.4rem,3.8vh,3rem)] font-bold leading-[1.08] text-amber-50">
                  {clue.question}
                </p>
              ) : (
                <div className="panel-muted mt-3 flex min-h-20 items-center justify-center text-[10px] font-semibold uppercase tracking-[0.24em]">
                  Hidden
                </div>
              )}
            </div>
          </section>

          {!isPresentation ? (
            <aside className="min-h-0 space-y-3 overflow-y-auto pr-1">
              <section className="panel-inset p-4">
                <p className="brand-overline text-[11px] font-semibold uppercase tracking-[0.28em]">
                  Active Team
                </p>
                <div className="mt-3 space-y-2">
                  {teams.map((team) => {
                    const isActive = team.id === activeTeamId;

                    return (
                      <button
                        key={team.id}
                        type="button"
                        onClick={() => onSelectTeam(team.id)}
                        className={[
                          'w-full rounded-[1rem] border px-3 py-2.5 text-left transition',
                          isActive
                            ? 'border-amber-300/50 bg-amber-300/10 text-slate-50'
                            : 'border-white/10 bg-[rgba(4,10,36,0.72)] text-slate-200 hover:border-sky-300/30',
                        ].join(' ')}
                      >
                        <span className="block text-base font-bold">
                          {team.name.trim() || 'Unnamed Team'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="panel-inset p-4">
                <p className="brand-overline text-[11px] font-semibold uppercase tracking-[0.28em]">
                  Score Clue
                </p>
                <div className="mt-3 space-y-2.5">
                  <Tooltip content="Award this clue value to the currently active team.">
                    <button
                      type="button"
                      onClick={onMarkCorrect}
                      disabled={!activeTeamId}
                      className="control-button w-full px-3 py-2 text-[11px] tracking-[0.16em] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Mark Correct
                    </button>
                  </Tooltip>
                  <Tooltip
                    content={
                      subtractOnIncorrect
                        ? `Subtract ${formatCurrencyValue(clue.value)} from the active team.`
                        : 'Record an incorrect answer without a score penalty.'
                    }
                  >
                    <button
                      type="button"
                      onClick={onMarkIncorrect}
                      disabled={!activeTeamId}
                      className="secondary-button w-full px-3 py-2 text-[11px] tracking-[0.16em] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Mark Incorrect{' '}
                      {subtractOnIncorrect ? `(${formatCurrencyValue(clue.value)})` : '(no penalty)'}
                    </button>
                  </Tooltip>
                  <Tooltip content="Return to the board without changing scores.">
                    <button
                      type="button"
                      onClick={onClose}
                      className="secondary-button w-full px-3 py-2 text-[11px] tracking-[0.16em]"
                    >
                      Return to Board
                    </button>
                  </Tooltip>
                  <Tooltip content="Put this clue back on the board as unused and close it.">
                    <button
                      type="button"
                      onClick={onRestoreClue}
                      className="secondary-button w-full px-3 py-2 text-[11px] tracking-[0.16em]"
                    >
                      Return Tile
                    </button>
                  </Tooltip>
                </div>
              </section>
            </aside>
          ) : null}
        </div>
      </div>
    </div>
  );
}
