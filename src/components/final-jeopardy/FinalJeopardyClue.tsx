import { useEffect, useState } from 'react';

interface FinalJeopardyClueProps {
  category: string;
  clue: string;
  correctResponse: string;
  timerSeconds?: number;
  phaseStartedAt: number | null;
  isHostView: boolean;
  onContinue?: () => void;
}

function getRemainingSeconds(timerSeconds: number, phaseStartedAt: number | null): number {
  if (!phaseStartedAt) {
    return timerSeconds;
  }

  const elapsedSeconds = Math.floor((Date.now() - phaseStartedAt) / 1000);
  return Math.max(timerSeconds - elapsedSeconds, 0);
}

export function FinalJeopardyClue({
  category,
  clue,
  correctResponse,
  timerSeconds,
  phaseStartedAt,
  isHostView,
  onContinue,
}: FinalJeopardyClueProps) {
  const [remainingSeconds, setRemainingSeconds] = useState(
    timerSeconds ? getRemainingSeconds(timerSeconds, phaseStartedAt) : 0,
  );

  useEffect(() => {
    if (!timerSeconds) {
      return;
    }

    setRemainingSeconds(getRemainingSeconds(timerSeconds, phaseStartedAt));

    const intervalId = window.setInterval(() => {
      setRemainingSeconds(getRemainingSeconds(timerSeconds, phaseStartedAt));
    }, 500);

    return () => window.clearInterval(intervalId);
  }, [phaseStartedAt, timerSeconds]);

  return (
    <section className="final-stage-panel">
      <p className="brand-overline text-xs font-semibold uppercase tracking-[0.45em]">
        Final Jeopardy
      </p>
      <p className="brand-subtitle mt-3 text-sm uppercase tracking-[0.24em]">{category}</p>
      <h2 className="brand-title mt-5 text-3xl font-black leading-tight sm:text-5xl sm:leading-tight lg:text-6xl">
        {clue}
      </h2>

      {timerSeconds ? (
        <div className="mt-8 flex justify-center">
          <div className="final-countdown">
            <span className="brand-overline text-[11px] font-semibold uppercase tracking-[0.35em]">
              Timer
            </span>
            <span className="score-value mt-2 block text-5xl font-black">{remainingSeconds}</span>
          </div>
        </div>
      ) : null}

      {isHostView ? (
        <div className="panel-inset mt-8 border-amber-300/20 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-100/80">
            Host Preview
          </p>
          <p className="brand-title mt-4 text-2xl font-bold leading-tight text-amber-50 sm:text-3xl">
            {correctResponse}
          </p>
        </div>
      ) : null}

      {isHostView && onContinue ? (
        <div className="mt-8 flex justify-center">
          <button type="button" onClick={onContinue} className="control-button">
            Continue To Responses
          </button>
        </div>
      ) : null}
    </section>
  );
}
