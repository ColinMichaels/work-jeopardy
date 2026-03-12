import type { ResolvedClue } from '../models/game';
import type { TeamState } from '../models/team';
import { formatCurrencyValue } from '../lib/score-utils';
import { HostCluePreview } from './HostCluePreview';
import { PanelWindowButton } from './PanelWindowButton';
import { ScoreBoard } from './ScoreBoard';
import { Tooltip } from './Tooltip';

interface HostGameplayBarProps {
  clueEntry: ResolvedClue | null;
  isRevealed: boolean;
  activeMediaIndex: number | null;
  teams: TeamState[];
  activeTeamId: string | null;
  isFinalJeopardyReady?: boolean;
  finalJeopardyEligibleTeamCount?: number;
  subtractOnIncorrect: boolean;
  onSelectTeam: (teamId: string) => void;
  onStartFinalJeopardy?: () => void;
  onReveal: () => void;
  onMarkCorrect: () => void;
  onMarkIncorrect: () => void;
  onCloseClue: () => void;
  onRestoreClue: () => void;
  onOpenMedia: (index: number) => void;
  onCloseMedia: () => void;
  showCluePreview?: boolean;
  onHideCluePreview?: () => void;
  onHide?: () => void;
}

export function HostGameplayBar({
  clueEntry,
  isRevealed,
  activeMediaIndex,
  teams,
  activeTeamId,
  isFinalJeopardyReady = false,
  finalJeopardyEligibleTeamCount = 0,
  subtractOnIncorrect,
  onSelectTeam,
  onStartFinalJeopardy,
  onReveal,
  onMarkCorrect,
  onMarkIncorrect,
  onCloseClue,
  onRestoreClue,
  onOpenMedia,
  onCloseMedia,
  showCluePreview = true,
  onHideCluePreview,
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

        <div className={showCluePreview ? 'grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]' : ''}>
          <section className="panel-inset p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="panel-heading">Clue Actions</p>
              </div>
              {activeTeam ? <span className="brand-tag">{activeTeam.name}</span> : null}
            </div>

            {clueEntry && clue ? (
              <>
                <div
                  className={[
                    'mt-4 rounded-[1.4rem] border px-4 py-3',
                    isRevealed
                      ? 'border-amber-300/35 bg-amber-300/12'
                      : 'border-sky-300/20 bg-sky-300/10',
                  ].join(' ')}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-200">
                        {isRevealed ? 'Action Required' : 'Ready To Reveal'}
                      </p>
                      <div className="h-3 w-px bg-white/10" />
                      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                        {isRevealed ? 'Score Next' : 'Preview Click Also Reveals'}
                      </p>
                    </div>
                    <span className="brand-tag">{isRevealed ? 'Judging' : 'Private'}</span>
                  </div>
                </div>

                <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                  {!isRevealed ? (
                    <Tooltip
                      content="Reveal the correct response to every linked window."
                      className="w-full"
                    >
                      <button
                        type="button"
                        onClick={onReveal}
                        className="control-button w-full px-5 py-3 md:col-span-2 xl:col-span-3"
                      >
                        Reveal To Players
                      </button>
                    </Tooltip>
                  ) : (
                    <div className="status-pill flex items-center justify-center md:col-span-2 xl:col-span-3">
                      Answer Live On Board
                    </div>
                  )}

                  <Tooltip content="Close this clue without changing scores." className="w-full">
                    <button
                      type="button"
                      onClick={onCloseClue}
                      className="secondary-button w-full px-5 py-3"
                    >
                      Close Clue
                    </button>
                  </Tooltip>

                  <Tooltip content="Return this clue to the board as unused." className="w-full">
                    <button
                      type="button"
                      onClick={onRestoreClue}
                      className="secondary-button w-full px-5 py-3"
                    >
                      Return Tile
                    </button>
                  </Tooltip>

                  {hasMedia ? (
                    <Tooltip content="Open or close the clue media lightbox." className="w-full">
                      <button
                        type="button"
                        onClick={() =>
                          activeMediaIndex === null ? onOpenMedia(0) : onCloseMedia()
                        }
                        className="secondary-button w-full px-5 py-3"
                      >
                        {activeMediaIndex === null ? 'Open Media' : 'Close Media'}
                      </button>
                    </Tooltip>
                  ) : null}
                </div>

                <div
                  className={[
                    'mt-4 rounded-[1.45rem] border px-4 py-3',
                    isRevealed
                      ? 'border-amber-300/35 bg-[rgba(78,49,8,0.22)]'
                      : 'border-white/10 bg-[rgba(2,8,33,0.62)]',
                  ].join(' ')}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <p className="panel-heading">Judge Response</p>
                      <div className="h-3 w-px bg-white/10" />
                      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                        {isRevealed ? 'Mark Result' : 'Pick Active Team'}
                      </p>
                    </div>
                    <span className="brand-tag">
                      {activeTeam ? activeTeam.name : 'Select Team'}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <Tooltip
                      content="Award this clue to the active team and close it."
                      className="w-full"
                    >
                      <button
                        type="button"
                        onClick={onMarkCorrect}
                        disabled={!activeTeamId}
                        className="success-button w-full px-5 py-3 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Mark Correct
                      </button>
                    </Tooltip>

                    <Tooltip
                      content={
                        subtractOnIncorrect
                          ? `Subtract ${formatCurrencyValue(clue.value)} from the active team and close the clue.`
                          : 'Record an incorrect answer without a score penalty.'
                      }
                      className="w-full"
                    >
                      <button
                        type="button"
                        onClick={onMarkIncorrect}
                        disabled={!activeTeamId}
                        className="danger-button w-full px-5 py-3 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Mark Incorrect{' '}
                        {subtractOnIncorrect
                          ? `(${formatCurrencyValue(clue.value)})`
                          : '(no penalty)'}
                      </button>
                    </Tooltip>
                  </div>
                </div>
              </>
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

          {showCluePreview ? (
            <HostCluePreview
              clueEntry={clueEntry}
              isRevealed={isRevealed}
              activeMediaIndex={activeMediaIndex}
              onReveal={onReveal}
              onOpenMedia={onOpenMedia}
              onCloseMedia={onCloseMedia}
              onHide={onHideCluePreview}
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
