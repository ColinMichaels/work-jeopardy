import type { AnsweredClueMap } from '../models/game';
import type { CategoryConfig } from '../types/game-config';
import { CategoryHeader } from './CategoryHeader';
import { ClueTile } from './ClueTile';

interface GameBoardProps {
  categories: CategoryConfig[];
  answeredClueIds: AnsweredClueMap;
  selectedClueId: string | null;
  isInteractive?: boolean;
  compact?: boolean;
  onSelectClue: (clueId: string) => void;
}

export function GameBoard({
  categories,
  answeredClueIds,
  selectedClueId,
  isInteractive = true,
  compact = false,
  onSelectClue,
}: GameBoardProps) {
  const rowCount = Math.max(...categories.map((category) => category.clues.length));
  const boardGridStyle = compact
    ? {
        gridTemplateColumns: `repeat(${categories.length}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${rowCount + 1}, minmax(0, 1fr))`,
      }
    : {
        gridTemplateColumns: `repeat(${categories.length}, minmax(0, 1fr))`,
      };

  return (
    <section className={`panel board-shell overflow-hidden ${compact ? 'h-full' : ''}`}>
      <div className={`${compact ? 'h-full p-2 sm:p-3' : 'overflow-x-auto p-3 sm:p-4'}`}>
        <div
          className={`grid ${compact ? 'h-full gap-2' : 'min-w-[980px] gap-2 sm:gap-3'}`}
          style={boardGridStyle}
        >
          {categories.map((category) => (
            <CategoryHeader key={category.id} title={category.title} compact={compact} />
          ))}

          {Array.from({ length: rowCount }, (_, rowIndex) =>
            categories.map((category) => {
              const clue = category.clues[rowIndex];

              return (
                <ClueTile
                  key={`${category.id}-${clue?.id ?? `empty-${rowIndex}`}`}
                  clue={clue}
                  isAnswered={clue ? Boolean(answeredClueIds[clue.id]) : false}
                  isActive={clue?.id === selectedClueId}
                  isInteractive={isInteractive}
                  compact={compact}
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
