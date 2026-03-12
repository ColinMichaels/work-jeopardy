import type { GameSoundCue } from '../types/game-audio';
import { Tooltip } from './Tooltip';

interface SoundDefinitionSummary {
  cue: GameSoundCue;
  label: string;
  description: string;
  loop?: boolean;
}

interface SoundControlsProps {
  soundDefinitions: readonly SoundDefinitionSummary[];
  isConfigSoundEnabled: boolean;
  isSoundOutputEnabled: boolean;
  activeLoopingCue: GameSoundCue | null;
  onToggleSoundOutput: (enabled: boolean) => void;
  onPreviewCue: (cue: GameSoundCue) => void;
  onStopCue: (cue: GameSoundCue) => void;
  onStopAll: () => void;
}

export function SoundControls({
  soundDefinitions,
  isConfigSoundEnabled,
  isSoundOutputEnabled,
  activeLoopingCue,
  onToggleSoundOutput,
  onPreviewCue,
  onStopCue,
  onStopAll,
}: SoundControlsProps) {
  const canPlaySound = isConfigSoundEnabled && isSoundOutputEnabled;

  return (
    <section className="panel-inset p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="brand-overline text-[11px] font-semibold uppercase tracking-[0.35em]">
          Sound
        </p>
        <span className="status-pill">
          {isConfigSoundEnabled ? (isSoundOutputEnabled ? 'Audio On' : 'Muted') : 'Config Off'}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Tooltip
          content={
            isConfigSoundEnabled
              ? 'Mute or unmute sound playback in this browser window.'
              : 'Sound is disabled in the current game config.'
          }
        >
          <button
            type="button"
            onClick={() => onToggleSoundOutput(!isSoundOutputEnabled)}
            disabled={!isConfigSoundEnabled}
            className="secondary-button disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSoundOutputEnabled ? 'Mute Audio' : 'Unmute Audio'}
          </button>
        </Tooltip>
        <Tooltip content="Stop any looping cue, including the placeholder thinking bed.">
          <button
            type="button"
            onClick={onStopAll}
            disabled={!activeLoopingCue}
            className="secondary-button disabled:cursor-not-allowed disabled:opacity-50"
          >
            Stop Loop
          </button>
        </Tooltip>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {soundDefinitions.map((definition) => {
          const isLooping = definition.loop && activeLoopingCue === definition.cue;

          return (
            <Tooltip key={definition.cue} content={definition.description} className="w-full">
              <button
                type="button"
                onClick={() =>
                  isLooping ? onStopCue(definition.cue) : onPreviewCue(definition.cue)
                }
                disabled={!canPlaySound}
                className={[
                  'w-full disabled:cursor-not-allowed disabled:opacity-50',
                  isLooping ? 'control-button' : 'secondary-button',
                ].join(' ')}
              >
                {isLooping ? `Stop ${definition.label}` : definition.label}
              </button>
            </Tooltip>
          );
        })}
      </div>
    </section>
  );
}
