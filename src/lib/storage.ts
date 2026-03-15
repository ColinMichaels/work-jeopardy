import type { PersistedGameState } from '../models/game';
import type { GameSettings } from '../types/game-config';

const DEFAULT_STORAGE_KEY = 'team-jeopardy-state';
export const CONFIG_OVERRIDE_STORAGE_KEY = 'work-jeopardy-config-override';
export const BUNDLED_GAME_SELECTION_STORAGE_KEY = 'work-jeopardy-bundled-game';
export const SOUND_ENABLED_STORAGE_KEY = 'work-jeopardy-sound-enabled';
export const SESSION_STORAGE_PREFIX = 'work-jeopardy-session';

const MANAGED_STORAGE_INDEX_KEY = 'work-jeopardy-storage-index';
const STORAGE_ENVELOPE_APP_ID = 'work-jeopardy';
const STORAGE_ENVELOPE_VERSION = 1;
const GAME_STATE_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 45;
const CONFIG_OVERRIDE_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30;
const SESSION_SNAPSHOT_MAX_AGE_MS = 1000 * 60 * 60 * 24;

type ManagedStorageKind = 'game-state' | 'config-override' | 'session-snapshot';

interface ManagedStorageIndexEntry {
  kind: ManagedStorageKind;
  touchedAt: number;
}

type ManagedStorageIndex = Record<string, ManagedStorageIndexEntry>;

interface StorageEnvelopeMeta {
  app: typeof STORAGE_ENVELOPE_APP_ID;
  version: typeof STORAGE_ENVELOPE_VERSION;
  kind: Exclude<ManagedStorageKind, 'session-snapshot'>;
  updatedAt: number;
}

interface StoredGameStateEnvelope {
  __workJeopardy: StorageEnvelopeMeta & {
    kind: 'game-state';
  };
  state: PersistedGameState;
}

interface StoredConfigOverrideEnvelope {
  __workJeopardy: StorageEnvelopeMeta & {
    kind: 'config-override';
  };
  rawConfig: string;
}

interface ParsedStoredGameState {
  state: PersistedGameState;
  updatedAt: number | null;
}

interface ParsedStoredConfigOverride {
  rawConfig: string;
  updatedAt: number | null;
}

export interface StorageCleanupResult {
  removedGameStateCount: number;
  removedConfigOverrideCount: number;
  removedSessionSnapshotCount: number;
  removedKeys: string[];
}

export interface StorageCleanupOptions {
  activeGameStorageKey?: string | null;
  activeSessionId?: string | null;
  preserveConfigOverride?: boolean;
  mode?: 'stale' | 'inactive';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isPersistedGameState(value: unknown): value is PersistedGameState {
  if (!isRecord(value)) {
    return false;
  }

  if (!Array.isArray(value.teams) || !Array.isArray(value.answeredClueIds)) {
    return false;
  }

  if (
    value.finalJeopardy !== undefined &&
    value.finalJeopardy !== null &&
    !isPersistedFinalJeopardyState(value.finalJeopardy)
  ) {
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

function isNumberRecord(value: unknown): value is Record<string, number> {
  return (
    isRecord(value) &&
    Object.values(value).every((entry) => typeof entry === 'number' && Number.isFinite(entry))
  );
}

function isStringRecord(value: unknown): value is Record<string, string> {
  return isRecord(value) && Object.values(value).every((entry) => typeof entry === 'string');
}

function isBooleanRecord(value: unknown): value is Record<string, boolean> {
  return isRecord(value) && Object.values(value).every((entry) => typeof entry === 'boolean');
}

function isPersistedFinalJeopardyState(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.phase === 'string' &&
    Array.isArray(value.eligibleTeamIds) &&
    value.eligibleTeamIds.every((teamId) => typeof teamId === 'string') &&
    isNumberRecord(value.startingScores) &&
    isNumberRecord(value.wagers) &&
    isStringRecord(value.responses) &&
    isBooleanRecord(value.judgments) &&
    typeof value.scoresApplied === 'boolean' &&
    (value.phaseStartedAt === null || typeof value.phaseStartedAt === 'number')
  );
}

function isStorageEnvelopeMeta(
  value: unknown,
  kind?: Exclude<ManagedStorageKind, 'session-snapshot'>,
): value is StorageEnvelopeMeta {
  return (
    isRecord(value) &&
    value.app === STORAGE_ENVELOPE_APP_ID &&
    value.version === STORAGE_ENVELOPE_VERSION &&
    (kind === undefined ? typeof value.kind === 'string' : value.kind === kind) &&
    isFiniteNumber(value.updatedAt)
  );
}

function isStoredGameStateEnvelope(value: unknown): value is StoredGameStateEnvelope {
  return isRecord(value) && isStorageEnvelopeMeta(value.__workJeopardy, 'game-state');
}

function isStoredConfigOverrideEnvelope(value: unknown): value is StoredConfigOverrideEnvelope {
  return isRecord(value) && isStorageEnvelopeMeta(value.__workJeopardy, 'config-override');
}

function getStorageEnvelopeMeta<K extends Exclude<ManagedStorageKind, 'session-snapshot'>>(
  kind: K,
  updatedAt = Date.now(),
): StorageEnvelopeMeta & { kind: K } {
  return {
    app: STORAGE_ENVELOPE_APP_ID,
    version: STORAGE_ENVELOPE_VERSION,
    kind,
    updatedAt,
  };
}

function readStorageIndex(): ManagedStorageIndex {
  const rawValue = loadStoredString(MANAGED_STORAGE_INDEX_KEY);

  if (!rawValue) {
    return {};
  }

  try {
    const parsedValue: unknown = JSON.parse(rawValue);

    if (!isRecord(parsedValue) || !isRecord(parsedValue.entries)) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(parsedValue.entries).flatMap(([storageKey, entry]) =>
        isRecord(entry) &&
        (entry.kind === 'game-state' ||
          entry.kind === 'config-override' ||
          entry.kind === 'session-snapshot') &&
        isFiniteNumber(entry.touchedAt)
          ? ([[storageKey, { kind: entry.kind, touchedAt: entry.touchedAt }]] as const)
          : [],
      ),
    );
  } catch {
    return {};
  }
}

function writeStorageIndex(index: ManagedStorageIndex): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const entries = Object.entries(index);

    if (entries.length === 0) {
      window.localStorage.removeItem(MANAGED_STORAGE_INDEX_KEY);
      return;
    }

    window.localStorage.setItem(
      MANAGED_STORAGE_INDEX_KEY,
      JSON.stringify({
        version: STORAGE_ENVELOPE_VERSION,
        entries: Object.fromEntries(entries),
      }),
    );
  } catch {
    // Ignore storage failures so the game remains playable in restricted browsers.
  }
}

export function touchManagedStorageKey(
  storageKey: string,
  kind: ManagedStorageKind,
  touchedAt = Date.now(),
): void {
  if (typeof window === 'undefined' || storageKey === MANAGED_STORAGE_INDEX_KEY) {
    return;
  }

  const nextTouchedAt = Number.isFinite(touchedAt) ? touchedAt : Date.now();
  const index = readStorageIndex();
  const existingEntry = index[storageKey];

  if (
    existingEntry &&
    existingEntry.kind === kind &&
    Math.abs(existingEntry.touchedAt - nextTouchedAt) < 1000
  ) {
    return;
  }

  index[storageKey] = {
    kind,
    touchedAt: nextTouchedAt,
  };
  writeStorageIndex(index);
}

export function clearManagedStorageKey(storageKey: string): void {
  if (typeof window === 'undefined' || storageKey === MANAGED_STORAGE_INDEX_KEY) {
    return;
  }

  const index = readStorageIndex();

  if (!index[storageKey]) {
    return;
  }

  delete index[storageKey];
  writeStorageIndex(index);
}

function parseStoredGameState(storedValue: string): ParsedStoredGameState | null {
  try {
    const parsedValue: unknown = JSON.parse(storedValue);

    if (isStoredGameStateEnvelope(parsedValue) && isPersistedGameState(parsedValue.state)) {
      return {
        state: parsedValue.state,
        updatedAt: parsedValue.__workJeopardy.updatedAt,
      };
    }

    if (isPersistedGameState(parsedValue)) {
      return {
        state: parsedValue,
        updatedAt: null,
      };
    }

    return null;
  } catch {
    return null;
  }
}

function parseStoredConfigOverride(storedValue: string): ParsedStoredConfigOverride | null {
  try {
    const parsedValue: unknown = JSON.parse(storedValue);

    if (
      isStoredConfigOverrideEnvelope(parsedValue) &&
      typeof parsedValue.rawConfig === 'string'
    ) {
      return {
        rawConfig: parsedValue.rawConfig,
        updatedAt: parsedValue.__workJeopardy.updatedAt,
      };
    }
  } catch {
    return {
      rawConfig: storedValue,
      updatedAt: null,
    };
  }

  return typeof storedValue === 'string' ? { rawConfig: storedValue, updatedAt: null } : null;
}

function normalizePersistedGameState(state: PersistedGameState): PersistedGameState {
  return {
    teams: state.teams.map((team) => ({
      id: team.id,
      name: team.name,
      score: team.score,
    })),
    answeredClueIds: state.answeredClueIds.filter(
      (value): value is string => typeof value === 'string',
    ),
    finalJeopardy: state.finalJeopardy
      ? {
          phase: state.finalJeopardy.phase,
          eligibleTeamIds: state.finalJeopardy.eligibleTeamIds.filter(
            (value): value is string => typeof value === 'string',
          ),
          startingScores: { ...state.finalJeopardy.startingScores },
          wagers: { ...state.finalJeopardy.wagers },
          responses: { ...state.finalJeopardy.responses },
          judgments: { ...state.finalJeopardy.judgments },
          scoresApplied: state.finalJeopardy.scoresApplied,
          phaseStartedAt: state.finalJeopardy.phaseStartedAt,
        }
      : null,
  };
}

function getLocalStorageKeys(): string[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    return Array.from({ length: window.localStorage.length }, (_, index) =>
      window.localStorage.key(index),
    ).filter((value): value is string => typeof value === 'string');
  } catch {
    return [];
  }
}

function removeStoredKey(storageKey: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.removeItem(storageKey);
  } catch {
    // Nothing to do if the browser blocks localStorage access.
  }
}

export function getSessionStorageKey(sessionId: string): string {
  return `${SESSION_STORAGE_PREFIX}:${sessionId}`;
}

function createStorageCleanupResult(): StorageCleanupResult {
  return {
    removedGameStateCount: 0,
    removedConfigOverrideCount: 0,
    removedSessionSnapshotCount: 0,
    removedKeys: [],
  };
}

function trackRemovedStorageKey(
  result: StorageCleanupResult,
  kind: ManagedStorageKind,
  storageKey: string,
): void {
  result.removedKeys.push(storageKey);

  switch (kind) {
    case 'game-state':
      result.removedGameStateCount += 1;
      break;
    case 'config-override':
      result.removedConfigOverrideCount += 1;
      break;
    case 'session-snapshot':
      result.removedSessionSnapshotCount += 1;
      break;
  }
}

function removeTrackedStorageKey(
  storageKey: string,
  kind: ManagedStorageKind,
  index: ManagedStorageIndex,
  result: StorageCleanupResult,
): void {
  removeStoredKey(storageKey);
  delete index[storageKey];
  trackRemovedStorageKey(result, kind, storageKey);
}

function getStoredSessionSnapshotTouchedAt(storedValue: string): number | null {
  try {
    const parsedValue: unknown = JSON.parse(storedValue);

    if (!isRecord(parsedValue)) {
      return null;
    }

    if (isFiniteNumber(parsedValue.storedAt)) {
      return parsedValue.storedAt;
    }

    if (isFiniteNumber(parsedValue.revision)) {
      return parsedValue.revision;
    }

    return null;
  } catch {
    return null;
  }
}

function isLikelyLegacyGameStateKey(storageKey: string): boolean {
  return storageKey === DEFAULT_STORAGE_KEY || storageKey.startsWith('work-jeopardy-');
}

function isManagedAppKey(storageKey: string): boolean {
  return (
    storageKey === MANAGED_STORAGE_INDEX_KEY ||
    storageKey === BUNDLED_GAME_SELECTION_STORAGE_KEY ||
    storageKey === SOUND_ENABLED_STORAGE_KEY ||
    storageKey === CONFIG_OVERRIDE_STORAGE_KEY ||
    storageKey.startsWith(`${SESSION_STORAGE_PREFIX}:`)
  );
}

export function cleanupBrowserStorage({
  activeGameStorageKey = null,
  activeSessionId = null,
  preserveConfigOverride = false,
  mode = 'stale',
}: StorageCleanupOptions = {}): StorageCleanupResult {
  if (typeof window === 'undefined') {
    return createStorageCleanupResult();
  }

  const result = createStorageCleanupResult();
  const now = Date.now();
  const index = readStorageIndex();
  const availableKeys = new Set(getLocalStorageKeys());
  const preserveKeys = new Set<string>();
  const activeSessionStorageKey = activeSessionId ? getSessionStorageKey(activeSessionId) : null;

  if (activeGameStorageKey) {
    preserveKeys.add(activeGameStorageKey);
  }

  if (preserveConfigOverride) {
    preserveKeys.add(CONFIG_OVERRIDE_STORAGE_KEY);
  }

  if (activeSessionStorageKey) {
    preserveKeys.add(activeSessionStorageKey);
  }

  for (const [storageKey] of Object.entries(index)) {
    if (storageKey === MANAGED_STORAGE_INDEX_KEY || !availableKeys.has(storageKey)) {
      delete index[storageKey];
    }
  }

  for (const [storageKey, entry] of Object.entries(index)) {
    if (preserveKeys.has(storageKey)) {
      continue;
    }

    const maxAgeMs =
      entry.kind === 'session-snapshot'
        ? SESSION_SNAPSHOT_MAX_AGE_MS
        : entry.kind === 'config-override'
          ? CONFIG_OVERRIDE_MAX_AGE_MS
          : GAME_STATE_MAX_AGE_MS;

    const shouldRemove =
      mode === 'inactive' || now - entry.touchedAt > maxAgeMs;

    if (!shouldRemove) {
      continue;
    }

    removeTrackedStorageKey(storageKey, entry.kind, index, result);
    availableKeys.delete(storageKey);
  }

  for (const storageKey of availableKeys) {
    if (preserveKeys.has(storageKey) || storageKey === MANAGED_STORAGE_INDEX_KEY) {
      continue;
    }

    const rawValue = loadStoredString(storageKey);

    if (!rawValue) {
      continue;
    }

    if (storageKey.startsWith(`${SESSION_STORAGE_PREFIX}:`)) {
      const touchedAt = getStoredSessionSnapshotTouchedAt(rawValue);
      const isStale = touchedAt === null || now - touchedAt > SESSION_SNAPSHOT_MAX_AGE_MS;

      if (mode === 'inactive' || isStale) {
        removeTrackedStorageKey(storageKey, 'session-snapshot', index, result);
      }

      continue;
    }

    if (mode === 'inactive' && storageKey === CONFIG_OVERRIDE_STORAGE_KEY) {
      const parsedOverride = parseStoredConfigOverride(rawValue);

      if (parsedOverride) {
        removeTrackedStorageKey(storageKey, 'config-override', index, result);
      }

      continue;
    }

    if (mode === 'inactive' && isLikelyLegacyGameStateKey(storageKey) && !isManagedAppKey(storageKey)) {
      const parsedState = parseStoredGameState(rawValue);

      if (parsedState) {
        removeTrackedStorageKey(storageKey, 'game-state', index, result);
      }
    }
  }

  writeStorageIndex(index);
  return result;
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

  const parsedState = parseStoredGameState(storedValue);

  if (!parsedState) {
    clearStoredGameState(storageKey);
    return null;
  }

  touchManagedStorageKey(storageKey, 'game-state', parsedState.updatedAt ?? Date.now());
  return normalizePersistedGameState(parsedState.state);
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

export function loadStoredBoolean(storageKey: string): boolean | null {
  const storedValue = loadStoredString(storageKey);

  if (storedValue === 'true') {
    return true;
  }

  if (storedValue === 'false') {
    return false;
  }

  return null;
}

export function saveStoredGameState(storageKey: string, state: PersistedGameState): void {
  const updatedAt = Date.now();

  saveStoredString(
    storageKey,
    JSON.stringify({
      __workJeopardy: getStorageEnvelopeMeta('game-state', updatedAt),
      state,
    } satisfies StoredGameStateEnvelope),
  );
  touchManagedStorageKey(storageKey, 'game-state', updatedAt);
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

export function saveStoredBoolean(storageKey: string, value: boolean): void {
  saveStoredString(storageKey, value ? 'true' : 'false');
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
    clearManagedStorageKey(storageKey);
  } catch {
    // Nothing to do if the browser blocks localStorage access.
  }
}

export function loadStoredConfigOverride(storageKey = CONFIG_OVERRIDE_STORAGE_KEY): string | null {
  const storedValue = loadStoredString(storageKey);

  if (!storedValue) {
    return null;
  }

  const parsedOverride = parseStoredConfigOverride(storedValue);

  if (!parsedOverride) {
    clearStoredConfigOverride(storageKey);
    return null;
  }

  touchManagedStorageKey(storageKey, 'config-override', parsedOverride.updatedAt ?? Date.now());
  return parsedOverride.rawConfig;
}

export function saveStoredConfigOverride(
  rawConfig: string,
  storageKey = CONFIG_OVERRIDE_STORAGE_KEY,
): void {
  const updatedAt = Date.now();

  saveStoredString(
    storageKey,
    JSON.stringify({
      __workJeopardy: getStorageEnvelopeMeta('config-override', updatedAt),
      rawConfig,
    } satisfies StoredConfigOverrideEnvelope),
  );
  touchManagedStorageKey(storageKey, 'config-override', updatedAt);
}

export function clearStoredConfigOverride(
  storageKey = CONFIG_OVERRIDE_STORAGE_KEY,
): void {
  clearStoredString(storageKey);
}

export function loadStoredBundledGameSelection(
  storageKey = BUNDLED_GAME_SELECTION_STORAGE_KEY,
): string | null {
  const storedValue = loadStoredString(storageKey);
  return storedValue && storedValue.trim().length > 0 ? storedValue.trim() : null;
}

export function saveStoredBundledGameSelection(
  bundledGameId: string,
  storageKey = BUNDLED_GAME_SELECTION_STORAGE_KEY,
): void {
  saveStoredString(storageKey, bundledGameId);
}

export function clearStoredBundledGameSelection(
  storageKey = BUNDLED_GAME_SELECTION_STORAGE_KEY,
): void {
  clearStoredString(storageKey);
}
