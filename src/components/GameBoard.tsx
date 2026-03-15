import { useEffect, useMemo, useRef, useState } from 'react';
import { buildDomId } from '../lib/dom-ids';
import type { AnsweredClueMap } from '../models/game';
import type { CategoryConfig } from '../types/game-config';
import { CategoryHeader } from './CategoryHeader';
import { ClueTile } from './ClueTile';

interface GameBoardProps {
  boardId?: string;
  categories: CategoryConfig[];
  answeredClueIds: AnsweredClueMap;
  selectedClueId: string | null;
  isInteractive?: boolean;
  compact?: boolean;
  showDailyDoubleHint?: boolean;
  showMediaHint?: boolean;
  onSelectClue: (clueId: string) => void;
}

export function GameBoard({
  boardId = 'game-board',
  categories,
  answeredClueIds,
  selectedClueId,
  isInteractive = true,
  compact = false,
  showDailyDoubleHint = false,
  showMediaHint = false,
  onSelectClue,
}: GameBoardProps) {
  const rowCount = Math.max(...categories.map((category) => category.clues.length));
  const answeredClueCount = Object.keys(answeredClueIds).length;
  const categoriesSignature = useMemo(
    () =>
      categories
        .map((category) => `${category.id}:${category.clues.map((clue) => clue.id).join(',')}`)
        .join('|'),
    [categories],
  );
  const previousAnsweredClueCountRef = useRef(answeredClueCount);
  const previousCategoriesSignatureRef = useRef(categoriesSignature);
  const [animationCycle, setAnimationCycle] = useState(0);
  const categoryEntranceStepMs = compact ? 90 : 120;
  const tileEntranceBaseMs = compact ? 260 : 320;
  const tileEntranceStepMs = compact ? 46 : 58;
  const boardGridStyle = compact
    ? {
        gridTemplateColumns: `repeat(${categories.length}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${rowCount + 1}, minmax(0, 1fr))`,
      }
    : {
        gridTemplateColumns: `repeat(${categories.length}, minmax(0, 1fr))`,
      };

  useEffect(() => {
    const didResetBoard =
      answeredClueCount === 0 && previousAnsweredClueCountRef.current > 0;
    const didSwapBoardLayout =
      categoriesSignature !== previousCategoriesSignatureRef.current;

    if (didResetBoard || didSwapBoardLayout) {
      setAnimationCycle((currentCycle) => currentCycle + 1);
    }

    previousAnsweredClueCountRef.current = answeredClueCount;
    previousCategoriesSignatureRef.current = categoriesSignature;
  }, [answeredClueCount, categoriesSignature]);

  return (
    <section
      id={boardId}
      className={`panel board-shell scene-stage-enter overflow-hidden ${compact ? 'h-full' : ''}`}
    >
      <div className={`${compact ? 'h-full p-2 sm:p-3' : 'overflow-x-auto p-2 sm:p-4'}`}>
        <div
          id={buildDomId(boardId, 'grid')}
          className={`grid ${compact ? 'h-full gap-2' : 'min-w-[760px] gap-2 sm:min-w-[980px] sm:gap-3'}`}
          style={boardGridStyle}
        >
          {categories.map((category, categoryIndex) => (
            <CategoryHeader
              key={`${category.id}-${animationCycle}`}
              boardId={boardId}
              categoryId={category.id}
              title={category.title}
              compact={compact}
              entranceDelayMs={categoryIndex * categoryEntranceStepMs}
            />
          ))}

          {Array.from({ length: rowCount }, (_, rowIndex) =>
            categories.map((category, categoryIndex) => {
              const clue = category.clues[rowIndex];
              const tileIndex = rowIndex * categories.length + categoryIndex;

              return (
                <ClueTile
                  key={`${category.id}-${clue?.id ?? `empty-${rowIndex}`}-${animationCycle}`}
                  tileId={
                    clue
                      ? buildDomId(boardId, 'tile', clue.id)
                      : buildDomId(boardId, 'empty-tile', category.id, rowIndex + 1)
                  }
                  clue={clue}
                  isAnswered={clue ? Boolean(answeredClueIds[clue.id]) : false}
                  isActive={clue?.id === selectedClueId}
                  isInteractive={isInteractive}
                  compact={compact}
                  showDailyDoubleHint={showDailyDoubleHint}
                  showMediaHint={showMediaHint}
                  entranceDelayMs={tileEntranceBaseMs + tileIndex * tileEntranceStepMs}
                  onSelect={onSelectClue}
                />
              );
            }),
          )}
        </div>
      </div>
    </section>
  );
}
