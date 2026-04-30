import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { GameUpdate } from '../game-update';
import type { GameEvent } from '../game-events';

export type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting';

const FOUR_HOURS = 4 * 60 * 60 * 1000;
const MAX_EVENTS = 20;

interface GameStore {
  update: GameUpdate | null;
  connectionStatus: ConnectionStatus;
  /** pitcher.id from the most recent PitchingSubstitutionEvent for the current game, or null. */
  pitchingChangeId: number | null;
  /** Epoch ms timestamp of the last game-update received. null if no cached data. */
  lastUpdatedAt: number | null;
  /** Accumulated game events, newest-first. Capped at MAX_EVENTS. Not persisted. */
  gameEvents: GameEvent[];
  setUpdate: (update: GameUpdate) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  clearUpdate: () => void;
  setPitchingChange: (pitcherId: number) => void;
  addEvents: (events: GameEvent[]) => void;
}

export const useGameStore = create<GameStore>()(
  devtools(
    persist(
      (set) => ({
        update: null,
        connectionStatus: 'disconnected',
        pitchingChangeId: null,
        lastUpdatedAt: null,
        gameEvents: [],

        setUpdate: (update) =>
          set(
            (state) => {
              const isNewGame = state.update?.gamePk !== update.gamePk;
              return {
                update,
                lastUpdatedAt: Date.now(),
                // Clear game-specific state when a new game starts
                gameEvents: isNewGame ? [] : state.gameEvents,
                pitchingChangeId: isNewGame ? null : state.pitchingChangeId,
              };
            },
            false,
            'setUpdate'
          ),

        setConnectionStatus: (connectionStatus) =>
          set({ connectionStatus }, false, 'setConnectionStatus'),

        clearUpdate: () =>
          set(
            { update: null, pitchingChangeId: null, lastUpdatedAt: null, gameEvents: [] },
            false,
            'clearUpdate'
          ),

        setPitchingChange: (pitcherId) =>
          set({ pitchingChangeId: pitcherId }, false, 'setPitchingChange'),

        addEvents: (events) =>
          set(
            (state) => ({
              gameEvents: [...events, ...state.gameEvents].slice(0, MAX_EVENTS),
            }),
            false,
            'addEvents'
          ),
      }),
      {
        name: 'game-store-v2',
        partialize: (state) => ({
          update: state.update,
          lastUpdatedAt: state.lastUpdatedAt,
        }),
        onRehydrateStorage: () => (state) => {
          if (!state?.lastUpdatedAt) return;
          if (Date.now() - state.lastUpdatedAt > FOUR_HOURS) {
            state.update = null;
            state.lastUpdatedAt = null;
            return;
          }
          // Clear persisted update if it has an unrecognised trackingMode (old schema)
          const validModes: string[] = ['live', 'between-innings', 'final'];
          if (state.update !== null && !validModes.includes(state.update.trackingMode as string)) {
            state.update = null;
            state.lastUpdatedAt = null;
          }
        },
      }
    ),
    { name: 'GameStore' }
  )
);
