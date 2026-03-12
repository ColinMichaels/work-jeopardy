import type { TeamState } from '../models/team';
import { formatScore } from '../lib/score-utils';
import { Tooltip } from './Tooltip';

interface ScoreBoardProps {
  teams: TeamState[];
  activeTeamId: string | null;
  onSelectTeam: (teamId: string) => void;
}

export function ScoreBoard({ teams, activeTeamId, onSelectTeam }: ScoreBoardProps) {
  return (
    <section className="panel p-3 sm:p-4">
      <div className="flex gap-3 overflow-x-auto pb-1">
        {teams.map((team) => {
          const isActive = team.id === activeTeamId;

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
                className={[
                  'h-full w-full rounded-[1.6rem] border px-4 py-3 text-left transition',
                  'focus:outline-none focus:ring-4 focus:ring-amber-300/30',
                  isActive
                    ? 'border-amber-300/55 bg-amber-300/10 shadow-board'
                    : 'border-white/10 bg-slate-950/40 hover:border-sky-300/30 hover:bg-slate-900/80',
                ].join(' ')}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-display text-lg font-bold text-slate-50 sm:text-xl">
                      {team.name.trim() || 'Unnamed Team'}
                    </div>
                    <div className="mt-1 text-[11px] uppercase tracking-[0.28em] text-slate-400">
                      {isActive ? 'Active' : 'Standby'}
                    </div>
                  </div>
                  <div className="font-display text-2xl font-black text-amber-200 sm:text-3xl">
                    {formatScore(team.score)}
                  </div>
                </div>
              </button>
            </Tooltip>
          );
        })}
      </div>
    </section>
  );
}
