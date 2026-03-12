import type { GameConfig } from '../types/game-config';

function slugifyFilenamePart(value: string, fallback: string): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalized || fallback;
}

export function buildGameConfigFilename(config: Pick<GameConfig, 'title'>): string {
  const dateStamp = new Date().toISOString().slice(0, 10);
  const baseName = slugifyFilenamePart(config.title, 'work-jeopardy-game');
  return `${baseName}-${dateStamp}.json`;
}

export function downloadGameConfigJson(config: GameConfig): string {
  const filename = buildGameConfigFilename(config);

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return filename;
  }

  const blob = new Blob([JSON.stringify(config, null, 2)], {
    type: 'application/json',
  });
  const objectUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = objectUrl;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();

  window.setTimeout(() => {
    window.URL.revokeObjectURL(objectUrl);
  }, 0);

  return filename;
}
