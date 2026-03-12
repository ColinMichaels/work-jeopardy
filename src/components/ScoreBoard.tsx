import type { TeamState } from '../models/team';
import { formatScore } from '../lib/score-utils';
import { Tooltip } from './Tooltip';

interface ScoreBoardProps {
  teams: TeamState[];
  activeTeamId: string | null;
  isInteractive?: boolean;
  onSelectTeam: (teamId: string) => void;
}

export function ScoreBoard({
  teams,
  activeTeamId,
  isInteractive = true,
  onSelectTeam,
}: ScoreBoardProps) {
  return (
    <section className="score-ribbon px-3 py-3 sm:px-4">
      <div className="flex gap-3 overflow-x-auto pb-1">
        {teams.map((team) => {
          const isActive = team.id === activeTeamId;
          const cardClassName = [
            'score-card min-w-[210px] flex-1 rounded-[1.55rem] border px-4 py-3 text-left transition',
            'focus:outline-none focus:ring-4 focus:ring-[rgba(255,223,133,0.22)]',
            isActive ? 'score-card--active' : '',
          ]
            .filter(Boolean)
            .join(' ');

          const content = (
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="score-name text-lg font-bold uppercase sm:text-xl">
                  {team.name.trim() || 'Unnamed Team'}
                </div>
                {isActive ? (
                  <div className="mt-2 h-1.5 w-14 rounded-full bg-amber-200/75" />
                ) : (
                  <div className="mt-2 h-1.5 w-10 rounded-full bg-white/10" />
                )}
              </div>
              <div className="score-value text-2xl font-black sm:text-3xl">
                {formatScore(team.score)}
              </div>
            </div>
          );

          if (!isInteractive) {
            return (
              <div key={team.id} className={cardClassName}>
                {content}
              </div>
            );
          }

          return (
            <Tooltip
              key={team.id}
              content={
                isActive
                  ? 'This team is active for clue scoring.'
                  : 'Click to make this team active for clue scoring.'
              }
              className="min-w-[210px] flex-1"
            >
              <button
                type="button"
                onClick={() => onSelectTeam(team.id)}
                className={`${cardClassName} h-full w-full`}
              >
                {content}
              </button>
            </Tooltip>
          );
        })}
      </div>
    </section>
  );
}
