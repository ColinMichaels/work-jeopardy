import { useLayoutEffect, useMemo, useState, type CSSProperties } from 'react';
import { buildDomId } from '../lib/dom-ids';
import type { ResolvedClue } from '../models/game';
import type { TeamState } from '../models/team';
import { formatCurrencyValue } from '../lib/score-utils';
import { ClueMediaPanel } from './ClueMediaPanel';
import { Tooltip } from './Tooltip';

interface ClueModalProps {
  clueEntry: ResolvedClue | null;
  isRevealed: boolean;
  teams: TeamState[];
  activeTeamId: string | null;
  subtractOnIncorrect: boolean;
  variant?: 'interactive' | 'presentation';
  activeMediaIndex: number | null;
  onSelectTeam: (teamId: string) => void;
  onReveal: () => void;
  onMarkCorrect: () => void;
  onMarkIncorrect: () => void;
  onClose: () => void;
  onRestoreClue: () => void;
  onOpenMedia: (index: number) => void;
  onCloseMedia: () => void;
}

interface ClueStageSourceRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

function getStageOriginStyle(sourceRect: ClueStageSourceRect | null): CSSProperties | undefined {
  if (!sourceRect || typeof window === 'undefined') {
    return undefined;
  }

  const viewportWidth = Math.max(window.innerWidth, 1);
  const viewportHeight = Math.max(window.innerHeight, 1);
  const translateX = sourceRect.left + sourceRect.width / 2 - viewportWidth / 2;
  const translateY = sourceRect.top + sourceRect.height / 2 - viewportHeight / 2;

  return {
    '--clue-stage-origin-x': `${translateX}px`,
    '--clue-stage-origin-y': `${translateY}px`,
    '--clue-stage-origin-scale-x': `${Math.max(sourceRect.width / viewportWidth, 0.06)}`,
    '--clue-stage-origin-scale-y': `${Math.max(sourceRect.height / viewportHeight, 0.05)}`,
  } as CSSProperties;
}

export function ClueModal({
  clueEntry,
  isRevealed,
  teams,
  activeTeamId,
  subtractOnIncorrect,
  variant = 'interactive',
  activeMediaIndex,
  onSelectTeam,
  onReveal,
  onMarkCorrect,
  onMarkIncorrect,
  onClose,
  onRestoreClue,
  onOpenMedia,
  onCloseMedia,
}: ClueModalProps) {
  const [sourceRect, setSourceRect] = useState<ClueStageSourceRect | null>(null);

  useLayoutEffect(() => {
    if (!clueEntry || typeof document === 'undefined') {
      setSourceRect(null);
      return;
    }

    const tileElement = document.querySelector<HTMLElement>(
      `[data-clue-id="${clueEntry.clue.id}"]`,
    );

    if (!tileElement) {
      setSourceRect(null);
      return;
    }

    const nextRect = tileElement.getBoundingClientRect();

    if (nextRect.width <= 0 || nextRect.height <= 0) {
      setSourceRect(null);
      return;
    }

    setSourceRect({
      left: nextRect.left,
      top: nextRect.top,
      width: nextRect.width,
      height: nextRect.height,
    });
  }, [clueEntry]);

  const stageOriginStyle = useMemo(() => getStageOriginStyle(sourceRect), [sourceRect]);

  if (!clueEntry) {
    return null;
  }

  const { clue, categoryTitle } = clueEntry;
  const clueStageId = buildDomId('clue-stage', clue.id);
  const isPresentation = variant === 'presentation';
  const activeTeam = teams.find((team) => team.id === activeTeamId) ?? null;
  const controlButtonClass =
    'secondary-button px-3 py-1.5 text-[10px] tracking-[0.14em]';
  const scoreButtonClass =
    'px-3 py-2 text-[11px] tracking-[0.16em] disabled:cursor-not-allowed disabled:opacity-50';

  return (
    <div
      id={`${clueStageId}-overlay`}
      className="scene-overlay-enter fixed inset-0 z-50 bg-[#0a33c8]"
    >
      <div
        id={clueStageId}
        className={[
          'clue-stage-scene flex h-full min-h-0 flex-col overflow-hidden',
          stageOriginStyle ? 'clue-stage-expand' : 'scene-stage-enter',
        ].join(' ')}
        style={stageOriginStyle}
      >
        <div
          id={`${clueStageId}-layout`}
          className="flex min-h-0 flex-1 flex-col px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8"
        >
          {!isPresentation ? (
            <div
              id={`${clueStageId}-header`}
              className="mb-4 flex shrink-0 flex-col gap-3 lg:mb-6 lg:flex-row lg:items-start lg:justify-between"
            >
              <div id={`${clueStageId}-meta`} className="flex flex-wrap items-center gap-2">
                <span className="clue-stage-chip">{categoryTitle}</span>
                <span className="clue-stage-chip">{formatCurrencyValue(clue.value)}</span>
                {clue.dailyDouble ? (
                  <span className="clue-stage-chip clue-stage-chip--accent">
                    Daily Double
                  </span>
                ) : null}
              </div>

              <div id={`${clueStageId}-controls`} className="flex flex-wrap items-center justify-end gap-2">
                {clue.media?.length ? (
                  <ClueMediaPanel
                    media={clue.media}
                    clueTitle={categoryTitle}
                    activeLightboxIndex={activeMediaIndex}
                    canOpenLightbox
                    displayMode="stage-controls"
                    shouldAutoplay={isRevealed || activeMediaIndex !== null}
                    onOpenLightbox={onOpenMedia}
                    onCloseLightbox={onCloseMedia}
                  />
                ) : null}

                <Tooltip content="Close the current clue and return to the board.">
                  <button type="button" onClick={onClose} className={controlButtonClass}>
                    Close
                  </button>
                </Tooltip>
              </div>
            </div>
          ) : null}

          <div id={`${clueStageId}-body`} className="flex min-h-0 flex-1 flex-col">
            <div
              id={`${clueStageId}-content`}
              className={[
                'flex min-h-0 flex-1 items-center justify-center py-3 sm:py-6 lg:py-8',
                isRevealed ? 'pb-[8vh] sm:pb-[10vh] lg:pb-[12vh]' : '',
              ].join(' ')}
            >
              <div
                id={`${clueStageId}-text-stack`}
                className={[
                  'flex w-full min-h-0 flex-col items-center justify-center',
                  isRevealed ? 'gap-6 sm:gap-8 lg:gap-10' : '',
                ].join(' ')}
                >
                  <p
                    id={`${clueStageId}-clue`}
                    className={[
                      'clue-stage-text w-full text-center font-black transition-[opacity,filter,transform] duration-300 [text-wrap:balance]',
                      isRevealed
                      ? 'mx-auto max-w-[min(97vw,1840px)] text-[clamp(1.7rem,4.8vh,4.35rem)] leading-[1.14] opacity-[0.72]'
                      : 'mx-auto max-w-[min(96vw,1820px)] text-[clamp(2.4rem,8.3vh,7rem)] leading-[1.08]',
                  ].join(' ')}
                >
                  {clue.answer}
                </p>

                {isRevealed ? (
                  <p
                    id={`${clueStageId}-response`}
                    className="clue-stage-response-text mx-auto max-w-[min(97vw,1860px)] text-center text-[clamp(2rem,6vh,5.35rem)] font-bold leading-[1.12] [text-wrap:balance]"
                  >
                    {clue.question}
                  </p>
                ) : null}
              </div>
            </div>

            {!isRevealed && !isPresentation ? (
              <div id={`${clueStageId}-reveal-controls`} className="shrink-0 pt-2 sm:pt-4">
                <div className="mx-auto w-full max-w-[min(96vw,1750px)]">
                  <div className="flex items-center justify-end gap-4">
                    <Tooltip content="Reveal the correct Jeopardy-style response for the room.">
                      <button
                        type="button"
                        onClick={onReveal}
                        className="control-button px-3 py-1.5 text-[10px] tracking-[0.14em]"
                      >
                        Reveal
                      </button>
                    </Tooltip>
                  </div>
                </div>
              </div>
            ) : null}

            {!isPresentation ? (
              <div
                id={`${clueStageId}-footer`}
                className="mt-6 flex shrink-0 flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
              >
                <div id={`${clueStageId}-teams`} className="flex flex-wrap items-center gap-2">
                  {teams.map((team) => {
                    const isActive = team.id === activeTeamId;

                    return (
                      <button
                        key={team.id}
                        type="button"
                        onClick={() => onSelectTeam(team.id)}
                        className={[
                          'clue-stage-team-chip',
                          isActive ? 'clue-stage-team-chip--active' : '',
                        ].join(' ')}
                      >
                        {team.name.trim() || 'Unnamed Team'}
                      </button>
                    );
                  })}
                </div>

                <div id={`${clueStageId}-judge-actions`} className="flex flex-wrap items-center justify-end gap-2">
                  <Tooltip content="Award this clue value to the currently active team.">
                    <button
                      type="button"
                      onClick={onMarkCorrect}
                      disabled={!activeTeamId}
                      className={['control-button', scoreButtonClass].join(' ')}
                    >
                      {activeTeam ? `Correct: ${activeTeam.name}` : 'Mark Correct'}
                    </button>
                  </Tooltip>

                  <Tooltip
                    content={
                      subtractOnIncorrect
                        ? `Subtract ${formatCurrencyValue(clue.value)} from the active team.`
                        : 'Record an incorrect answer without a score penalty.'
                    }
                  >
                    <button
                      type="button"
                      onClick={onMarkIncorrect}
                      disabled={!activeTeamId}
                      className={['secondary-button', scoreButtonClass].join(' ')}
                    >
                      Mark Incorrect{' '}
                      {subtractOnIncorrect ? `(${formatCurrencyValue(clue.value)})` : '(no penalty)'}
                    </button>
                  </Tooltip>

                  <Tooltip content="Return to the board without changing scores.">
                    <button type="button" onClick={onClose} className={controlButtonClass}>
                      Return to Board
                    </button>
                  </Tooltip>

                  <Tooltip content="Put this clue back on the board as unused and close it.">
                    <button
                      type="button"
                      onClick={onRestoreClue}
                      className={controlButtonClass}
                    >
                      Return Tile
                    </button>
                  </Tooltip>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {isPresentation && clue.media?.length ? (
          <ClueMediaPanel
            media={clue.media}
            clueTitle={categoryTitle}
            activeLightboxIndex={activeMediaIndex}
            canOpenLightbox={false}
            displayMode="stage-controls"
            shouldAutoplay={isRevealed || activeMediaIndex !== null}
            onOpenLightbox={onOpenMedia}
            onCloseLightbox={onCloseMedia}
          />
        ) : null}
      </div>
    </div>
  );
}
