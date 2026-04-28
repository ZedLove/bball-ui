/**
 * Subset of the backend's game-events contract.
 * Only includes event types the frontend currently consumes.
 * Source of truth: ~/workspace/bball/src/server/socket-events.ts
 */

export interface PitchingSubstitutionEvent {
  category: 'pitching-substitution';
  gamePk: number;
  atBatIndex: number;
  inning: number;
  halfInning: 'top' | 'bottom';
  battingTeam: string;
  defendingTeam: string;
  eventType: string;
  description: string;
  player: { id: number; fullName: string };
}

/** Discriminated union — extend as we consume more event types. */
export type GameEvent = PitchingSubstitutionEvent;

export interface GameEventsPayload {
  gamePk: number;
  events: GameEvent[];
}
