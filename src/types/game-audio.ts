export const GAME_SOUND_CUES = [
  'thinkMusic',
  'introJeopardy',
  'boardFill',
  'dailyDouble',
  'tripleStumper',
  'endRound',
  'contestantBuzzer',
  'correctAnswer',
] as const;

export type GameSoundCue = (typeof GAME_SOUND_CUES)[number];

export interface GameSoundSettings {
  enabled: boolean;
  volume?: number;
}

export interface GameSoundDefinition {
  cue: GameSoundCue;
  label: string;
  description: string;
  defaultPath: string;
  loop?: boolean;
}
