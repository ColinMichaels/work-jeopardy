import type { CSSProperties } from 'react';

interface CategoryHeaderProps {
  title: string;
  compact?: boolean;
  entranceDelayMs?: number;
}

export function CategoryHeader({
  title,
  compact = false,
  entranceDelayMs = 0,
}: CategoryHeaderProps) {
  const entranceStyle = {
    '--board-entrance-delay': `${entranceDelayMs}ms`,
  } as CSSProperties;

  return (
    <div
      className={`board-category board-entrance-card flex items-center justify-center border text-center ${compact ? 'h-full min-h-0 rounded-[1.2rem] px-2 py-2' : 'min-h-28 rounded-[1.75rem] px-3 py-4'}`}
      style={entranceStyle}
    >
      <h2
        className={`board-category-title max-w-full break-words font-black uppercase ${compact ? 'text-[clamp(1rem,1.55vw,1.4rem)] leading-[1.02] tracking-[0.15em]' : 'text-[clamp(1rem,1.1vw,1.35rem)] leading-[1.04] tracking-[0.14em]'}`}
      >
        {title}
      </h2>
    </div>
  );
}
