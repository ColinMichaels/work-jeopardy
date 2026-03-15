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
  activeCueIds: GameSoundCue[];
  activeLoopingCue: GameSoundCue | null;
  dense?: boolean;
  onToggleSoundOutput: (enabled: boolean) => void;
  onPreviewCue: (cue: GameSoundCue) => void;
  onStopCue: (cue: GameSoundCue) => void;
  onStopAll: () => void;
}

export function SoundControls({
  soundDefinitions,
  isConfigSoundEnabled,
  isSoundOutputEnabled,
  activeCueIds,
  activeLoopingCue,
  dense = false,
  onToggleSoundOutput,
  onPreviewCue,
  onStopCue,
  onStopAll,
}: SoundControlsProps) {
  const canPlaySound = isConfigSoundEnabled && isSoundOutputEnabled;

  return (
    <section className={`panel-inset ${dense ? 'p-3' : 'p-4'}`}>
      <div className="flex items-center justify-between gap-3">
        <p className={`brand-overline font-semibold uppercase ${dense ? 'text-[10px] tracking-[0.28em]' : 'text-[11px] tracking-[0.35em]'}`}>
          Sound
        </p>
        <span className={`status-pill ${dense ? 'px-3 py-1 text-[10px] tracking-[0.18em]' : ''}`}>
          {isConfigSoundEnabled ? (isSoundOutputEnabled ? 'Audio On' : 'Muted') : 'Config Off'}
        </span>
      </div>

      <div className={`flex flex-wrap gap-2 ${dense ? 'mt-3' : 'mt-4'}`}>
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
            className={[
              'secondary-button disabled:cursor-not-allowed disabled:opacity-50',
              dense ? 'px-3 py-1.5 text-[10px] tracking-[0.14em]' : '',
            ].join(' ')}
          >
            {isSoundOutputEnabled ? 'Mute Audio' : 'Unmute Audio'}
          </button>
        </Tooltip>
        <Tooltip content="Stop any currently playing cue in this browser window.">
          <button
            type="button"
            onClick={onStopAll}
            disabled={activeCueIds.length === 0}
            className={[
              'secondary-button disabled:cursor-not-allowed disabled:opacity-50',
              dense ? 'px-3 py-1.5 text-[10px] tracking-[0.14em]' : '',
            ].join(' ')}
          >
            Stop Audio
          </button>
        </Tooltip>
      </div>

      <div className={`grid gap-2 sm:grid-cols-2 ${dense ? 'mt-3' : 'mt-4'}`}>
        {soundDefinitions.map((definition) => {
          const isActive = activeCueIds.includes(definition.cue);
          const isLooping = definition.loop && activeLoopingCue === definition.cue;

          return (
            <Tooltip key={definition.cue} content={definition.description} className="w-full">
              <button
                type="button"
                onClick={() => (isActive ? onStopCue(definition.cue) : onPreviewCue(definition.cue))}
                disabled={!canPlaySound}
                className={[
                  'w-full disabled:cursor-not-allowed disabled:opacity-50',
                  dense ? 'px-3 py-1.5 text-[10px] tracking-[0.14em]' : '',
                  isActive ? 'control-button' : 'secondary-button',
                ].join(' ')}
              >
                {isActive
                  ? `Stop ${definition.label}${isLooping ? ' Loop' : ''}`
                  : definition.label}
              </button>
            </Tooltip>
          );
        })}
      </div>
    </section>
  );
}
