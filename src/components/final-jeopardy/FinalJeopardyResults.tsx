import { formatCurrencyValue, formatScore } from '../../lib/score-utils';
import type { TeamState } from '../../models/team';
import type { FinalJeopardyTeamRow } from './types';

interface FinalJeopardyResultsProps {
  correctResponse: string;
  teams: TeamState[];
  eligibleTeams: FinalJeopardyTeamRow[];
  winnerIds: string[];
  isHostView: boolean;
  onResetGame?: () => void;
}

export function FinalJeopardyResults({
  correctResponse,
  teams,
  eligibleTeams,
  winnerIds,
  isHostView,
  onResetGame,
}: FinalJeopardyResultsProps) {
  const sortedTeams = [...teams].sort((left, right) => right.score - left.score);
  const winners = sortedTeams.filter((team) => winnerIds.includes(team.id));

  return (
    <section className="final-stage-panel">
      <p className="brand-overline text-xs font-semibold uppercase tracking-[0.45em]">
        Final Jeopardy
      </p>
      <h2 className="brand-title mt-4 text-4xl font-black uppercase tracking-[0.16em] sm:text-5xl">
        Results
      </h2>

      <div className="panel-inset mt-8 border-amber-300/20 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-100/80">
          Correct Response
        </p>
        <p className="brand-title mt-4 text-2xl font-bold leading-tight text-amber-50 sm:text-3xl">
          {correctResponse}
        </p>
      </div>

      <div className="mt-8 grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="space-y-4">
          {sortedTeams.map((team) => {
            const eligibleTeam = eligibleTeams.find((entry) => entry.id === team.id);
            const isWinner = winnerIds.includes(team.id);

            return (
              <div
                key={team.id}
                className={[
                  'final-team-card',
                  isWinner ? 'border-amber-300/45 bg-amber-300/10' : '',
                ].join(' ')}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="score-name text-2xl font-bold uppercase tracking-[0.08em]">
                      {team.name}
                    </p>
                    {eligibleTeam ? (
                      <p className="brand-subtitle mt-1 text-sm uppercase tracking-[0.22em]">
                        {formatScore(eligibleTeam.startingScore)} start •{' '}
                        {formatCurrencyValue(eligibleTeam.wager ?? 0)} wager
                      </p>
                    ) : (
                      <p className="brand-subtitle mt-1 text-sm uppercase tracking-[0.22em]">
                        Did not participate
                      </p>
                    )}
                  </div>
                  {isWinner ? <span className="brand-tag">Winner</span> : null}
                </div>

                <p
                  className={[
                    'score-value mt-4 text-4xl font-black',
                    team.score < 0 ? 'score-value--negative' : '',
                  ].join(' ')}
                >
                  {formatScore(team.score)}
                </p>
              </div>
            );
          })}
        </div>

        <div className="panel-inset p-5">
          <p className="brand-overline text-xs font-semibold uppercase tracking-[0.35em]">
            Winner
          </p>
          <div className="mt-4 space-y-3">
            {winners.map((winner) => (
              <div key={winner.id} className="final-team-card">
                <p className="score-name text-2xl font-bold uppercase tracking-[0.08em]">
                  {winner.name}
                </p>
                <p
                  className={[
                    'score-value mt-2 text-3xl font-black',
                    winner.score < 0 ? 'score-value--negative' : '',
                  ].join(' ')}
                >
                  {formatScore(winner.score)}
                </p>
              </div>
            ))}
          </div>

          {isHostView && onResetGame ? (
            <div className="mt-6">
              <button type="button" onClick={onResetGame} className="danger-button w-full">
                Reset Game
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
