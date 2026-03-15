import type { GameSoundCue } from '../types/game-audio';
import type { TeamState } from '../models/team';
import { HostControlsSections } from './HostControlsSections';

interface HostPanelProps {
  isOpen: boolean;
  bundledGames: ReadonlyArray<{
    id: string;
    label: string;
    description: string;
  }>;
  selectedBundledGameId: string;
  loadingBundledGameId?: string | null;
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
  onSelectBundledGame: (bundledGameId: string) => void;
  onExportGame: () => { filename: string };
  onImportGame: (file: File) => Promise<{
    ok: boolean;
    message?: string;
    errors?: string[];
    cancelled?: boolean;
  }>;
  onOpenConfigEditor: () => void;
  onResetScores: () => void;
  onResetGame: () => void;
  onClearSavedState: () => void;
  onCleanBrowserStorage: () => void;
  onResetLocalConfig: () => void;
  onStartFinalJeopardy?: () => void;
}

export function HostPanel({
  isOpen,
  bundledGames,
  selectedBundledGameId,
  loadingBundledGameId = null,
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
  onSelectBundledGame,
  onExportGame,
  onImportGame,
  onOpenConfigEditor,
  onResetScores,
  onResetGame,
  onClearSavedState,
  onCleanBrowserStorage,
  onResetLocalConfig,
  onStartFinalJeopardy,
}: HostPanelProps) {
  return (
    <div
      id="host-panel-overlay"
      className={[
        'fixed inset-0 z-40 transition',
        isOpen ? 'pointer-events-auto' : 'pointer-events-none',
      ].join(' ')}
      aria-hidden={!isOpen}
    >
      <button
        id="host-panel-dismiss-layer"
        type="button"
        onClick={onClose}
        className={[
          'absolute inset-0 bg-slate-950/65 backdrop-blur-sm transition-opacity',
          isOpen ? 'opacity-100' : 'opacity-0',
        ].join(' ')}
        aria-label="Close host panel"
      />

      <aside
        id="host-panel"
        className={[
          'absolute right-0 top-0 flex h-full w-full max-w-[360px] flex-col border-l border-white/10 bg-[rgba(3,8,34,0.96)] shadow-board transition-transform duration-200 sm:max-w-[380px]',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
      >
        <div id="host-panel-header" className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
          <div id="host-panel-title">
            <p className="brand-overline text-[10px] font-semibold uppercase tracking-[0.3em]">
              Host Panel
            </p>
            <h2 className="brand-title mt-1 text-xl font-black uppercase tracking-[0.12em]">
              Controls
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="secondary-button px-3 py-1.5 text-[10px] tracking-[0.14em]"
          >
            Close
          </button>
        </div>

        <div id="host-panel-content" className="flex-1 space-y-3 overflow-y-auto px-3 py-3">
          <HostControlsSections
            idPrefix="host-panel-controls"
            bundledGames={bundledGames}
            selectedBundledGameId={selectedBundledGameId}
            loadingBundledGameId={loadingBundledGameId}
            dense
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
            onSelectBundledGame={onSelectBundledGame}
            onExportGame={onExportGame}
            onImportGame={onImportGame}
            onOpenConfigEditor={onOpenConfigEditor}
            onResetScores={onResetScores}
            onResetGame={onResetGame}
            onClearSavedState={onClearSavedState}
            onCleanBrowserStorage={onCleanBrowserStorage}
            onResetLocalConfig={onResetLocalConfig}
            onStartFinalJeopardy={onStartFinalJeopardy}
          />
        </div>
      </aside>
    </div>
  );
}
