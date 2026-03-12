import type { ConfigParseResult, GameConfig, GameMediaReference, GameSettings } from '../types/game-config';
import type { ResolvedClue } from '../models/game';

const DEFAULT_SETTINGS: GameSettings = {
  subtractOnIncorrect: true,
  enableLocalStorage: true,
  storageKey: 'team-jeopardy-state',
};

const VALID_MEDIA_TYPES = new Set(['image', 'audio', 'video']);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readRequiredString(
  source: Record<string, unknown>,
  key: string,
  path: string,
  errors: string[],
): string | null {
  const value = source[key];

  if (typeof value !== 'string' || value.trim().length === 0) {
    errors.push(`${path}.${key} must be a non-empty string.`);
    return null;
  }

  return value.trim();
}

function readOptionalString(
  source: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = source[key];
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

function readRequiredPositiveNumber(
  source: Record<string, unknown>,
  key: string,
  path: string,
  errors: string[],
): number | null {
  const value = source[key];

  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    errors.push(`${path}.${key} must be a positive number.`);
    return null;
  }

  return value;
}

function readOptionalBoolean(
  source: Record<string, unknown>,
  key: string,
  path: string,
  errors: string[],
  fallback: boolean,
): boolean {
  const value = source[key];

  if (value === undefined) {
    return fallback;
  }

  if (typeof value !== 'boolean') {
    errors.push(`${path}.${key} must be a boolean.`);
    return fallback;
  }

  return value;
}

function parseMedia(
  value: unknown,
  path: string,
  errors: string[],
): GameMediaReference[] | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    errors.push(`${path}.media must be an array when provided.`);
    return undefined;
  }

  const media = value.flatMap((entry, index) => {
    const mediaPath = `${path}.media[${index}]`;

    if (!isRecord(entry)) {
      errors.push(`${mediaPath} must be an object.`);
      return [];
    }

    const type = readRequiredString(entry, 'type', mediaPath, errors);
    const src = readRequiredString(entry, 'src', mediaPath, errors);
    const alt = readOptionalString(entry, 'alt');

    if (!type || !src) {
      return [];
    }

    if (!VALID_MEDIA_TYPES.has(type)) {
      errors.push(`${mediaPath}.type must be one of: image, audio, video.`);
      return [];
    }

    return [{ type: type as GameMediaReference['type'], src, alt }];
  });

  return media.length > 0 ? media : undefined;
}

function assertUniqueIds(label: string, ids: string[], errors: string[]): void {
  const seen = new Set<string>();

  ids.forEach((id) => {
    if (seen.has(id)) {
      errors.push(`${label} ids must be unique. Duplicate id: "${id}".`);
      return;
    }

    seen.add(id);
  });
}

export function loadGameConfig(rawConfig: string): ConfigParseResult {
  let parsedValue: unknown;

  try {
    parsedValue = JSON.parse(rawConfig);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown parse error';
    return {
      ok: false,
      errors: [`Invalid JSON in game config: ${message}`],
    };
  }

  if (!isRecord(parsedValue)) {
    return {
      ok: false,
      errors: ['Game config must be a JSON object at the top level.'],
    };
  }

  const errors: string[] = [];
  const title = readRequiredString(parsedValue, 'title', 'config', errors);
  const subtitle = readOptionalString(parsedValue, 'subtitle');

  const teamsInput = parsedValue.teams;
  const categoriesInput = parsedValue.categories;
  const settingsInput = parsedValue.settings;

  const teams = Array.isArray(teamsInput)
    ? teamsInput.flatMap((entry, index) => {
        const path = `config.teams[${index}]`;

        if (!isRecord(entry)) {
          errors.push(`${path} must be an object.`);
          return [];
        }

        const id = readRequiredString(entry, 'id', path, errors);
        const name = readRequiredString(entry, 'name', path, errors);

        return id && name ? [{ id, name }] : [];
      })
    : [];

  if (!Array.isArray(teamsInput)) {
    errors.push('config.teams must be an array.');
  } else if (teams.length === 0) {
    errors.push('config.teams must include at least one team.');
  }

  const categories = Array.isArray(categoriesInput)
    ? categoriesInput.flatMap((entry, categoryIndex) => {
        const path = `config.categories[${categoryIndex}]`;

        if (!isRecord(entry)) {
          errors.push(`${path} must be an object.`);
          return [];
        }

        const id = readRequiredString(entry, 'id', path, errors);
        const categoryTitle = readRequiredString(entry, 'title', path, errors);
        const cluesInput = entry.clues;

        if (!Array.isArray(cluesInput)) {
          errors.push(`${path}.clues must be an array.`);
          return [];
        }

        const clues = cluesInput.flatMap((clueEntry, clueIndex) => {
          const cluePath = `${path}.clues[${clueIndex}]`;

          if (!isRecord(clueEntry)) {
            errors.push(`${cluePath} must be an object.`);
            return [];
          }

          const clueId = readRequiredString(clueEntry, 'id', cluePath, errors);
          const value = readRequiredPositiveNumber(clueEntry, 'value', cluePath, errors);
          const answer = readRequiredString(clueEntry, 'answer', cluePath, errors);
          const question = readRequiredString(clueEntry, 'question', cluePath, errors);
          const notes = readOptionalString(clueEntry, 'notes');
          const media = parseMedia(clueEntry.media, cluePath, errors);
          const dailyDouble = readOptionalBoolean(
            clueEntry,
            'dailyDouble',
            cluePath,
            errors,
            false,
          );

          if (!clueId || !value || !answer || !question) {
            return [];
          }

          return [
            {
              id: clueId,
              value,
              answer,
              question,
              notes,
              dailyDouble,
              media,
            },
          ];
        });

        if (clues.length === 0) {
          errors.push(`${path}.clues must include at least one clue.`);
        }

        return id && categoryTitle
          ? [
              {
                id,
                title: categoryTitle,
                clues,
              },
            ]
          : [];
      })
    : [];

  if (!Array.isArray(categoriesInput)) {
    errors.push('config.categories must be an array.');
  } else if (categories.length === 0) {
    errors.push('config.categories must include at least one category.');
  }

  let settingsSource: Record<string, unknown> = {};

  if (settingsInput !== undefined) {
    if (!isRecord(settingsInput)) {
      errors.push('config.settings must be an object when provided.');
    } else {
      settingsSource = settingsInput;
    }
  }

  const settings: GameSettings = {
    subtractOnIncorrect: readOptionalBoolean(
      settingsSource,
      'subtractOnIncorrect',
      'config.settings',
      errors,
      DEFAULT_SETTINGS.subtractOnIncorrect,
    ),
    enableLocalStorage: readOptionalBoolean(
      settingsSource,
      'enableLocalStorage',
      'config.settings',
      errors,
      DEFAULT_SETTINGS.enableLocalStorage,
    ),
    storageKey:
      readOptionalString(settingsSource, 'storageKey') ?? DEFAULT_SETTINGS.storageKey,
  };

  assertUniqueIds('Team', teams.map((team) => team.id), errors);
  assertUniqueIds('Category', categories.map((category) => category.id), errors);
  assertUniqueIds(
    'Clue',
    categories.flatMap((category) => category.clues.map((clue) => clue.id)),
    errors,
  );

  if (errors.length > 0 || !title) {
    return {
      ok: false,
      errors,
    };
  }

  return {
    ok: true,
    value: {
      title,
      subtitle,
      teams,
      categories,
      settings,
    },
  };
}

export function findClueById(config: GameConfig, clueId: string | null): ResolvedClue | null {
  if (!clueId) {
    return null;
  }

  for (const [categoryIndex, category] of config.categories.entries()) {
    for (const [clueIndex, clue] of category.clues.entries()) {
      if (clue.id === clueId) {
        return {
          categoryId: category.id,
          categoryTitle: category.title,
          categoryIndex,
          clueIndex,
          clue,
        };
      }
    }
  }

  return null;
}

export function getMinimumClueValue(config: GameConfig): number {
  const values = config.categories.flatMap((category) => category.clues.map((clue) => clue.value));
  return values.length > 0 ? Math.min(...values) : 100;
}
