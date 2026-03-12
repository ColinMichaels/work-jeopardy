import type { ClueConfig, GameConfig } from '../types/game-config';
import type { TeamState } from './team';

export type AnsweredClueMap = Record<string, true>;
export type FinalJeopardyPhase =
  | 'category'
  | 'wager'
  | 'clue'
  | 'responses'
  | 'review'
  | 'results';

export interface FinalJeopardyState {
  phase: FinalJeopardyPhase;
  eligibleTeamIds: string[];
  startingScores: Record<string, number>;
  wagers: Record<string, number>;
  responses: Record<string, string>;
  judgments: Record<string, boolean>;
  scoresApplied: boolean;
  phaseStartedAt: number | null;
}

export interface GameState {
  teams: TeamState[];
  answeredClueIds: AnsweredClueMap;
  selectedClueId: string | null;
  activeClueMediaIndex: number | null;
  isQuestionRevealed: boolean;
  finalJeopardy: FinalJeopardyState | null;
}

export interface PersistedGameState {
  teams: TeamState[];
  answeredClueIds: string[];
  finalJeopardy?: FinalJeopardyState | null;
}

export interface ResolvedClue {
  categoryId: string;
  categoryTitle: string;
  categoryIndex: number;
  clueIndex: number;
  clue: ClueConfig;
}

export interface SharedSessionSnapshot {
  config: GameConfig;
  selectedBundledGameId: string;
  isUsingLocalConfig: boolean;
  gameState: GameState;
  activeTeamId: string | null;
  manualScoreDelta: number;
  isPresenterMode: boolean;
}
