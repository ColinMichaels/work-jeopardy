interface CategoryHeaderProps {
  title: string;
}

export function CategoryHeader({ title }: CategoryHeaderProps) {
  return (
    <div className="flex min-h-28 items-center justify-center rounded-[1.75rem] border border-amber-300/20 bg-slate-900/95 px-3 py-4 text-center shadow-board">
      <h2 className="font-display text-lg font-black uppercase tracking-[0.24em] text-amber-100 sm:text-xl">
        {title}
      </h2>
    </div>
  );
}
