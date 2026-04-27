import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';

const GAME_OVER_DISMISS_MS = 5 * 60 * 1_000; // 5 minutes
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1_000; // 30 minutes

export function useGameTimers(): void {
  const update = useGameStore((s) => s.update);
  const clearUpdate = useGameStore((s) => s.clearUpdate);

  const gameOverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Game-over dismiss timer: fires 5 min after receiving a 'final' update
  useEffect(() => {
    if (gameOverTimerRef.current) {
      clearTimeout(gameOverTimerRef.current);
      gameOverTimerRef.current = null;
    }

    if (update?.trackingMode === 'final') {
      gameOverTimerRef.current = setTimeout(() => {
        clearUpdate();
      }, GAME_OVER_DISMISS_MS);
    }

    return () => {
      if (gameOverTimerRef.current) {
        clearTimeout(gameOverTimerRef.current);
      }
    };
  }, [update, clearUpdate]);

  // Inactivity safety-net timer: reset on every non-null update
  useEffect(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }

    if (update !== null) {
      inactivityTimerRef.current = setTimeout(() => {
        clearUpdate();
      }, INACTIVITY_TIMEOUT_MS);
    }

    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [update, clearUpdate]);
}
