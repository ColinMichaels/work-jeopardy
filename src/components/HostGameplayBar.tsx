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
  const isRevealStep = Boolean(clue) && !isRevealed;
  const isJudgeStep = Boolean(clue) && isRevealed;
  const isMediaReady = hasMedia && activeMediaIndex === null;

  return (
    <section id="host-gameplay-bar" className="panel relative p-4">
      {onHide ? (
        <div className="absolute right-4 top-4 z-10">
          <PanelWindowButton label="Hide gameplay deck" onClick={onHide} />
        </div>
      ) : null}

      <div id="host-gameplay-bar-content" className="flex flex-col gap-3">
        <div id="host-gameplay-header" className="flex flex-wrap items-start justify-between gap-3">
          <div id="host-gameplay-title">
            <h2 className="panel-heading">Gameplay</h2>
          </div>

          <div id="host-gameplay-status" className="flex flex-wrap items-center gap-2">
            {clueEntry && clue ? (
              <>
                    <span className="brand-tag px-2 py-1 text-[10px] tracking-[0.16em]">{clueEntry.categoryTitle}</span>
                    <span className="brand-tag px-2 py-1 text-[10px] tracking-[0.16em]">{formatCurrencyValue(clue.value)}</span>
                    {clue.dailyDouble ? <span className="brand-tag px-2 py-1 text-[10px] tracking-[0.16em]">Daily Double</span> : null}
                    {hasMedia ? (
                      <span className={`brand-tag px-2 py-1 text-[10px] tracking-[0.16em] ${isMediaReady ? 'border-sky-300/40 bg-sky-300/12 text-sky-50' : ''}`}>
                        {clue.media?.length && clue.media.length > 1 ? `Media ${clue.media.length}` : 'Media'}
                      </span>
                    ) : null}
                    {isRevealed ? <span className="brand-tag px-2 py-1 text-[10px] tracking-[0.16em]">Revealed</span> : null}
                  </>
                ) : isFinalJeopardyReady ? (
                  <span className="brand-tag px-2 py-1 text-[10px] tracking-[0.16em] border-amber-300/40 bg-amber-300/12">
                    Final Ready{finalJeopardyEligibleTeamCount > 0 ? ` ${finalJeopardyEligibleTeamCount}` : ''}
                  </span>
                ) : (
                  <span className="brand-tag px-2 py-1 text-[10px] tracking-[0.16em]">Waiting For Clue</span>
                )}
              </div>
            </div>

        <ScoreBoard
          scoreboardId="host-gameplay-score-board"
          teams={teams}
          activeTeamId={activeTeamId}
          isInteractive
          compact
          onSelectTeam={onSelectTeam}
        />

        <div
          id="host-gameplay-detail-grid"
          className={showCluePreview ? 'grid gap-3 xl:grid-cols-[minmax(0,1fr)_320px]' : ''}
        >
          <section id="host-gameplay-clue-actions" className="panel-inset p-3">
            <div id="host-gameplay-clue-actions-header" className="flex items-center justify-between gap-3">
              <div>
                <p className="panel-heading">Clue Actions</p>
              </div>
              {activeTeam ? <span className="brand-tag px-2 py-1 text-[10px] tracking-[0.16em]">{activeTeam.name}</span> : null}
            </div>

            {clueEntry && clue ? (
              <>
                <div
                  id="host-gameplay-next-step"
                  className={[
                    'mt-3 rounded-[1.2rem] border px-3 py-2.5',
                    isRevealStep
                      ? 'border-sky-300/35 bg-sky-300/12 shadow-[0_0_0_1px_rgba(125,211,252,0.1)]'
                      : 'border-amber-300/35 bg-amber-300/12 shadow-[0_0_0_1px_rgba(252,211,77,0.08)]',
                  ].join(' ')}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-200">
                        {isRevealed ? 'Scoring Window' : 'Next Step'}
                      </p>
                      <div className="h-3 w-px bg-white/10" />
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                        {isRevealed ? 'Choose Result' : 'Reveal Response'}
                      </p>
                    </div>
                    <span className={`brand-tag px-2 py-1 text-[10px] tracking-[0.16em] ${isRevealStep ? 'border-sky-300/40 bg-sky-300/12 text-sky-50' : 'border-amber-300/40 bg-amber-300/12 text-amber-50'}`}>
                      {isRevealed ? 'Judging' : 'Private'}
                    </span>
                  </div>
                </div>

                <div id="host-gameplay-primary-actions" className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                  {!isRevealed ? (
                    <Tooltip
                      content="Reveal the correct response to every linked window."
                      className="w-full"
                    >
                      <button
                        type="button"
                        onClick={onReveal}
                        className="control-button w-full px-4 py-2.5 text-[11px] tracking-[0.18em] shadow-[0_0_0_1px_rgba(255,224,138,0.18),0_0_28px_rgba(246,193,74,0.14)] md:col-span-2 xl:col-span-3"
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
                      className="secondary-button w-full px-4 py-2.5 text-[11px] tracking-[0.16em]"
                    >
                      Close Clue
                    </button>
                  </Tooltip>

                  <Tooltip content="Return this clue to the board as unused." className="w-full">
                    <button
                      type="button"
                      onClick={onRestoreClue}
                      className="secondary-button w-full px-4 py-2.5 text-[11px] tracking-[0.16em]"
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
                        className={[
                          activeMediaIndex === null ? 'secondary-button border-sky-300/35 bg-sky-300/10 text-sky-50' : 'secondary-button',
                          'w-full px-4 py-2.5 text-[11px] tracking-[0.16em]',
                        ].join(' ')}
                      >
                        {activeMediaIndex === null ? 'Open Media' : 'Close Media'}
                      </button>
                    </Tooltip>
                  ) : null}
                </div>

                <div
                  id="host-gameplay-judge-actions"
                  className={[
                    'mt-3 rounded-[1.25rem] border px-3 py-3',
                    isJudgeStep
                      ? 'border-emerald-300/35 bg-[rgba(10,64,46,0.26)] shadow-[0_0_0_1px_rgba(110,231,183,0.08)]'
                      : 'border-white/10 bg-[rgba(2,8,33,0.62)]',
                  ].join(' ')}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <p className="panel-heading">Judge Response</p>
                      <div className="h-3 w-px bg-white/10" />
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                        {isRevealed ? 'Mark Result' : 'Pick Team First'}
                      </p>
                    </div>
                    <span className={`brand-tag px-2 py-1 text-[10px] tracking-[0.16em] ${isJudgeStep ? 'border-emerald-300/40 bg-emerald-300/12 text-emerald-50' : ''}`}>
                      {activeTeam ? activeTeam.name : 'Select Team'}
                    </span>
                  </div>

                  <div className="mt-3 grid gap-2 md:grid-cols-2">
                    <Tooltip
                      content="Award this clue to the active team and close it."
                      className="w-full"
                    >
                      <button
                        type="button"
                        onClick={onMarkCorrect}
                        disabled={!activeTeamId}
                        className={[
                          'success-button w-full px-4 py-2.5 text-[11px] tracking-[0.16em] disabled:cursor-not-allowed disabled:opacity-50',
                          isJudgeStep && activeTeamId ? 'shadow-[0_0_0_1px_rgba(110,231,183,0.18),0_0_24px_rgba(16,185,129,0.12)]' : '',
                        ].join(' ')}
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
                        className={[
                          'danger-button w-full px-4 py-2.5 text-[11px] tracking-[0.16em] disabled:cursor-not-allowed disabled:opacity-50',
                          isJudgeStep && activeTeamId ? 'shadow-[0_0_0_1px_rgba(248,113,113,0.14),0_0_24px_rgba(239,68,68,0.12)]' : '',
                        ].join(' ')}
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
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-[1.15rem] border border-amber-300/30 bg-amber-300/10 px-3 py-3">
                <p className="text-xs text-slate-100">
                  {finalJeopardyEligibleTeamCount > 0
                    ? `${finalJeopardyEligibleTeamCount} teams are eligible for Final Jeopardy.`
                    : 'No teams are currently eligible for Final Jeopardy.'}
                </p>
                <button
                  type="button"
                  onClick={onStartFinalJeopardy}
                  disabled={finalJeopardyEligibleTeamCount === 0}
                  className="control-button px-4 py-2 text-[11px] tracking-[0.16em] disabled:cursor-not-allowed disabled:opacity-50"
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
