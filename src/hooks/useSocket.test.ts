import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { io } from 'socket.io-client';
import { useSocket } from './useSocket';
import { useGameStore } from '../store/gameStore';
import type { GameUpdate } from '../game-update';

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
    useGameStore.setState({ update: null, connectionStatus: 'disconnected' });
  });

  it('calls io() with VITE_SOCKET_URL on mount', () => {
    renderHook(() => useSocket());
    expect(io).toHaveBeenCalledWith(import.meta.env.VITE_SOCKET_URL, expect.any(Object));
  });

  it('sets connectionStatus to connected on connect event', () => {
    renderHook(() => useSocket());

    // Find the 'connect' handler registered via socket.on
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

    const mockUpdate = { trackingMode: 'outs' } as GameUpdate;
    gameUpdateHandler?.(mockUpdate);

    expect(useGameStore.getState().update?.trackingMode).toBe('outs');
  });

  it('disconnects socket on unmount', () => {
    const { unmount } = renderHook(() => useSocket());
    unmount();
    expect(mockDisconnect).toHaveBeenCalledOnce();
  });
});
