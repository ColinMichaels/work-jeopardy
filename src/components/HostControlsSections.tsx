import type { GameSoundCue } from '../types/game-audio';
import type { TeamState } from '../models/team';
import { formatCurrencyValue } from '../lib/score-utils';
import { SoundControls } from './SoundControls';
import { Tooltip } from './Tooltip';

interface HostControlsSectionsProps {
  teams: TeamState[];
  activeTeamId: string | null;
  manualScoreDelta: number;
  isLocalStorageEnabled: boolean;
  isUsingLocalConfig: boolean;
  isConfigSoundEnabled: boolean;
  isSoundOutputEnabled: boolean;
  soundDefinitions: ReadonlyArray<{
    cue: GameSoundCue;
    label: string;
    description: string;
    loop?: boolean;
  }>;
  activeLoopingCue: GameSoundCue | null;
  onSelectTeam: (teamId: string) => void;
  onManualScoreDeltaChange: (value: number) => void;
  onAdjustTeamScore: (teamId: string, delta: number) => void;
  onToggleSoundOutput: (enabled: boolean) => void;
  onPreviewCue: (cue: GameSoundCue) => void;
  onStopCue: (cue: GameSoundCue) => void;
  onStopAllSounds: () => void;
  onOpenConfigEditor: () => void;
  onResetScores: () => void;
  onResetGame: () => void;
  onClearSavedState: () => void;
  onResetLocalConfig: () => void;
}

export function HostControlsSections({
  teams,
  activeTeamId,
  manualScoreDelta,
  isLocalStorageEnabled,
  isUsingLocalConfig,
  isConfigSoundEnabled,
  isSoundOutputEnabled,
  soundDefinitions,
  activeLoopingCue,
  onSelectTeam,
  onManualScoreDeltaChange,
  onAdjustTeamScore,
  onToggleSoundOutput,
  onPreviewCue,
  onStopCue,
  onStopAllSounds,
  onOpenConfigEditor,
  onResetScores,
  onResetGame,
  onClearSavedState,
  onResetLocalConfig,
}: HostControlsSectionsProps) {
  return (
    <>
      <section className="panel-inset p-4">
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

      <SoundControls
        soundDefinitions={soundDefinitions}
        isConfigSoundEnabled={isConfigSoundEnabled}
        isSoundOutputEnabled={isSoundOutputEnabled}
        activeLoopingCue={activeLoopingCue}
        onToggleSoundOutput={onToggleSoundOutput}
        onPreviewCue={onPreviewCue}
        onStopCue={onStopCue}
        onStopAll={onStopAllSounds}
      />

      <section className="panel-inset p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="brand-overline text-[11px] font-semibold uppercase tracking-[0.35em]">
            Manual Score
          </p>
          <span className="brand-tag">{formatCurrencyValue(manualScoreDelta || 0)}</span>
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
          className="field-input mt-3 text-xl font-semibold"
        />
      </section>

      <section className="space-y-3">
        {teams.map((team) => {
          const isActive = team.id === activeTeamId;

          return (
            <div
              key={team.id}
              className={[
                'panel-inset p-4 transition',
                isActive ? 'border-amber-300/45 bg-amber-300/10' : '',
              ].join(' ')}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="score-name text-lg font-bold">
                    {team.name.trim() || 'Unnamed Team'}
                  </p>
                  <p className="score-value mt-1 text-2xl font-black">
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
                <Tooltip
                  content={`Add ${formatCurrencyValue(manualScoreDelta || 0)} to this team.`}
                  className="flex-1"
                >
                  <button
                    type="button"
                    onClick={() => onAdjustTeamScore(team.id, manualScoreDelta)}
                    disabled={manualScoreDelta === 0}
                    className="control-button w-full disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Add
                  </button>
                </Tooltip>
                <Tooltip
                  content={`Subtract ${formatCurrencyValue(manualScoreDelta || 0)} from this team.`}
                  className="flex-1"
                >
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
    </>
  );
}
