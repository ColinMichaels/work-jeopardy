export const GAME_SOUND_CUES = [
  'thinkMusic',
  'boardFill',
  'dailyDouble',
  'tripleStumper',
  'endRound',
  'contestantBuzzer',
  'correctAnswer',
] as const;

export type GameSoundCue = (typeof GAME_SOUND_CUES)[number];

export type GameSoundCueOverrides = Partial<Record<GameSoundCue, string>>;

export interface GameSoundSettings {
  enabled: boolean;
  volume?: number;
  cues?: GameSoundCueOverrides;
}

export interface GameSoundDefinition {
  cue: GameSoundCue;
  label: string;
  description: string;
  defaultPath: string;
  loop?: boolean;
}
