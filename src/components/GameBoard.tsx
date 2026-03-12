import type { AnsweredClueMap } from '../models/game';
import type { CategoryConfig } from '../types/game-config';
import { CategoryHeader } from './CategoryHeader';
import { ClueTile } from './ClueTile';

interface GameBoardProps {
  categories: CategoryConfig[];
  answeredClueIds: AnsweredClueMap;
  selectedClueId: string | null;
  onSelectClue: (clueId: string) => void;
}

export function GameBoard({
  categories,
  answeredClueIds,
  selectedClueId,
  onSelectClue,
}: GameBoardProps) {
  const rowCount = Math.max(...categories.map((category) => category.clues.length));

  return (
    <section className="panel overflow-hidden">
      <div className="overflow-x-auto p-3 sm:p-4">
        <div
          className="grid min-w-[980px] gap-3"
          style={{ gridTemplateColumns: `repeat(${categories.length}, minmax(0, 1fr))` }}
        >
          {categories.map((category) => (
            <CategoryHeader key={category.id} title={category.title} />
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
