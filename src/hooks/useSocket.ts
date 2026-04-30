import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useGameStore } from '../store/gameStore';
import type { GameUpdate } from '../game-update';
import type { GameEventsPayload } from '../game-events';

export function useSocket(): void {
  const setUpdate = useGameStore((s) => s.setUpdate);
  const setConnectionStatus = useGameStore((s) => s.setConnectionStatus);
  const setPitchingChange = useGameStore((s) => s.setPitchingChange);
  const addEvents = useGameStore((s) => s.addEvents);

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

    socket.on('game-events', (payload: GameEventsPayload) => {
      // Guard against late/out-of-order events from a previous game
      const currentGamePk = useGameStore.getState().update?.gamePk;
      if (currentGamePk !== undefined && payload.gamePk !== currentGamePk) return;
      addEvents(payload.events);
      for (const event of payload.events) {
        if (event.category === 'pitching-substitution') {
          setPitchingChange(event.player.id);
        }
      }
    });

    return () => {
      socket.disconnect();
    };
    // Store actions are stable references from Zustand — safe to omit from deps.
  }, []);
}
