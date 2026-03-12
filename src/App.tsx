import { useEffect, useRef, useState } from 'react';
import { ClueModal } from './components/ClueModal';
import { ConfigEditorModal } from './components/ConfigEditorModal';
import { ControlBar } from './components/ControlBar';
import { ErrorScreen } from './components/ErrorScreen';
import { GameBoard } from './components/GameBoard';
import { HostPanel } from './components/HostPanel';
import { ScoreBoard } from './components/ScoreBoard';
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
  clearStoredConfigOverride,
  clearStoredGameState,
  CONFIG_OVERRIDE_STORAGE_KEY,
  getStorageKey,
  loadStoredConfigOverride,
  loadStoredGameState,
  saveStoredConfigOverride,
  saveStoredGameState,
} from './lib/storage';
import type { GameState } from './models/game';
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
  };
}

export default function App() {
  if (!bundledConfigResult.ok) {
    return <ErrorScreen errors={bundledConfigResult.errors} />;
  }

  const bundledConfig = bundledConfigResult.value;
  const bootstrapRef = useRef<BootstrapState | null>(null);

  if (!bootstrapRef.current) {
    bootstrapRef.current = buildBootstrapState(bundledConfig);
  }

  const bootstrapState = bootstrapRef.current;

  const [config, setConfig] = useState<GameConfig>(bootstrapState.config);
  const [isUsingLocalConfig, setIsUsingLocalConfig] = useState<boolean>(
    bootstrapState.isUsingLocalConfig,
  );
  const [gameState, setGameState] = useState<GameState>(bootstrapState.gameState);
  const [activeTeamId, setActiveTeamId] = useState<string | null>(bootstrapState.activeTeamId);
  const [manualScoreDelta, setManualScoreDelta] = useState<number>(
    bootstrapState.manualScoreDelta,
  );
  const [isHostPanelOpen, setIsHostPanelOpen] = useState(false);
  const [isConfigEditorOpen, setIsConfigEditorOpen] = useState(false);

  const storageKey = getStorageKey(config.settings);
  const activeClue = findClueById(config, gameState.selectedClueId);
  const totalClues = config.categories.reduce((sum, category) => sum + category.clues.length, 0);
  const answeredClues = Object.keys(gameState.answeredClueIds).length;

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
    if (!activeClue) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (shouldIgnoreKeyboardShortcut(event.target)) {
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        setGameState((currentState) => closeClue(currentState));
      }

      if ((event.key === ' ' || event.key === 'Enter') && !gameState.isQuestionRevealed) {
        event.preventDefault();
        setGameState((currentState) => revealQuestion(currentState));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeClue, gameState.isQuestionRevealed]);

  const handleSelectClue = (clueId: string) => {
    setIsHostPanelOpen(false);
    setGameState((currentState) => selectClue(currentState, clueId));
  };

  const handleReveal = () => {
    setGameState((currentState) => revealQuestion(currentState));
  };

  const handleCloseClue = () => {
    setGameState((currentState) => closeClue(currentState));
  };

  const handleMarkClue = (isCorrect: boolean) => {
    if (!activeTeamId || !activeClue) {
      return;
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

    setGameState(resetGame(config));
    setActiveTeamId(config.teams[0]?.id ?? null);
    setIsHostPanelOpen(false);
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
          onOpenHostPanel={() => setIsHostPanelOpen(true)}
        />

        <ScoreBoard
          teams={gameState.teams}
          activeTeamId={activeTeamId}
          onSelectTeam={setActiveTeamId}
        />

        <GameBoard
          categories={config.categories}
          answeredClueIds={gameState.answeredClueIds}
          selectedClueId={gameState.selectedClueId}
          onSelectClue={handleSelectClue}
        />
      </div>

      <HostPanel
        isOpen={isHostPanelOpen}
        teams={gameState.teams}
        activeTeamId={activeTeamId}
        manualScoreDelta={manualScoreDelta}
        isLocalStorageEnabled={config.settings.enableLocalStorage}
        isUsingLocalConfig={isUsingLocalConfig}
        onClose={() => setIsHostPanelOpen(false)}
        onSelectTeam={setActiveTeamId}
        onManualScoreDeltaChange={(value) => setManualScoreDelta(Math.max(0, value))}
        onAdjustTeamScore={handleAdjustTeamScore}
        onOpenConfigEditor={() => {
          setIsHostPanelOpen(false);
          setIsConfigEditorOpen(true);
        }}
        onResetScores={handleResetScores}
        onResetGame={handleResetGame}
        onClearSavedState={handleClearSavedState}
        onResetLocalConfig={handleResetLocalConfig}
      />

      <ConfigEditorModal
        isOpen={isConfigEditorOpen}
        config={config}
        onClose={() => setIsConfigEditorOpen(false)}
        onApply={handleApplyConfig}
      />

      <ClueModal
        clueEntry={activeClue}
        isRevealed={gameState.isQuestionRevealed}
        teams={gameState.teams}
        activeTeamId={activeTeamId}
        subtractOnIncorrect={config.settings.subtractOnIncorrect}
        onSelectTeam={setActiveTeamId}
        onReveal={handleReveal}
        onMarkCorrect={() => handleMarkClue(true)}
        onMarkIncorrect={() => handleMarkClue(false)}
        onClose={handleCloseClue}
      />
    </div>
  );
}
