import type {
  FinalJeopardyPhase,
  FinalJeopardyState,
  GameState,
  PersistedGameState,
} from '../models/game';
import type { TeamState } from '../models/team';
import type { GameConfig } from '../types/game-config';
import {
  applyFinalJeopardyScores,
  buildTeamScoreSnapshot,
  getEligibleFinalJeopardyTeams,
  getFinalJeopardyConfig,
} from './final-jeopardy';
import { getScoreDelta } from './score-utils';

function buildInitialTeams(config: GameConfig): TeamState[] {
  return config.teams.map((team) => ({
    id: team.id,
    name: team.name,
    score: 0,
  }));
}

function buildClueIdSet(config: GameConfig): Set<string> {
  return new Set(config.categories.flatMap((category) => category.clues.map((clue) => clue.id)));
}

function isFinalJeopardyPhase(value: unknown): value is FinalJeopardyPhase {
  return (
    value === 'category' ||
    value === 'wager' ||
    value === 'clue' ||
    value === 'responses' ||
    value === 'review' ||
    value === 'results'
  );
}

function buildPhaseTimestamp(phase: FinalJeopardyPhase): number | null {
  return phase === 'clue' ? Date.now() : null;
}

function filterNumberRecord(
  source: Record<string, number>,
  validKeys: Set<string>,
): Record<string, number> {
  return Object.entries(source).reduce<Record<string, number>>((result, [key, value]) => {
    if (validKeys.has(key) && Number.isFinite(value)) {
      result[key] = value;
    }

    return result;
  }, {});
}

function filterStringRecord(
  source: Record<string, string>,
  validKeys: Set<string>,
): Record<string, string> {
  return Object.entries(source).reduce<Record<string, string>>((result, [key, value]) => {
    if (validKeys.has(key) && typeof value === 'string') {
      result[key] = value;
    }

    return result;
  }, {});
}

function filterBooleanRecord(
  source: Record<string, boolean>,
  validKeys: Set<string>,
): Record<string, boolean> {
  return Object.entries(source).reduce<Record<string, boolean>>((result, [key, value]) => {
    if (validKeys.has(key) && typeof value === 'boolean') {
      result[key] = value;
    }

    return result;
  }, {});
}

function normalizeFinalJeopardyState(
  config: GameConfig,
  teams: TeamState[],
  finalJeopardyState: FinalJeopardyState | null | undefined,
): FinalJeopardyState | null {
  const finalJeopardyConfig = getFinalJeopardyConfig(config);

  if (!finalJeopardyConfig || !finalJeopardyState || !isFinalJeopardyPhase(finalJeopardyState.phase)) {
    return null;
  }

  const validTeamIds = new Set(teams.map((team) => team.id));
  const eligibleTeamIds = finalJeopardyState.eligibleTeamIds.filter((teamId, index, values) => {
    return validTeamIds.has(teamId) && values.indexOf(teamId) === index;
  });
  const eligibleTeamIdSet = new Set(eligibleTeamIds);
  const startingScores = teams.reduce<Record<string, number>>((result, team) => {
    const storedScore = finalJeopardyState.startingScores[team.id];
    result[team.id] = Number.isFinite(storedScore) ? storedScore : team.score;
    return result;
  }, {});

  return {
    phase: finalJeopardyState.phase,
    eligibleTeamIds,
    startingScores,
    wagers: filterNumberRecord(finalJeopardyState.wagers, eligibleTeamIdSet),
    responses: filterStringRecord(finalJeopardyState.responses, eligibleTeamIdSet),
    judgments: filterBooleanRecord(finalJeopardyState.judgments, eligibleTeamIdSet),
    scoresApplied: finalJeopardyState.scoresApplied,
    phaseStartedAt:
      typeof finalJeopardyState.phaseStartedAt === 'number'
        ? finalJeopardyState.phaseStartedAt
        : buildPhaseTimestamp(finalJeopardyState.phase),
  };
}

function updateFinalJeopardyState(
  state: GameState,
  updater: (finalJeopardyState: FinalJeopardyState) => FinalJeopardyState,
): GameState {
  if (!state.finalJeopardy) {
    return state;
  }

  return {
    ...state,
    selectedClueId: null,
    activeClueMediaIndex: null,
    isQuestionRevealed: false,
    finalJeopardy: updater(state.finalJeopardy),
  };
}

export function createInitialGameState(config: GameConfig): GameState {
  return {
    teams: buildInitialTeams(config),
    answeredClueIds: {},
    selectedClueId: null,
    activeClueMediaIndex: null,
    isQuestionRevealed: false,
    notification: null,
    finalJeopardy: null,
  };
}

export function hydrateGameState(
  config: GameConfig,
  persistedState: PersistedGameState | null,
): GameState {
  const initialState = createInitialGameState(config);

  if (!persistedState) {
    return initialState;
  }

  const validTeamIds = new Set(config.teams.map((team) => team.id));
  const validClueIds = buildClueIdSet(config);
  const storedTeams = new Map(
    persistedState.teams
      .filter((team) => validTeamIds.has(team.id))
      .map((team) => [team.id, team] as const),
  );

  const answeredClueIds = persistedState.answeredClueIds.reduce<Record<string, true>>(
    (current, clueId) => {
      if (validClueIds.has(clueId)) {
        current[clueId] = true;
      }

      return current;
    },
    {},
  );

  const teams = config.teams.map((team) => {
    const storedTeam = storedTeams.get(team.id);

    return {
      id: team.id,
      name: storedTeam?.name ?? team.name,
      score: Number.isFinite(storedTeam?.score) ? storedTeam!.score : 0,
    };
  });

  return {
    ...initialState,
    teams,
    answeredClueIds,
    finalJeopardy: normalizeFinalJeopardyState(config, teams, persistedState.finalJeopardy),
  };
}

export function selectClue(state: GameState, clueId: string): GameState {
  if (state.answeredClueIds[clueId] || state.finalJeopardy) {
    return state;
  }

  return {
    ...state,
    selectedClueId: clueId,
    activeClueMediaIndex: null,
    isQuestionRevealed: false,
    answeredClueIds: {
      ...state.answeredClueIds,
      [clueId]: true,
    },
  };
}

export function closeClue(state: GameState): GameState {
  return {
    ...state,
    selectedClueId: null,
    activeClueMediaIndex: null,
    isQuestionRevealed: false,
  };
}

export function restoreSelectedClue(state: GameState): GameState {
  if (!state.selectedClueId) {
    return state;
  }

  const nextAnsweredClueIds = { ...state.answeredClueIds };
  delete nextAnsweredClueIds[state.selectedClueId];

  return {
    ...state,
    answeredClueIds: nextAnsweredClueIds,
    selectedClueId: null,
    activeClueMediaIndex: null,
    isQuestionRevealed: false,
  };
}

export function openClueMedia(state: GameState, mediaIndex: number): GameState {
  if (!state.selectedClueId || state.finalJeopardy || mediaIndex < 0) {
    return state;
  }

  return {
    ...state,
    activeClueMediaIndex: mediaIndex,
  };
}

export function closeClueMedia(state: GameState): GameState {
  if (state.activeClueMediaIndex === null) {
    return state;
  }

  return {
    ...state,
    activeClueMediaIndex: null,
  };
}

export function revealQuestion(state: GameState): GameState {
  if (!state.selectedClueId || state.finalJeopardy) {
    return state;
  }

  return {
    ...state,
    isQuestionRevealed: true,
  };
}

export function applyClueOutcome(
  state: GameState,
  teamId: string,
  clueValue: number,
  isCorrect: boolean,
  subtractOnIncorrect: boolean,
): GameState {
  const delta = getScoreDelta(clueValue, isCorrect, subtractOnIncorrect);

  return {
    ...closeClue(state),
    teams: state.teams.map((team) =>
      team.id === teamId
        ? {
            ...team,
            score: team.score + delta,
          }
        : team,
    ),
  };
}

export function adjustTeamScore(state: GameState, teamId: string, delta: number): GameState {
  if (delta === 0) {
    return state;
  }

  return {
    ...state,
    teams: state.teams.map((team) =>
      team.id === teamId
        ? {
            ...team,
            score: team.score + delta,
          }
        : team,
    ),
  };
}

export function resetScores(state: GameState): GameState {
  return {
    ...state,
    teams: state.teams.map((team) => ({
      ...team,
      score: 0,
    })),
    selectedClueId: null,
    activeClueMediaIndex: null,
    isQuestionRevealed: false,
    notification: null,
    finalJeopardy: null,
  };
}

export function resetGame(config: GameConfig): GameState {
  return createInitialGameState(config);
}

export function reconcileGameStateWithConfig(
  config: GameConfig,
  previousState: GameState,
): GameState {
  const validClueIds = buildClueIdSet(config);
  const previousScores = new Map(previousState.teams.map((team) => [team.id, team.score]));

  const answeredClueIds = Object.keys(previousState.answeredClueIds).reduce<Record<string, true>>(
    (current, clueId) => {
      if (validClueIds.has(clueId)) {
        current[clueId] = true;
      }

      return current;
    },
    {},
  );

  const teams = config.teams.map((team) => ({
    id: team.id,
    name: team.name,
    score: previousScores.get(team.id) ?? 0,
  }));

  return {
    teams,
    answeredClueIds,
    selectedClueId: null,
    activeClueMediaIndex: null,
    isQuestionRevealed: false,
    notification: null,
    finalJeopardy: normalizeFinalJeopardyState(config, teams, previousState.finalJeopardy),
  };
}

export function toPersistedGameState(state: GameState): PersistedGameState {
  return {
    teams: state.teams,
    answeredClueIds: Object.keys(state.answeredClueIds),
    finalJeopardy: state.finalJeopardy
      ? {
          phase: state.finalJeopardy.phase,
          eligibleTeamIds: [...state.finalJeopardy.eligibleTeamIds],
          startingScores: { ...state.finalJeopardy.startingScores },
          wagers: { ...state.finalJeopardy.wagers },
          responses: { ...state.finalJeopardy.responses },
          judgments: { ...state.finalJeopardy.judgments },
          scoresApplied: state.finalJeopardy.scoresApplied,
          phaseStartedAt: state.finalJeopardy.phaseStartedAt,
        }
      : null,
  };
}

export function startFinalJeopardy(state: GameState, config: GameConfig): GameState {
  const finalJeopardyConfig = getFinalJeopardyConfig(config);

  if (!finalJeopardyConfig || state.finalJeopardy) {
    return state;
  }

  const eligibleTeams = getEligibleFinalJeopardyTeams(state.teams, finalJeopardyConfig);

  return {
    ...closeClue(state),
    finalJeopardy: {
      phase: 'category',
      eligibleTeamIds: eligibleTeams.map((team) => team.id),
      startingScores: buildTeamScoreSnapshot(state.teams),
      wagers: {},
      responses: {},
      judgments: {},
      scoresApplied: false,
      phaseStartedAt: null,
    },
  };
}

export function setFinalJeopardyPhase(
  state: GameState,
  phase: FinalJeopardyPhase,
): GameState {
  return updateFinalJeopardyState(state, (finalJeopardyState) => ({
    ...finalJeopardyState,
    phase,
    phaseStartedAt: buildPhaseTimestamp(phase),
  }));
}

export function setFinalJeopardyWager(
  state: GameState,
  teamId: string,
  wager: number | null,
): GameState {
  return updateFinalJeopardyState(state, (finalJeopardyState) => {
    if (!finalJeopardyState.eligibleTeamIds.includes(teamId)) {
      return finalJeopardyState;
    }

    const wagers = { ...finalJeopardyState.wagers };

    if (wager === null) {
      delete wagers[teamId];
    } else {
      wagers[teamId] = wager;
    }

    return {
      ...finalJeopardyState,
      wagers,
    };
  });
}

export function setFinalJeopardyWagers(
  state: GameState,
  wagersByTeamId: Record<string, number>,
): GameState {
  return updateFinalJeopardyState(state, (finalJeopardyState) => {
    const eligibleTeamIds = new Set(finalJeopardyState.eligibleTeamIds);

    return {
      ...finalJeopardyState,
      wagers: filterNumberRecord(wagersByTeamId, eligibleTeamIds),
    };
  });
}

export function setFinalJeopardyResponse(
  state: GameState,
  teamId: string,
  response: string,
): GameState {
  return updateFinalJeopardyState(state, (finalJeopardyState) => {
    if (!finalJeopardyState.eligibleTeamIds.includes(teamId)) {
      return finalJeopardyState;
    }

    return {
      ...finalJeopardyState,
      responses: {
        ...finalJeopardyState.responses,
        [teamId]: response,
      },
    };
  });
}

export function setFinalJeopardyJudgment(
  state: GameState,
  teamId: string,
  isCorrect: boolean,
): GameState {
  return updateFinalJeopardyState(state, (finalJeopardyState) => {
    if (!finalJeopardyState.eligibleTeamIds.includes(teamId)) {
      return finalJeopardyState;
    }

    return {
      ...finalJeopardyState,
      judgments: {
        ...finalJeopardyState.judgments,
        [teamId]: isCorrect,
      },
    };
  });
}

export function applyFinalJeopardyResults(state: GameState): GameState {
  if (!state.finalJeopardy || state.finalJeopardy.scoresApplied) {
    return state;
  }

  return {
    ...state,
    teams: applyFinalJeopardyScores(state.teams, state.finalJeopardy),
    finalJeopardy: {
      ...state.finalJeopardy,
      phase: 'results',
      scoresApplied: true,
      phaseStartedAt: null,
    },
  };
}
