import { formatScore } from '../../lib/score-utils';
import type { FinalJeopardyTeamRow } from './types';

interface FinalJeopardyCategoryProps {
  category: string;
  teams: FinalJeopardyTeamRow[];
  isHostView: boolean;
  onStartWagering?: () => void;
}

export function FinalJeopardyCategory({
  category,
  teams,
  isHostView,
  onStartWagering,
}: FinalJeopardyCategoryProps) {
  return (
    <section className="final-stage-panel">
      <p className="brand-overline text-xs font-semibold uppercase tracking-[0.45em]">
        Final Jeopardy
      </p>
      <h2 className="brand-title mt-4 text-4xl font-black uppercase tracking-[0.16em] sm:text-5xl lg:text-6xl">
        {category}
      </h2>
      <p className="brand-subtitle mt-4 text-base sm:text-lg">
        {isHostView ? 'Reveal the category, then start the private wager phase.' : 'Final category revealed.'}
      </p>

      <div className="mt-8 grid gap-3 md:grid-cols-3">
        {teams.map((team) => (
          <div key={team.id} className="final-team-card">
            <p className="score-name text-xl font-bold uppercase tracking-[0.08em]">
              {team.name}
            </p>
            <p
              className={[
                'score-value mt-2 text-3xl font-black',
                team.score < 0 ? 'score-value--negative' : '',
              ].join(' ')}
            >
              {formatScore(team.score)}
            </p>
          </div>
        ))}
      </div>

      {isHostView && onStartWagering ? (
        <div className="mt-8 flex justify-center">
          <button type="button" onClick={onStartWagering} className="control-button">
            Start Wagering
          </button>
        </div>
      ) : null}
    </section>
  );
}
