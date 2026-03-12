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
import sampleGameRaw from './data/sample-game.json?raw';
import {
  applyFinalJeopardyResults,
  applyClueOutcome,
  adjustTeamScore,
  closeClue,
  hydrateGameState,
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
  isPresenterMode: boolean;
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
    isPresenterMode: false,
  };
}

export default function App() {
  if (!bundledConfigResult.ok) {
    return <ErrorScreen errors={bundledConfigResult.errors} />;
  }

  const bundledConfig = bundledConfigResult.value;
  const bootstrapRef = useRef<BootstrapState | null>(null);
  const hasPlayedInitialIntroRef = useRef(false);
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
  const [isPresenterMode, setIsPresenterMode] = useState<boolean>(bootstrapState.isPresenterMode);
  const [isHostPanelOpen, setIsHostPanelOpen] = useState(false);
  const [isConfigEditorOpen, setIsConfigEditorOpen] = useState(false);
  const [isBoardHeaderForcedVisible, setIsBoardHeaderForcedVisible] = useState(false);
  const [boardEntranceCycle, setBoardEntranceCycle] = useState(0);

  const storageKey = getStorageKey(config.settings);
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
    setIsPresenterMode(snapshot.isPresenterMode);
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
              onSelectClue={handleSelectClue}
            />

            <HostConsole
              clueEntry={activeClue}
              isRevealed={gameState.isQuestionRevealed}
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
              onSelectClue={handleSelectClue}
            />
          </>
        )}
      </div>

      {viewMode === 'single' && !activeFinalJeopardy ? (
        <HostPanel
          isOpen={isHostPanelOpen}
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
          onSelectTeam={handleSelectTeam}
          onReveal={handleReveal}
          onMarkCorrect={() => handleMarkClue(true)}
          onMarkIncorrect={() => handleMarkClue(false)}
          onClose={handleCloseClue}
          onRestoreClue={handleRestoreClue}
        />
      ) : null}
    </div>
  );
}
