import type { ClueConfig } from '../types/game-config';
import { formatCurrencyValue } from '../lib/score-utils';

interface ClueTileProps {
  clue?: ClueConfig;
  isAnswered: boolean;
  isActive: boolean;
  isInteractive: boolean;
  compact: boolean;
  onSelect: (clueId: string) => void;
}

export function ClueTile({
  clue,
  isAnswered,
  isActive,
  isInteractive,
  compact,
  onSelect,
}: ClueTileProps) {
  if (!clue) {
    return (
      <div
        className={`board-empty border ${compact ? 'h-full min-h-0 rounded-[1.2rem]' : 'min-h-32 rounded-[1.75rem]'}`}
      />
    );
  }

  const tileClassName = [
    'border text-center transition duration-150',
    'focus:outline-none focus:ring-4 focus:ring-[rgba(255,223,133,0.25)]',
    'board-tile',
    compact ? 'h-full min-h-0 rounded-[1.2rem] px-2 py-2' : 'min-h-32 rounded-[1.75rem] px-3 py-4',
    isAnswered ? 'board-tile--used' : '',
    isActive ? 'board-tile--active' : '',
    isInteractive && !isAnswered ? 'hover:-translate-y-0.5' : 'cursor-default',
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      <span
        className={`board-tile-value block font-black tracking-tight ${compact ? 'text-[clamp(1.25rem,2.55vw,2.8rem)]' : 'text-4xl sm:text-5xl'}`}
      >
        {isAnswered ? 'USED' : formatCurrencyValue(clue.value)}
      </span>
      {clue.dailyDouble && !isAnswered ? (
        <span
          className={`board-tile-label mt-2 block font-semibold uppercase tracking-[0.34em] ${compact ? 'text-[9px]' : 'text-[11px]'}`}
        >
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
