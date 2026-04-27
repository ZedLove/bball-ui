import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useGameStore } from '../store/gameStore';
import type { GameUpdate } from '../game-update';

export function useSocket(): void {
  const setUpdate = useGameStore((s) => s.setUpdate);
  const setConnectionStatus = useGameStore((s) => s.setConnectionStatus);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_SOCKET_URL, {
      // Reconnect indefinitely; socket.io-client default is Infinity but be explicit.
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
    });

    socket.on('connect', () => setConnectionStatus('connected'));

    // Any disconnect triggers the reconnecting state — socket.io-client handles
    // reconnection automatically. We only show 'disconnected' after giving up.
    socket.on('disconnect', () => setConnectionStatus('reconnecting'));

    socket.on('game-update', (update: GameUpdate) => setUpdate(update));

    return () => {
      socket.disconnect();
    };
    // Store actions are stable references from Zustand — safe to omit from deps.
  }, []);
}
