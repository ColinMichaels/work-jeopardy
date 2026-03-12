import {
  getEligibleFinalJeopardyTeams,
  validateFinalJeopardyWager,
} from '../src/lib/final-jeopardy';
import type { FinalJeopardyConfig } from '../src/types/game-config';

const baseConfig: FinalJeopardyConfig = {
  enabled: true,
  category: 'Final Category',
  clue: 'Final Clue',
  correctResponse: 'What is coverage?',
  allowNonPositiveScores: false,
};

describe('final jeopardy helpers', () => {
  it('filters out non-positive teams when configured', () => {
    const teams = [
      { id: 'team-1', name: 'Blue Team', score: 1200 },
      { id: 'team-2', name: 'Gold Team', score: 0 },
      { id: 'team-3', name: 'Green Team', score: -100 },
    ];

    expect(getEligibleFinalJeopardyTeams(teams, baseConfig).map((team) => team.id)).toEqual([
      'team-1',
    ]);
  });

  it('allows all teams when non-positive scores are permitted', () => {
    const teams = [
      { id: 'team-1', name: 'Blue Team', score: 1200 },
      { id: 'team-2', name: 'Gold Team', score: 0 },
    ];

    expect(
      getEligibleFinalJeopardyTeams(teams, {
        ...baseConfig,
        allowNonPositiveScores: true,
      }).map((team) => team.id),
    ).toEqual(['team-1', 'team-2']);
  });

  it('validates whole-number wagers within the allowed range', () => {
    expect(validateFinalJeopardyWager('', 500)).toEqual({
      ok: false,
      error: 'Enter a wager.',
    });

    expect(validateFinalJeopardyWager('12.5', 500)).toEqual({
      ok: false,
      error: 'Use a whole number wager.',
    });

    expect(validateFinalJeopardyWager('700', 500)).toEqual({
      ok: false,
      error: 'Wager must be 500 or less.',
    });

    expect(validateFinalJeopardyWager('500', 500)).toEqual({
      ok: true,
      value: 500,
    });
  });
});
