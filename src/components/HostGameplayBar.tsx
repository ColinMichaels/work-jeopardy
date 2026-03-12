import type { ResolvedClue } from '../models/game';
import type { TeamState } from '../models/team';
import { formatCurrencyValue } from '../lib/score-utils';
import { PanelWindowButton } from './PanelWindowButton';
import { ScoreBoard } from './ScoreBoard';
import { Tooltip } from './Tooltip';

interface HostGameplayBarProps {
  clueEntry: ResolvedClue | null;
  isRevealed: boolean;
  activeMediaIndex: number | null;
  teams: TeamState[];
  activeTeamId: string | null;
  manualScoreDelta: number;
  isFinalJeopardyReady?: boolean;
  finalJeopardyEligibleTeamCount?: number;
  subtractOnIncorrect: boolean;
  onSelectTeam: (teamId: string) => void;
  onManualScoreDeltaChange: (value: number) => void;
  onAdjustTeamScore: (teamId: string, delta: number) => void;
  onStartFinalJeopardy?: () => void;
  onReveal: () => void;
  onMarkCorrect: () => void;
  onMarkIncorrect: () => void;
  onCloseClue: () => void;
  onRestoreClue: () => void;
  onOpenMedia: (index: number) => void;
  onCloseMedia: () => void;
  onHide?: () => void;
}

export function HostGameplayBar({
  clueEntry,
  isRevealed,
  activeMediaIndex,
  teams,
  activeTeamId,
  manualScoreDelta,
  isFinalJeopardyReady = false,
  finalJeopardyEligibleTeamCount = 0,
  subtractOnIncorrect,
  onSelectTeam,
  onManualScoreDeltaChange,
  onAdjustTeamScore,
  onStartFinalJeopardy,
  onReveal,
  onMarkCorrect,
  onMarkIncorrect,
  onCloseClue,
  onRestoreClue,
  onOpenMedia,
  onCloseMedia,
  onHide,
}: HostGameplayBarProps) {
  const activeTeam = teams.find((team) => team.id === activeTeamId) ?? null;
  const clue = clueEntry?.clue ?? null;
  const hasMedia = Boolean(clue?.media?.length);

  return (
    <section className="panel relative p-5">
      {onHide ? (
        <div className="absolute right-4 top-4 z-10">
          <PanelWindowButton label="Hide gameplay deck" onClick={onHide} />
        </div>
      ) : null}

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="panel-heading">Gameplay</h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {clueEntry && clue ? (
              <>
                <span className="brand-tag">{clueEntry.categoryTitle}</span>
                <span className="brand-tag">{formatCurrencyValue(clue.value)}</span>
                {clue.dailyDouble ? <span className="brand-tag">Daily Double</span> : null}
                {hasMedia ? (
                  <span className="brand-tag">
                    {clue.media?.length && clue.media.length > 1 ? `Media ${clue.media.length}` : 'Media'}
                  </span>
                ) : null}
                {isRevealed ? <span className="brand-tag">Revealed</span> : null}
              </>
            ) : isFinalJeopardyReady ? (
              <span className="brand-tag">
                Final Ready{finalJeopardyEligibleTeamCount > 0 ? ` ${finalJeopardyEligibleTeamCount}` : ''}
              </span>
            ) : (
              <span className="brand-tag">Waiting For Clue</span>
            )}
          </div>
        </div>

        <ScoreBoard
          teams={teams}
          activeTeamId={activeTeamId}
          isInteractive
          compact
          onSelectTeam={onSelectTeam}
        />

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
          <section className="panel-inset p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="panel-heading">Clue Actions</p>
              </div>
              {activeTeam ? <span className="brand-tag">{activeTeam.name}</span> : null}
            </div>

            {clueEntry && clue ? (
              <div className="mt-4 grid gap-2 md:grid-cols-2 2xl:grid-cols-3">
                {!isRevealed ? (
                  <Tooltip content="Reveal the correct response to every linked window.">
                    <button type="button" onClick={onReveal} className="control-button w-full">
                      Reveal
                    </button>
                  </Tooltip>
                ) : (
                  <div className="status-pill flex items-center justify-center">Live On Board</div>
                )}

                <Tooltip content="Award this clue to the active team and close it.">
                  <button
                    type="button"
                    onClick={onMarkCorrect}
                    disabled={!activeTeamId}
                    className="control-button w-full disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Correct
                  </button>
                </Tooltip>

                <Tooltip
                  content={
                    subtractOnIncorrect
                      ? `Subtract ${formatCurrencyValue(clue.value)} from the active team and close the clue.`
                      : 'Record an incorrect answer without a score penalty.'
                  }
                >
                  <button
                    type="button"
                    onClick={onMarkIncorrect}
                    disabled={!activeTeamId}
                    className="secondary-button w-full disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Incorrect
                  </button>
                </Tooltip>

                <Tooltip content="Close this clue without changing scores.">
                  <button type="button" onClick={onCloseClue} className="secondary-button w-full">
                    Close
                  </button>
                </Tooltip>

                <Tooltip content="Return this clue to the board as unused.">
                  <button
                    type="button"
                    onClick={onRestoreClue}
                    className="secondary-button w-full"
                  >
                    Return Tile
                  </button>
                </Tooltip>

                {hasMedia ? (
                  <Tooltip content="Open or close the clue media lightbox.">
                    <button
                      type="button"
                      onClick={() =>
                        activeMediaIndex === null ? onOpenMedia(0) : onCloseMedia()
                      }
                      className="secondary-button w-full"
                    >
                      {activeMediaIndex === null ? 'Open Media' : 'Close Media'}
                    </button>
                  </Tooltip>
                ) : null}
              </div>
            ) : isFinalJeopardyReady && onStartFinalJeopardy ? (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[1.35rem] border border-amber-300/30 bg-amber-300/10 px-4 py-4">
                <p className="text-sm text-slate-100">
                  {finalJeopardyEligibleTeamCount > 0
                    ? `${finalJeopardyEligibleTeamCount} teams are eligible for Final Jeopardy.`
                    : 'No teams are currently eligible for Final Jeopardy.'}
                </p>
                <button
                  type="button"
                  onClick={onStartFinalJeopardy}
                  disabled={finalJeopardyEligibleTeamCount === 0}
                  className="control-button disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Start Final
                </button>
              </div>
            ) : (
              <div className="panel-muted mt-4 px-4 py-10 text-center text-[11px] font-semibold uppercase tracking-[0.3em]">
                Select A Clue To Unlock Gameplay Controls
              </div>
            )}
          </section>

          <section className="panel-inset p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="panel-heading">Manual Score</p>
              </div>
              <span className="brand-tag">{formatCurrencyValue(manualScoreDelta || 0)}</span>
            </div>

            <div className="mt-4 space-y-3">
              <input
                type="number"
                min="0"
                step="100"
                value={manualScoreDelta}
                onChange={(event) => {
                  const nextValue = Number.parseInt(event.target.value, 10);
                  onManualScoreDeltaChange(Number.isNaN(nextValue) ? 0 : Math.max(0, nextValue));
                }}
                className="field-input text-xl font-semibold"
              />

              <div className="rounded-[1.25rem] border border-white/10 bg-[rgba(2,8,33,0.62)] px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                  Active Team
                </p>
                <p className="mt-2 text-lg font-bold text-slate-50">
                  {activeTeam?.name ?? 'No Team Selected'}
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <Tooltip
                  content={`Add ${formatCurrencyValue(manualScoreDelta || 0)} to the active team.`}
                >
                  <button
                    type="button"
                    onClick={() => activeTeamId && onAdjustTeamScore(activeTeamId, manualScoreDelta)}
                    disabled={!activeTeamId || manualScoreDelta === 0}
                    className="control-button w-full disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Add
                  </button>
                </Tooltip>
                <Tooltip
                  content={`Subtract ${formatCurrencyValue(manualScoreDelta || 0)} from the active team.`}
                >
                  <button
                    type="button"
                    onClick={() => activeTeamId && onAdjustTeamScore(activeTeamId, -manualScoreDelta)}
                    disabled={!activeTeamId || manualScoreDelta === 0}
                    className="secondary-button w-full disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Subtract
                  </button>
                </Tooltip>
              </div>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
