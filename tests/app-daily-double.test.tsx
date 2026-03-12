import { fireEvent, render, screen } from '@testing-library/react';
import App from '../src/App';

describe('Daily Double presentation flow', () => {
  it('shows the featured player-facing Daily Double message when the clue is selected', async () => {
    window.history.replaceState({}, '', '/?session=test-session');

    render(<App />);

    const dailyDoubleTile = screen.getAllByRole('button', { name: '$500' })[0];
    fireEvent.click(dailyDoubleTile);

    expect(await screen.findByText('Special Event')).toBeInTheDocument();
    expect(
      await screen.findByText('Blue Team found the Daily Double in TypeScript for $500.'),
    ).toBeInTheDocument();
  });
});
