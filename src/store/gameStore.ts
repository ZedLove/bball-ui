import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { GameUpdate } from '../game-update';

export type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting';

interface GameStore {
  update: GameUpdate | null;
  connectionStatus: ConnectionStatus;
  /** pitcher.id from the most recent PitchingSubstitutionEvent for the current game, or null. */
  pitchingChangeId: number | null;
  setUpdate: (update: GameUpdate) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  clearUpdate: () => void;
  setPitchingChange: (pitcherId: number) => void;
}

export const useGameStore = create<GameStore>()(
  devtools(
    (set) => ({
      update: null,
      connectionStatus: 'disconnected',
      pitchingChangeId: null,

      setUpdate: (update) => set({ update }, false, 'setUpdate'),

      setConnectionStatus: (connectionStatus) =>
        set({ connectionStatus }, false, 'setConnectionStatus'),

      clearUpdate: () => set({ update: null, pitchingChangeId: null }, false, 'clearUpdate'),

      setPitchingChange: (pitcherId) =>
        set({ pitchingChangeId: pitcherId }, false, 'setPitchingChange'),
    }),
    { name: 'GameStore' }
  )
);
