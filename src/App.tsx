import { useEffect, useRef, useState } from 'react';
import { ClueModal } from './components/ClueModal';
import { ConfigEditorModal } from './components/ConfigEditorModal';
import { ControlBar } from './components/ControlBar';
import { ErrorScreen } from './components/ErrorScreen';
import { FinalJeopardyScreen } from './components/final-jeopardy/FinalJeopardyScreen';
import { GameBoard } from './components/GameBoard';
import { GameNotificationBanner } from './components/GameNotificationBanner';
import { HostConsole } from './components/HostConsole';
import { HostGameplayBar } from './components/HostGameplayBar';
import { HostLayoutControls } from './components/HostLayoutControls';
import { HostPanel } from './components/HostPanel';
import { PanelWindowButton } from './components/PanelWindowButton';
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
import { formatCurrencyValue, formatScore } from './lib/score-utils';
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
import type { GameNotification, GameNotificationTone, GameState, SharedSessionSnapshot } from './models/game';
import { GAME_SOUND_CUES, type GameSoundCue } from './types/game-audio';
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

type RemoteAudioCommand =
  | {
      type: 'play';
      cue: GameSoundCue;
    }
  | {
      type: 'stop';
      cue: GameSoundCue;
    }
  | {
      type: 'stopAll';
    }
  | {
      type: 'setEnabled';
      enabled: boolean;
    };

interface RemoteAudioCommandMessage {
  type: 'remote-audio-command';
  sessionId: string;
  commandId: number;
  command: RemoteAudioCommand;
}

const REMOTE_AUDIO_CHANNEL_PREFIX = 'work-jeopardy-audio';
const GAME_SOUND_CUE_SET = new Set<string>(GAME_SOUND_CUES);

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isGameSoundCue(value: unknown): value is GameSoundCue {
  return typeof value === 'string' && GAME_SOUND_CUE_SET.has(value);
}

function isRemoteAudioCommandMessage(value: unknown): value is RemoteAudioCommandMessage {
  if (!isRecord(value) || value.type !== 'remote-audio-command') {
    return false;
  }

  if (typeof value.sessionId !== 'string' || typeof value.commandId !== 'number') {
    return false;
  }

  const { command } = value;

  if (!isRecord(command) || typeof command.type !== 'string') {
    return false;
  }

  switch (command.type) {
    case 'play':
    case 'stop':
      return isGameSoundCue(command.cue);
    case 'stopAll':
      return true;
    case 'setEnabled':
      return typeof command.enabled === 'boolean';
    default:
      return false;
  }
}

function getRemoteAudioChannelName(sessionId: string): string {
  return `${REMOTE_AUDIO_CHANNEL_PREFIX}:${sessionId}`;
}

function createRemoteAudioCommandId(previousCommandId: number): number {
  return Math.max(Date.now(), previousCommandId + 1);
}

function isLoopingGameCue(cue: GameSoundCue): boolean {
  return cue === 'thinkMusic';
}

function shouldIgnoreKeyboardShortcut(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
  );
}

function hasKeyboardModifier(event: KeyboardEvent): boolean {
  return event.metaKey || event.ctrlKey || event.altKey;
}

interface GameNotificationInput {
  tone: GameNotificationTone;
  variant?: GameNotification['variant'];
  title: string;
  message: string;
  durationMs?: number | null;
}

function createGameNotification({
  tone,
  variant = 'default',
  title,
  message,
  durationMs = 3600,
}: GameNotificationInput): GameNotification {
  return {
    id: `notice-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    tone,
    variant,
    title,
    message,
    expiresAt: durationMs === null ? null : Date.now() + durationMs,
  };
}

function withGameNotification(
  previousState: GameState,
  nextState: GameState,
  notification: GameNotificationInput,
): GameState {
  if (nextState === previousState) {
    return previousState;
  }

  return {
    ...nextState,
    notification: createGameNotification(notification),
  };
}

function getFinalJeopardyPhaseNotification(
  phase: Parameters<typeof setFinalJeopardyPhase>[1],
): GameNotificationInput {
  switch (phase) {
    case 'category':
      return {
        tone: 'warning',
        title: 'Final Jeopardy',
        message: 'The final category is now on the board.',
        durationMs: 4200,
      };
    case 'wager':
      return {
        tone: 'warning',
        title: 'Wagers Open',
        message: 'Teams should lock in their Final Jeopardy wagers.',
        durationMs: 4200,
      };
    case 'clue':
      return {
        tone: 'info',
        title: 'Final Clue Live',
        message: 'The final clue is live. Teams should prepare their responses.',
        durationMs: 4200,
      };
    case 'responses':
      return {
        tone: 'info',
        title: 'Responses In Progress',
        message: 'Responses are being collected now.',
        durationMs: 3600,
      };
    case 'review':
      return {
        tone: 'warning',
        title: 'Judging Responses',
        message: 'The host is reviewing each Final Jeopardy response.',
        durationMs: 3600,
      };
    case 'results':
      return {
        tone: 'success',
        title: 'Final Results',
        message: 'Final Jeopardy results are on screen.',
        durationMs: 5000,
      };
  }
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

interface HostVisiblePanels {
  gameplay: boolean;
  board: boolean;
  clue: boolean;
  setup: boolean;
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
  const remoteAudioCommandIdRef = useRef(0);
  const lastHandledRemoteAudioCommandIdRef = useRef(0);
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
  const [routedLoopingCue, setRoutedLoopingCue] = useState<GameSoundCue | null>(null);
  const [hostVisiblePanels, setHostVisiblePanels] = useState<HostVisiblePanels>({
    gameplay: true,
    board: true,
    clue: true,
    setup: true,
  });

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
  const shouldRouteAudioToBoard = viewMode === 'host' && isPresenterMode;
  const displayedActiveCueIds =
    shouldRouteAudioToBoard && routedLoopingCue ? [routedLoopingCue] : activeCueIds;
  const displayedActiveLoopingCue = shouldRouteAudioToBoard ? routedLoopingCue : activeLoopingCue;
  const shouldShowBoardHeader = !isBoardView || !isPresenterMode || isBoardHeaderForcedVisible;
  const shouldShowHostSidebar = hostVisiblePanels.setup;
  const shouldShowControlBar =
    shouldShowBoardHeader && (viewMode !== 'host' || Boolean(activeFinalJeopardy));
  const notificationOffsetClass = shouldShowControlBar
    ? isBoardView
      ? 'top-20 sm:top-24'
      : 'top-24 sm:top-28'
    : 'top-4 sm:top-6';

  const sharedSnapshot: SharedSessionSnapshot = {
    config,
    selectedBundledGameId,
    isUsingLocalConfig,
    gameState,
    activeTeamId,
    manualScoreDelta,
    isPresenterMode,
  };

  const broadcastRemoteAudioCommand = (command: RemoteAudioCommand): boolean => {
    if (typeof BroadcastChannel === 'undefined') {
      return false;
    }

    remoteAudioCommandIdRef.current = createRemoteAudioCommandId(remoteAudioCommandIdRef.current);

    const message = {
      type: 'remote-audio-command',
      sessionId,
      commandId: remoteAudioCommandIdRef.current,
      command,
    } satisfies RemoteAudioCommandMessage;

    const channel = new BroadcastChannel(getRemoteAudioChannelName(sessionId));
    channel.postMessage(message);
    channel.close();
    return true;
  };

  const trackRoutedAudioCommand = (command: RemoteAudioCommand) => {
    setRoutedLoopingCue((currentCue) => {
      switch (command.type) {
        case 'play':
          return isLoopingGameCue(command.cue) ? command.cue : currentCue;
        case 'stop':
          return currentCue === command.cue ? null : currentCue;
        case 'stopAll':
          return null;
        case 'setEnabled':
          return command.enabled ? currentCue : null;
      }
    });
  };

  const playSessionCue = (cue: GameSoundCue) => {
    if (shouldRouteAudioToBoard && broadcastRemoteAudioCommand({ type: 'play', cue })) {
      trackRoutedAudioCommand({ type: 'play', cue });
      return Promise.resolve(true);
    }

    return playCue(cue);
  };

  const stopSessionCue = (cue: GameSoundCue) => {
    if (shouldRouteAudioToBoard && broadcastRemoteAudioCommand({ type: 'stop', cue })) {
      trackRoutedAudioCommand({ type: 'stop', cue });
      return;
    }

    stopCue(cue);
  };

  const stopAllSessionAudio = () => {
    if (shouldRouteAudioToBoard && broadcastRemoteAudioCommand({ type: 'stopAll' })) {
      trackRoutedAudioCommand({ type: 'stopAll' });
      return;
    }

    stopAll();
  };

  const setSessionSoundOutputEnabled = (enabled: boolean) => {
    setIsSoundOutputEnabled(enabled);
    trackRoutedAudioCommand({ type: 'setEnabled', enabled });

    if (shouldRouteAudioToBoard) {
      void broadcastRemoteAudioCommand({ type: 'setEnabled', enabled });
    }
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
    if (shouldRouteAudioToBoard) {
      return;
    }

    setRoutedLoopingCue(null);
  }, [shouldRouteAudioToBoard]);

  useEffect(() => {
    if (viewMode !== 'board' || typeof BroadcastChannel === 'undefined') {
      return;
    }

    const channel = new BroadcastChannel(getRemoteAudioChannelName(sessionId));

    const handleMessage = (event: MessageEvent<unknown>) => {
      const message = event.data;

      if (!isRemoteAudioCommandMessage(message) || message.sessionId !== sessionId) {
        return;
      }

      if (message.commandId <= lastHandledRemoteAudioCommandIdRef.current) {
        return;
      }

      lastHandledRemoteAudioCommandIdRef.current = message.commandId;

      switch (message.command.type) {
        case 'play':
          void playCue(message.command.cue);
          break;
        case 'stop':
          stopCue(message.command.cue);
          break;
        case 'stopAll':
          stopAll();
          break;
        case 'setEnabled':
          setIsSoundOutputEnabled(message.command.enabled);
          break;
      }
    };

    channel.addEventListener('message', handleMessage as EventListener);

    return () => {
      channel.removeEventListener('message', handleMessage as EventListener);
      channel.close();
    };
  }, [playCue, sessionId, stopAll, stopCue, viewMode]);

  useEffect(() => {
    const viewLabel =
      viewMode === 'board' ? 'Board' : viewMode === 'host' ? 'Host' : 'Single View';
    const roundLabel = activeFinalJeopardy ? ' | Final Jeopardy' : '';
    if(viewMode === 'board'){
      document.title = `${config.title} | ${viewLabel}${roundLabel}`;
    } else {
      document.title = `${viewLabel}${roundLabel} | ${config.title}`;
    }
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
    stopSessionCue('thinkMusic');
    void playSessionCue('introJeopardy');
  }, [activeFinalJeopardy, boardEntranceCycle, viewMode]);

  useEffect(() => {
    const shouldPlayFinalThinkMusic =
      viewMode !== 'board' &&
      activeFinalJeopardy?.phase === 'clue' &&
      Boolean(finalJeopardyConfig?.timerSeconds);

    if (shouldPlayFinalThinkMusic) {
      stopSessionCue('introJeopardy');
      void playSessionCue('thinkMusic');
      return;
    }

    stopSessionCue('thinkMusic');
  }, [activeFinalJeopardy?.phase, finalJeopardyConfig?.timerSeconds, viewMode]);

  const handleSelectTeam = (teamId: string) => {
    if (teamId !== activeTeamId) {
      void playSessionCue('contestantBuzzer');
    }

    setActiveTeamId(teamId);
  };

  const handleSelectClue = (clueId: string) => {
    const clueEntry = findClueById(config, clueId);
    const activeTeam = gameState.teams.find((team) => team.id === activeTeamId) ?? null;

    stopSessionCue('thinkMusic');
    stopSessionCue('introJeopardy');
    setIsHostPanelOpen(false);

    if (clueEntry?.clue.dailyDouble) {
      void playSessionCue('dailyDouble');
    }

    setGameState((currentState) =>
      withGameNotification(
        currentState,
        selectClue(currentState, clueId),
        clueEntry?.clue.dailyDouble
          ? {
              tone: 'warning',
              variant: 'featured',
              title: 'Daily Double',
              message: `${activeTeam?.name ?? 'A player'} found the Daily Double in ${clueEntry.categoryTitle} for ${formatCurrencyValue(clueEntry.clue.value)}.`,
              durationMs: 5200,
            }
          : {
              tone: 'info',
              title: 'New Clue',
              message: clueEntry
                ? `${clueEntry.categoryTitle} for ${formatCurrencyValue(clueEntry.clue.value)} is on screen.`
                : 'A new clue is now on screen.',
              durationMs: 3600,
            },
      ),
    );
  };

  const handleReveal = () => {
    stopSessionCue('thinkMusic');
    setGameState((currentState) =>
      withGameNotification(currentState, revealQuestion(currentState), {
        tone: 'warning',
        title: 'Correct Response Revealed',
        message: 'The host is judging the clue now.',
        durationMs: 3200,
      }),
    );
  };

  const handleOpenClueMedia = (mediaIndex: number) => {
    setGameState((currentState) => openClueMedia(currentState, mediaIndex));
  };

  const handleCloseClueMedia = () => {
    setGameState((currentState) => closeClueMedia(currentState));
  };

  const playClueCloseSound = (wasScored: boolean) => {
    stopSessionCue('thinkMusic');

    if (!activeClue) {
      return;
    }

    if (answeredClues === totalClues) {
      void playSessionCue('endRound');
      return;
    }

    if (!wasScored && gameState.isQuestionRevealed) {
      void playSessionCue('tripleStumper');
    }
  };

  const handleCloseClue = () => {
    playClueCloseSound(false);
    setGameState((currentState) =>
      withGameNotification(currentState, closeClue(currentState), {
        tone: answeredClues === totalClues ? 'warning' : 'info',
        title: answeredClues === totalClues ? 'Board Complete' : 'Next Clue',
        message:
          answeredClues === totalClues
            ? finalJeopardyConfig
              ? 'Main board complete. Final Jeopardy is ready.'
              : 'Main board complete.'
            : 'Select the next clue on the board.',
        durationMs: answeredClues === totalClues ? 4200 : 2600,
      }),
    );
  };

  const handleRestoreClue = () => {
    stopSessionCue('thinkMusic');
    setGameState((currentState) =>
      withGameNotification(currentState, restoreSelectedClue(currentState), {
        tone: 'warning',
        title: 'Clue Returned',
        message: 'That tile is back on the board.',
        durationMs: 2800,
      }),
    );
  };

  const handleMarkClue = (isCorrect: boolean) => {
    if (!activeTeamId || !activeClue) {
      return;
    }

    const isLastClue = answeredClues === totalClues;
    playClueCloseSound(true);

    if (!isLastClue) {
      void playSessionCue(isCorrect ? 'correctAnswer' : 'tripleStumper');
    }

    setGameState((currentState) => {
      const activeTeam = currentState.teams.find((team) => team.id === activeTeamId);
      const nextState = applyClueOutcome(
        currentState,
        activeTeamId,
        activeClue.clue.value,
        isCorrect,
        config.settings.subtractOnIncorrect,
      );

      return withGameNotification(
        currentState,
        nextState,
        isCorrect
          ? {
              tone: 'success',
              title: `${activeTeam?.name ?? 'Team'} Correct`,
              message: `${formatScore(activeClue.clue.value)} awarded.${isLastClue ? ` ${finalJeopardyConfig ? 'Main board complete. Final Jeopardy is ready.' : 'Main board complete.'}` : ''}`,
              durationMs: 4200,
            }
          : {
              tone: config.settings.subtractOnIncorrect ? 'error' : 'warning',
              title: `${activeTeam?.name ?? 'Team'} Incorrect`,
              message: config.settings.subtractOnIncorrect
                ? `${formatScore(-activeClue.clue.value)} recorded.${isLastClue ? ` ${finalJeopardyConfig ? 'Main board complete. Final Jeopardy is ready.' : 'Main board complete.'}` : ''}`
                : `Incorrect answer recorded with no score change.${isLastClue ? ` ${finalJeopardyConfig ? 'Main board complete. Final Jeopardy is ready.' : 'Main board complete.'}` : ''}`,
              durationMs: 4200,
            },
      );
    });
  };

  const handleAdjustTeamScore = (teamId: string, delta: number) => {
    setGameState((currentState) => {
      const nextState = adjustTeamScore(currentState, teamId, delta);
      const team = currentState.teams.find((entry) => entry.id === teamId);

      return withGameNotification(
        currentState,
        nextState,
        {
          tone: delta > 0 ? 'success' : 'error',
          title: 'Score Updated',
          message: `${team?.name ?? 'Team'} ${delta > 0 ? 'gained' : 'lost'} ${formatCurrencyValue(Math.abs(delta))}.`,
          durationMs: 3600,
        },
      );
    });
  };

  const handleStartFinalJeopardy = () => {
    if (!finalJeopardyConfig || activeFinalJeopardy || !isMainBoardComplete) {
      return;
    }

    stopAllSessionAudio();
    setIsHostPanelOpen(false);
    setIsConfigEditorOpen(false);
    setGameState((currentState) =>
      withGameNotification(currentState, startFinalJeopardy(currentState, config), {
        tone: 'warning',
        title: 'Final Jeopardy',
        message: 'Final Jeopardy is starting now.',
        durationMs: 5000,
      }),
    );
  };

  const handleSetFinalJeopardyPhase = (
    phase: Parameters<typeof setFinalJeopardyPhase>[1],
  ) => {
    setGameState((currentState) =>
      withGameNotification(
        currentState,
        setFinalJeopardyPhase(currentState, phase),
        getFinalJeopardyPhaseNotification(phase),
      ),
    );
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
    stopSessionCue('thinkMusic');
    setGameState((currentState) =>
      withGameNotification(currentState, applyFinalJeopardyResults(currentState), {
        tone: 'success',
        title: 'Scores Finalized',
        message: 'Final Jeopardy scores have been applied.',
        durationMs: 5000,
      }),
    );
  };

  const handleResetScores = () => {
    if (!window.confirm('Reset all team scores to zero?')) {
      return;
    }

    setGameState((currentState) =>
      withGameNotification(currentState, resetScores(currentState), {
        tone: 'warning',
        title: 'Scores Reset',
        message: 'All team scores are back to zero.',
        durationMs: 3600,
      }),
    );
  };

  const handleResetGame = () => {
    if (!window.confirm('Reset the full board and all scores?')) {
      return;
    }

    if (config.settings.enableLocalStorage) {
      clearStoredGameState(storageKey);
    }

    stopAllSessionAudio();
    setGameState((currentState) =>
      withGameNotification(currentState, resetGame(config), {
        tone: 'warning',
        title: 'Board Reset',
        message: 'The board and all team scores have been reset.',
        durationMs: 4200,
      }),
    );
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

    stopAllSessionAudio();
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
    setGameState({
      ...snapshot.gameState,
      notification: snapshot.gameState.notification
        ? {
            ...snapshot.gameState.notification,
            variant: snapshot.gameState.notification.variant ?? 'default',
          }
        : null,
    });
    setActiveTeamId(snapshot.activeTeamId);
    setManualScoreDelta(snapshot.manualScoreDelta);
    setIsPresenterMode(snapshot.isPresenterMode);
  };

  useEffect(() => {
    if (
      !activeClue ||
      viewMode === 'board' ||
      gameState.activeClueMediaIndex !== null ||
      isConfigEditorOpen
    ) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (hasKeyboardModifier(event) || shouldIgnoreKeyboardShortcut(event.target)) {
        return;
      }

      const normalizedKey = event.key.toLowerCase();
      const hasClueMedia = Boolean(activeClue.clue.media?.length);

      if (event.key === 'Escape' || normalizedKey === 'x') {
        event.preventDefault();
        handleCloseClue();
        return;
      }

      if (
        (event.key === ' ' || event.key === 'Enter' || normalizedKey === 'r') &&
        !gameState.isQuestionRevealed
      ) {
        event.preventDefault();
        handleReveal();
        return;
      }

      if (normalizedKey === 'c' && activeTeamId) {
        event.preventDefault();
        handleMarkClue(true);
        return;
      }

      if (normalizedKey === 'i' && activeTeamId) {
        event.preventDefault();
        handleMarkClue(false);
        return;
      }

      if (normalizedKey === 'u') {
        event.preventDefault();
        handleRestoreClue();
        return;
      }

      if (normalizedKey === 'm' && hasClueMedia) {
        event.preventDefault();
        handleOpenClueMedia(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    activeClue,
    activeTeamId,
    gameState.activeClueMediaIndex,
    gameState.isQuestionRevealed,
    isConfigEditorOpen,
    viewMode,
  ]);

  useEffect(() => {
    if (viewMode === 'board' || gameState.activeClueMediaIndex === null || isConfigEditorOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (hasKeyboardModifier(event) || shouldIgnoreKeyboardShortcut(event.target)) {
        return;
      }

      const normalizedKey = event.key.toLowerCase();

      if (event.key === 'Escape' || normalizedKey === 'x' || normalizedKey === 'm') {
        event.preventDefault();
        handleCloseClueMedia();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.activeClueMediaIndex, isConfigEditorOpen, viewMode]);

  useEffect(() => {
    if (viewMode === 'board' || isConfigEditorOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (hasKeyboardModifier(event) || shouldIgnoreKeyboardShortcut(event.target)) {
        return;
      }

      const normalizedKey = event.key.toLowerCase();

      if (normalizedKey >= '1' && normalizedKey <= '9' && !activeFinalJeopardy) {
        const teamIndex = Number.parseInt(normalizedKey, 10) - 1;
        const nextTeam = gameState.teams[teamIndex];

        if (!nextTeam) {
          return;
        }

        event.preventDefault();
        handleSelectTeam(nextTeam.id);
        return;
      }

      if (normalizedKey === 'f' && isFinalJeopardyReady) {
        event.preventDefault();
        handleStartFinalJeopardy();
        return;
      }

      if (normalizedKey === 'h' && viewMode === 'single' && !activeFinalJeopardy) {
        event.preventDefault();
        setIsHostPanelOpen((currentValue) => !currentValue);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeFinalJeopardy, gameState.teams, isConfigEditorOpen, isFinalJeopardyReady, viewMode]);

  useEffect(() => {
    if (!isBoardView || !isPresenterMode || shouldShowBoardHeader) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (hasKeyboardModifier(event) || shouldIgnoreKeyboardShortcut(event.target)) {
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

  const toggleHostVisiblePanel = (panel: keyof HostVisiblePanels) => {
    setHostVisiblePanels((currentPanels) => ({
      ...currentPanels,
      [panel]: !currentPanels[panel],
    }));
  };

  return (
    <div
      className={
        isBoardView
          ? 'h-screen overflow-hidden px-3 py-3 sm:px-4'
          : viewMode === 'host' && !activeFinalJeopardy
            ? 'min-h-screen px-4 py-4 pb-28 sm:px-6 lg:px-8'
            : 'min-h-screen px-4 py-4 sm:px-6 lg:px-8'
      }
    >
      <div
        className={`mx-auto flex w-full flex-col ${isBoardView ? 'h-[calc(100vh-1.5rem)] max-w-[1920px] gap-3' : 'max-w-[1800px] gap-4'}`}
      >
        {shouldShowControlBar ? (
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

        {viewMode === 'single' && !activeFinalJeopardy ? (
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
          <div className="space-y-4">
            <div
              className={
                shouldShowHostSidebar
                  ? 'grid gap-4 xl:grid-cols-[minmax(0,1fr)_430px] 2xl:grid-cols-[minmax(0,1.08fr)_450px]'
                  : ''
              }
            >
              <div className="space-y-4">
                {hostVisiblePanels.gameplay ? (
                  <HostGameplayBar
                    clueEntry={activeClue}
                    isRevealed={gameState.isQuestionRevealed}
                    activeMediaIndex={gameState.activeClueMediaIndex}
                    teams={gameState.teams}
                    activeTeamId={activeTeamId}
                    isFinalJeopardyReady={isFinalJeopardyReady}
                    finalJeopardyEligibleTeamCount={eligibleFinalJeopardyTeams.length}
                    subtractOnIncorrect={config.settings.subtractOnIncorrect}
                    onSelectTeam={handleSelectTeam}
                    onStartFinalJeopardy={handleStartFinalJeopardy}
                    onReveal={handleReveal}
                    onMarkCorrect={() => handleMarkClue(true)}
                    onMarkIncorrect={() => handleMarkClue(false)}
                    onCloseClue={handleCloseClue}
                    onRestoreClue={handleRestoreClue}
                    onOpenMedia={handleOpenClueMedia}
                    onCloseMedia={handleCloseClueMedia}
                    showCluePreview={hostVisiblePanels.clue}
                    onHideCluePreview={() => toggleHostVisiblePanel('clue')}
                    onHide={() => toggleHostVisiblePanel('gameplay')}
                  />
                ) : null}

                {hostVisiblePanels.board ? (
                  <section className="panel relative p-3 sm:p-4">
                    <div className="absolute right-4 top-4 z-10">
                      <PanelWindowButton
                        label="Hide host board"
                        onClick={() => toggleHostVisiblePanel('board')}
                      />
                    </div>

                    <div className="mb-3 flex items-center justify-between gap-3 px-1">
                      <div>
                        <p className="panel-heading">Host Board</p>
                      </div>
                    </div>

                    <div className="min-h-[340px]" style={{ height: 'min(58vh, 620px)' }}>
                      <GameBoard
                        key={`host-board-${boardEntranceCycle}`}
                        categories={config.categories}
                        answeredClueIds={gameState.answeredClueIds}
                        selectedClueId={gameState.selectedClueId}
                        isInteractive
                        compact
                        showDailyDoubleHint
                        showMediaHint
                        onSelectClue={handleSelectClue}
                      />
                    </div>
                  </section>
                ) : null}

                {!hostVisiblePanels.gameplay && !hostVisiblePanels.board && !shouldShowHostSidebar ? (
                  <section className="panel-muted px-4 py-12 text-center">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.34em]">
                      Host Panels Hidden
                    </p>
                    <p className="mt-3 text-sm font-normal normal-case tracking-normal text-slate-300">
                      Use the layout controls above to reopen the gameplay deck, host board, clue
                      preview, or setup tools.
                    </p>
                  </section>
                ) : null}
              </div>

              {shouldShowHostSidebar ? (
                <HostConsole
                  bundledGames={bundledGameCatalog.games}
                  selectedBundledGameId={selectedBundledGameId}
                  teams={gameState.teams}
                  activeTeamId={activeTeamId}
                  manualScoreDelta={manualScoreDelta}
                  isLocalStorageEnabled={config.settings.enableLocalStorage}
                  isUsingLocalConfig={isUsingLocalConfig}
                  isConfigSoundEnabled={isConfigSoundEnabled}
                  isSoundOutputEnabled={isSoundOutputEnabled}
                  activeCueIds={displayedActiveCueIds}
                  soundDefinitions={soundDefinitions}
                  activeLoopingCue={displayedActiveLoopingCue}
                  onToggleSoundOutput={setSessionSoundOutputEnabled}
                  onPreviewCue={playSessionCue}
                  onStopCue={stopSessionCue}
                  onStopAllSounds={stopAllSessionAudio}
                  onSelectBundledGame={handleSelectBundledGame}
                  onExportGame={handleExportGame}
                  onImportGame={handleImportGame}
                  onOpenConfigEditor={() => setIsConfigEditorOpen(true)}
                  onResetScores={handleResetScores}
                  onResetGame={handleResetGame}
                  onClearSavedState={handleClearSavedState}
                  onResetLocalConfig={handleResetLocalConfig}
                  onSelectTeam={handleSelectTeam}
                  onManualScoreDeltaChange={(value) => setManualScoreDelta(Math.max(0, value))}
                  onAdjustTeamScore={handleAdjustTeamScore}
                  showSetupSection={hostVisiblePanels.setup}
                  onHideSetupSection={() => toggleHostVisiblePanel('setup')}
                />
              ) : null}
            </div>
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

      {viewMode === 'host' && !activeFinalJeopardy ? (
        <div className="pointer-events-none fixed inset-x-4 bottom-4 z-30 sm:inset-x-6 lg:inset-x-8">
          <div className="mx-auto max-w-[1800px]">
            <div className="pointer-events-auto">
              <HostLayoutControls
                compact
                visiblePanels={hostVisiblePanels}
                onTogglePanel={toggleHostVisiblePanel}
                onOpenBoardWindow={() => openWindowForView('board')}
                onOpenHostWindow={() => openWindowForView('host')}
                onOpenSingleWindow={() => openWindowForView('single')}
              />
            </div>
          </div>
        </div>
      ) : null}

      {viewMode !== 'host' ? (
        <GameNotificationBanner
          notification={gameState.notification}
          offsetClassName={notificationOffsetClass}
        />
      ) : null}

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
          activeCueIds={displayedActiveCueIds}
          soundDefinitions={soundDefinitions}
          activeLoopingCue={displayedActiveLoopingCue}
          onClose={() => setIsHostPanelOpen(false)}
          onSelectTeam={handleSelectTeam}
          onManualScoreDeltaChange={(value) => setManualScoreDelta(Math.max(0, value))}
          onAdjustTeamScore={handleAdjustTeamScore}
          onToggleSoundOutput={setSessionSoundOutputEnabled}
          onPreviewCue={playSessionCue}
          onStopCue={stopSessionCue}
          onStopAllSounds={stopAllSessionAudio}
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
