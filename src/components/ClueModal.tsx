import type { ResolvedClue } from '../models/game';
import type { TeamState } from '../models/team';
import { formatCurrencyValue } from '../lib/score-utils';
import { Tooltip } from './Tooltip';

interface ClueModalProps {
  clueEntry: ResolvedClue | null;
  isRevealed: boolean;
  teams: TeamState[];
  activeTeamId: string | null;
  subtractOnIncorrect: boolean;
  variant?: 'interactive' | 'presentation';
  onSelectTeam: (teamId: string) => void;
  onReveal: () => void;
  onMarkCorrect: () => void;
  onMarkIncorrect: () => void;
  onClose: () => void;
}

export function ClueModal({
  clueEntry,
  isRevealed,
  teams,
  activeTeamId,
  subtractOnIncorrect,
  variant = 'interactive',
  onSelectTeam,
  onReveal,
  onMarkCorrect,
  onMarkIncorrect,
  onClose,
}: ClueModalProps) {
  if (!clueEntry) {
    return null;
  }

  const { clue, categoryTitle } = clueEntry;
  const isPresentation = variant === 'presentation';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 p-4 backdrop-blur-sm sm:p-6">
      <div className="modal-shell mx-auto flex h-full max-w-6xl flex-col">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
          <div>
            <p className="brand-overline text-xs font-semibold uppercase tracking-[0.45em]">
              {categoryTitle}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h2 className="brand-title text-3xl font-black sm:text-4xl">
                {formatCurrencyValue(clue.value)}
              </h2>
              {clue.dailyDouble ? <span className="brand-tag">Daily Double</span> : null}
            </div>
          </div>

          {!isPresentation ? (
            <Tooltip content="Close the current clue and return to the board.">
              <button type="button" onClick={onClose} className="secondary-button">
                Close
              </button>
            </Tooltip>
          ) : null}
        </div>

        <div
          className={[
            'grid flex-1 gap-6 overflow-y-auto p-6',
            isPresentation ? '' : 'xl:grid-cols-[minmax(0,1fr)_320px]',
          ].join(' ')}
        >
          <section className="panel-inset p-6">
            <p className="brand-overline text-xs font-semibold uppercase tracking-[0.35em]">Clue</p>
            <p className="brand-title mt-5 text-3xl font-bold leading-tight sm:text-5xl sm:leading-tight">
              {clue.answer}
            </p>

            {!isPresentation && clue.notes ? (
              <div className="panel-inset mt-6 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                  Host Notes
                </p>
                <p className="mt-2 text-base text-slate-200">{clue.notes}</p>
              </div>
            ) : null}

            {!isPresentation && clue.media?.length ? (
              <div className="panel-inset mt-6 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                  Media References
                </p>
                <ul className="mt-2 space-y-2 text-sm text-slate-200">
                  {clue.media.map((media) => (
                    <li key={`${media.type}-${media.src}`}>
                      {media.type}: {media.src}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="panel-inset mt-6 border-amber-300/20 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-100/80">
                  Correct Response
                </p>
                {!isRevealed && !isPresentation ? (
                  <Tooltip content="Reveal the correct Jeopardy-style response for the room.">
                    <button type="button" onClick={onReveal} className="control-button">
                      Reveal
                    </button>
                  </Tooltip>
                ) : null}
              </div>

              {isRevealed ? (
                <p className="brand-title mt-4 text-2xl font-bold leading-tight text-amber-50 sm:text-4xl sm:leading-tight">
                  {clue.question}
                </p>
              ) : (
                <div className="panel-muted mt-4 flex min-h-24 items-center justify-center text-[11px] font-semibold uppercase tracking-[0.32em]">
                  Hidden
                </div>
              )}
            </div>
          </section>

          {!isPresentation ? (
            <aside className="space-y-4">
              <section className="panel-inset p-5">
                <p className="brand-overline text-xs font-semibold uppercase tracking-[0.35em]">
                  Active Team
                </p>
                <div className="mt-4 space-y-2">
                  {teams.map((team) => {
                    const isActive = team.id === activeTeamId;

                    return (
                      <button
                        key={team.id}
                        type="button"
                        onClick={() => onSelectTeam(team.id)}
                        className={[
                          'w-full rounded-2xl border px-4 py-3 text-left transition',
                          isActive
                            ? 'border-amber-300/50 bg-amber-300/10 text-slate-50'
                            : 'border-white/10 bg-[rgba(4,10,36,0.72)] text-slate-200 hover:border-sky-300/30',
                        ].join(' ')}
                      >
                        <span className="block text-lg font-bold">
                          {team.name.trim() || 'Unnamed Team'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="panel-inset p-5">
                <p className="brand-overline text-xs font-semibold uppercase tracking-[0.35em]">
                  Score Clue
                </p>
                <div className="mt-4 space-y-3">
                  <Tooltip content="Award this clue value to the currently active team.">
                    <button
                      type="button"
                      onClick={onMarkCorrect}
                      disabled={!activeTeamId}
                      className="control-button w-full disabled:cursor-not-allowed disabled:opacity-50"
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
                      className="secondary-button w-full disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Mark Incorrect{' '}
                      {subtractOnIncorrect ? `(${formatCurrencyValue(clue.value)})` : '(no penalty)'}
                    </button>
                  </Tooltip>
                  <Tooltip content="Return to the board without changing scores.">
                    <button type="button" onClick={onClose} className="secondary-button w-full">
                      Return to Board
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
