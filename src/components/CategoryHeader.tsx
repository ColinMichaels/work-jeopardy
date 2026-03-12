interface CategoryHeaderProps {
  title: string;
}

export function CategoryHeader({ title }: CategoryHeaderProps) {
  return (
    <div className="board-category flex min-h-28 items-center justify-center rounded-[1.75rem] border px-3 py-4 text-center">
      <h2 className="board-category-title text-lg font-black uppercase tracking-[0.22em] sm:text-[1.35rem]">
        {title}
      </h2>
    </div>
  );
}
