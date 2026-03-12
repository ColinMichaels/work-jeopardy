import type { GameState, PersistedGameState } from '../models/game';
import type { TeamState } from '../models/team';
import type { GameConfig } from '../types/game-config';
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

export function createInitialGameState(config: GameConfig): GameState {
  return {
    teams: buildInitialTeams(config),
    answeredClueIds: {},
    selectedClueId: null,
    isQuestionRevealed: false,
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

  return {
    ...initialState,
    teams: config.teams.map((team) => {
      const storedTeam = storedTeams.get(team.id);

      return {
        id: team.id,
        name: storedTeam?.name ?? team.name,
        score: Number.isFinite(storedTeam?.score) ? storedTeam!.score : 0,
      };
    }),
    answeredClueIds,
  };
}

export function selectClue(state: GameState, clueId: string): GameState {
  if (state.answeredClueIds[clueId]) {
    return state;
  }

  return {
    ...state,
    selectedClueId: clueId,
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
    isQuestionRevealed: false,
  };
}

export function revealQuestion(state: GameState): GameState {
  if (!state.selectedClueId) {
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

  return {
    teams: config.teams.map((team) => ({
      id: team.id,
      name: team.name,
      score: previousScores.get(team.id) ?? 0,
    })),
    answeredClueIds,
    selectedClueId: null,
    isQuestionRevealed: false,
  };
}

export function toPersistedGameState(state: GameState): PersistedGameState {
  return {
    teams: state.teams,
    answeredClueIds: Object.keys(state.answeredClueIds),
  };
}
