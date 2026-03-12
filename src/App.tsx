import { useEffect, useRef, useState } from 'react';
import { ClueModal } from './components/ClueModal';
import { ConfigEditorModal } from './components/ConfigEditorModal';
import { ControlBar } from './components/ControlBar';
import { ErrorScreen } from './components/ErrorScreen';
import { GameBoard } from './components/GameBoard';
import { HostConsole } from './components/HostConsole';
import { HostPanel } from './components/HostPanel';
import { ScoreBoard } from './components/ScoreBoard';
import { SessionLauncherModal } from './components/SessionLauncherModal';
import sampleGameRaw from './data/sample-game.json?raw';
import {
  applyClueOutcome,
  adjustTeamScore,
  closeClue,
  hydrateGameState,
  reconcileGameStateWithConfig,
  resetGame,
  resetScores,
  revealQuestion,
  selectClue,
  toPersistedGameState,
} from './lib/game-engine';
import { findClueById, getMinimumClueValue, loadGameConfig } from './lib/config-loader';
import {
  buildWindowUrl,
  ensureSessionIdInUrl,
  getViewModeFromLocation,
  useSessionSync,
} from './lib/session-sync';
import { useSoundboard } from './lib/soundboard';
import {
  clearStoredConfigOverride,
  clearStoredGameState,
  CONFIG_OVERRIDE_STORAGE_KEY,
  getStorageKey,
  loadStoredBoolean,
  loadStoredConfigOverride,
  loadStoredGameState,
  saveStoredBoolean,
  saveStoredConfigOverride,
  saveStoredGameState,
  SOUND_ENABLED_STORAGE_KEY,
} from './lib/storage';
import type { GameState, SharedSessionSnapshot } from './models/game';
import type { GameConfig } from './types/game-config';

// Import the JSON as raw text so malformed edits fail inside the app instead of crashing the build.
const bundledConfigResult = loadGameConfig(sampleGameRaw);

function shouldIgnoreKeyboardShortcut(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && ['INPUT', 'TEXTAREA'].includes(target.tagName);
}

interface BootstrapState {
  config: GameConfig;
  gameState: GameState;
  activeTeamId: string | null;
  manualScoreDelta: number;
  isUsingLocalConfig: boolean;
  isSoundOutputEnabled: boolean;
}

function buildBootstrapState(bundledConfig: GameConfig): BootstrapState {
  const storedOverride = loadStoredConfigOverride(CONFIG_OVERRIDE_STORAGE_KEY);
  let config = bundledConfig;
  let isUsingLocalConfig = false;

  if (storedOverride) {
    const overrideResult = loadGameConfig(storedOverride);

    if (overrideResult.ok) {
      config = overrideResult.value;
      isUsingLocalConfig = true;
    } else {
      clearStoredConfigOverride(CONFIG_OVERRIDE_STORAGE_KEY);
    }
  }

  const storageKey = getStorageKey(config.settings);
  const storedState = config.settings.enableLocalStorage
    ? loadStoredGameState(storageKey)
    : null;

  return {
    config,
    gameState: hydrateGameState(config, storedState),
    activeTeamId: config.teams[0]?.id ?? null,
    manualScoreDelta: getMinimumClueValue(config),
    isUsingLocalConfig,
    isSoundOutputEnabled: loadStoredBoolean(SOUND_ENABLED_STORAGE_KEY) ?? true,
  };
}

export default function App() {
  if (!bundledConfigResult.ok) {
    return <ErrorScreen errors={bundledConfigResult.errors} />;
  }

  const bundledConfig = bundledConfigResult.value;
  const bootstrapRef = useRef<BootstrapState | null>(null);
  const sessionIdRef = useRef<string>(ensureSessionIdInUrl());
  const viewModeRef = useRef(getViewModeFromLocation());

  if (!bootstrapRef.current) {
    bootstrapRef.current = buildBootstrapState(bundledConfig);
  }

  const bootstrapState = bootstrapRef.current;
  const sessionId = sessionIdRef.current;
  const viewMode = viewModeRef.current;

  const [config, setConfig] = useState<GameConfig>(bootstrapState.config);
  const [isUsingLocalConfig, setIsUsingLocalConfig] = useState<boolean>(
    bootstrapState.isUsingLocalConfig,
  );
  const [gameState, setGameState] = useState<GameState>(bootstrapState.gameState);
  const [activeTeamId, setActiveTeamId] = useState<string | null>(bootstrapState.activeTeamId);
  const [manualScoreDelta, setManualScoreDelta] = useState<number>(
    bootstrapState.manualScoreDelta,
  );
  const [isSoundOutputEnabled, setIsSoundOutputEnabled] = useState<boolean>(
    bootstrapState.isSoundOutputEnabled,
  );
  const [isHostPanelOpen, setIsHostPanelOpen] = useState(false);
  const [isConfigEditorOpen, setIsConfigEditorOpen] = useState(false);
  const [isSessionLauncherOpen, setIsSessionLauncherOpen] = useState(false);

  const storageKey = getStorageKey(config.settings);
  const activeClue = findClueById(config, gameState.selectedClueId);
  const totalClues = config.categories.reduce((sum, category) => sum + category.clues.length, 0);
  const answeredClues = Object.keys(gameState.answeredClueIds).length;
  const isConfigSoundEnabled = config.settings.sounds.enabled;

  const { activeLoopingCue, soundDefinitions, playCue, stopCue, stopAll } = useSoundboard({
    settings: config.settings.sounds,
    isOutputEnabled: isConfigSoundEnabled && isSoundOutputEnabled,
  });

  const sharedSnapshot: SharedSessionSnapshot = {
    config,
    isUsingLocalConfig,
    gameState,
    activeTeamId,
    manualScoreDelta,
  };

  useEffect(() => {
    if (!gameState.teams.some((team) => team.id === activeTeamId)) {
      setActiveTeamId(gameState.teams[0]?.id ?? null);
    }
  }, [activeTeamId, gameState.teams]);

  useEffect(() => {
    if (!config.settings.enableLocalStorage) {
      return;
    }

    saveStoredGameState(storageKey, toPersistedGameState(gameState));
  }, [config.settings.enableLocalStorage, gameState, storageKey]);

  useEffect(() => {
    saveStoredBoolean(SOUND_ENABLED_STORAGE_KEY, isSoundOutputEnabled);
  }, [isSoundOutputEnabled]);

  const handleSelectTeam = (teamId: string) => {
    if (teamId !== activeTeamId) {
      void playCue('contestantBuzzer');
    }

    setActiveTeamId(teamId);
  };

  const handleSelectClue = (clueId: string) => {
    const clueEntry = findClueById(config, clueId);

    stopCue('thinkMusic');
    setIsHostPanelOpen(false);
    setIsSessionLauncherOpen(false);

    if (clueEntry?.clue.dailyDouble) {
      void playCue('dailyDouble');
    }

    setGameState((currentState) => selectClue(currentState, clueId));
  };

  const handleReveal = () => {
    stopCue('thinkMusic');
    setGameState((currentState) => revealQuestion(currentState));
  };

  const playClueCloseSound = (wasScored: boolean) => {
    stopCue('thinkMusic');

    if (!activeClue) {
      return;
    }

    if (answeredClues === totalClues) {
      void playCue('endRound');
      return;
    }

    if (!wasScored && gameState.isQuestionRevealed) {
      void playCue('tripleStumper');
    }
  };

  const handleCloseClue = () => {
    playClueCloseSound(false);
    setGameState((currentState) => closeClue(currentState));
  };

  const handleMarkClue = (isCorrect: boolean) => {
    if (!activeTeamId || !activeClue) {
      return;
    }

    playClueCloseSound(true);

    setGameState((currentState) =>
      applyClueOutcome(
        currentState,
        activeTeamId,
        activeClue.clue.value,
        isCorrect,
        config.settings.subtractOnIncorrect,
      ),
    );
  };

  const handleAdjustTeamScore = (teamId: string, delta: number) => {
    setGameState((currentState) => adjustTeamScore(currentState, teamId, delta));
  };

  const handleResetScores = () => {
    if (!window.confirm('Reset all team scores to zero?')) {
      return;
    }

    setGameState((currentState) => resetScores(currentState));
  };

  const handleResetGame = () => {
    if (!window.confirm('Reset the full board and all scores?')) {
      return;
    }

    if (config.settings.enableLocalStorage) {
      clearStoredGameState(storageKey);
    }

    stopAll();
    setGameState(resetGame(config));
    setActiveTeamId(config.teams[0]?.id ?? null);
    setIsHostPanelOpen(false);
    void playCue('boardFill');
  };

  const handleClearSavedState = () => {
    if (!window.confirm('Clear the saved browser state for this game?')) {
      return;
    }

    clearStoredGameState(storageKey);
  };

  const applyRuntimeConfig = (
    nextConfig: GameConfig,
    options: { rawConfig: string | null; isLocalOverride: boolean },
  ) => {
    if (options.isLocalOverride && options.rawConfig) {
      saveStoredConfigOverride(options.rawConfig, CONFIG_OVERRIDE_STORAGE_KEY);
    } else {
      clearStoredConfigOverride(CONFIG_OVERRIDE_STORAGE_KEY);
    }

    stopAll();
    setConfig(nextConfig);
    setIsUsingLocalConfig(options.isLocalOverride);
    setGameState((currentState) => reconcileGameStateWithConfig(nextConfig, currentState));
    setActiveTeamId((currentTeamId) =>
      nextConfig.teams.some((team) => team.id === currentTeamId)
        ? currentTeamId
        : nextConfig.teams[0]?.id ?? null,
    );
    setManualScoreDelta(getMinimumClueValue(nextConfig));
  };

  const handleApplyConfig = (nextConfigDraft: GameConfig) => {
    const rawConfig = JSON.stringify(nextConfigDraft, null, 2);
    const parseResult = loadGameConfig(rawConfig);

    if (!parseResult.ok) {
      return {
        ok: false,
        errors: parseResult.errors,
      };
    }

    applyRuntimeConfig(parseResult.value, {
      rawConfig,
      isLocalOverride: true,
    });
    setIsHostPanelOpen(false);

    return { ok: true };
  };

  const handleResetLocalConfig = () => {
    if (!window.confirm('Discard the local host config and return to the bundled game?')) {
      return;
    }

    applyRuntimeConfig(bundledConfig, {
      rawConfig: null,
      isLocalOverride: false,
    });
    setIsConfigEditorOpen(false);
    setIsHostPanelOpen(false);
  };

  const handleApplySharedSnapshot = (snapshot: SharedSessionSnapshot) => {
    setConfig(snapshot.config);
    setIsUsingLocalConfig(snapshot.isUsingLocalConfig);
    setGameState(snapshot.gameState);
    setActiveTeamId(snapshot.activeTeamId);
    setManualScoreDelta(snapshot.manualScoreDelta);
  };

  useEffect(() => {
    if (!activeClue || viewMode === 'board') {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (shouldIgnoreKeyboardShortcut(event.target)) {
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        handleCloseClue();
      }

      if ((event.key === ' ' || event.key === 'Enter') && !gameState.isQuestionRevealed) {
        event.preventDefault();
        handleReveal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeClue, gameState.isQuestionRevealed, viewMode]);

  const { transport } = useSessionSync({
    sessionId,
    snapshot: sharedSnapshot,
    allowStorageFallback: config.settings.enableLocalStorage,
    onApplySnapshot: handleApplySharedSnapshot,
  });

  const openWindowForView = (nextView: 'single' | 'board' | 'host') => {
    const targetUrl = buildWindowUrl(nextView, sessionId);
    setIsSessionLauncherOpen(false);
    window.open(targetUrl, '_blank');
  };

  return (
    <div className="min-h-screen px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-4">
        <ControlBar
          title={config.title}
          subtitle={config.subtitle}
          answeredClues={answeredClues}
          totalClues={totalClues}
          isLocalStorageEnabled={config.settings.enableLocalStorage}
          isUsingLocalConfig={isUsingLocalConfig}
          sessionId={sessionId}
          viewMode={viewMode}
          syncTransport={transport}
          onOpenSessionLauncher={viewMode !== 'board' ? () => setIsSessionLauncherOpen(true) : undefined}
          onOpenHostPanel={viewMode === 'single' ? () => setIsHostPanelOpen(true) : undefined}
        />

        <ScoreBoard
          teams={gameState.teams}
          activeTeamId={activeTeamId}
          isInteractive={viewMode !== 'board'}
          onSelectTeam={handleSelectTeam}
        />

        {viewMode === 'host' ? (
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_440px]">
            <GameBoard
              categories={config.categories}
              answeredClueIds={gameState.answeredClueIds}
              selectedClueId={gameState.selectedClueId}
              isInteractive
              onSelectClue={handleSelectClue}
            />

            <HostConsole
              clueEntry={activeClue}
              isRevealed={gameState.isQuestionRevealed}
              teams={gameState.teams}
              activeTeamId={activeTeamId}
              manualScoreDelta={manualScoreDelta}
              subtractOnIncorrect={config.settings.subtractOnIncorrect}
              isLocalStorageEnabled={config.settings.enableLocalStorage}
              isUsingLocalConfig={isUsingLocalConfig}
              isConfigSoundEnabled={isConfigSoundEnabled}
              isSoundOutputEnabled={isSoundOutputEnabled}
              soundDefinitions={soundDefinitions}
              activeLoopingCue={activeLoopingCue}
              onSelectTeam={handleSelectTeam}
              onManualScoreDeltaChange={(value) => setManualScoreDelta(Math.max(0, value))}
              onAdjustTeamScore={handleAdjustTeamScore}
              onToggleSoundOutput={setIsSoundOutputEnabled}
              onPreviewCue={playCue}
              onStopCue={stopCue}
              onStopAllSounds={stopAll}
              onOpenConfigEditor={() => setIsConfigEditorOpen(true)}
              onResetScores={handleResetScores}
              onResetGame={handleResetGame}
              onClearSavedState={handleClearSavedState}
              onResetLocalConfig={handleResetLocalConfig}
              onReveal={handleReveal}
              onMarkCorrect={() => handleMarkClue(true)}
              onMarkIncorrect={() => handleMarkClue(false)}
              onCloseClue={handleCloseClue}
            />
          </div>
        ) : (
          <GameBoard
            categories={config.categories}
            answeredClueIds={gameState.answeredClueIds}
            selectedClueId={gameState.selectedClueId}
            isInteractive={viewMode !== 'board'}
            onSelectClue={handleSelectClue}
          />
        )}
      </div>

      {viewMode === 'single' ? (
        <HostPanel
          isOpen={isHostPanelOpen}
          teams={gameState.teams}
          activeTeamId={activeTeamId}
          manualScoreDelta={manualScoreDelta}
          isLocalStorageEnabled={config.settings.enableLocalStorage}
          isUsingLocalConfig={isUsingLocalConfig}
          isConfigSoundEnabled={isConfigSoundEnabled}
          isSoundOutputEnabled={isSoundOutputEnabled}
          soundDefinitions={soundDefinitions}
          activeLoopingCue={activeLoopingCue}
          onClose={() => setIsHostPanelOpen(false)}
          onSelectTeam={handleSelectTeam}
          onManualScoreDeltaChange={(value) => setManualScoreDelta(Math.max(0, value))}
          onAdjustTeamScore={handleAdjustTeamScore}
          onToggleSoundOutput={setIsSoundOutputEnabled}
          onPreviewCue={playCue}
          onStopCue={stopCue}
          onStopAllSounds={stopAll}
          onOpenConfigEditor={() => {
            setIsHostPanelOpen(false);
            setIsConfigEditorOpen(true);
          }}
          onResetScores={handleResetScores}
          onResetGame={handleResetGame}
          onClearSavedState={handleClearSavedState}
          onResetLocalConfig={handleResetLocalConfig}
        />
      ) : null}

      {viewMode !== 'board' ? (
        <SessionLauncherModal
          isOpen={isSessionLauncherOpen}
          sessionId={sessionId}
          viewMode={viewMode}
          syncTransport={transport}
          isLocalStorageEnabled={config.settings.enableLocalStorage}
          isUsingLocalConfig={isUsingLocalConfig}
          onClose={() => setIsSessionLauncherOpen(false)}
          onOpenBoardWindow={() => openWindowForView('board')}
          onOpenHostWindow={() => openWindowForView('host')}
          onOpenSingleWindow={() => openWindowForView('single')}
        />
      ) : null}

      {viewMode !== 'board' ? (
        <ConfigEditorModal
          isOpen={isConfigEditorOpen}
          config={config}
          onClose={() => setIsConfigEditorOpen(false)}
          onApply={handleApplyConfig}
        />
      ) : null}

      {viewMode !== 'host' ? (
        <ClueModal
          clueEntry={activeClue}
          isRevealed={gameState.isQuestionRevealed}
          teams={gameState.teams}
          activeTeamId={activeTeamId}
          subtractOnIncorrect={config.settings.subtractOnIncorrect}
          variant={viewMode === 'board' ? 'presentation' : 'interactive'}
          onSelectTeam={handleSelectTeam}
          onReveal={handleReveal}
          onMarkCorrect={() => handleMarkClue(true)}
          onMarkIncorrect={() => handleMarkClue(false)}
          onClose={handleCloseClue}
        />
      ) : null}
    </div>
  );
}
