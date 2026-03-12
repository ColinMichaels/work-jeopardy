interface CategoryHeaderProps {
  title: string;
  compact?: boolean;
}

export function CategoryHeader({ title, compact = false }: CategoryHeaderProps) {
  return (
    <div
      className={`board-category flex items-center justify-center border text-center ${compact ? 'h-full min-h-0 rounded-[1.2rem] px-2 py-2' : 'min-h-28 rounded-[1.75rem] px-3 py-4'}`}
    >
      <h2
        className={`board-category-title font-black uppercase tracking-[0.22em] ${compact ? 'text-[clamp(0.72rem,1.05vw,1rem)] leading-tight' : 'text-lg sm:text-[1.35rem]'}`}
      >
        {title}
      </h2>
    </div>
  );
}
