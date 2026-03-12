import type { PersistedGameState } from '../models/game';
import type { GameSettings } from '../types/game-config';

const DEFAULT_STORAGE_KEY = 'team-jeopardy-state';
export const CONFIG_OVERRIDE_STORAGE_KEY = 'work-jeopardy-config-override';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isPersistedGameState(value: unknown): value is PersistedGameState {
  if (!isRecord(value)) {
    return false;
  }

  if (!Array.isArray(value.teams) || !Array.isArray(value.answeredClueIds)) {
    return false;
  }

  return value.teams.every(
    (team) =>
      isRecord(team) &&
      typeof team.id === 'string' &&
      typeof team.name === 'string' &&
      typeof team.score === 'number',
  );
}

export function getStorageKey(settings: Pick<GameSettings, 'storageKey'>): string {
  const candidate = settings.storageKey?.trim();
  return candidate ? candidate : DEFAULT_STORAGE_KEY;
}

export function loadStoredGameState(storageKey: string): PersistedGameState | null {
  const storedValue = loadStoredString(storageKey);

  if (!storedValue) {
    return null;
  }

  try {
    const parsedValue: unknown = JSON.parse(storedValue);

    if (!isPersistedGameState(parsedValue)) {
      return null;
    }

    return {
      teams: parsedValue.teams.map((team) => ({
        id: team.id,
        name: team.name,
        score: team.score,
      })),
      answeredClueIds: parsedValue.answeredClueIds.filter(
        (value): value is string => typeof value === 'string',
      ),
    };
  } catch {
    return null;
  }
}

function loadStoredString(storageKey: string): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage.getItem(storageKey);
  } catch {
    return null;
  }
}

export function saveStoredGameState(storageKey: string, state: PersistedGameState): void {
  saveStoredString(storageKey, JSON.stringify(state));
}

function saveStoredString(storageKey: string, value: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(storageKey, value);
  } catch {
    // Swallow storage failures so the game remains playable in restricted browsers.
  }
}

export function clearStoredGameState(storageKey: string): void {
  clearStoredString(storageKey);
}

function clearStoredString(storageKey: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.removeItem(storageKey);
  } catch {
    // Nothing to do if the browser blocks localStorage access.
  }
}

export function loadStoredConfigOverride(storageKey = CONFIG_OVERRIDE_STORAGE_KEY): string | null {
  return loadStoredString(storageKey);
}

export function saveStoredConfigOverride(
  rawConfig: string,
  storageKey = CONFIG_OVERRIDE_STORAGE_KEY,
): void {
  saveStoredString(storageKey, rawConfig);
}

export function clearStoredConfigOverride(
  storageKey = CONFIG_OVERRIDE_STORAGE_KEY,
): void {
  clearStoredString(storageKey);
}
