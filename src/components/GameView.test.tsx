import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { GameView } from './GameView';
import { makeUpdate } from '../test/fixtures';

// Mock StrikeZonePanel to avoid ParentSize jsdom issues
vi.mock('./StrikeZonePanel', () => ({
  StrikeZonePanel: () => <div data-testid="strike-zone-panel" />,
}));

describe('GameView', () => {
  it('renders Scoreboard in all modes', () => {
    render(<GameView update={makeUpdate()} />);
    expect(screen.getByText('TOR')).toBeInTheDocument();
  });

  it('renders OutsDisplay when live and outsRemaining is set', () => {
    render(<GameView update={makeUpdate({ trackingMode: 'live', outsRemaining: 2 })} />);
    expect(screen.getByRole('img', { name: /out/i })).toBeInTheDocument();
  });

  it('renders RunsNeeded when live and runsNeeded is set', () => {
    render(
      <GameView
        update={makeUpdate({
          trackingMode: 'live',
          outsRemaining: null,
          totalOutsRemaining: null,
          runsNeeded: 2,
          currentPitcher: null,
        })}
      />
    );
    expect(screen.getByText('runs needed to take the lead')).toBeInTheDocument();
    expect(screen.getByLabelText('2 runs needed to take the lead')).toBeInTheDocument();
  });

  it('renders StrikeZonePanel in live mode', () => {
    render(
      <GameView
        update={makeUpdate({
          trackingMode: 'live',
          outsRemaining: null,
          totalOutsRemaining: null,
          runsNeeded: null,
          currentPitcher: null,
        })}
      />
    );
    expect(screen.getByTestId('strike-zone-panel')).toBeInTheDocument();
  });

  it('renders PitcherInfo when currentPitcher is set in live mode (defending)', () => {
    render(<GameView update={makeUpdate({ trackingMode: 'live', outsRemaining: 2 })} />);
    expect(screen.getByText('Pitching: Max Fried')).toBeInTheDocument();
  });

  it('renders PitcherInfo when currentPitcher is set in live mode (batting)', () => {
    render(
      <GameView
        update={makeUpdate({
          trackingMode: 'live',
          outsRemaining: null,
          totalOutsRemaining: null,
          runsNeeded: null,
        })}
      />
    );
    expect(screen.getByText('Pitching: Max Fried')).toBeInTheDocument();
  });

  it('does not render PitcherInfo when currentPitcher is null', () => {
    render(
      <GameView
        update={makeUpdate({
          trackingMode: 'live',
          outsRemaining: null,
          totalOutsRemaining: null,
          runsNeeded: null,
          currentPitcher: null,
        })}
      />
    );
    expect(screen.queryByText(/Pitching:/)).not.toBeInTheDocument();
  });

  it('renders BetweenInningsView for trackingMode between-innings', () => {
    render(
      <GameView
        update={makeUpdate({
          trackingMode: 'between-innings',
          inning: { number: 5, half: 'Middle', ordinal: '5th' },
        })}
      />
    );
    expect(screen.getByText('Half inning over')).toBeInTheDocument();
  });

  it('renders GameOverView for trackingMode final', () => {
    render(<GameView update={makeUpdate({ trackingMode: 'final', gameStatus: 'Final' })} />);
    expect(screen.getByText('FINAL')).toBeInTheDocument();
  });

  it('renders DelayBanner when isDelayed is true', () => {
    render(
      <GameView
        update={makeUpdate({
          isDelayed: true,
          delayDescription: 'Delayed: Rain',
        })}
      />
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Delayed: Rain')).toBeInTheDocument();
  });

  it('does not render DelayBanner when not delayed', () => {
    render(<GameView update={makeUpdate({ isDelayed: false })} />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
