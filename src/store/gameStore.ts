import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { GameUpdate } from '../game-update';

export type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting';

interface GameStore {
  update: GameUpdate | null;
  connectionStatus: ConnectionStatus;
  setUpdate: (update: GameUpdate) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  clearUpdate: () => void;
}

export const useGameStore = create<GameStore>()(
  devtools(
    (set) => ({
      update: null,
      connectionStatus: 'disconnected',

      setUpdate: (update) => set({ update }, false, 'setUpdate'),

      setConnectionStatus: (connectionStatus) =>
        set({ connectionStatus }, false, 'setConnectionStatus'),

      clearUpdate: () => set({ update: null }, false, 'clearUpdate'),
    }),
    { name: 'GameStore' }
  )
);
