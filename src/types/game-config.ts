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

export interface GameSettings {
  subtractOnIncorrect: boolean;
  enableLocalStorage: boolean;
  storageKey?: string;
}

export interface GameConfig {
  title: string;
  subtitle?: string;
  teams: TeamConfig[];
  categories: CategoryConfig[];
  settings: GameSettings;
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
