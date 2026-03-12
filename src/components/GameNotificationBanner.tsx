import { useEffect, useState } from 'react';
import type { GameNotification } from '../models/game';

interface GameNotificationBannerProps {
  notification: GameNotification | null | undefined;
  offsetClassName?: string;
}

const TONE_CLASS_NAMES: Record<NonNullable<GameNotification['tone']>, string> = {
  info: 'border-sky-300/35 bg-sky-300/14 text-sky-50',
  success: 'border-emerald-300/35 bg-emerald-300/14 text-emerald-50',
  warning: 'border-amber-300/40 bg-amber-300/16 text-amber-50',
  error: 'border-rose-300/35 bg-rose-300/14 text-rose-50',
};

export function GameNotificationBanner({
  notification,
  offsetClassName = 'top-4 sm:top-6',
}: GameNotificationBannerProps) {
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  useEffect(() => {
    if (!notification?.expiresAt) {
      return;
    }

    const remainingMs = notification.expiresAt - Date.now();

    if (remainingMs <= 0) {
      setCurrentTime(Date.now());
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setCurrentTime(Date.now());
    }, remainingMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [notification?.id, notification?.expiresAt]);

  if (!notification) {
    return null;
  }

  if (notification.expiresAt !== null && notification.expiresAt <= currentTime) {
    return null;
  }

  return (
    <div className={`pointer-events-none fixed inset-x-4 ${offsetClassName} z-[70] flex justify-center`}>
      <div
        className={[
          'scene-stage-enter w-full max-w-[min(760px,100%)] rounded-[1.6rem] border px-5 py-4 shadow-board backdrop-blur-md',
          TONE_CLASS_NAMES[notification.tone],
        ].join(' ')}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.34em] opacity-85">
          Game Update
        </p>
        <p className="mt-2 text-lg font-black uppercase tracking-[0.08em]">{notification.title}</p>
        <p className="mt-2 text-sm leading-6 text-white/90">{notification.message}</p>
      </div>
    </div>
  );
}
