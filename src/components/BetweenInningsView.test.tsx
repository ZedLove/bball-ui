import { render, screen } from '@testing-library/react';
import { BetweenInningsView } from './BetweenInningsView';
import { makeUpdate } from '../test/fixtures';

describe('BetweenInningsView', () => {
  it('shows home team batting next during Middle', () => {
    render(
      <BetweenInningsView
        update={makeUpdate({
          trackingMode: 'between-innings',
          inning: { number: 5, half: 'Middle', ordinal: '5th' },
        })}
      />
    );
    expect(screen.getByText('NYM batting next')).toBeInTheDocument();
  });

  it('shows away team batting next during End', () => {
    render(
      <BetweenInningsView
        update={makeUpdate({
          trackingMode: 'between-innings',
          inning: { number: 5, half: 'End', ordinal: '5th' },
        })}
      />
    );
    expect(screen.getByText('TOR batting next')).toBeInTheDocument();
  });

  it('shows upcoming pitcher when available', () => {
    render(
      <BetweenInningsView
        update={makeUpdate({
          trackingMode: 'between-innings',
          upcomingPitcher: { id: 800002, fullName: 'Blake Snell' },
        })}
      />
    );
    expect(screen.getByText('Pitching next: Blake Snell')).toBeInTheDocument();
  });

  it('does not show pitcher line when upcomingPitcher is null', () => {
    render(
      <BetweenInningsView
        update={makeUpdate({
          trackingMode: 'between-innings',
          upcomingPitcher: null,
        })}
      />
    );
    expect(screen.queryByText(/Pitching next/)).not.toBeInTheDocument();
  });
});
