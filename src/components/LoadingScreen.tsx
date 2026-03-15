interface LoadingScreenProps {
  eyebrow?: string;
  title: string;
  message?: string;
}

export function LoadingScreen({
  eyebrow = 'Loading',
  title,
  message,
}: LoadingScreenProps) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl rounded-[2rem] border border-sky-300/20 bg-slate-950/80 p-8 shadow-board">
        <p className="text-xs font-semibold uppercase tracking-[0.45em] text-sky-100/80">
          {eyebrow}
        </p>
        <h1 className="mt-3 font-display text-4xl font-black text-slate-50">{title}</h1>
        {message ? <p className="mt-3 text-base text-slate-300">{message}</p> : null}

        <div className="mt-8 flex items-center gap-4">
          <div className="h-3 w-3 animate-pulse rounded-full bg-amber-300" />
          <div className="h-3 w-3 animate-pulse rounded-full bg-sky-300 [animation-delay:180ms]" />
          <div className="h-3 w-3 animate-pulse rounded-full bg-indigo-300 [animation-delay:360ms]" />
        </div>
      </div>
    </div>
  );
}
