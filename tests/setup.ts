import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest';

type MessageListener = (event: MessageEvent<unknown>) => void;

class MockBroadcastChannel {
  static instancesByName = new Map<string, Set<MockBroadcastChannel>>();

  readonly name: string;
  onmessage: ((event: MessageEvent<unknown>) => void) | null = null;
  private listeners = new Set<MessageListener>();

  constructor(name: string) {
    this.name = name;

    const instances = MockBroadcastChannel.instancesByName.get(name) ?? new Set();
    instances.add(this);
    MockBroadcastChannel.instancesByName.set(name, instances);
  }

  static reset() {
    MockBroadcastChannel.instancesByName.clear();
  }

  postMessage(data: unknown) {
    const peers = MockBroadcastChannel.instancesByName.get(this.name);

    if (!peers) {
      return;
    }

    peers.forEach((peer) => {
      if (peer === this) {
        return;
      }

      const event = new MessageEvent('message', { data });
      peer.listeners.forEach((listener) => listener(event));
      peer.onmessage?.(event);
    });
  }

  addEventListener(type: string, listener: EventListener) {
    if (type === 'message') {
      this.listeners.add(listener as MessageListener);
    }
  }

  removeEventListener(type: string, listener: EventListener) {
    if (type === 'message') {
      this.listeners.delete(listener as MessageListener);
    }
  }

  close() {
    const peers = MockBroadcastChannel.instancesByName.get(this.name);

    if (!peers) {
      return;
    }

    peers.delete(this);

    if (peers.size === 0) {
      MockBroadcastChannel.instancesByName.delete(this.name);
    }
  }
}

beforeAll(() => {
  vi.stubGlobal('BroadcastChannel', MockBroadcastChannel);
  window.open = vi.fn(() => null);
  window.confirm = vi.fn(() => true);
  HTMLMediaElement.prototype.play = vi.fn(async () => undefined);
  HTMLMediaElement.prototype.pause = vi.fn(() => undefined);
});

beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
  window.history.replaceState({}, '', '/');
  MockBroadcastChannel.reset();
});

afterEach(() => {
  cleanup();
  MockBroadcastChannel.reset();
});

afterAll(() => {
  vi.unstubAllGlobals();
});
