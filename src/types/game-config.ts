import type { GameSoundSettings } from './game-audio';

export type GameMediaType = 'image' | 'audio' | 'video';

export interface GameMediaReference {
  type: GameMediaType;
  src: string;
  alt?: string;
}

export interface TeamConfig {
  id: string;
  name: string;
}

export interface ClueConfig {
  id: string;
  value: number;
  answer: string;
  question: string;
  notes?: string;
  dailyDouble?: boolean;
  media?: GameMediaReference[];
}

export interface CategoryConfig {
  id: string;
  title: string;
  clues: ClueConfig[];
}

export interface FinalJeopardyConfig {
  enabled: boolean;
  category: string;
  clue: string;
  correctResponse: string;
  timerSeconds?: number;
  allowNonPositiveScores?: boolean;
}

export interface GameSettings {
  subtractOnIncorrect: boolean;
  enableLocalStorage: boolean;
  storageKey?: string;
  sounds: GameSoundSettings;
}

export interface GameConfig {
  title: string;
  subtitle?: string;
  teams: TeamConfig[];
  categories: CategoryConfig[];
  settings: GameSettings;
  finalJeopardy?: FinalJeopardyConfig;
}

export interface ConfigParseSuccess {
  ok: true;
  value: GameConfig;
}

export interface ConfigParseFailure {
  ok: false;
  errors: string[];
}

export type ConfigParseResult = ConfigParseSuccess | ConfigParseFailure;
