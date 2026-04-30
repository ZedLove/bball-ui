import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { EventsFeed } from './EventsFeed';
import type { GameEvent } from '../game-events';

function makeSubstitution(overrides: Partial<GameEvent> = {}): GameEvent {
  return {
    category: 'pitching-substitution',
    gamePk: 717171,
    atBatIndex: 1,
    inning: 3,
    halfInning: 'top',
    battingTeam: 'TOR',
    defendingTeam: 'NYM',
    eventType: 'pitching_substitution',
    description: 'Blake Snell replaces Max Fried.',
    player: { id: 800002, fullName: 'Blake Snell' },
    ...overrides,
  } as GameEvent;
}

function makePA(isScoringPlay: boolean, description = 'Strikeout.'): GameEvent {
  return {
    category: 'plate-appearance-completed',
    gamePk: 717171,
    atBatIndex: 2,
    inning: 3,
    halfInning: 'top',
    battingTeam: 'TOR',
    defendingTeam: 'NYM',
    eventType: 'strikeout',
    description,
    isScoringPlay,
    rbi: isScoringPlay ? 1 : 0,
    batter: { id: 1, fullName: 'Test Batter' },
    pitcher: { id: 2, fullName: 'Test Pitcher' },
    pitchSequence: [],
  };
}

describe('EventsFeed', () => {
  it('renders "No events yet." when events is empty', () => {
    render(<EventsFeed events={[]} />);
    expect(screen.getByText('No events yet.')).toBeInTheDocument();
  });

  it('renders event descriptions', () => {
    render(<EventsFeed events={[makeSubstitution()]} />);
    expect(screen.getByText('Blake Snell replaces Max Fried.')).toBeInTheDocument();
  });

  it('renders inning badge in T/B format', () => {
    render(<EventsFeed events={[makeSubstitution({ inning: 5, halfInning: 'bottom' })]} />);
    expect(screen.getByText('B5')).toBeInTheDocument();
  });

  it('renders P-SUB label for pitching substitution', () => {
    render(<EventsFeed events={[makeSubstitution()]} />);
    expect(screen.getByText('P-SUB')).toBeInTheDocument();
  });

  it('renders O-SUB label for offensive substitution', () => {
    render(
      <EventsFeed
        events={[
          {
            category: 'offensive-substitution',
            gamePk: 717171,
            atBatIndex: 3,
            inning: 4,
            halfInning: 'top',
            battingTeam: 'TOR',
            defendingTeam: 'NYM',
            eventType: 'offensive_substitution',
            description: 'Pinch hitter.',
            player: { id: 99, fullName: 'Pinch Hitter' },
          },
        ]}
      />
    );
    expect(screen.getByText('O-SUB')).toBeInTheDocument();
  });

  it('shows All tab and disabled Scoring tab when no scoring plays', () => {
    render(<EventsFeed events={[makePA(false)]} />);
    const scoringBtn = screen.getByRole('button', { name: 'Scoring' });
    expect(scoringBtn).toBeDisabled();
  });

  it('enables Scoring tab when scoring plays exist', () => {
    render(<EventsFeed events={[makePA(true, 'Home run!')]} />);
    expect(screen.getByRole('button', { name: 'Scoring' })).not.toBeDisabled();
  });

  it('filters to scoring plays + all subs when Scoring tab active', async () => {
    const events: GameEvent[] = [
      makePA(false, 'Strikeout.'),
      makePA(true, 'Home run!'),
      makeSubstitution({ description: 'Pitcher change.' }),
    ];
    render(<EventsFeed events={events} />);
    await userEvent.click(screen.getByRole('button', { name: 'Scoring' }));

    expect(screen.getByText('Home run!')).toBeInTheDocument();
    expect(screen.getByText('Pitcher change.')).toBeInTheDocument();
    expect(screen.queryByText('Strikeout.')).not.toBeInTheDocument();
  });

  it('shows all events when All tab is active', async () => {
    const events: GameEvent[] = [makePA(false, 'Strikeout.'), makePA(true, 'Home run!')];
    render(<EventsFeed events={events} />);

    expect(screen.getByText('Strikeout.')).toBeInTheDocument();
    expect(screen.getByText('Home run!')).toBeInTheDocument();
  });

  it('applies scoring highlight border to scoring play rows', () => {
    render(<EventsFeed events={[makePA(true, 'Home run!')]} />);
    // The scoring row has a border-l-2 class
    const row = screen.getByText('Home run!').closest('.border-l-2');
    expect(row).toBeInTheDocument();
  });
});
