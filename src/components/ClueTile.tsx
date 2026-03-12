import type { CSSProperties } from 'react';
import type { ClueConfig } from '../types/game-config';
import { formatCurrencyValue } from '../lib/score-utils';

interface ClueTileProps {
  clue?: ClueConfig;
  isAnswered: boolean;
  isActive: boolean;
  isInteractive: boolean;
  compact: boolean;
  showDailyDoubleHint: boolean;
  entranceDelayMs?: number;
  onSelect: (clueId: string) => void;
}

export function ClueTile({
  clue,
  isAnswered,
  isActive,
  isInteractive,
  compact,
  showDailyDoubleHint,
  entranceDelayMs = 0,
  onSelect,
}: ClueTileProps) {
  const entranceStyle = {
    '--board-entrance-delay': `${entranceDelayMs}ms`,
  } as CSSProperties;

  if (!clue) {
    return (
      <div
        className={`board-empty board-entrance-card border ${compact ? 'h-full min-h-0 ' : 'min-h-32 '}`}
        style={entranceStyle}
      />
    );
  }

  const tileClassName = [
    'board-entrance-card flex flex-col items-center justify-center border text-center transition duration-150',
    'focus:outline-none focus:ring-4 focus:ring-[rgba(255,223,133,0.25)]',
    'board-tile',
    compact ? 'h-full min-h-0  px-1 py-1' : 'min-h-32  px-2 py-3',
    isAnswered ? 'board-tile--used' : '',
    isActive ? 'board-tile--active' : '',
    isInteractive && !isAnswered ? 'hover:-translate-y-0.5' : 'cursor-default',
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {!isAnswered ? (
        <span
          className={`board-tile-value block font-black tracking-tight ${compact ? 'text-[clamp(1.25rem,2.55vw,2.8rem)]' : 'text-4xl sm:text-5xl'}`}
        >
          {formatCurrencyValue(clue.value)}
        </span>
      ) : null}
      {showDailyDoubleHint && clue.dailyDouble && !isAnswered ? (
        <span
          className={`board-tile-label mt-2 block font-semibold uppercase tracking-[0.34em] ${compact ? 'text-[9px]' : 'text-[11px]'}`}
        >
          Daily Double
        </span>
      ) : null}
    </>
  );

  if (!isInteractive || isAnswered) {
    return (
      <div className={tileClassName} style={entranceStyle}>
        {content}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(clue.id)}
      className={tileClassName}
      style={entranceStyle}
    >
      {content}
    </button>
  );
}
