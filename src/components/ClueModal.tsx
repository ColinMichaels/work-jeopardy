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

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 p-4 backdrop-blur-sm sm:p-6">
      <div className="mx-auto flex h-full max-w-6xl flex-col rounded-[2rem] border border-amber-300/20 bg-slate-900/95 shadow-board">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.45em] text-sky-200/70">
              {categoryTitle}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h2 className="font-display text-3xl font-black text-slate-50 sm:text-4xl">
                {formatCurrencyValue(clue.value)}
              </h2>
              {clue.dailyDouble ? (
                <span className="rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-amber-100">
                  Daily Double
                </span>
              ) : null}
            </div>
          </div>

          <Tooltip content="Close the current clue and return to the board.">
            <button type="button" onClick={onClose} className="secondary-button">
              Close
            </button>
          </Tooltip>
        </div>

        <div className="grid flex-1 gap-6 overflow-y-auto p-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <section className="rounded-[1.5rem] border border-white/10 bg-slate-950/40 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-200/70">
              Clue
            </p>
            <p className="mt-5 font-display text-3xl font-bold leading-tight text-slate-50 sm:text-5xl sm:leading-tight">
              {clue.answer}
            </p>

            {clue.notes ? (
              <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Host Notes</p>
                <p className="mt-2 text-base text-slate-200">{clue.notes}</p>
              </div>
            ) : null}

            {clue.media?.length ? (
              <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Media References</p>
                <ul className="mt-2 space-y-2 text-sm text-slate-200">
                  {clue.media.map((media) => (
                    <li key={`${media.type}-${media.src}`}>
                      {media.type}: {media.src}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="mt-6 rounded-[1.5rem] border border-amber-300/20 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-100/80">
                  Correct Response
                </p>
                {!isRevealed ? (
                  <Tooltip content="Reveal the correct Jeopardy-style response for the room.">
                    <button type="button" onClick={onReveal} className="control-button">
                      Reveal
                    </button>
                  </Tooltip>
                ) : null}
              </div>

              {isRevealed ? (
                <p className="mt-4 font-display text-2xl font-bold leading-tight text-amber-50 sm:text-4xl sm:leading-tight">
                  {clue.question}
                </p>
              ) : (
                <div className="mt-4 flex min-h-24 items-center justify-center rounded-2xl border border-dashed border-amber-300/20 bg-slate-950/35 text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-400">
                  Hidden
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-4">
            <section className="rounded-[1.5rem] border border-white/10 bg-slate-950/40 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-200/70">
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
                          : 'border-white/10 bg-slate-900/70 text-slate-200 hover:border-sky-300/30',
                      ].join(' ')}
                    >
                      <span className="block text-lg font-bold">{team.name.trim() || 'Unnamed Team'}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-[1.5rem] border border-white/10 bg-slate-950/40 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-200/70">
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
                    Mark Incorrect {subtractOnIncorrect ? `(${formatCurrencyValue(clue.value)})` : '(no penalty)'}
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
        </div>
      </div>
    </div>
  );
}
