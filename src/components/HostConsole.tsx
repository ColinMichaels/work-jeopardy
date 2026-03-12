import type { GameSoundCue } from '../types/game-audio';
import type { ResolvedClue } from '../models/game';
import type { TeamState } from '../models/team';
import { formatCurrencyValue } from '../lib/score-utils';
import { HostControlsSections } from './HostControlsSections';
import { Tooltip } from './Tooltip';

interface HostConsoleProps {
  clueEntry: ResolvedClue | null;
  isRevealed: boolean;
  teams: TeamState[];
  activeTeamId: string | null;
  manualScoreDelta: number;
  subtractOnIncorrect: boolean;
  isLocalStorageEnabled: boolean;
  isUsingLocalConfig: boolean;
  isConfigSoundEnabled: boolean;
  isSoundOutputEnabled: boolean;
  soundDefinitions: ReadonlyArray<{
    cue: GameSoundCue;
    label: string;
    description: string;
    loop?: boolean;
  }>;
  activeLoopingCue: GameSoundCue | null;
  onSelectTeam: (teamId: string) => void;
  onManualScoreDeltaChange: (value: number) => void;
  onAdjustTeamScore: (teamId: string, delta: number) => void;
  onToggleSoundOutput: (enabled: boolean) => void;
  onPreviewCue: (cue: GameSoundCue) => void;
  onStopCue: (cue: GameSoundCue) => void;
  onStopAllSounds: () => void;
  onOpenConfigEditor: () => void;
  onResetScores: () => void;
  onResetGame: () => void;
  onClearSavedState: () => void;
  onResetLocalConfig: () => void;
  onReveal: () => void;
  onMarkCorrect: () => void;
  onMarkIncorrect: () => void;
  onCloseClue: () => void;
}

export function HostConsole({
  clueEntry,
  isRevealed,
  teams,
  activeTeamId,
  manualScoreDelta,
  subtractOnIncorrect,
  isLocalStorageEnabled,
  isUsingLocalConfig,
  isConfigSoundEnabled,
  isSoundOutputEnabled,
  soundDefinitions,
  activeLoopingCue,
  onSelectTeam,
  onManualScoreDeltaChange,
  onAdjustTeamScore,
  onToggleSoundOutput,
  onPreviewCue,
  onStopCue,
  onStopAllSounds,
  onOpenConfigEditor,
  onResetScores,
  onResetGame,
  onClearSavedState,
  onResetLocalConfig,
  onReveal,
  onMarkCorrect,
  onMarkIncorrect,
  onCloseClue,
}: HostConsoleProps) {
  const clue = clueEntry?.clue ?? null;
  const currentClue = clueEntry?.clue;

  return (
    <aside className="space-y-4">
      <section className="panel p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="brand-overline text-[11px] font-semibold uppercase tracking-[0.35em]">
              Host Console
            </p>
            <h2 className="brand-title mt-1 text-2xl font-black uppercase tracking-[0.14em]">
              Current Clue
            </h2>
          </div>
          {clue ? <span className="brand-tag">{formatCurrencyValue(clue.value)}</span> : null}
        </div>

        {clueEntry ? (
          <div className="mt-5 space-y-4">
            <div className="panel-inset p-4">
              <p className="brand-overline text-[11px] font-semibold uppercase tracking-[0.3em]">
                {clueEntry.categoryTitle}
              </p>
              <p className="mt-3 text-2xl font-bold leading-snug text-slate-50">
                {currentClue?.answer}
              </p>
            </div>

            {currentClue?.notes ? (
              <div className="panel-inset p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">
                  Host Notes
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-200">{currentClue.notes}</p>
              </div>
            ) : null}

            {currentClue?.media?.length ? (
              <div className="panel-inset p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">
                  Media References
                </p>
                <ul className="mt-2 space-y-2 text-sm text-slate-200">
                  {currentClue.media.map((media) => (
                    <li key={`${media.type}-${media.src}`}>
                      {media.type}: {media.src}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="panel-inset border-amber-300/20 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-amber-100/80">
                  Correct Response
                </p>
                {!isRevealed ? (
                  <Tooltip content="Reveal the correct response on every linked window in this session.">
                    <button type="button" onClick={onReveal} className="control-button">
                      Reveal
                    </button>
                  </Tooltip>
                ) : null}
              </div>

              {isRevealed ? (
                <p className="mt-3 text-xl font-bold leading-snug text-amber-50">
                  {currentClue?.question}
                </p>
              ) : (
                <div className="panel-muted mt-3 px-4 py-5 text-center text-[11px] font-semibold uppercase tracking-[0.32em]">
                  Hidden Until Reveal
                </div>
              )}
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <Tooltip content="Award this clue to the active team and close it on every linked window.">
                <button
                  type="button"
                  onClick={onMarkCorrect}
                  disabled={!activeTeamId}
                  className="control-button w-full disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Mark Correct
                </button>
              </Tooltip>
              <Tooltip
                content={
                  subtractOnIncorrect
                    ? `Subtract ${formatCurrencyValue(currentClue?.value ?? 0)} from the active team and close the clue.`
                    : 'Record an incorrect answer without a score penalty, then close the clue.'
                }
              >
                <button
                  type="button"
                  onClick={onMarkIncorrect}
                  disabled={!activeTeamId}
                  className="secondary-button w-full disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Mark Incorrect
                </button>
              </Tooltip>
              <Tooltip content="Close the active clue on every linked window without scoring it.">
                <button
                  type="button"
                  onClick={onCloseClue}
                  className="secondary-button w-full sm:col-span-2"
                >
                  Close Clue
                </button>
              </Tooltip>
            </div>
          </div>
        ) : (
          <div className="panel-muted mt-5 px-4 py-10 text-center text-[11px] font-semibold uppercase tracking-[0.34em]">
            Select A Clue To Control It Here
          </div>
        )}
      </section>

      <section className="panel p-5">
        <div className="space-y-4">
          <HostControlsSections
            teams={teams}
            activeTeamId={activeTeamId}
            manualScoreDelta={manualScoreDelta}
            isLocalStorageEnabled={isLocalStorageEnabled}
            isUsingLocalConfig={isUsingLocalConfig}
            isConfigSoundEnabled={isConfigSoundEnabled}
            isSoundOutputEnabled={isSoundOutputEnabled}
            soundDefinitions={soundDefinitions}
            activeLoopingCue={activeLoopingCue}
            onSelectTeam={onSelectTeam}
            onManualScoreDeltaChange={onManualScoreDeltaChange}
            onAdjustTeamScore={onAdjustTeamScore}
            onToggleSoundOutput={onToggleSoundOutput}
            onPreviewCue={onPreviewCue}
            onStopCue={onStopCue}
            onStopAllSounds={onStopAllSounds}
            onOpenConfigEditor={onOpenConfigEditor}
            onResetScores={onResetScores}
            onResetGame={onResetGame}
            onClearSavedState={onClearSavedState}
            onResetLocalConfig={onResetLocalConfig}
          />
        </div>
      </section>
    </aside>
  );
}
