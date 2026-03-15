import { useEffect, useMemo, useRef } from 'react';
import type { SharedSessionSnapshot } from '../models/game';
import { getSessionStorageKey, touchManagedStorageKey } from './storage';

export type AppViewMode = 'single' | 'board' | 'host';

interface SessionRequestMessage {
  type: 'state-request';
  sessionId: string;
  sourceId: string;
}

interface SessionSnapshotMessage {
  type: 'state-snapshot';
  sessionId: string;
  sourceId: string;
  revision: number;
  storedAt?: number;
  snapshot: SharedSessionSnapshot;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function createWindowId(): string {
  return `window-${Math.random().toString(36).slice(2, 10)}`;
}

function createSessionId(): string {
  return `session-${Math.random().toString(36).slice(2, 10)}`;
}

function getChannelName(sessionId: string): string {
  return `work-jeopardy-live:${sessionId}`;
}

export function getViewModeFromLocation(): AppViewMode {
  if (typeof window === 'undefined') {
    return 'single';
  }

  const params = new URLSearchParams(window.location.search);
  const view = params.get('view');

  if (view === 'board' || view === 'host') {
    return view;
  }

  return 'single';
}

export function ensureSessionIdInUrl(): string {
  if (typeof window === 'undefined') {
    return createSessionId();
  }

  const url = new URL(window.location.href);
  const existingSessionId = url.searchParams.get('session');

  if (existingSessionId) {
    return existingSessionId;
  }

  const sessionId = createSessionId();
  url.searchParams.set('session', sessionId);
  window.history.replaceState({}, '', url.toString());
  return sessionId;
}

export function buildWindowUrl(
  viewMode: AppViewMode,
  sessionId: string,
  currentHref = window.location.href,
): string {
  const url = new URL(currentHref);
  url.searchParams.set('session', sessionId);

  if (viewMode === 'single') {
    url.searchParams.delete('view');
  } else {
    url.searchParams.set('view', viewMode);
  }

  return url.toString();
}

export function buildWindowTargetName(viewMode: AppViewMode, sessionId: string): string {
  return `work-jeopardy:${sessionId}:${viewMode}`;
}

function isSessionRequestMessage(value: unknown): value is SessionRequestMessage {
  return (
    isRecord(value) &&
    value.type === 'state-request' &&
    typeof value.sessionId === 'string' &&
    typeof value.sourceId === 'string'
  );
}

function isSessionSnapshotMessage(value: unknown): value is SessionSnapshotMessage {
  return (
    isRecord(value) &&
    value.type === 'state-snapshot' &&
    typeof value.sessionId === 'string' &&
    typeof value.sourceId === 'string' &&
    typeof value.revision === 'number' &&
    (value.storedAt === undefined || typeof value.storedAt === 'number') &&
    isRecord(value.snapshot)
  );
}

function readStoredSnapshot(sessionId: string): SessionSnapshotMessage | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(getSessionStorageKey(sessionId));

    if (!rawValue) {
      return null;
    }

    const parsedValue: unknown = JSON.parse(rawValue);
    if (!isSessionSnapshotMessage(parsedValue)) {
      return null;
    }

    touchManagedStorageKey(
      getSessionStorageKey(sessionId),
      'session-snapshot',
      parsedValue.storedAt ?? parsedValue.revision,
    );
    return parsedValue;
  } catch {
    return null;
  }
}

function persistSnapshot(sessionId: string, message: SessionSnapshotMessage): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(getSessionStorageKey(sessionId), JSON.stringify(message));
    touchManagedStorageKey(
      getSessionStorageKey(sessionId),
      'session-snapshot',
      message.storedAt ?? message.revision,
    );
  } catch {
    // Ignore storage failures and rely on BroadcastChannel only.
  }
}

function createNextRevision(previousRevision: number): number {
  return Math.max(Date.now(), previousRevision + 1);
}

interface UseSessionSyncOptions {
  sessionId: string;
  snapshot: SharedSessionSnapshot;
  allowStorageFallback: boolean;
  onApplySnapshot: (snapshot: SharedSessionSnapshot) => void;
}

export function useSessionSync({
  sessionId,
  snapshot,
  allowStorageFallback,
  onApplySnapshot,
}: UseSessionSyncOptions) {
  const sourceIdRef = useRef(createWindowId());
  const revisionRef = useRef(0);
  const lastSerializedSnapshotRef = useRef('');
  const latestEnvelopeRef = useRef<SessionSnapshotMessage | null>(null);
  const onApplySnapshotRef = useRef(onApplySnapshot);

  const hasBroadcastChannel = typeof BroadcastChannel !== 'undefined';
  const snapshotJson = useMemo(() => JSON.stringify(snapshot), [snapshot]);

  useEffect(() => {
    onApplySnapshotRef.current = onApplySnapshot;
  }, [onApplySnapshot]);

  useEffect(() => {
    const channel = hasBroadcastChannel ? new BroadcastChannel(getChannelName(sessionId)) : null;

    const applyIncomingSnapshot = (message: SessionSnapshotMessage) => {
      if (message.sessionId !== sessionId || message.sourceId === sourceIdRef.current) {
        return;
      }

      if (message.revision < revisionRef.current) {
        return;
      }

      const incomingJson = JSON.stringify(message.snapshot);

      revisionRef.current = message.revision;
      latestEnvelopeRef.current = message;

      if (incomingJson === lastSerializedSnapshotRef.current) {
        return;
      }

      lastSerializedSnapshotRef.current = incomingJson;
      onApplySnapshotRef.current(message.snapshot);
    };

    const handleChannelMessage = (event: MessageEvent<unknown>) => {
      const message = event.data;

      if (isSessionRequestMessage(message)) {
        if (message.sessionId === sessionId && message.sourceId !== sourceIdRef.current) {
          const latestEnvelope = latestEnvelopeRef.current;

          if (latestEnvelope) {
            channel?.postMessage(latestEnvelope);
          }
        }

        return;
      }

      if (isSessionSnapshotMessage(message)) {
        applyIncomingSnapshot(message);
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (!allowStorageFallback || event.key !== getSessionStorageKey(sessionId) || !event.newValue) {
        return;
      }

      try {
        const parsedValue: unknown = JSON.parse(event.newValue);

        if (isSessionSnapshotMessage(parsedValue)) {
          applyIncomingSnapshot(parsedValue);
        }
      } catch {
        // Ignore invalid cross-window storage writes.
      }
    };

    if (allowStorageFallback) {
      const storedSnapshot = readStoredSnapshot(sessionId);

      if (storedSnapshot) {
        applyIncomingSnapshot(storedSnapshot);
      }
    }

    if (channel) {
      channel.addEventListener('message', handleChannelMessage as EventListener);
      channel.postMessage({
        type: 'state-request',
        sessionId,
        sourceId: sourceIdRef.current,
      } satisfies SessionRequestMessage);
    }

    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
      channel?.removeEventListener('message', handleChannelMessage as EventListener);
      channel?.close();
    };
  }, [allowStorageFallback, hasBroadcastChannel, sessionId]);

  useEffect(() => {
    if (snapshotJson === lastSerializedSnapshotRef.current) {
      return;
    }

    lastSerializedSnapshotRef.current = snapshotJson;
    revisionRef.current = createNextRevision(revisionRef.current);

    const message: SessionSnapshotMessage = {
      type: 'state-snapshot',
      sessionId,
      sourceId: sourceIdRef.current,
      revision: revisionRef.current,
      storedAt: Date.now(),
      snapshot,
    };

    latestEnvelopeRef.current = message;

    if (allowStorageFallback) {
      persistSnapshot(sessionId, message);
    }

    if (hasBroadcastChannel) {
      const channel = new BroadcastChannel(getChannelName(sessionId));
      channel.postMessage(message);
      channel.close();
    }
  }, [allowStorageFallback, hasBroadcastChannel, sessionId, snapshot, snapshotJson]);

  return {
    transport: hasBroadcastChannel
      ? allowStorageFallback
        ? 'broadcast+storage'
        : 'broadcast'
      : allowStorageFallback
        ? 'storage'
        : 'none',
  } as const;
}
