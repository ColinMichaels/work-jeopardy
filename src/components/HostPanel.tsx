import type { GameSoundCue } from '../types/game-audio';
import type { TeamState } from '../models/team';
import { HostControlsSections } from './HostControlsSections';

interface HostPanelProps {
  isOpen: boolean;
  teams: TeamState[];
  activeTeamId: string | null;
  manualScoreDelta: number;
  isFinalJeopardyReady?: boolean;
  finalJeopardyEligibleTeamCount?: number;
  isLocalStorageEnabled: boolean;
  isUsingLocalConfig: boolean;
  isConfigSoundEnabled: boolean;
  isSoundOutputEnabled: boolean;
  activeCueIds: GameSoundCue[];
  soundDefinitions: ReadonlyArray<{
    cue: GameSoundCue;
    label: string;
    description: string;
    loop?: boolean;
  }>;
  activeLoopingCue: GameSoundCue | null;
  onClose: () => void;
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
  onStartFinalJeopardy?: () => void;
}

export function HostPanel({
  isOpen,
  teams,
  activeTeamId,
  manualScoreDelta,
  isFinalJeopardyReady = false,
  finalJeopardyEligibleTeamCount = 0,
  isLocalStorageEnabled,
  isUsingLocalConfig,
  isConfigSoundEnabled,
  isSoundOutputEnabled,
  activeCueIds,
  soundDefinitions,
  activeLoopingCue,
  onClose,
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
  onStartFinalJeopardy,
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
          'absolute right-0 top-0 flex h-full w-full max-w-[430px] flex-col border-l border-white/10 bg-[rgba(3,8,34,0.96)] shadow-board transition-transform duration-200',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
      >
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
          <div>
            <p className="brand-overline text-[11px] font-semibold uppercase tracking-[0.35em]">
              Host Panel
            </p>
            <h2 className="brand-title mt-1 text-2xl font-black uppercase tracking-[0.14em]">
              Controls
            </h2>
          </div>
          <button type="button" onClick={onClose} className="secondary-button">
            Close
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <HostControlsSections
            teams={teams}
            activeTeamId={activeTeamId}
            manualScoreDelta={manualScoreDelta}
            isFinalJeopardyReady={isFinalJeopardyReady}
            finalJeopardyEligibleTeamCount={finalJeopardyEligibleTeamCount}
            isLocalStorageEnabled={isLocalStorageEnabled}
            isUsingLocalConfig={isUsingLocalConfig}
            isConfigSoundEnabled={isConfigSoundEnabled}
            isSoundOutputEnabled={isSoundOutputEnabled}
            activeCueIds={activeCueIds}
            soundDefinitions={soundDefinitions}
            activeLoopingCue={activeLoopingCue}
            onSelectTeam={onSelectTeam}
            onManualScoreDeltaChange={onManualScoreDeltaChange}
            onAdjustTeamScore={onAdjustTeamScore}
            onToggleSoundOutput={onToggleSoundOutput}
            onPreviewCue={onPreviewCue}
            onStopCue={onStopCue}
            onStopAllSounds={onStopAllSounds}
            onOpenConfigEditor={onOpenConfigEditor}
            onResetScores={onResetScores}
            onResetGame={onResetGame}
            onClearSavedState={onClearSavedState}
            onResetLocalConfig={onResetLocalConfig}
            onStartFinalJeopardy={onStartFinalJeopardy}
          />
        </div>
      </aside>
    </div>
  );
}
