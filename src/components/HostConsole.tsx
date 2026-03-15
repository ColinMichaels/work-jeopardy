import type { GameSoundCue } from '../types/game-audio';
import type { TeamState } from '../models/team';
import { HostControlsSections } from './HostControlsSections';
import { PanelWindowButton } from './PanelWindowButton';

interface HostConsoleProps {
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
  onSelectTeam: (teamId: string) => void;
  onManualScoreDeltaChange: (value: number) => void;
  onAdjustTeamScore: (teamId: string, delta: number) => void;
  showSetupSection?: boolean;
  onHideSetupSection?: () => void;
}

export function HostConsole({
  bundledGames,
  selectedBundledGameId,
  loadingBundledGameId = null,
  teams,
  activeTeamId,
  manualScoreDelta,
  isLocalStorageEnabled,
  isUsingLocalConfig,
  isConfigSoundEnabled,
  isSoundOutputEnabled,
  activeCueIds,
  soundDefinitions,
  activeLoopingCue,
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
  onSelectTeam,
  onManualScoreDeltaChange,
  onAdjustTeamScore,
  showSetupSection = true,
  onHideSetupSection,
}: HostConsoleProps) {
  return (
    <aside className="space-y-3 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto lg:pr-1">
      {showSetupSection ? (
        <section className="panel relative p-3">
          {onHideSetupSection ? (
            <div className="absolute right-4 top-4 z-10">
              <PanelWindowButton label="Hide setup tools" onClick={onHideSetupSection} />
            </div>
          ) : null}

          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="panel-heading">Host Tools</h2>
            </div>
          </div>

          <div className="space-y-3">
            <HostControlsSections
              bundledGames={bundledGames}
              selectedBundledGameId={selectedBundledGameId}
              loadingBundledGameId={loadingBundledGameId}
              dense
              teams={teams}
              activeTeamId={activeTeamId}
              manualScoreDelta={manualScoreDelta}
              isLocalStorageEnabled={isLocalStorageEnabled}
              isUsingLocalConfig={isUsingLocalConfig}
              isConfigSoundEnabled={isConfigSoundEnabled}
              isSoundOutputEnabled={isSoundOutputEnabled}
              activeCueIds={activeCueIds}
              soundDefinitions={soundDefinitions}
              activeLoopingCue={activeLoopingCue}
              showFinalJeopardyAction={false}
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
            />
          </div>
        </section>
      ) : null}
    </aside>
  );
}
