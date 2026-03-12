import type { TeamState } from '../models/team';
import { formatCurrencyValue } from '../lib/score-utils';
import { Tooltip } from './Tooltip';

interface HostPanelProps {
  isOpen: boolean;
  teams: TeamState[];
  activeTeamId: string | null;
  manualScoreDelta: number;
  isLocalStorageEnabled: boolean;
  isUsingLocalConfig: boolean;
  onClose: () => void;
  onSelectTeam: (teamId: string) => void;
  onManualScoreDeltaChange: (value: number) => void;
  onAdjustTeamScore: (teamId: string, delta: number) => void;
  onOpenConfigEditor: () => void;
  onResetScores: () => void;
  onResetGame: () => void;
  onClearSavedState: () => void;
  onResetLocalConfig: () => void;
}

export function HostPanel({
  isOpen,
  teams,
  activeTeamId,
  manualScoreDelta,
  isLocalStorageEnabled,
  isUsingLocalConfig,
  onClose,
  onSelectTeam,
  onManualScoreDeltaChange,
  onAdjustTeamScore,
  onOpenConfigEditor,
  onResetScores,
  onResetGame,
  onClearSavedState,
  onResetLocalConfig,
}: HostPanelProps) {
  return (
    <div
      className={[
        'fixed inset-0 z-40 transition',
        isOpen ? 'pointer-events-auto' : 'pointer-events-none',
      ].join(' ')}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        onClick={onClose}
        className={[
          'absolute inset-0 bg-slate-950/65 backdrop-blur-sm transition-opacity',
          isOpen ? 'opacity-100' : 'opacity-0',
        ].join(' ')}
        aria-label="Close host panel"
      />

      <aside
        className={[
          'absolute right-0 top-0 flex h-full w-full max-w-[430px] flex-col border-l border-white/10 bg-slate-950/95 shadow-board transition-transform duration-200',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
      >
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-sky-200/70">
              Host Panel
            </p>
            <h2 className="mt-1 font-display text-2xl font-black uppercase tracking-[0.14em] text-slate-50">
              Controls
            </h2>
          </div>
          <button type="button" onClick={onClose} className="secondary-button">
            Close
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <section className="rounded-[1.75rem] border border-white/10 bg-slate-900/60 p-4">
            <div className="flex flex-wrap gap-2">
              <Tooltip content="Open the local-only editor for title, teams, categories, clues, and settings.">
                <button type="button" onClick={onOpenConfigEditor} className="control-button">
                  Edit Game
                </button>
              </Tooltip>
              <Tooltip content="Reset all team scores while keeping used clues on the board.">
                <button type="button" onClick={onResetScores} className="secondary-button">
                  Reset Scores
                </button>
              </Tooltip>
              <Tooltip content="Reset the full board, scores, and current clue selection.">
                <button type="button" onClick={onResetGame} className="danger-button">
                  Reset Game
                </button>
              </Tooltip>
              {isLocalStorageEnabled ? (
                <Tooltip content="Remove the saved board and scores from this browser profile.">
                  <button type="button" onClick={onClearSavedState} className="secondary-button">
                    Clear Save
                  </button>
                </Tooltip>
              ) : null}
              {isUsingLocalConfig ? (
                <Tooltip content="Discard the browser-only game override and return to the bundled config.">
                  <button type="button" onClick={onResetLocalConfig} className="secondary-button">
                    Use Bundled Config
                  </button>
                </Tooltip>
              ) : null}
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-white/10 bg-slate-900/60 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-sky-200/70">
                Manual Score
              </p>
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
                {formatCurrencyValue(manualScoreDelta || 0)}
              </span>
            </div>

            <input
              type="number"
              min="0"
              step="100"
              value={manualScoreDelta}
              onChange={(event) => {
                const nextValue = Number.parseInt(event.target.value, 10);
                onManualScoreDeltaChange(Number.isNaN(nextValue) ? 0 : Math.max(0, nextValue));
              }}
              className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-xl font-semibold text-slate-50 outline-none transition focus:border-amber-300/40 focus:ring-4 focus:ring-amber-300/20"
            />
          </section>

          <section className="space-y-3">
            {teams.map((team) => {
              const isActive = team.id === activeTeamId;

              return (
                <div
                  key={team.id}
                  className={[
                    'rounded-[1.75rem] border p-4 transition',
                    isActive
                      ? 'border-amber-300/45 bg-amber-300/10'
                      : 'border-white/10 bg-slate-900/60',
                  ].join(' ')}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-display text-lg font-bold text-slate-50">
                        {team.name.trim() || 'Unnamed Team'}
                      </p>
                      <p className="mt-1 text-2xl font-black text-amber-200">
                        {team.score >= 0 ? '$' : '-$'}
                        {Math.abs(team.score).toLocaleString('en-US')}
                      </p>
                    </div>

                    <Tooltip content="Mark this team as the active recipient for clue scoring.">
                      <button
                        type="button"
                        onClick={() => onSelectTeam(team.id)}
                        className={isActive ? 'control-button' : 'secondary-button'}
                      >
                        {isActive ? 'Active' : 'Make Active'}
                      </button>
                    </Tooltip>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <Tooltip content={`Add ${formatCurrencyValue(manualScoreDelta || 0)} to this team.`} className="flex-1">
                      <button
                        type="button"
                        onClick={() => onAdjustTeamScore(team.id, manualScoreDelta)}
                        disabled={manualScoreDelta === 0}
                        className="control-button w-full disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Add
                      </button>
                    </Tooltip>
                    <Tooltip content={`Subtract ${formatCurrencyValue(manualScoreDelta || 0)} from this team.`} className="flex-1">
                      <button
                        type="button"
                        onClick={() => onAdjustTeamScore(team.id, -manualScoreDelta)}
                        disabled={manualScoreDelta === 0}
                        className="secondary-button w-full disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Subtract
                      </button>
                    </Tooltip>
                  </div>
                </div>
              );
            })}
          </section>
        </div>
      </aside>
    </div>
  );
}
