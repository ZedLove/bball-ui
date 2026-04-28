import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { io } from 'socket.io-client';
import { useSocket } from './useSocket';
import { useGameStore } from '../store/gameStore';
import type { GameUpdate } from '../game-update';
import type { GameEventsPayload } from '../game-events';

// Build a controllable mock socket
const mockOn = vi.fn();
const mockDisconnect = vi.fn();
const mockSocket = { on: mockOn, disconnect: mockDisconnect };

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => mockSocket),
}));

describe('useSocket', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useGameStore.setState({
      update: null,
      connectionStatus: 'disconnected',
      pitchingChangeId: null,
    });
  });

  it('calls io() with VITE_SOCKET_URL on mount', () => {
    renderHook(() => useSocket());
    expect(io).toHaveBeenCalledWith(import.meta.env.VITE_SOCKET_URL, expect.any(Object));
  });

  it('sets connectionStatus to connected on connect event', () => {
    renderHook(() => useSocket());

    const connectHandler = mockOn.mock.calls.find(([event]) => event === 'connect')?.[1];
    connectHandler?.();

    expect(useGameStore.getState().connectionStatus).toBe('connected');
  });

  it('sets connectionStatus to reconnecting on disconnect event', () => {
    renderHook(() => useSocket());

    const disconnectHandler = mockOn.mock.calls.find(([event]) => event === 'disconnect')?.[1];
    disconnectHandler?.();

    expect(useGameStore.getState().connectionStatus).toBe('reconnecting');
  });

  it('calls setUpdate when game-update event fires', () => {
    renderHook(() => useSocket());

    const gameUpdateHandler = mockOn.mock.calls.find(([event]) => event === 'game-update')?.[1];

    const mockUpdate = { trackingMode: 'live' } as GameUpdate;
    gameUpdateHandler?.(mockUpdate);

    expect(useGameStore.getState().update?.trackingMode).toBe('live');
  });

  it('sets pitchingChangeId on pitching-substitution game-event', () => {
    renderHook(() => useSocket());

    const gameEventsHandler = mockOn.mock.calls.find(([event]) => event === 'game-events')?.[1];

    const payload: GameEventsPayload = {
      gamePk: 717171,
      events: [
        {
          category: 'pitching-substitution',
          gamePk: 717171,
          atBatIndex: 15,
          inning: 5,
          halfInning: 'top',
          battingTeam: 'TOR',
          defendingTeam: 'NYM',
          eventType: 'pitching_substitution',
          description: 'Pitching Change: Blake Snell replaces Max Fried.',
          player: { id: 800002, fullName: 'Blake Snell' },
        },
      ],
    };
    gameEventsHandler?.(payload);

    expect(useGameStore.getState().pitchingChangeId).toBe(800002);
  });

  it('disconnects socket on unmount', () => {
    const { unmount } = renderHook(() => useSocket());
    unmount();
    expect(mockDisconnect).toHaveBeenCalledOnce();
  });
});
