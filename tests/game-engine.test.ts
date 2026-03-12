import {
  applyClueOutcome,
  createInitialGameState,
  resetScores,
  restoreSelectedClue,
  revealQuestion,
  selectClue,
  startFinalJeopardy,
} from '../src/lib/game-engine';
import type { GameState } from '../src/models/game';
import type { GameConfig } from '../src/types/game-config';

function buildTestConfig(): GameConfig {
  return {
    title: 'Test Board',
    teams: [
      { id: 'team-1', name: 'Blue Team' },
      { id: 'team-2', name: 'Gold Team' },
    ],
    categories: [
      {
        id: 'cat-1',
        title: 'Category',
        clues: [
          {
            id: 'clue-100',
            value: 100,
            answer: 'Answer',
            question: 'Question',
          },
        ],
      },
    ],
    settings: {
      subtractOnIncorrect: true,
      enableLocalStorage: false,
      sounds: {
        enabled: false,
      },
    },
    finalJeopardy: {
      enabled: true,
      category: 'Final Category',
      clue: 'Final Clue',
      correctResponse: 'What is test coverage?',
      allowNonPositiveScores: false,
    },
  };
}

describe('game engine state transitions', () => {
  it('creates a fresh game state with no active notification', () => {
    const state = createInitialGameState(buildTestConfig());

    expect(state.selectedClueId).toBeNull();
    expect(state.notification).toBeNull();
    expect(state.teams.map((team) => team.score)).toEqual([0, 0]);
  });

  it('selects, reveals, and scores a clue while closing it afterward', () => {
    const config = buildTestConfig();
    const initialState = createInitialGameState(config);
    const selectedState = selectClue(initialState, 'clue-100');
    const revealedState = revealQuestion(selectedState);
    const scoredState = applyClueOutcome(revealedState, 'team-1', 100, true, true);

    expect(selectedState.selectedClueId).toBe('clue-100');
    expect(selectedState.answeredClueIds).toEqual({ 'clue-100': true });
    expect(revealedState.isQuestionRevealed).toBe(true);
    expect(scoredState.selectedClueId).toBeNull();
    expect(scoredState.isQuestionRevealed).toBe(false);
    expect(scoredState.teams.find((team) => team.id === 'team-1')?.score).toBe(100);
  });

  it('returns a selected clue back to the board as unused', () => {
    const initialState = createInitialGameState(buildTestConfig());
    const selectedState = selectClue(initialState, 'clue-100');
    const restoredState = restoreSelectedClue(selectedState);

    expect(restoredState.selectedClueId).toBeNull();
    expect(restoredState.answeredClueIds).toEqual({});
  });

  it('resets scores and clears transient runtime state', () => {
    const initialState = createInitialGameState(buildTestConfig());
    const dirtyState: GameState = {
      ...initialState,
      teams: initialState.teams.map((team, index) => ({
        ...team,
        score: index === 0 ? 300 : -200,
      })),
      selectedClueId: 'clue-100',
      isQuestionRevealed: true,
      notification: {
        id: 'notice-1',
        tone: 'warning',
        variant: 'featured',
        title: 'Board Update',
        message: 'Testing reset behavior.',
        expiresAt: Date.now() + 1000,
      },
    };

    const resetState = resetScores(dirtyState);

    expect(resetState.teams.map((team) => team.score)).toEqual([0, 0]);
    expect(resetState.selectedClueId).toBeNull();
    expect(resetState.isQuestionRevealed).toBe(false);
    expect(resetState.notification).toBeNull();
  });

  it('starts Final Jeopardy with only eligible teams when non-positive scores are excluded', () => {
    const config = buildTestConfig();
    const initialState = createInitialGameState(config);
    const preparedState: GameState = {
      ...initialState,
      teams: [
        { id: 'team-1', name: 'Blue Team', score: 400 },
        { id: 'team-2', name: 'Gold Team', score: 0 },
      ],
    };

    const nextState = startFinalJeopardy(preparedState, config);

    expect(nextState.finalJeopardy?.eligibleTeamIds).toEqual(['team-1']);
    expect(nextState.selectedClueId).toBeNull();
  });
});
