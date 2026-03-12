import { render, screen } from '@testing-library/react';
import { ScoreBoard } from '../src/components/ScoreBoard';

describe('ScoreBoard', () => {
  it('renders negative scores with the muted red modifier class', () => {
    render(
      <ScoreBoard
        teams={[
          { id: 'team-1', name: 'Blue Team', score: -200 },
          { id: 'team-2', name: 'Gold Team', score: 300 },
        ]}
        activeTeamId="team-2"
        isInteractive={false}
        onSelectTeam={() => undefined}
      />,
    );

    expect(screen.getByText('-$200')).toHaveClass('score-value--negative');
    expect(screen.getByText('$300')).not.toHaveClass('score-value--negative');
  });
});
