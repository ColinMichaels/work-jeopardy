export interface BundledGameSource {
  id: string;
  label: string;
  description: string;
  filename: string;
  loadRawConfig: () => Promise<string>;
}

export const DEFAULT_BUNDLED_GAME_ID = 'team-jeopardy';

function createRawConfigLoader(
  importer: () => Promise<{ default: string }>,
): () => Promise<string> {
  let pendingLoad: Promise<string> | null = null;

  return () => {
    if (!pendingLoad) {
      pendingLoad = importer()
        .then((module) => module.default)
        .catch((error) => {
          pendingLoad = null;
          throw error;
        });
    }

    return pendingLoad;
  };
}

export const BUNDLED_GAME_SOURCES: ReadonlyArray<BundledGameSource> = [
  {
    id: 'team-jeopardy',
    label: 'Team Jeopardy',
    description: 'Developer-focused categories for engineering meetings and demos.',
    filename: 'sample-game.json',
    loadRawConfig: createRawConfigLoader(() => import('./sample-game.json?raw')),
  },
  {
    id: 'classic-trivia',
    label: 'Classic Trivia Night',
    description: 'A general knowledge board with history, geography, books, and science.',
    filename: 'sample-classic-trivia.json',
    loadRawConfig: createRawConfigLoader(() => import('./sample-classic-trivia.json?raw')),
  },
  {
    id: '90s-pop-throwback',
    label: '90s Pop Throwback',
    description: 'Teen pop, late-90s crossover hits, and soundtrack staples.',
    filename: 'sample-90s-pop.json',
    loadRawConfig: createRawConfigLoader(() => import('./sample-90s-pop.json?raw')),
  },
  {
    id: '2000s-pop-party',
    label: '2000s Pop Party',
    description: 'Reality-show breakouts, dance-pop singles, and peak ringtone-era hooks.',
    filename: 'sample-2000s-pop.json',
    loadRawConfig: createRawConfigLoader(() => import('./sample-2000s-pop.json?raw')),
  },
  {
    id: '60s-pop-gold',
    label: '60s Pop Gold',
    description: 'British Invasion favorites, girl-group classics, and radio-era pop landmarks.',
    filename: 'sample-60s-pop.json',
    loadRawConfig: createRawConfigLoader(() => import('./sample-60s-pop.json?raw')),
  },
  {
    id: '70s-pop-superstars',
    label: '70s Pop Superstars',
    description: 'Singer-songwriters, disco crossovers, FM staples, and blockbuster soundtrack hits.',
    filename: 'sample-70s-pop.json',
    loadRawConfig: createRawConfigLoader(() => import('./sample-70s-pop.json?raw')),
  },
  {
    id: '90s-rap-classics',
    label: '90s Rap Classics',
    description: 'Golden-era albums, iconic MCs, and essential East, West, and Southern rap.',
    filename: 'sample-90s-rap.json',
    loadRawConfig: createRawConfigLoader(() => import('./sample-90s-rap.json?raw')),
  },
  {
    id: '2000s-rap-essentials',
    label: '2000s Rap Essentials',
    description: 'Mixtape-era stars, Southern dominance, and major 2000s rap labels.',
    filename: 'sample-2000s-rap.json',
    loadRawConfig: createRawConfigLoader(() => import('./sample-2000s-rap.json?raw')),
  },
  {
    id: 'solar-renewables',
    label: 'Solar & Renewable Energy',
    description: 'Solar power, wind, storage, the grid, and clean-energy policy.',
    filename: 'sample-solar-renewables.json',
    loadRawConfig: createRawConfigLoader(() => import('./sample-solar-renewables.json?raw')),
  },
  {
    id: 'ai-technology',
    label: 'AI & Technology',
    description: 'Machine learning, computing history, chips, the web, and core tech concepts.',
    filename: 'sample-ai-technology.json',
    loadRawConfig: createRawConfigLoader(() => import('./sample-ai-technology.json?raw')),
  },
  {
    id: 'pop-culture-showdown',
    label: 'Pop Culture Showdown',
    description: 'Movies, television, music, and familiar entertainment categories.',
    filename: 'sample-pop-culture.json',
    loadRawConfig: createRawConfigLoader(() => import('./sample-pop-culture.json?raw')),
  },
  {
    id: 'space-exploration',
    label: 'Space Exploration',
    description: 'Planets, missions, astronomy, spacecraft, and orbital basics.',
    filename: 'sample-space-exploration.json',
    loadRawConfig: createRawConfigLoader(() => import('./sample-space-exploration.json?raw')),
  },
];
