/**
 * Payload emitted by the backend on the 'game-update' Socket.IO event.
 * Source of truth: ~/workspace/bball/src/scheduler/parser.ts
 * Keep this in sync with the backend whenever GameUpdate changes.
 */

export interface TeamInfo {
  id: number;
  name: string;
  abbreviation: string;
}

export interface GameUpdate {
  /** "In Progress", "Final", "Delayed: Rain", etc. */
  gameStatus: string;

  teams: {
    away: TeamInfo;
    home: TeamInfo;
  };

  score: {
    away: number;
    home: number;
  };

  inning: {
    number: number;
    /** 'Top' = away batting; 'Middle' = break after top; 'Bottom' = home batting; 'End' = break after bottom */
    half: 'Top' | 'Middle' | 'Bottom' | 'End';
    ordinal: string; // "5th", "10th", etc.
  };

  /** Current out count within the half-inning (0–2) */
  outs: number;

  /** Abbreviation of the team currently defending (or defending next during breaks) */
  defendingTeam: string;

  /** Abbreviation of the team currently batting (or batting next during breaks) */
  battingTeam: string;

  /** true when game is paused: rain delay, suspension, etc. */
  isDelayed: boolean;

  /** Human-readable delay reason from the API, e.g. "Delayed: Rain". null when not delayed. */
  delayDescription: string | null;

  /** true when currentInning > scheduledInnings */
  isExtraInnings: boolean;

  /** Innings originally scheduled (almost always 9) */
  scheduledInnings: number;

  /**
   * Determines which primary display the UI renders:
   *   'outs'            – target team is defending; emit every tick
   *   'runs'            – target team is batting in extra innings while tied/losing; emit every tick
   *   'batting'         – target team is batting in regulation; emit ONCE on transition
   *   'between-innings' – half-inning just ended; emit ONCE on transition
   *   'final'           – game has ended; emit ONCE on transition
   */
  trackingMode: 'outs' | 'runs' | 'batting' | 'between-innings' | 'final';

  /** 3 − current outs when defending. null in all other modes. */
  outsRemaining: number | null;

  /**
   * Total defensive outs remaining for the rest of the game (accounts for all future
   * half-innings the team will defend). null in extra innings or when tracking runs.
   */
  totalOutsRemaining: number | null;

  /** Runs needed to take the lead when batting in extras. null in all other modes. */
  runsNeeded: number | null;

  /** Current pitcher on the field. null when unavailable or not defending. */
  currentPitcher: { id: number; fullName: string } | null;

  /** true when the pitcher changed since the last emitted update. Always false from the parser — the scheduler sets this. */
  pitchingChange: boolean;

  /**
   * Between-inning break duration in seconds as reported by the API (usually 120).
   * Only set when trackingMode === 'between-innings'. null otherwise.
   */
  inningBreakLength: number | null;
}
