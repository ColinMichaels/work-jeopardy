import { useEffect, useRef, useState } from 'react';
import { ClueModal } from './components/ClueModal';
import { ConfigEditorModal } from './components/ConfigEditorModal';
import { ControlBar } from './components/ControlBar';
import { ErrorScreen } from './components/ErrorScreen';
import { FinalJeopardyScreen } from './components/final-jeopardy/FinalJeopardyScreen';
import { GameBoard } from './components/GameBoard';
import { HostConsole } from './components/HostConsole';
import { HostPanel } from './components/HostPanel';
import { ScoreBoard } from './components/ScoreBoard';
import {
  BUNDLED_GAME_SOURCES,
  DEFAULT_BUNDLED_GAME_ID,
  type BundledGameSource,
} from './data/bundled-games';
import {
  applyFinalJeopardyResults,
  applyClueOutcome,
  adjustTeamScore,
  closeClueMedia,
  closeClue,
  hydrateGameState,
  openClueMedia,
  reconcileGameStateWithConfig,
  resetGame,
  resetScores,
  revealQuestion,
  restoreSelectedClue,
  setFinalJeopardyJudgment,
  setFinalJeopardyPhase,
  setFinalJeopardyResponse,
  setFinalJeopardyWagers,
  selectClue,
  startFinalJeopardy,
  toPersistedGameState,
} from './lib/game-engine';
import { findClueById, getMinimumClueValue, loadGameConfig } from './lib/config-loader';
import { downloadGameConfigJson } from './lib/config-transfer';
import { getEligibleFinalJeopardyTeams, getFinalJeopardyConfig } from './lib/final-jeopardy';
import {
  buildWindowTargetName,
  buildWindowUrl,
  ensureSessionIdInUrl,
  getViewModeFromLocation,
  useSessionSync,
} from './lib/session-sync';
import { useSoundboard } from './lib/soundboard';
import {
  clearStoredBundledGameSelection,
  clearStoredConfigOverride,
  clearStoredGameState,
  loadStoredBundledGameSelection,
  CONFIG_OVERRIDE_STORAGE_KEY,
  getStorageKey,
  loadStoredBoolean,
  loadStoredConfigOverride,
  loadStoredGameState,
  saveStoredBundledGameSelection,
  saveStoredBoolean,
  saveStoredConfigOverride,
  saveStoredGameState,
  SOUND_ENABLED_STORAGE_KEY,
} from './lib/storage';
import type { GameState, SharedSessionSnapshot } from './models/game';
import type { GameConfig } from './types/game-config';

interface BundledGameDefinition extends BundledGameSource {
  config: GameConfig;
}

interface BundledGameCatalog {
  games: ReadonlyArray<BundledGameDefinition>;
  byId: ReadonlyMap<string, BundledGameDefinition>;
  defaultGame: BundledGameDefinition;
}

interface BundledGameCatalogResult {
  ok: true;
  value: BundledGameCatalog;
}

interface BundledGameCatalogFailure {
  ok: false;
  errors: string[];
}

type BundledGameCatalogParseResult = BundledGameCatalogResult | BundledGameCatalogFailure;

function buildBundledGameCatalog(): BundledGameCatalogParseResult {
  const errors: string[] = [];
  const games: BundledGameDefinition[] = [];

  BUNDLED_GAME_SOURCES.forEach((source) => {
    const parseResult = loadGameConfig(source.rawConfig);

    if (!parseResult.ok) {
      errors.push(
        ...parseResult.errors.map((error) => `${source.filename}: ${error}`),
      );
      return;
    }

    games.push({
      ...source,
      config: parseResult.value,
    });
  });

  if (errors.length > 0) {
    return {
      ok: false,
      errors,
    };
  }

  const byId = new Map(games.map((game) => [game.id, game] as const));
  const defaultGame = byId.get(DEFAULT_BUNDLED_GAME_ID) ?? games[0];

  if (!defaultGame) {
    return {
      ok: false,
      errors: ['No bundled games were found in src/data/.'],
    };
  }

  return {
    ok: true,
    value: {
      games,
      byId,
      defaultGame,
    },
  };
}

// Import bundled JSON files as raw text so malformed edits fail inside the app instead of crashing the build.
const bundledGameCatalogResult = buildBundledGameCatalog();

function shouldIgnoreKeyboardShortcut(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && ['INPUT', 'TEXTAREA'].includes(target.tagName);
}

interface BootstrapState {
  config: GameConfig;
  selectedBundledGameId: string;
  gameState: GameState;
  activeTeamId: string | null;
  manualScoreDelta: number;
  isUsingLocalConfig: boolean;
  isSoundOutputEnabled: boolean;
  isPresenterMode: boolean;
}

function buildBootstrapState(bundledGameCatalog: BundledGameCatalog): BootstrapState {
  const storedBundledGameId = loadStoredBundledGameSelection();
  const selectedBundledGame = storedBundledGameId
    ? bundledGameCatalog.byId.get(storedBundledGameId) ?? null
    : null;

  if (storedBundledGameId && !selectedBundledGame) {
    clearStoredBundledGameSelection();
  }

  const storedOverride = loadStoredConfigOverride(CONFIG_OVERRIDE_STORAGE_KEY);
  const baseGame = selectedBundledGame ?? bundledGameCatalog.defaultGame;
  let config = baseGame.config;
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
    selectedBundledGameId: baseGame.id,
    gameState: hydrateGameState(config, storedState),
    activeTeamId: config.teams[0]?.id ?? null,
    manualScoreDelta: getMinimumClueValue(config),
    isUsingLocalConfig,
    isSoundOutputEnabled: loadStoredBoolean(SOUND_ENABLED_STORAGE_KEY) ?? true,
    isPresenterMode: false,
  };
}

export default function App() {
  if (!bundledGameCatalogResult.ok) {
    return <ErrorScreen errors={bundledGameCatalogResult.errors} />;
  }

  const bundledGameCatalog = bundledGameCatalogResult.value;
  const bootstrapRef = useRef<BootstrapState | null>(null);
  const hasPlayedInitialIntroRef = useRef(false);
  const sessionIdRef = useRef<string>(ensureSessionIdInUrl());
  const viewModeRef = useRef(getViewModeFromLocation());

  if (!bootstrapRef.current) {
    bootstrapRef.current = buildBootstrapState(bundledGameCatalog);
  }

  const bootstrapState = bootstrapRef.current;
  const sessionId = sessionIdRef.current;
  const viewMode = viewModeRef.current;

  const [config, setConfig] = useState<GameConfig>(bootstrapState.config);
  const [selectedBundledGameId, setSelectedBundledGameId] = useState<string>(
    bootstrapState.selectedBundledGameId,
  );
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
  const [isPresenterMode, setIsPresenterMode] = useState<boolean>(bootstrapState.isPresenterMode);
  const [isHostPanelOpen, setIsHostPanelOpen] = useState(false);
  const [isConfigEditorOpen, setIsConfigEditorOpen] = useState(false);
  const [isBoardHeaderForcedVisible, setIsBoardHeaderForcedVisible] = useState(false);
  const [boardEntranceCycle, setBoardEntranceCycle] = useState(0);

  const storageKey = getStorageKey(config.settings);
  const selectedBundledGame =
    bundledGameCatalog.byId.get(selectedBundledGameId) ?? bundledGameCatalog.defaultGame;
  const activeClue = findClueById(config, gameState.selectedClueId);
  const totalClues = config.categories.reduce((sum, category) => sum + category.clues.length, 0);
  const answeredClues = Object.keys(gameState.answeredClueIds).length;
  const isMainBoardComplete = answeredClues === totalClues;
  const isConfigSoundEnabled = config.settings.sounds.enabled;
  const isBoardView = viewMode === 'board';
  const finalJeopardyConfig = getFinalJeopardyConfig(config);
  const activeFinalJeopardy = finalJeopardyConfig ? gameState.finalJeopardy : null;
  const eligibleFinalJeopardyTeams = finalJeopardyConfig
    ? getEligibleFinalJeopardyTeams(gameState.teams, finalJeopardyConfig)
    : [];
  const isFinalJeopardyReady = Boolean(finalJeopardyConfig) && isMainBoardComplete && !activeFinalJeopardy;

  const { activeCueIds, activeLoopingCue, soundDefinitions, playCue, stopCue, stopAll } =
    useSoundboard({
      settings: config.settings.sounds,
      isOutputEnabled: isConfigSoundEnabled && isSoundOutputEnabled,
    });
  const shouldShowBoardHeader = !isBoardView || !isPresenterMode || isBoardHeaderForcedVisible;

  const sharedSnapshot: SharedSessionSnapshot = {
    config,
    selectedBundledGameId,
    isUsingLocalConfig,
    gameState,
    activeTeamId,
    manualScoreDelta,
    isPresenterMode,
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

  useEffect(() => {
    const viewLabel =
      viewMode === 'board' ? 'Board View' : viewMode === 'host' ? 'Host View' : 'Single View';
    const roundLabel = activeFinalJeopardy ? ' | Final Jeopardy' : '';
    document.title = `${config.title} | ${viewLabel}${roundLabel}`;
  }, [activeFinalJeopardy, config.title, viewMode]);

  useEffect(() => {
    if (!isBoardView || !isPresenterMode) {
      setIsBoardHeaderForcedVisible(false);
    }
  }, [isBoardView, isPresenterMode]);

  useEffect(() => {
    const shouldPlayInitialIntro = viewMode === 'single' && !hasPlayedInitialIntroRef.current;
    const shouldPlayBoardIntro =
      viewMode !== 'board' &&
      !activeFinalJeopardy &&
      (boardEntranceCycle > 0 || shouldPlayInitialIntro);

    if (!shouldPlayBoardIntro) {
      return;
    }

    hasPlayedInitialIntroRef.current = true;
    stopCue('thinkMusic');
    void playCue('introJeopardy');
  }, [activeFinalJeopardy, boardEntranceCycle, viewMode]);

  useEffect(() => {
    const shouldPlayFinalThinkMusic =
      viewMode !== 'board' &&
      activeFinalJeopardy?.phase === 'clue' &&
      Boolean(finalJeopardyConfig?.timerSeconds);

    if (shouldPlayFinalThinkMusic) {
      stopCue('introJeopardy');
      void playCue('thinkMusic');
      return;
    }

    stopCue('thinkMusic');
  }, [activeFinalJeopardy?.phase, finalJeopardyConfig?.timerSeconds, viewMode]);

  const handleSelectTeam = (teamId: string) => {
    if (teamId !== activeTeamId) {
      void playCue('contestantBuzzer');
    }

    setActiveTeamId(teamId);
  };

  const handleSelectClue = (clueId: string) => {
    const clueEntry = findClueById(config, clueId);

    stopCue('thinkMusic');
    stopCue('introJeopardy');
    setIsHostPanelOpen(false);

    if (clueEntry?.clue.dailyDouble) {
      void playCue('dailyDouble');
    }

    setGameState((currentState) => selectClue(currentState, clueId));
  };

  const handleReveal = () => {
    stopCue('thinkMusic');
    setGameState((currentState) => revealQuestion(currentState));
  };

  const handleOpenClueMedia = (mediaIndex: number) => {
    setGameState((currentState) => openClueMedia(currentState, mediaIndex));
  };

  const handleCloseClueMedia = () => {
    setGameState((currentState) => closeClueMedia(currentState));
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

  const handleRestoreClue = () => {
    stopCue('thinkMusic');
    setGameState((currentState) => restoreSelectedClue(currentState));
  };

  const handleMarkClue = (isCorrect: boolean) => {
    if (!activeTeamId || !activeClue) {
      return;
    }

    const isLastClue = answeredClues === totalClues;
    playClueCloseSound(true);

    if (!isLastClue) {
      void playCue(isCorrect ? 'correctAnswer' : 'tripleStumper');
    }

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

  const handleStartFinalJeopardy = () => {
    if (!finalJeopardyConfig || activeFinalJeopardy || !isMainBoardComplete) {
      return;
    }

    stopAll();
    setIsHostPanelOpen(false);
    setIsConfigEditorOpen(false);
    setGameState((currentState) => startFinalJeopardy(currentState, config));
  };

  const handleSetFinalJeopardyPhase = (
    phase: Parameters<typeof setFinalJeopardyPhase>[1],
  ) => {
    setGameState((currentState) => setFinalJeopardyPhase(currentState, phase));
  };

  const handleSetFinalJeopardyWagers = (wagersByTeamId: Record<string, number>) => {
    setGameState((currentState) => setFinalJeopardyWagers(currentState, wagersByTeamId));
  };

  const handleSetFinalJeopardyResponse = (teamId: string, response: string) => {
    setGameState((currentState) => setFinalJeopardyResponse(currentState, teamId, response));
  };

  const handleSetFinalJeopardyJudgment = (teamId: string, isCorrect: boolean) => {
    setGameState((currentState) => setFinalJeopardyJudgment(currentState, teamId, isCorrect));
  };

  const handleApplyFinalJeopardyResults = () => {
    stopCue('thinkMusic');
    setGameState((currentState) => applyFinalJeopardyResults(currentState));
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
    setBoardEntranceCycle((currentCycle) => currentCycle + 1);
  };

  const handleClearSavedState = () => {
    if (!window.confirm('Clear the saved browser state for this game?')) {
      return;
    }

    clearStoredGameState(storageKey);
  };

  const applyRuntimeConfig = (
    nextConfig: GameConfig,
    options: {
      rawConfig: string | null;
      isLocalOverride: boolean;
      selectedBundledGameId?: string;
      resetGameState?: boolean;
      clearTargetSavedState?: boolean;
    },
  ) => {
    const nextBundledGameId = options.selectedBundledGameId ?? selectedBundledGameId;

    if (options.isLocalOverride && options.rawConfig) {
      saveStoredConfigOverride(options.rawConfig, CONFIG_OVERRIDE_STORAGE_KEY);
    } else {
      clearStoredConfigOverride(CONFIG_OVERRIDE_STORAGE_KEY);
    }

    saveStoredBundledGameSelection(nextBundledGameId);

    if (options.clearTargetSavedState && nextConfig.settings.enableLocalStorage) {
      clearStoredGameState(getStorageKey(nextConfig.settings));
    }

    stopAll();
    setConfig(nextConfig);
    setSelectedBundledGameId(nextBundledGameId);
    setIsUsingLocalConfig(options.isLocalOverride);
    setGameState((currentState) =>
      options.resetGameState ? resetGame(nextConfig) : reconcileGameStateWithConfig(nextConfig, currentState),
    );
    setActiveTeamId((currentTeamId) => {
      if (options.resetGameState) {
        return nextConfig.teams[0]?.id ?? null;
      }

      return nextConfig.teams.some((team) => team.id === currentTeamId)
        ? currentTeamId
        : nextConfig.teams[0]?.id ?? null;
    });
    setManualScoreDelta(getMinimumClueValue(nextConfig));
    setBoardEntranceCycle((currentCycle) => currentCycle + 1);
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
      selectedBundledGameId,
    });
    setIsHostPanelOpen(false);

    return { ok: true };
  };

  const handleExportGame = () => ({
    filename: downloadGameConfigJson(config),
  });

  const handleImportGame = async (file: File) => {
    let rawConfig = '';

    try {
      rawConfig = await file.text();
    } catch {
      return {
        ok: false,
        errors: ['The selected file could not be read.'],
      };
    }

    const parseResult = loadGameConfig(rawConfig);

    if (!parseResult.ok) {
      return {
        ok: false,
        errors: parseResult.errors,
      };
    }

    const importedConfig = parseResult.value;
    const confirmMessage =
      isUsingLocalConfig || answeredClues > 0 || Boolean(activeFinalJeopardy)
        ? `Load "${importedConfig.title}" from ${file.name} and replace the current session with a fresh board?`
        : `Load "${importedConfig.title}" from ${file.name} as the current game?`;

    if (!window.confirm(confirmMessage)) {
      return {
        ok: false,
        cancelled: true,
      };
    }

    applyRuntimeConfig(importedConfig, {
      rawConfig,
      isLocalOverride: true,
      selectedBundledGameId,
      resetGameState: true,
      clearTargetSavedState: true,
    });
    setIsConfigEditorOpen(false);

    return {
      ok: true,
      message: `Loaded "${importedConfig.title}" from ${file.name}.`,
    };
  };

  const handleResetLocalConfig = () => {
    if (!window.confirm('Discard the local host config and return to the selected bundled game?')) {
      return;
    }

    applyRuntimeConfig(selectedBundledGame.config, {
      rawConfig: null,
      isLocalOverride: false,
      selectedBundledGameId: selectedBundledGame.id,
    });
    setIsConfigEditorOpen(false);
    setIsHostPanelOpen(false);
  };

  const handleSelectBundledGame = (bundledGameId: string) => {
    const nextBundledGame = bundledGameCatalog.byId.get(bundledGameId);

    if (!nextBundledGame) {
      return;
    }

    const switchingFromLocalOverride = isUsingLocalConfig;
    const switchingToNewGame =
      bundledGameId !== selectedBundledGameId || isUsingLocalConfig;

    if (!switchingToNewGame) {
      return;
    }

    const confirmMessage = switchingFromLocalOverride
      ? `Load "${nextBundledGame.label}" and discard the current browser-only edits?`
      : `Load "${nextBundledGame.label}" and start a fresh board?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    applyRuntimeConfig(nextBundledGame.config, {
      rawConfig: null,
      isLocalOverride: false,
      selectedBundledGameId: nextBundledGame.id,
      resetGameState: true,
      clearTargetSavedState: true,
    });
    setIsConfigEditorOpen(false);
    setIsHostPanelOpen(false);
  };

  const handleApplySharedSnapshot = (snapshot: SharedSessionSnapshot) => {
    setConfig(snapshot.config);
    setSelectedBundledGameId(snapshot.selectedBundledGameId || bundledGameCatalog.defaultGame.id);
    setIsUsingLocalConfig(snapshot.isUsingLocalConfig);
    setGameState(snapshot.gameState);
    setActiveTeamId(snapshot.activeTeamId);
    setManualScoreDelta(snapshot.manualScoreDelta);
    setIsPresenterMode(snapshot.isPresenterMode);
  };

  useEffect(() => {
    if (!activeClue || viewMode === 'board' || gameState.activeClueMediaIndex !== null) {
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
  }, [activeClue, gameState.activeClueMediaIndex, gameState.isQuestionRevealed, viewMode]);

  useEffect(() => {
    if (viewMode === 'board' || gameState.activeClueMediaIndex === null) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (shouldIgnoreKeyboardShortcut(event.target)) {
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        handleCloseClueMedia();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.activeClueMediaIndex, viewMode]);

  useEffect(() => {
    if (!isBoardView || !isPresenterMode || shouldShowBoardHeader) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (shouldIgnoreKeyboardShortcut(event.target)) {
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        setIsBoardHeaderForcedVisible(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isBoardView, isPresenterMode, shouldShowBoardHeader]);

  const { transport } = useSessionSync({
    sessionId,
    snapshot: sharedSnapshot,
    allowStorageFallback: config.settings.enableLocalStorage,
    onApplySnapshot: handleApplySharedSnapshot,
  });

  const openWindowForView = (nextView: 'single' | 'board' | 'host') => {
    if (nextView === 'host') {
      setIsPresenterMode(true);
    } else if (nextView === 'single') {
      setIsPresenterMode(false);
    }

    const targetUrl = buildWindowUrl(nextView, sessionId);
    const windowTargetName = buildWindowTargetName(nextView, sessionId);
    const nextWindow = window.open(targetUrl, windowTargetName);
    nextWindow?.focus();
  };

  return (
    <div
      className={
        isBoardView
          ? 'h-screen overflow-hidden px-3 py-3 sm:px-4'
          : 'min-h-screen px-4 py-4 sm:px-6 lg:px-8'
      }
    >
      <div
        className={`mx-auto flex w-full flex-col ${isBoardView ? 'h-[calc(100vh-1.5rem)] max-w-[1920px] gap-3' : 'max-w-[1800px] gap-4'}`}
      >
        {shouldShowBoardHeader ? (
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
            compact={isBoardView}
            onOpenHostPanel={
              viewMode === 'single' && !activeFinalJeopardy
                ? () => setIsHostPanelOpen(true)
                : undefined
            }
            onHideCompactHeader={
              isBoardView && isPresenterMode && isBoardHeaderForcedVisible
                ? () => setIsBoardHeaderForcedVisible(false)
                : undefined
            }
            onOpenBoardWindow={() => openWindowForView('board')}
            onOpenHostWindow={() => openWindowForView('host')}
            onOpenSingleWindow={() => openWindowForView('single')}
          />
        ) : null}

        {!isBoardView && !activeFinalJeopardy ? (
          <ScoreBoard
            teams={gameState.teams}
            activeTeamId={activeTeamId}
            isInteractive
            onSelectTeam={handleSelectTeam}
          />
        ) : null}

        {activeFinalJeopardy && finalJeopardyConfig ? (
          <div className={isBoardView ? 'min-h-0 flex-1 overflow-y-auto' : ''}>
            <FinalJeopardyScreen
              config={finalJeopardyConfig}
              state={activeFinalJeopardy}
              teams={gameState.teams}
              viewMode={viewMode}
              onSetPhase={handleSetFinalJeopardyPhase}
              onSetWagers={handleSetFinalJeopardyWagers}
              onSetResponse={handleSetFinalJeopardyResponse}
              onSetJudgment={handleSetFinalJeopardyJudgment}
              onApplyResults={handleApplyFinalJeopardyResults}
              onResetGame={handleResetGame}
            />
          </div>
        ) : viewMode === 'host' ? (
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_440px]">
            <GameBoard
              key={`host-board-${boardEntranceCycle}`}
              categories={config.categories}
              answeredClueIds={gameState.answeredClueIds}
              selectedClueId={gameState.selectedClueId}
              isInteractive
              showDailyDoubleHint
              showMediaHint
              onSelectClue={handleSelectClue}
            />

            <HostConsole
              bundledGames={bundledGameCatalog.games}
              selectedBundledGameId={selectedBundledGameId}
              clueEntry={activeClue}
              isRevealed={gameState.isQuestionRevealed}
              activeMediaIndex={gameState.activeClueMediaIndex}
              teams={gameState.teams}
              activeTeamId={activeTeamId}
              manualScoreDelta={manualScoreDelta}
              isFinalJeopardyReady={isFinalJeopardyReady}
              finalJeopardyEligibleTeamCount={eligibleFinalJeopardyTeams.length}
              subtractOnIncorrect={config.settings.subtractOnIncorrect}
              isLocalStorageEnabled={config.settings.enableLocalStorage}
              isUsingLocalConfig={isUsingLocalConfig}
              isConfigSoundEnabled={isConfigSoundEnabled}
              isSoundOutputEnabled={isSoundOutputEnabled}
              activeCueIds={activeCueIds}
              soundDefinitions={soundDefinitions}
              activeLoopingCue={activeLoopingCue}
              onSelectTeam={handleSelectTeam}
              onManualScoreDeltaChange={(value) => setManualScoreDelta(Math.max(0, value))}
              onAdjustTeamScore={handleAdjustTeamScore}
              onToggleSoundOutput={setIsSoundOutputEnabled}
              onPreviewCue={playCue}
              onStopCue={stopCue}
              onStopAllSounds={stopAll}
              onSelectBundledGame={handleSelectBundledGame}
              onExportGame={handleExportGame}
              onImportGame={handleImportGame}
              onOpenConfigEditor={() => setIsConfigEditorOpen(true)}
              onResetScores={handleResetScores}
              onResetGame={handleResetGame}
              onClearSavedState={handleClearSavedState}
              onResetLocalConfig={handleResetLocalConfig}
              onStartFinalJeopardy={handleStartFinalJeopardy}
              onReveal={handleReveal}
              onMarkCorrect={() => handleMarkClue(true)}
              onMarkIncorrect={() => handleMarkClue(false)}
              onCloseClue={handleCloseClue}
              onRestoreClue={handleRestoreClue}
              onOpenMedia={handleOpenClueMedia}
              onCloseMedia={handleCloseClueMedia}
            />
          </div>
        ) : isBoardView ? (
          <div className="flex min-h-0 flex-1 flex-col gap-3">
            <div className="min-h-0 flex-1">
              <GameBoard
                key={`board-view-${boardEntranceCycle}`}
                categories={config.categories}
                answeredClueIds={gameState.answeredClueIds}
                selectedClueId={gameState.selectedClueId}
                isInteractive={false}
                compact
                showDailyDoubleHint={false}
                onSelectClue={handleSelectClue}
              />
            </div>
            <div className="shrink-0">
              <ScoreBoard
                teams={gameState.teams}
                activeTeamId={activeTeamId}
                isInteractive={false}
                compact
                onSelectTeam={handleSelectTeam}
              />
            </div>
          </div>
        ) : (
          <>
            <GameBoard
              key={`single-board-${boardEntranceCycle}`}
              categories={config.categories}
              answeredClueIds={gameState.answeredClueIds}
              selectedClueId={gameState.selectedClueId}
              isInteractive
              showDailyDoubleHint={false}
              showMediaHint
              onSelectClue={handleSelectClue}
            />
          </>
        )}
      </div>

      {viewMode === 'single' && !activeFinalJeopardy ? (
        <HostPanel
          isOpen={isHostPanelOpen}
          bundledGames={bundledGameCatalog.games}
          selectedBundledGameId={selectedBundledGameId}
          teams={gameState.teams}
          activeTeamId={activeTeamId}
          manualScoreDelta={manualScoreDelta}
          isFinalJeopardyReady={isFinalJeopardyReady}
          finalJeopardyEligibleTeamCount={eligibleFinalJeopardyTeams.length}
          isLocalStorageEnabled={config.settings.enableLocalStorage}
          isUsingLocalConfig={isUsingLocalConfig}
          isConfigSoundEnabled={isConfigSoundEnabled}
          isSoundOutputEnabled={isSoundOutputEnabled}
          activeCueIds={activeCueIds}
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
          onSelectBundledGame={handleSelectBundledGame}
          onExportGame={handleExportGame}
          onImportGame={handleImportGame}
          onOpenConfigEditor={() => {
            setIsHostPanelOpen(false);
            setIsConfigEditorOpen(true);
          }}
          onResetScores={handleResetScores}
          onResetGame={handleResetGame}
          onClearSavedState={handleClearSavedState}
          onResetLocalConfig={handleResetLocalConfig}
          onStartFinalJeopardy={handleStartFinalJeopardy}
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

      {viewMode !== 'host' && !activeFinalJeopardy ? (
        <ClueModal
          clueEntry={activeClue}
          isRevealed={gameState.isQuestionRevealed}
          teams={gameState.teams}
          activeTeamId={activeTeamId}
          subtractOnIncorrect={config.settings.subtractOnIncorrect}
          variant={viewMode === 'board' ? 'presentation' : 'interactive'}
          activeMediaIndex={gameState.activeClueMediaIndex}
          onSelectTeam={handleSelectTeam}
          onReveal={handleReveal}
          onMarkCorrect={() => handleMarkClue(true)}
          onMarkIncorrect={() => handleMarkClue(false)}
          onClose={handleCloseClue}
          onRestoreClue={handleRestoreClue}
          onOpenMedia={handleOpenClueMedia}
          onCloseMedia={handleCloseClueMedia}
        />
      ) : null}
    </div>
  );
}
