import { useEffect, useRef, useState } from 'react';
import type { GameSoundCue, GameSoundDefinition, GameSoundSettings } from '../types/game-audio';

interface PlaybackHandle {
  stop: () => void;
}

const DEFAULT_VOLUME = 0.85;
const THINK_LOOP_MS = 1800;

export const GAME_SOUND_DEFINITIONS: readonly GameSoundDefinition[] = [
  {
    cue: 'thinkMusic',
    label: 'Think Music',
    description: 'A looping placeholder bed for clue thinking time.',
    defaultPath: 'sounds/think-music.mp3',
    loop: true,
  },
  {
    cue: 'boardFill',
    label: 'Board Fill',
    description: 'Use this when the round starts or the board resets.',
    defaultPath: 'sounds/board-fill.mp3',
  },
  {
    cue: 'dailyDouble',
    label: 'Daily Double',
    description: 'Plays when a daily double clue is selected.',
    defaultPath: 'sounds/daily-double.mp3',
  },
  {
    cue: 'tripleStumper',
    label: 'Triple Stumper',
    description: 'Use this when the room misses a revealed clue.',
    defaultPath: 'sounds/jeopardy-incorrect-answer.mp3',
  },
  {
    cue: 'endRound',
    label: 'End Round',
    description: 'Use this when the final clue of the board is closed.',
    defaultPath: 'sounds/end-round.mp3',
  },
  {
    cue: 'contestantBuzzer',
    label: 'Contestant Buzzer',
    description: 'Short cue for selecting the active team.',
    defaultPath: 'sounds/jeopardy-ding.mp3',
  },
  {
    cue: 'correctAnswer',
    label: 'Correct Answer',
    description: 'Short cue for a correct answer.',
    defaultPath: 'sounds/correct-answer.mp3',
  },
  {
    cue: 'introJeopardy',
    label: 'Intro Jeopardy',
    description: 'Manual full-length opening sting for the host.',
    defaultPath: 'sounds/intro-jeopardy.mp3',
  },
] as const;

const SOUND_DEFINITION_MAP = new Map(GAME_SOUND_DEFINITIONS.map((definition) => [definition.cue, definition]));

function clampVolume(volume?: number): number {
  if (!Number.isFinite(volume)) {
    return DEFAULT_VOLUME;
  }

  return Math.min(1, Math.max(0, volume ?? DEFAULT_VOLUME));
}

function getAudioContext(
  audioContextRef: React.MutableRefObject<AudioContext | null>,
): AudioContext | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const ExistingAudioContext =
    window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  if (!ExistingAudioContext) {
    return null;
  }

  if (!audioContextRef.current) {
    audioContextRef.current = new ExistingAudioContext();
  }

  return audioContextRef.current;
}

function scheduleTone(
  context: AudioContext,
  frequency: number,
  startTime: number,
  duration: number,
  volume: number,
  type: OscillatorType = 'square',
): PlaybackHandle {
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startTime);
  gainNode.gain.setValueAtTime(0.0001, startTime);
  gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);

  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.03);

  return {
    stop: () => {
      try {
        gainNode.gain.cancelScheduledValues(context.currentTime);
        gainNode.gain.setValueAtTime(0.0001, context.currentTime);
        oscillator.stop();
      } catch {
        // The oscillator may already be finished.
      }
    },
  };
}

function playBoardFillFallback(context: AudioContext, volume: number): PlaybackHandle {
  const startTime = context.currentTime;
  const handles = [660, 820, 980, 1200].map((frequency, index) =>
    scheduleTone(context, frequency, startTime + index * 0.08, 0.11, volume * 0.08),
  );

  return {
    stop: () => handles.forEach((handle) => handle.stop()),
  };
}

function playDailyDoubleFallback(context: AudioContext, volume: number): PlaybackHandle {
  const startTime = context.currentTime;
  const handles = [
    scheduleTone(context, 330, startTime, 0.24, volume * 0.12, 'sawtooth'),
    scheduleTone(context, 554, startTime + 0.18, 0.3, volume * 0.14, 'sawtooth'),
  ];

  return {
    stop: () => handles.forEach((handle) => handle.stop()),
  };
}

function playTripleStumperFallback(context: AudioContext, volume: number): PlaybackHandle {
  const startTime = context.currentTime;
  const handles = [620, 520, 430].map((frequency, index) =>
    scheduleTone(context, frequency, startTime + index * 0.14, 0.18, volume * 0.08, 'triangle'),
  );

  return {
    stop: () => handles.forEach((handle) => handle.stop()),
  };
}

function playEndRoundFallback(context: AudioContext, volume: number): PlaybackHandle {
  return scheduleTone(context, 170, context.currentTime, 0.46, volume * 0.18, 'sawtooth');
}

function playContestantBuzzerFallback(context: AudioContext, volume: number): PlaybackHandle {
  const startTime = context.currentTime;
  const handles = [
    scheduleTone(context, 220, startTime, 0.06, volume * 0.12),
    scheduleTone(context, 176, startTime + 0.03, 0.09, volume * 0.08, 'triangle'),
  ];

  return {
    stop: () => handles.forEach((handle) => handle.stop()),
  };
}

function playCorrectAnswerFallback(context: AudioContext, volume: number): PlaybackHandle {
  const startTime = context.currentTime;
  const handles = [
    scheduleTone(context, 784, startTime, 0.08, volume * 0.11, 'triangle'),
    scheduleTone(context, 988, startTime + 0.08, 0.1, volume * 0.14, 'triangle'),
  ];

  return {
    stop: () => handles.forEach((handle) => handle.stop()),
  };
}

function createThinkMusicFallback(context: AudioContext, volume: number): PlaybackHandle {
  let intervalId: number | null = null;

  const scheduleLoop = () => {
    const startTime = context.currentTime;
    [392, 440, 523, 440].forEach((frequency, index) => {
      scheduleTone(context, frequency, startTime + index * 0.34, 0.26, volume * 0.045, 'triangle');
    });
  };

  scheduleLoop();
  intervalId = window.setInterval(scheduleLoop, THINK_LOOP_MS);

  return {
    stop: () => {
      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }
    },
  };
}

function playFallbackCue(
  cue: GameSoundCue,
  context: AudioContext,
  volume: number,
): PlaybackHandle {
  switch (cue) {
    case 'thinkMusic':
      return createThinkMusicFallback(context, volume);
    case 'boardFill':
      return playBoardFillFallback(context, volume);
    case 'dailyDouble':
      return playDailyDoubleFallback(context, volume);
    case 'tripleStumper':
      return playTripleStumperFallback(context, volume);
    case 'endRound':
      return playEndRoundFallback(context, volume);
    case 'contestantBuzzer':
      return playContestantBuzzerFallback(context, volume);
    case 'correctAnswer':
      return playCorrectAnswerFallback(context, volume);
  }

  return playBoardFillFallback(context, volume);
}

function createAudioHandle(audio: HTMLAudioElement, onFinish: () => void): PlaybackHandle {
  let isDisposed = false;
  const handleEnded = () => {
    if (isDisposed) {
      return;
    }

    isDisposed = true;
    audio.removeEventListener('ended', handleEnded);
    onFinish();
  };

  const dispose = () => {
    if (isDisposed) {
      return;
    }

    isDisposed = true;
    audio.removeEventListener('ended', handleEnded);
    audio.pause();
    audio.currentTime = 0;
    onFinish();
  };

  audio.addEventListener('ended', handleEnded);

  return {
    stop: dispose,
  };
}

function getFallbackCueDurationMs(cue: GameSoundCue): number | null {
  switch (cue) {
    case 'boardFill':
      return 500;
    case 'dailyDouble':
      return 650;
    case 'tripleStumper':
      return 700;
    case 'endRound':
      return 500;
    case 'contestantBuzzer':
      return 200;
    case 'correctAnswer':
      return 250;
    case 'introJeopardy':
      return 1200;
    case 'thinkMusic':
      return null;
  }
}

function playAssetCue(
  src: string,
  volume: number,
  loop: boolean,
  onFinish: () => void,
): Promise<PlaybackHandle | null> {
  if (typeof Audio === 'undefined') {
    return Promise.resolve(null);
  }

  const audio = new Audio(src);
  audio.preload = 'auto';
  audio.volume = volume;
  audio.loop = loop;

  return new Promise((resolve) => {
    let didSettle = false;

    const finish = (handle: PlaybackHandle | null) => {
      if (didSettle) {
        return;
      }

      didSettle = true;
      resolve(handle);
    };

    audio.addEventListener(
      'error',
      () => {
        finish(null);
      },
      { once: true },
    );

    audio
      .play()
      .then(() => {
        finish(createAudioHandle(audio, onFinish));
      })
      .catch(() => {
        finish(null);
      });
  });
}

function resolveSoundAssetPath(cue: GameSoundCue): string {
  return SOUND_DEFINITION_MAP.get(cue)?.defaultPath ?? '';
}

interface UseSoundboardOptions {
  settings: GameSoundSettings;
  isOutputEnabled: boolean;
}

export function useSoundboard({ settings, isOutputEnabled }: UseSoundboardOptions) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeHandlesRef = useRef<Partial<Record<GameSoundCue, PlaybackHandle>>>({});
  const cleanupTimerIdsRef = useRef<Partial<Record<GameSoundCue, number>>>({});
  const [activeLoopingCue, setActiveLoopingCue] = useState<GameSoundCue | null>(null);
  const [activeCueIds, setActiveCueIds] = useState<GameSoundCue[]>([]);

  const clearCueState = (cue: GameSoundCue) => {
    delete activeHandlesRef.current[cue];

    const cleanupTimerId = cleanupTimerIdsRef.current[cue];

    if (cleanupTimerId !== undefined) {
      window.clearTimeout(cleanupTimerId);
      delete cleanupTimerIdsRef.current[cue];
    }

    setActiveCueIds((currentCues) => currentCues.filter((currentCue) => currentCue !== cue));

    setActiveLoopingCue((currentCue) => (currentCue === cue ? null : currentCue));
  };

  const stopCue = (cue: GameSoundCue) => {
    const handle = activeHandlesRef.current[cue];

    if (!handle) {
      return;
    }

    handle.stop();
    clearCueState(cue);
  };

  const stopAll = () => {
    (Object.keys(activeHandlesRef.current) as GameSoundCue[]).forEach((cue) => {
      stopCue(cue);
    });
  };

  const registerActiveCue = (
    cue: GameSoundCue,
    handle: PlaybackHandle,
    options: { loop: boolean; cleanupAfterMs?: number | null },
  ) => {
    stopCue(cue);
    activeHandlesRef.current[cue] = handle;
    setActiveCueIds((currentCues) =>
      currentCues.includes(cue) ? currentCues : [...currentCues, cue],
    );

    if (options.loop) {
      setActiveLoopingCue(cue);
      return;
    }

    setActiveLoopingCue((currentCue) => (currentCue === cue ? null : currentCue));

    if (options.cleanupAfterMs && options.cleanupAfterMs > 0) {
      cleanupTimerIdsRef.current[cue] = window.setTimeout(() => {
        clearCueState(cue);
      }, options.cleanupAfterMs);
    }
  };

  const playCue = async (cue: GameSoundCue) => {
    const definition = SOUND_DEFINITION_MAP.get(cue);

    if (!definition || !isOutputEnabled) {
      return false;
    }

    if (definition.loop) {
      stopAll();
    }

    const volume = clampVolume(settings.volume);
    const cueSrc = resolveSoundAssetPath(cue);
    let handle = await playAssetCue(cueSrc, volume, Boolean(definition.loop), () => {
      clearCueState(cue);
    });

    if (!handle) {
      const context = getAudioContext(audioContextRef);

      if (!context) {
        return false;
      }

      if (context.state === 'suspended') {
        await context.resume().catch(() => undefined);
      }

      handle = playFallbackCue(cue, context, volume);
      registerActiveCue(cue, handle, {
        loop: Boolean(definition.loop),
        cleanupAfterMs: definition.loop ? null : getFallbackCueDurationMs(cue),
      });
    } else {
      registerActiveCue(cue, handle, {
        loop: Boolean(definition.loop),
        cleanupAfterMs: null,
      });
    }

    return true;
  };

  useEffect(() => {
    if (!isOutputEnabled) {
      stopAll();
    }
  }, [isOutputEnabled]);

  useEffect(
    () => () => {
      stopAll();
      void audioContextRef.current?.close();
    },
    [],
  );

  return {
    activeCueIds,
    activeLoopingCue,
    soundDefinitions: GAME_SOUND_DEFINITIONS,
    playCue,
    stopCue,
    stopAll,
  } as const;
}
