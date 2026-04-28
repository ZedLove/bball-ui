import { render, screen } from '@testing-library/react';
import { beforeEach } from 'vitest';
import { PitcherInfo } from './PitcherInfo';
import { useGameStore } from '../store/gameStore';

const mockPitcher = {
  id: 800001,
  fullName: 'Max Fried',
  pitchesThrown: 43,
  strikes: 28,
  balls: 15,
  usage: [
    { typeCode: 'FF', typeName: 'Four-Seam Fastball', count: 26, pct: 60 },
    { typeCode: 'SL', typeName: 'Slider', count: 11, pct: 25 },
    { typeCode: 'CH', typeName: 'Changeup', count: 6, pct: 15 },
  ],
};

describe('PitcherInfo', () => {
  beforeEach(() => {
    useGameStore.setState({ pitchingChangeId: null });
  });

  it('shows pitcher name', () => {
    render(<PitcherInfo pitcher={mockPitcher} />);
    expect(screen.getByText('Pitching: Max Fried')).toBeInTheDocument();
  });

  it('shows pitch count and strike/ball breakdown', () => {
    render(<PitcherInfo pitcher={mockPitcher} />);
    expect(screen.getByText('43 pitches · 28 S · 15 B')).toBeInTheDocument();
  });

  it('shows pitch type usage breakdown', () => {
    render(<PitcherInfo pitcher={mockPitcher} />);
    expect(screen.getByText('FF 60% SL 25% CH 15%')).toBeInTheDocument();
  });

  it('does not show usage line when usage is empty', () => {
    render(<PitcherInfo pitcher={{ ...mockPitcher, usage: [] }} />);
    expect(screen.queryByText(/FF/)).not.toBeInTheDocument();
  });

  it('shows NEW badge when pitchingChangeId matches pitcher.id', () => {
    useGameStore.setState({ pitchingChangeId: mockPitcher.id });
    render(<PitcherInfo pitcher={mockPitcher} />);
    expect(screen.getByText('NEW')).toBeInTheDocument();
  });

  it('does not show NEW badge when pitchingChangeId does not match', () => {
    useGameStore.setState({ pitchingChangeId: 999 });
    render(<PitcherInfo pitcher={mockPitcher} />);
    expect(screen.queryByText('NEW')).not.toBeInTheDocument();
  });

  it('does not show NEW badge when pitchingChangeId is null', () => {
    render(<PitcherInfo pitcher={mockPitcher} />);
    expect(screen.queryByText('NEW')).not.toBeInTheDocument();
  });
});
