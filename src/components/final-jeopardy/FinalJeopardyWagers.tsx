import { formatCurrencyValue, formatScore } from '../../lib/score-utils';
import type { FinalJeopardyTeamRow } from './types';

interface FinalJeopardyWagersProps {
  teams: FinalJeopardyTeamRow[];
  wagerDrafts: Record<string, string>;
  wagerErrors: Record<string, string>;
  isHostView: boolean;
  onWagerChange?: (teamId: string, value: string) => void;
  onLockWagers?: () => void;
}

export function FinalJeopardyWagers({
  teams,
  wagerDrafts,
  wagerErrors,
  isHostView,
  onWagerChange,
  onLockWagers,
}: FinalJeopardyWagersProps) {
  return (
    <section className="final-stage-panel">
      <p className="brand-overline text-xs font-semibold uppercase tracking-[0.45em]">
        Final Jeopardy
      </p>
      <h2 className="brand-title mt-4 text-4xl font-black uppercase tracking-[0.16em] sm:text-5xl">
        Wagers
      </h2>
      <p className="brand-subtitle mt-4 text-base sm:text-lg">
        {isHostView
          ? 'Enter each eligible team wager before revealing the clue.'
          : 'The host is collecting wagers.'}
      </p>

      <div className="mt-8 grid gap-4 xl:grid-cols-2">
        {teams.map((team) => (
          <div key={team.id} className="final-team-card">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="score-name text-2xl font-bold uppercase tracking-[0.08em]">
                  {team.name}
                </p>
                <p className="brand-subtitle mt-1 text-sm uppercase tracking-[0.22em]">
                  Current Score
                </p>
                <p
                  className={[
                    'score-value mt-1 text-3xl font-black',
                    team.score < 0 ? 'score-value--negative' : '',
                  ].join(' ')}
                >
                  {formatScore(team.score)}
                </p>
              </div>
              <span className="brand-tag">Max {formatCurrencyValue(team.maxWager)}</span>
            </div>

            {isHostView ? (
              <div className="mt-5">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-200">Wager</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={wagerDrafts[team.id] ?? ''}
                    onChange={(event) => onWagerChange?.(team.id, event.target.value)}
                    className="field-input text-2xl font-bold"
                    placeholder="0"
                  />
                </label>
                {wagerErrors[team.id] ? (
                  <p className="mt-2 text-sm text-rose-200">{wagerErrors[team.id]}</p>
                ) : null}
              </div>
            ) : (
              <div className="panel-muted mt-5 flex min-h-24 items-center justify-center px-4 text-[11px] font-semibold uppercase tracking-[0.32em]">
                Wager Hidden
              </div>
            )}
          </div>
        ))}
      </div>

      {isHostView && onLockWagers ? (
        <div className="mt-8 flex justify-center">
          <button type="button" onClick={onLockWagers} className="control-button">
            Lock Wagers
          </button>
        </div>
      ) : null}
    </section>
  );
}
