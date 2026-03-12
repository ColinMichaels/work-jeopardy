import aiTechnologyRaw from './sample-ai-technology.json?raw';
import classicTriviaRaw from './sample-classic-trivia.json?raw';
import popCultureRaw from './sample-pop-culture.json?raw';
import sampleGameRaw from './sample-game.json?raw';
import solarRenewablesRaw from './sample-solar-renewables.json?raw';
import spaceExplorationRaw from './sample-space-exploration.json?raw';

export interface BundledGameSource {
  id: string;
  label: string;
  description: string;
  filename: string;
  rawConfig: string;
}

export const DEFAULT_BUNDLED_GAME_ID = 'team-jeopardy';

export const BUNDLED_GAME_SOURCES: ReadonlyArray<BundledGameSource> = [
  {
    id: 'team-jeopardy',
    label: 'Team Jeopardy',
    description: 'Developer-focused categories for engineering meetings and demos.',
    filename: 'sample-game.json',
    rawConfig: sampleGameRaw,
  },
  {
    id: 'classic-trivia',
    label: 'Classic Trivia Night',
    description: 'A general knowledge board with history, geography, books, and science.',
    filename: 'sample-classic-trivia.json',
    rawConfig: classicTriviaRaw,
  },
  {
    id: 'solar-renewables',
    label: 'Solar & Renewable Energy',
    description: 'Solar power, wind, storage, the grid, and clean-energy policy.',
    filename: 'sample-solar-renewables.json',
    rawConfig: solarRenewablesRaw,
  },
  {
    id: 'ai-technology',
    label: 'AI & Technology',
    description: 'Machine learning, computing history, chips, the web, and core tech concepts.',
    filename: 'sample-ai-technology.json',
    rawConfig: aiTechnologyRaw,
  },
  {
    id: 'pop-culture-showdown',
    label: 'Pop Culture Showdown',
    description: 'Movies, television, music, and familiar entertainment categories.',
    filename: 'sample-pop-culture.json',
    rawConfig: popCultureRaw,
  },
  {
    id: 'space-exploration',
    label: 'Space Exploration',
    description: 'Planets, missions, astronomy, spacecraft, and orbital basics.',
    filename: 'sample-space-exploration.json',
    rawConfig: spaceExplorationRaw,
  },
];
