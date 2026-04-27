import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from './gameStore';
import type { GameUpdate } from '../game-update';

// Minimal valid GameUpdate fixture
const mockUpdate: GameUpdate = {
  gameStatus: 'In Progress',
  teams: {
    away: { id: 141, name: 'Toronto Blue Jays', abbreviation: 'TOR' },
    home: { id: 121, name: 'New York Mets', abbreviation: 'NYM' },
  },
  score: { away: 3, home: 2 },
  inning: { number: 5, half: 'Top', ordinal: '5th' },
  outs: 1,
  defendingTeam: 'NYM',
  battingTeam: 'TOR',
  isDelayed: false,
  delayDescription: null,
  isExtraInnings: false,
  scheduledInnings: 9,
  trackingMode: 'outs',
  outsRemaining: 2,
  totalOutsRemaining: 14,
  runsNeeded: null,
  currentPitcher: { id: 800001, fullName: 'Max Fried' },
  pitchingChange: false,
  inningBreakLength: null,
};

describe('gameStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useGameStore.setState({ update: null, connectionStatus: 'disconnected' });
  });

  it('starts with null update and disconnected status', () => {
    const { update, connectionStatus } = useGameStore.getState();
    expect(update).toBeNull();
    expect(connectionStatus).toBe('disconnected');
  });

  it('setUpdate stores the game update', () => {
    useGameStore.getState().setUpdate(mockUpdate);
    expect(useGameStore.getState().update).toEqual(mockUpdate);
  });

  it('clearUpdate resets update to null', () => {
    useGameStore.getState().setUpdate(mockUpdate);
    useGameStore.getState().clearUpdate();
    expect(useGameStore.getState().update).toBeNull();
  });

  it('setConnectionStatus updates the connection state', () => {
    useGameStore.getState().setConnectionStatus('connected');
    expect(useGameStore.getState().connectionStatus).toBe('connected');
  });
});
