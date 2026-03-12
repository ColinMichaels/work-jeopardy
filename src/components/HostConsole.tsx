import type { GameSoundCue } from '../types/game-audio';
import type { ResolvedClue } from '../models/game';
import { formatCurrencyValue } from '../lib/score-utils';
import { ClueMediaPanel } from './ClueMediaPanel';
import { HostControlsSections } from './HostControlsSections';
import { PanelWindowButton } from './PanelWindowButton';

interface HostConsoleProps {
  bundledGames: ReadonlyArray<{
    id: string;
    label: string;
    description: string;
  }>;
  selectedBundledGameId: string;
  clueEntry: ResolvedClue | null;
  isRevealed: boolean;
  activeMediaIndex: number | null;
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
  onResetLocalConfig: () => void;
  onOpenMedia: (index: number) => void;
  onCloseMedia: () => void;
  showClueSection?: boolean;
  showSetupSection?: boolean;
  onHideClueSection?: () => void;
  onHideSetupSection?: () => void;
}

export function HostConsole({
  bundledGames,
  selectedBundledGameId,
  clueEntry,
  isRevealed,
  activeMediaIndex,
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
  onResetLocalConfig,
  onOpenMedia,
  onCloseMedia,
  showClueSection = true,
  showSetupSection = true,
  onHideClueSection,
  onHideSetupSection,
}: HostConsoleProps) {
  const clue = clueEntry?.clue ?? null;
  const currentClue = clueEntry?.clue;

  return (
    <aside className="space-y-4 xl:sticky xl:top-4 xl:max-h-[calc(100vh-2rem)] xl:overflow-y-auto xl:pr-1">
      {showClueSection ? (
        <section className="panel relative p-5">
          {onHideClueSection ? (
            <div className="absolute right-4 top-4 z-10">
              <PanelWindowButton label="Hide clue preview" onClick={onHideClueSection} />
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="panel-heading">Clue Preview</h2>
            </div>
            <div className="flex items-center gap-2">
              {clue?.dailyDouble ? <span className="brand-tag">Daily Double</span> : null}
              {clue ? <span className="brand-tag">{formatCurrencyValue(clue.value)}</span> : null}
            </div>
          </div>

          {clueEntry ? (
            <div className="mt-5 space-y-4">
              <div className="panel-inset p-4">
                <p className="panel-heading">{clueEntry.categoryTitle}</p>
                <p className="mt-3 text-2xl font-bold leading-snug text-slate-50">
                  {currentClue?.answer}
                </p>
              </div>

              {currentClue?.notes ? (
                <div className="panel-inset p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">
                    Host Notes
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-200">{currentClue.notes}</p>
                </div>
              ) : null}

              {currentClue?.media?.length ? (
                <ClueMediaPanel
                  media={currentClue.media}
                  clueTitle={clueEntry.categoryTitle}
                  activeLightboxIndex={activeMediaIndex}
                  canOpenLightbox
                  compact
                  shouldAutoplay={isRevealed}
                  playbackEnabled={false}
                  onOpenLightbox={onOpenMedia}
                  onCloseLightbox={onCloseMedia}
                />
              ) : null}

              <div className="panel-inset border-amber-300/20 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-amber-100/80">
                      Host Preview
                    </p>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.26em] text-slate-400">
                      {isRevealed ? 'Live On Board' : 'Private Until Reveal'}
                    </p>
                  </div>
                  <span className="brand-tag">{isRevealed ? 'Live' : 'Private'}</span>
                </div>

                <p className="mt-3 text-xl font-bold leading-snug text-amber-50">
                  {currentClue?.question}
                </p>
              </div>
            </div>
          ) : (
            <div className="panel-muted mt-5 px-4 py-10 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.34em]">
                Select A Clue To Preview It Here
              </p>
              <p className="mt-3 text-sm font-normal normal-case tracking-normal text-slate-300">
                Clue actions stay above the host board so scoring and reveal controls are always in
                reach.
              </p>
            </div>
          )}
        </section>
      ) : null}

      {showSetupSection ? (
        <section className="panel relative p-5">
          {onHideSetupSection ? (
            <div className="absolute right-4 top-4 z-10">
              <PanelWindowButton label="Hide setup tools" onClick={onHideSetupSection} />
            </div>
          ) : null}

          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="panel-heading">Setup & Config</h2>
            </div>
          </div>

          <div className="space-y-4">
            <HostControlsSections
              bundledGames={bundledGames}
              selectedBundledGameId={selectedBundledGameId}
              isLocalStorageEnabled={isLocalStorageEnabled}
              isUsingLocalConfig={isUsingLocalConfig}
              isConfigSoundEnabled={isConfigSoundEnabled}
              isSoundOutputEnabled={isSoundOutputEnabled}
              activeCueIds={activeCueIds}
              soundDefinitions={soundDefinitions}
              activeLoopingCue={activeLoopingCue}
              showScoreUtilities={false}
              showFinalJeopardyAction={false}
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
              onResetLocalConfig={onResetLocalConfig}
            />
          </div>
        </section>
      ) : null}
    </aside>
  );
}
