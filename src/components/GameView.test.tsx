import { render, screen } from '@testing-library/react';
import { GameView } from './GameView';
import { makeUpdate } from '../test/fixtures';

describe('GameView', () => {
  it('renders Scoreboard in all modes', () => {
    render(<GameView update={makeUpdate({ trackingMode: 'outs' })} />);
    expect(screen.getByText('TOR')).toBeInTheDocument();
  });

  it('renders OutsDisplay for trackingMode outs', () => {
    render(<GameView update={makeUpdate({ trackingMode: 'outs', outs: 1 })} />);
    expect(screen.getByText('2 outs remaining')).toBeInTheDocument();
  });

  it('renders RunsNeeded for trackingMode runs', () => {
    render(
      <GameView
        update={makeUpdate({ trackingMode: 'runs', runsNeeded: 2, isExtraInnings: true })}
      />
    );
    expect(screen.getByText('runs needed to take the lead')).toBeInTheDocument();
  });

  it('renders BetweenInningsView for trackingMode between-innings', () => {
    render(
      <GameView
        update={makeUpdate({
          trackingMode: 'between-innings',
          inning: { number: 5, half: 'Middle', ordinal: '5th' },
          inningBreakLength: 120,
        })}
      />
    );
    expect(screen.getByText('Half inning over')).toBeInTheDocument();
  });

  it('renders BattingView for trackingMode batting', () => {
    render(<GameView update={makeUpdate({ trackingMode: 'batting', battingTeam: 'NYM' })} />);
    expect(screen.getByText('NYM batting')).toBeInTheDocument();
  });
});
