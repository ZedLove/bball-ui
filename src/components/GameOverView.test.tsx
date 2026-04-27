import { render, screen } from '@testing-library/react';
import { GameOverView } from './GameOverView';
import { makeUpdate } from '../test/fixtures';

it('shows FINAL badge and final score', () => {
  render(<GameOverView update={makeUpdate({ trackingMode: 'final', gameStatus: 'Final' })} />);
  expect(screen.getByText('FINAL')).toBeInTheDocument();
  // Scoreboard is embedded — team abbreviations appear
  expect(screen.getByText('TOR')).toBeInTheDocument();
  expect(screen.getByText('NYM')).toBeInTheDocument();
});

it('shows the checking-for-next-game message', () => {
  render(<GameOverView update={makeUpdate({ trackingMode: 'final' })} />);
  expect(screen.getByText('Checking for next game…')).toBeInTheDocument();
});
