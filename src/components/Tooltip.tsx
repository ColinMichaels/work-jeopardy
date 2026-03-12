import type { ReactNode } from 'react';

interface TooltipProps {
  content: string;
  children: ReactNode;
  className?: string;
}

export function Tooltip({ content, children, className = '' }: TooltipProps) {
  return (
    <span className={`group/tooltip relative inline-flex ${className}`}>
      {children}
      <span
        role="tooltip"
        className="brand-tooltip pointer-events-none absolute bottom-[calc(100%+0.6rem)] left-1/2 z-30 w-max max-w-xs -translate-x-1/2 rounded-xl border px-3 py-2 text-[11px] font-medium leading-snug opacity-0 shadow-board transition duration-150 group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100"
      >
        {content}
      </span>
    </span>
  );
}
