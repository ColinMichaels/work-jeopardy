import type { TeamState } from '../models/team';
import { buildDomId } from '../lib/dom-ids';
import { formatScore } from '../lib/score-utils';
import { Tooltip } from './Tooltip';

interface ScoreBoardProps {
  scoreboardId?: string;
  teams: TeamState[];
  activeTeamId: string | null;
  isInteractive?: boolean;
  compact?: boolean;
  onSelectTeam: (teamId: string) => void;
}

export function ScoreBoard({
  scoreboardId = 'score-board',
  teams,
  activeTeamId,
  isInteractive = true,
  compact = false,
  onSelectTeam,
}: ScoreBoardProps) {
  return (
    <section
      id={scoreboardId}
      className={`score-ribbon ${compact ? 'px-2 py-2 sm:px-3' : 'px-3 py-3 sm:px-4'}`}
    >
      <div id={buildDomId(scoreboardId, 'list')} className="flex gap-3 overflow-x-auto pb-1">
        {teams.map((team) => {
          const isActive = team.id === activeTeamId;
          const isNegative = team.score < 0;
          const teamCardId = buildDomId(scoreboardId, 'team', team.id);
          const cardClassName = [
            'score-card flex-1 rounded-[1.55rem] border text-left transition',
            'focus:outline-none focus:ring-4 focus:ring-[rgba(255,223,133,0.22)]',
            compact ? 'min-w-[150px] px-3 py-2' : 'min-w-[170px] px-4 py-3 sm:min-w-[210px]',
            isActive ? 'score-card--active' : '',
          ]
            .filter(Boolean)
            .join(' ');

          const content = (
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className={`score-name font-bold uppercase ${compact ? 'text-sm sm:text-base' : 'text-lg sm:text-xl'}`}>
                  {team.name.trim() || 'Unnamed Team'}
                </div>
                {isActive ? (
                  <div className="mt-2 h-1.5 w-14 rounded-full bg-amber-200/75" />
                ) : (
                  <div className="mt-2 h-1.5 w-10 rounded-full bg-white/10" />
                )}
              </div>
              <div
                className={[
                  'score-value font-black',
                  compact ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl',
                  isNegative ? 'score-value--negative' : '',
                ].join(' ')}
              >
                {formatScore(team.score)}
              </div>
            </div>
          );

          if (!isInteractive) {
            return (
              <div key={team.id} id={teamCardId} className={cardClassName}>
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
              className="min-w-[170px] flex-1 sm:min-w-[210px]"
            >
              <button
                id={teamCardId}
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
