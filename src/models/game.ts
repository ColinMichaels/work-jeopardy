import type { ClueConfig } from '../types/game-config';
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
