import type { ClueConfig } from '../types/game-config';
import { formatCurrencyValue } from '../lib/score-utils';

interface ClueTileProps {
  clue?: ClueConfig;
  isAnswered: boolean;
  isActive: boolean;
  onSelect: (clueId: string) => void;
}

export function ClueTile({ clue, isAnswered, isActive, onSelect }: ClueTileProps) {
  if (!clue) {
    return <div className="min-h-32 rounded-[1.75rem] border border-transparent bg-slate-950/25" />;
  }

  const disabled = isAnswered;

  return (
    <button
      type="button"
      onClick={() => onSelect(clue.id)}
      disabled={disabled}
      className={[
        'group min-h-32 rounded-[1.75rem] border px-3 py-4 text-center transition duration-150',
        'focus:outline-none focus:ring-4 focus:ring-amber-300/30',
        disabled
          ? 'border-slate-900 bg-slate-950/75 text-slate-600'
          : 'border-amber-300/20 bg-gradient-to-b from-sky-900 to-sky-950 text-amber-200 shadow-board hover:-translate-y-0.5 hover:border-amber-300/40 hover:from-sky-800 hover:to-sky-950',
        isActive ? 'border-amber-300/80 ring-4 ring-amber-300/20' : 'hover:shadow-[0_18px_40px_rgba(8,47,73,0.55)]',
      ].join(' ')}
    >
      <span className="font-display text-4xl font-black tracking-tight sm:text-5xl">
        {isAnswered ? 'USED' : formatCurrencyValue(clue.value)}
      </span>
      {clue.dailyDouble && !isAnswered ? (
        <span className="mt-2 block text-[11px] font-semibold uppercase tracking-[0.34em] text-amber-100/80">
          Daily Double
        </span>
      ) : null}
    </button>
  );
}
