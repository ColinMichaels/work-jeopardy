interface ErrorScreenProps {
  errors: string[];
}

export function ErrorScreen({ errors }: ErrorScreenProps) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl rounded-[2rem] border border-rose-300/30 bg-slate-950/80 p-8 shadow-board">
        <p className="text-xs font-semibold uppercase tracking-[0.45em] text-rose-200/80">
          Config Error
        </p>
        <h1 className="mt-3 font-display text-4xl font-black text-slate-50">
          The game JSON could not be loaded.
        </h1>
        <p className="mt-3 text-base text-slate-300">
          Fix the issues in <code className="rounded bg-slate-900 px-2 py-1">src/data/sample-game.json</code> and reload.
        </p>

        <ul className="mt-6 space-y-3">
          {errors.map((error) => (
            <li
              key={error}
              className="rounded-2xl border border-rose-300/20 bg-rose-300/10 px-4 py-3 text-sm text-rose-50"
            >
              {error}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
