import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { GameUpdate } from '../game-update';

export type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting';

const FOUR_HOURS = 4 * 60 * 60 * 1000;

interface GameStore {
  update: GameUpdate | null;
  connectionStatus: ConnectionStatus;
  /** pitcher.id from the most recent PitchingSubstitutionEvent for the current game, or null. */
  pitchingChangeId: number | null;
  /** Epoch ms timestamp of the last game-update received. null if no cached data. */
  lastUpdatedAt: number | null;
  setUpdate: (update: GameUpdate) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  clearUpdate: () => void;
  setPitchingChange: (pitcherId: number) => void;
}

export const useGameStore = create<GameStore>()(
  devtools(
    persist(
      (set) => ({
        update: null,
        connectionStatus: 'disconnected',
        pitchingChangeId: null,
        lastUpdatedAt: null,

        setUpdate: (update) => set({ update, lastUpdatedAt: Date.now() }, false, 'setUpdate'),

        setConnectionStatus: (connectionStatus) =>
          set({ connectionStatus }, false, 'setConnectionStatus'),

        clearUpdate: () =>
          set({ update: null, pitchingChangeId: null, lastUpdatedAt: null }, false, 'clearUpdate'),

        setPitchingChange: (pitcherId) =>
          set({ pitchingChangeId: pitcherId }, false, 'setPitchingChange'),
      }),
      {
        name: 'game-store',
        partialize: (state) => ({
          update: state.update,
          lastUpdatedAt: state.lastUpdatedAt,
        }),
        onRehydrateStorage: () => (state) => {
          if (!state?.lastUpdatedAt) return;
          if (Date.now() - state.lastUpdatedAt > FOUR_HOURS) {
            state.update = null;
            state.lastUpdatedAt = null;
          }
        },
      }
    ),
    { name: 'GameStore' }
  )
);
