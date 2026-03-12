import type { FinalJeopardyTeamRow } from './types';

interface FinalJeopardyResponsesProps {
  clue: string;
  teams: FinalJeopardyTeamRow[];
  isHostView: boolean;
  onResponseChange?: (teamId: string, response: string) => void;
  onContinue?: () => void;
}

export function FinalJeopardyResponses({
  clue,
  teams,
  isHostView,
  onResponseChange,
  onContinue,
}: FinalJeopardyResponsesProps) {
  const isReadyToReview = teams.every((team) => team.response.trim().length > 0);

  return (
    <section className="final-stage-panel">
      <p className="brand-overline text-xs font-semibold uppercase tracking-[0.45em]">
        Final Jeopardy
      </p>
      <h2 className="brand-title mt-4 text-4xl font-black uppercase tracking-[0.16em] sm:text-5xl">
        Responses
      </h2>
      <p className="brand-subtitle mt-4 text-base sm:text-lg">
        {isHostView ? 'Enter one response per eligible team.' : 'Responses are being recorded.'}
      </p>

      <div className="panel-inset mt-8 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-300">Clue</p>
        <p className="brand-title mt-3 text-2xl font-bold leading-tight sm:text-3xl">{clue}</p>
      </div>

      <div className="mt-6 grid gap-4">
        {teams.map((team) => (
          <div key={team.id} className="final-team-card">
            <p className="score-name text-2xl font-bold uppercase tracking-[0.08em]">
              {team.name}
            </p>

            {isHostView ? (
              <label className="mt-4 block">
                <span className="mb-2 block text-sm font-semibold text-slate-200">Response</span>
                <textarea
                  value={team.response}
                  onChange={(event) => onResponseChange?.(team.id, event.target.value)}
                  className="field-input min-h-28 resize-y text-lg"
                  placeholder="Enter the team response"
                />
              </label>
            ) : (
              <div className="panel-muted mt-4 flex min-h-28 items-center justify-center px-4 text-[11px] font-semibold uppercase tracking-[0.32em]">
                Hidden Until Review
              </div>
            )}
          </div>
        ))}
      </div>

      {isHostView && onContinue ? (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={onContinue}
            disabled={!isReadyToReview}
            className="control-button disabled:cursor-not-allowed disabled:opacity-50"
          >
            Continue To Review
          </button>
        </div>
      ) : null}
    </section>
  );
}
