/**
 * Frontend game-events socket contract.
 * Mirrors ~/workspace/bball/src/server/socket-events.ts — keep in sync.
 */

import type { PitchEvent } from './game-update';

// ---------------------------------------------------------------------------
// Shared base fields present on every game event
// ---------------------------------------------------------------------------

interface GameEventBase {
  gamePk: number;
  atBatIndex: number;
  inning: number;
  /** Lowercase — matches the halfInning field in the MLB live feed. */
  halfInning: 'top' | 'bottom';
  battingTeam: string;
  defendingTeam: string;
  eventType: string;
  description: string;
  category: string;
}

// ---------------------------------------------------------------------------
// Plate-appearance-completed events
// ---------------------------------------------------------------------------

/**
 * Emitted for every completed at-bat.
 * Scoring plays are identified by isScoringPlay: true.
 */
export interface PlateAppearanceCompletedEvent extends GameEventBase {
  category: 'plate-appearance-completed';
  isScoringPlay: boolean;
  rbi: number;
  batter: { id: number; fullName: string };
  pitcher: { id: number; fullName: string };
  /**
   * Full pitch sequence for the at-bat, in chronological order.
   * Empty for intent walks.
   */
  pitchSequence: PitchEvent[];
}

// ---------------------------------------------------------------------------
// Substitution events
// ---------------------------------------------------------------------------

interface SubstitutionEventBase extends GameEventBase {
  player: { id: number; fullName: string };
}

export interface PitchingSubstitutionEvent extends SubstitutionEventBase {
  category: 'pitching-substitution';
}

export interface OffensiveSubstitutionEvent extends SubstitutionEventBase {
  category: 'offensive-substitution';
}

export interface DefensiveSubstitutionEvent extends SubstitutionEventBase {
  category: 'defensive-substitution';
}

// ---------------------------------------------------------------------------
// GameEvent discriminated union
// ---------------------------------------------------------------------------

export type GameEvent =
  | PlateAppearanceCompletedEvent
  | PitchingSubstitutionEvent
  | OffensiveSubstitutionEvent
  | DefensiveSubstitutionEvent;

export interface GameEventsPayload {
  gamePk: number;
  events: GameEvent[];
}
