import type { FinalJeopardyState } from '../models/game';
import type { TeamState } from '../models/team';
import type { FinalJeopardyConfig, GameConfig } from '../types/game-config';

export interface FinalJeopardyWagerValidationResult {
  ok: boolean;
  value?: number;
  error?: string;
}

export function getFinalJeopardyConfig(
  config: Pick<GameConfig, 'finalJeopardy'>,
): FinalJeopardyConfig | null {
  return config.finalJeopardy?.enabled ? config.finalJeopardy : null;
}

export function getEligibleFinalJeopardyTeams(
  teams: TeamState[],
  finalJeopardyConfig: FinalJeopardyConfig,
): TeamState[] {
  if (finalJeopardyConfig.allowNonPositiveScores) {
    return teams;
  }

  return teams.filter((team) => team.score > 0);
}

export function buildTeamScoreSnapshot(teams: TeamState[]): Record<string, number> {
  return teams.reduce<Record<string, number>>((snapshot, team) => {
    snapshot[team.id] = team.score;
    return snapshot;
  }, {});
}

export function validateFinalJeopardyWager(
  rawValue: string,
  teamScore: number,
): FinalJeopardyWagerValidationResult {
  const trimmedValue = rawValue.trim();

  if (trimmedValue.length === 0) {
    return {
      ok: false,
      error: 'Enter a wager.',
    };
  }

  if (!/^\d+$/.test(trimmedValue)) {
    return {
      ok: false,
      error: 'Use a whole number wager.',
    };
  }

  const wager = Number.parseInt(trimmedValue, 10);
  const maximumWager = Math.max(teamScore, 0);

  if (wager < 0) {
    return {
      ok: false,
      error: 'Wager must be zero or more.',
    };
  }

  if (wager > maximumWager) {
    return {
      ok: false,
      error: `Wager must be ${maximumWager} or less.`,
    };
  }

  return {
    ok: true,
    value: wager,
  };
}

export function applyFinalJeopardyScores(
  teams: TeamState[],
  finalJeopardyState: FinalJeopardyState,
): TeamState[] {
  if (finalJeopardyState.scoresApplied) {
    return teams;
  }

  const eligibleTeamIds = new Set(finalJeopardyState.eligibleTeamIds);

  return teams.map((team) => {
    if (!eligibleTeamIds.has(team.id)) {
      return team;
    }

    const wager = finalJeopardyState.wagers[team.id] ?? 0;
    const isCorrect = finalJeopardyState.judgments[team.id] ?? false;

    return {
      ...team,
      score: team.score + (isCorrect ? wager : -wager),
    };
  });
}

export function getFinalJeopardyWinners(teams: TeamState[]): TeamState[] {
  if (teams.length === 0) {
    return [];
  }

  const topScore = Math.max(...teams.map((team) => team.score));
  return teams.filter((team) => team.score === topScore);
}
