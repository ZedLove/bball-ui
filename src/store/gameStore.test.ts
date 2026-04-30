import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGameStore } from './gameStore';
import type { GameUpdate } from '../game-update';
import type { GameEvent } from '../game-events';

// Minimal valid GameUpdate fixture
const mockUpdate: GameUpdate = {
  gameStatus: 'In Progress',
  gamePk: 717171,
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
  trackingMode: 'live',
  outsRemaining: 2,
  totalOutsRemaining: 14,
  runsNeeded: null,
  currentPitcher: {
    id: 800001,
    fullName: 'Max Fried',
    pitchesThrown: 43,
    strikes: 28,
    balls: 15,
    usage: [],
  },
  pitchHistory: [],
  upcomingPitcher: null,
  atBat: null,
  trackedTeamAbbr: 'TOR',
  venueId: null,
  venueFieldInfo: null,
};

describe('gameStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useGameStore.setState({
      update: null,
      connectionStatus: 'disconnected',
      pitchingChangeId: null,
      lastUpdatedAt: null,
      gameEvents: [],
    });
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

  it('sets pitchingChangeId via setPitchingChange', () => {
    useGameStore.getState().setPitchingChange(800001);
    expect(useGameStore.getState().pitchingChangeId).toBe(800001);
  });

  it('clears pitchingChangeId on clearUpdate', () => {
    useGameStore.setState({ pitchingChangeId: 800001 });
    useGameStore.getState().clearUpdate();
    expect(useGameStore.getState().pitchingChangeId).toBeNull();
  });

  it('setUpdate records lastUpdatedAt as a recent timestamp', () => {
    const before = Date.now();
    useGameStore.getState().setUpdate(mockUpdate);
    const after = Date.now();
    const { lastUpdatedAt } = useGameStore.getState();
    expect(lastUpdatedAt).toBeGreaterThanOrEqual(before);
    expect(lastUpdatedAt).toBeLessThanOrEqual(after);
  });

  it('clearUpdate clears both update and lastUpdatedAt', () => {
    useGameStore.getState().setUpdate(mockUpdate);
    useGameStore.getState().clearUpdate();
    expect(useGameStore.getState().update).toBeNull();
    expect(useGameStore.getState().lastUpdatedAt).toBeNull();
  });

  it('persist serialises only update and lastUpdatedAt', () => {
    useGameStore.getState().setUpdate(mockUpdate);
    useGameStore.getState().setConnectionStatus('connected');
    useGameStore.getState().setPitchingChange(800001);

    const stored = JSON.parse(localStorage.getItem('game-store-v2') ?? '{}');
    expect(stored.state).toHaveProperty('update');
    expect(stored.state).toHaveProperty('lastUpdatedAt');
    expect(stored.state).not.toHaveProperty('connectionStatus');
    expect(stored.state).not.toHaveProperty('pitchingChangeId');
  });

  it('hydration discards data older than 4 hours', async () => {
    const FOUR_HOURS = 4 * 60 * 60 * 1000;
    const staleTimestamp = Date.now() - FOUR_HOURS - 1000;

    localStorage.setItem(
      'game-store-v2',
      JSON.stringify({
        state: { update: mockUpdate, lastUpdatedAt: staleTimestamp },
        version: 0,
      })
    );

    vi.resetModules();
    const { useGameStore: freshStore } = await import('./gameStore');
    // Wait for async rehydration
    await vi.waitFor(() => {
      expect(freshStore.getState().update).toBeNull();
    });
    expect(freshStore.getState().lastUpdatedAt).toBeNull();
  });

  it('hydration keeps data younger than 4 hours', async () => {
    const recentTimestamp = Date.now() - 1000;

    localStorage.setItem(
      'game-store-v2',
      JSON.stringify({
        state: { update: mockUpdate, lastUpdatedAt: recentTimestamp },
        version: 0,
      })
    );

    vi.resetModules();
    const { useGameStore: freshStore } = await import('./gameStore');
    await vi.waitFor(() => {
      expect(freshStore.getState().lastUpdatedAt).toBe(recentTimestamp);
    });
    expect(freshStore.getState().update).toEqual(mockUpdate);
  });

  it('addEvents prepends new events to gameEvents', () => {
    const event1: GameEvent = {
      category: 'pitching-substitution',
      gamePk: 717171,
      atBatIndex: 1,
      inning: 1,
      halfInning: 'top',
      battingTeam: 'TOR',
      defendingTeam: 'NYM',
      eventType: 'pitching_substitution',
      description: 'Max Fried pitching',
      player: { id: 800001, fullName: 'Max Fried' },
    };
    useGameStore.getState().addEvents([event1]);
    expect(useGameStore.getState().gameEvents).toHaveLength(1);
    expect(useGameStore.getState().gameEvents[0]).toEqual(event1);
  });

  it('addEvents caps gameEvents at MAX_EVENTS (20)', () => {
    const events: GameEvent[] = Array.from({ length: 15 }, (_, i) => ({
      category: 'pitching-substitution' as const,
      gamePk: 717171,
      atBatIndex: i,
      inning: 1,
      halfInning: 'top' as const,
      battingTeam: 'TOR',
      defendingTeam: 'NYM',
      eventType: 'pitching_substitution',
      description: `Event ${i}`,
      player: { id: i, fullName: `Pitcher ${i}` },
    }));
    useGameStore.getState().addEvents(events);
    // Add 10 more
    const more: GameEvent[] = Array.from({ length: 10 }, (_, i) => ({
      ...events[0],
      atBatIndex: 100 + i,
      description: `Extra ${i}`,
    }));
    useGameStore.getState().addEvents(more);
    expect(useGameStore.getState().gameEvents).toHaveLength(20);
  });

  it('setUpdate clears gameEvents when gamePk changes', () => {
    const event: GameEvent = {
      category: 'pitching-substitution',
      gamePk: 717171,
      atBatIndex: 1,
      inning: 1,
      halfInning: 'top',
      battingTeam: 'TOR',
      defendingTeam: 'NYM',
      eventType: 'pitching_substitution',
      description: 'Pitcher in',
      player: { id: 1, fullName: 'Pitcher A' },
    };
    useGameStore.getState().setUpdate(mockUpdate);
    useGameStore.getState().addEvents([event]);
    expect(useGameStore.getState().gameEvents).toHaveLength(1);

    // New game
    useGameStore.getState().setUpdate({ ...mockUpdate, gamePk: 999999 });
    expect(useGameStore.getState().gameEvents).toHaveLength(0);
  });

  it('clearUpdate clears gameEvents', () => {
    const event: GameEvent = {
      category: 'pitching-substitution',
      gamePk: 717171,
      atBatIndex: 1,
      inning: 1,
      halfInning: 'top',
      battingTeam: 'TOR',
      defendingTeam: 'NYM',
      eventType: 'pitching_substitution',
      description: 'Pitcher in',
      player: { id: 1, fullName: 'Pitcher A' },
    };
    useGameStore.getState().addEvents([event]);
    useGameStore.getState().clearUpdate();
    expect(useGameStore.getState().gameEvents).toHaveLength(0);
  });

  it('gameEvents are not persisted to localStorage', () => {
    const event: GameEvent = {
      category: 'pitching-substitution',
      gamePk: 717171,
      atBatIndex: 1,
      inning: 1,
      halfInning: 'top',
      battingTeam: 'TOR',
      defendingTeam: 'NYM',
      eventType: 'pitching_substitution',
      description: 'Pitcher in',
      player: { id: 1, fullName: 'Pitcher A' },
    };
    useGameStore.getState().setUpdate(mockUpdate);
    useGameStore.getState().addEvents([event]);

    const stored = JSON.parse(localStorage.getItem('game-store-v2') ?? '{}');
    expect(stored.state).not.toHaveProperty('gameEvents');
  });
});
