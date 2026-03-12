import type { ClueConfig, GameConfig } from '../types/game-config';
import type { TeamState } from './team';

export type AnsweredClueMap = Record<string, true>;

export interface GameState {
  teams: TeamState[];
  answeredClueIds: AnsweredClueMap;
  selectedClueId: string | null;
  isQuestionRevealed: boolean;
}

export interface PersistedGameState {
  teams: TeamState[];
  answeredClueIds: string[];
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
  isUsingLocalConfig: boolean;
  gameState: GameState;
  activeTeamId: string | null;
  manualScoreDelta: number;
  isPresenterMode: boolean;
}
