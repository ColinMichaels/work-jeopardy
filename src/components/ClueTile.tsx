import type { ClueConfig } from '../types/game-config';
import { formatCurrencyValue } from '../lib/score-utils';

interface ClueTileProps {
  clue?: ClueConfig;
  isAnswered: boolean;
  isActive: boolean;
  isInteractive: boolean;
  onSelect: (clueId: string) => void;
}

export function ClueTile({ clue, isAnswered, isActive, isInteractive, onSelect }: ClueTileProps) {
  if (!clue) {
    return <div className="board-empty min-h-32 rounded-[1.75rem] border" />;
  }

  const tileClassName = [
    'min-h-32 rounded-[1.75rem] border px-3 py-4 text-center transition duration-150',
    'focus:outline-none focus:ring-4 focus:ring-[rgba(255,223,133,0.25)]',
    'board-tile',
    isAnswered ? 'board-tile--used' : '',
    isActive ? 'board-tile--active' : '',
    isInteractive && !isAnswered ? 'hover:-translate-y-0.5' : 'cursor-default',
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      <span className="board-tile-value text-4xl font-black tracking-tight sm:text-5xl">
        {isAnswered ? 'USED' : formatCurrencyValue(clue.value)}
      </span>
      {clue.dailyDouble && !isAnswered ? (
        <span className="board-tile-label mt-2 block text-[11px] font-semibold uppercase tracking-[0.34em]">
          Daily Double
        </span>
      ) : null}
    </>
  );

  if (!isInteractive || isAnswered) {
    return <div className={tileClassName}>{content}</div>;
  }

  return (
    <button type="button" onClick={() => onSelect(clue.id)} className={tileClassName}>
      {content}
    </button>
  );
}
