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

  const isFeatured = (notification.variant ?? 'default') === 'featured';

  return (
    <div
      className={[
        'pointer-events-none fixed inset-x-4 z-[70] flex justify-center',
        isFeatured ? 'top-1/2 -translate-y-1/2' : offsetClassName,
      ].join(' ')}
    >
      <div
        className={[
          isFeatured
            ? 'notification-banner-featured w-full max-w-[min(720px,100%)] rounded-[2rem] border px-7 py-7 text-center shadow-board backdrop-blur-md sm:px-10 sm:py-9'
            : 'scene-stage-enter w-full max-w-[min(760px,100%)] rounded-[1.6rem] border px-5 py-4 shadow-board backdrop-blur-md',
          isFeatured ? 'border-amber-200/50 text-amber-50' : TONE_CLASS_NAMES[notification.tone],
        ].join(' ')}
      >
        <p
          className={[
            'font-semibold uppercase opacity-85',
            isFeatured ? 'text-[12px] tracking-[0.42em]' : 'text-[11px] tracking-[0.34em]',
          ].join(' ')}
        >
          {isFeatured ? 'Special Event' : 'Game Update'}
        </p>
        <p
          className={[
            'mt-2 font-black uppercase',
            isFeatured ? 'text-4xl tracking-[0.12em] sm:text-5xl' : 'text-lg tracking-[0.08em]',
          ].join(' ')}
        >
          {notification.title}
        </p>
        <p
          className={[
            'mt-2 text-white/90',
            isFeatured ? 'text-base leading-7 sm:text-lg' : 'text-sm leading-6',
          ].join(' ')}
        >
          {notification.message}
        </p>
      </div>
    </div>
  );
}
