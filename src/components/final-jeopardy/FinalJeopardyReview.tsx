import { formatCurrencyValue, formatScore } from '../../lib/score-utils';
import type { FinalJeopardyTeamRow } from './types';

interface FinalJeopardyReviewProps {
  correctResponse: string;
  teams: FinalJeopardyTeamRow[];
  isHostView: boolean;
  onSetJudgment?: (teamId: string, isCorrect: boolean) => void;
  onApplyResults?: () => void;
}

export function FinalJeopardyReview({
  correctResponse,
  teams,
  isHostView,
  onSetJudgment,
  onApplyResults,
}: FinalJeopardyReviewProps) {
  const allJudged = teams.every((team) => typeof team.judgment === 'boolean');

  return (
    <section className="final-stage-panel">
      <p className="brand-overline text-xs font-semibold uppercase tracking-[0.45em]">
        Final Jeopardy
      </p>
      <h2 className="brand-title mt-4 text-4xl font-black uppercase tracking-[0.16em] sm:text-5xl">
        Review
      </h2>

      <div className="panel-inset mt-8 border-amber-300/20 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-100/80">
          {isHostView ? 'Correct Response' : 'Review In Progress'}
        </p>
        <p className="brand-title mt-4 text-2xl font-bold leading-tight text-amber-50 sm:text-3xl">
          {isHostView ? correctResponse : 'The host is judging each team response.'}
        </p>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        {teams.map((team) => (
          <div key={team.id} className="final-team-card">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="score-name text-2xl font-bold uppercase tracking-[0.08em]">
                  {team.name}
                </p>
                <p className="brand-subtitle mt-1 text-sm uppercase tracking-[0.22em]">
                  {formatScore(team.startingScore)} start • {formatCurrencyValue(team.wager ?? 0)} wager
                </p>
              </div>
              {typeof team.judgment === 'boolean' ? (
                <span className="brand-tag">{team.judgment ? 'Correct' : 'Incorrect'}</span>
              ) : null}
            </div>

            <div className="panel-inset mt-4 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-300">
                Response
              </p>
              <p className="mt-3 text-lg leading-7 text-slate-50">
                {team.response.trim() || 'No response recorded.'}
              </p>
            </div>

            {isHostView ? (
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => onSetJudgment?.(team.id, true)}
                  className="control-button"
                >
                  Mark Correct
                </button>
                <button
                  type="button"
                  onClick={() => onSetJudgment?.(team.id, false)}
                  className="secondary-button"
                >
                  Mark Incorrect
                </button>
              </div>
            ) : null}
          </div>
        ))}
      </div>

      {isHostView && onApplyResults ? (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={onApplyResults}
            disabled={!allJudged}
            className="control-button disabled:cursor-not-allowed disabled:opacity-50"
          >
            Apply Results
          </button>
        </div>
      ) : null}
    </section>
  );
}
