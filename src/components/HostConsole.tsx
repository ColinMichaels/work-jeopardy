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
  isFinalJeopardyReady?: boolean;
  finalJeopardyEligibleTeamCount?: number;
  subtractOnIncorrect: boolean;
  isLocalStorageEnabled: boolean;
  isUsingLocalConfig: boolean;
  isConfigSoundEnabled: boolean;
  isSoundOutputEnabled: boolean;
  activeCueIds: GameSoundCue[];
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
  onStartFinalJeopardy?: () => void;
  onReveal: () => void;
  onMarkCorrect: () => void;
  onMarkIncorrect: () => void;
  onCloseClue: () => void;
  onRestoreClue: () => void;
}

export function HostConsole({
  clueEntry,
  isRevealed,
  teams,
  activeTeamId,
  manualScoreDelta,
  isFinalJeopardyReady = false,
  finalJeopardyEligibleTeamCount = 0,
  subtractOnIncorrect,
  isLocalStorageEnabled,
  isUsingLocalConfig,
  isConfigSoundEnabled,
  isSoundOutputEnabled,
  activeCueIds,
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
  onStartFinalJeopardy,
  onReveal,
  onMarkCorrect,
  onMarkIncorrect,
  onCloseClue,
  onRestoreClue,
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
          <div className="flex items-center gap-2">
            {clue?.dailyDouble ? <span className="brand-tag">Daily Double</span> : null}
            {clue ? <span className="brand-tag">{formatCurrencyValue(clue.value)}</span> : null}
          </div>
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
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-amber-100/80">
                    Host Preview
                  </p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.26em] text-slate-400">
                    {isRevealed ? 'Live On Board' : 'Private Until Reveal'}
                  </p>
                </div>
                {isRevealed ? (
                  <span className="brand-tag">Live</span>
                ) : (
                  <Tooltip content="Reveal the correct response on every linked window in this session.">
                    <button type="button" onClick={onReveal} className="control-button">
                      Reveal To Board
                    </button>
                  </Tooltip>
                )}
              </div>

              <p className="mt-3 text-xl font-bold leading-snug text-amber-50">
                {currentClue?.question}
              </p>
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
                  className="secondary-button w-full"
                >
                  Close Clue
                </button>
              </Tooltip>
              <Tooltip content="Return the current clue tile to the board as unused and close it everywhere.">
                <button
                  type="button"
                  onClick={onRestoreClue}
                  className="secondary-button w-full"
                >
                  Return Tile
                </button>
              </Tooltip>
            </div>
          </div>
        ) : isFinalJeopardyReady && onStartFinalJeopardy ? (
          <div className="panel-inset mt-5 space-y-4 border-amber-300/30 bg-amber-300/10 p-5">
            <div className="text-center">
              <p className="brand-overline text-[11px] font-semibold uppercase tracking-[0.35em]">
                Final Jeopardy Ready
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-100">
                The main board is complete. Start Final Jeopardy from here or from the host
                controls below.
              </p>
            </div>
            <button type="button" onClick={onStartFinalJeopardy} className="control-button w-full">
              Start Final Jeopardy
            </button>
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
            isFinalJeopardyReady={isFinalJeopardyReady}
            finalJeopardyEligibleTeamCount={finalJeopardyEligibleTeamCount}
            isLocalStorageEnabled={isLocalStorageEnabled}
            isUsingLocalConfig={isUsingLocalConfig}
            isConfigSoundEnabled={isConfigSoundEnabled}
            isSoundOutputEnabled={isSoundOutputEnabled}
            activeCueIds={activeCueIds}
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
            onStartFinalJeopardy={onStartFinalJeopardy}
          />
        </div>
      </section>
    </aside>
  );
}
