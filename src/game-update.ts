/**
 * Payload emitted by the backend on the 'game-update' Socket.IO event.
 * Source of truth: ~/workspace/bball/src/server/socket-events.ts
 * Keep this in sync with the backend whenever GameUpdate changes.
 */

// ---------------------------------------------------------------------------
// Pitcher stats
// ---------------------------------------------------------------------------

export interface PitchTypeUsage {
  /** Statcast pitch type code, e.g. 'FF', 'SL', 'CH'. */
  typeCode: string;
  typeName: string;
  count: number;
  /** Usage percentage 0–100, rounded to the nearest integer. */
  pct: number;
}

export interface PitcherGameStats {
  pitchesThrown: number;
  /** Strike calls and swinging strikes (not strikeouts). */
  strikes: number;
  balls: number;
  /** Per-type breakdown, sorted descending by count. */
  usage: PitchTypeUsage[];
}

// ---------------------------------------------------------------------------
// Venue
// ---------------------------------------------------------------------------

export interface VenueFieldInfo {
  venueId: number;
  leftLine: number;
  leftCenter: number;
  center: number;
  rightCenter: number;
  rightLine: number;
}

// ---------------------------------------------------------------------------
// Pitch tracking (Statcast)
// ---------------------------------------------------------------------------

export interface PitchCoordinates {
  /** Horizontal plate location: feet from center. Negative = pitcher's arm side (catcher's left). */
  pX: number;
  /** Vertical plate location: feet above ground. */
  pZ: number;
  /** Legacy PITCHf/x pixel X coordinate. */
  x: number;
  /** Legacy PITCHf/x pixel Y coordinate. */
  y: number;
  /** Initial position X (feet from center) at 50ft from home plate. */
  x0: number;
  /** Initial position Y (feet from home plate). */
  y0: number;
  /** Initial position Z (feet above ground). */
  z0: number;
  /** Initial velocity X at release (ft/s). */
  vX0: number;
  /** Initial velocity Y at release (ft/s). Negative = toward home plate. */
  vY0: number;
  /** Initial velocity Z at release (ft/s). */
  vZ0: number;
  /** Lateral acceleration (ft/s²). */
  aX: number;
  /** Longitudinal acceleration / drag (ft/s²). */
  aY: number;
  /** Vertical acceleration (ft/s²). Combines gravity and Magnus lift. */
  aZ: number;
  /** Horizontal movement due to spin (inches, Pfx system). */
  pfxX: number;
  /** Vertical movement due to spin (inches, Pfx system). */
  pfxZ: number;
}

/** Spin and break metrics (Statcast). */
export interface PitchBreaks {
  /** Spin rate in RPM. */
  spinRate: number;
  /** Spin axis direction in degrees (0–360). */
  spinDirection: number;
  /** Break angle in degrees (0–360). */
  breakAngle: number;
  /** Total vertical break in inches vs a gravity-only trajectory. */
  breakVertical: number;
  /** Induced vertical break in inches (spin contribution only). */
  breakVerticalInduced: number;
  /** Horizontal break in inches. */
  breakHorizontal: number;
}

/** Full Statcast tracking data for a single pitch. */
export interface PitchTrackingData {
  /** Pitch velocity at release in mph. */
  startSpeed: number;
  /** Pitch velocity at plate crossing in mph. */
  endSpeed: number;
  /** Strike zone top in feet above ground (batter-specific, per-game). */
  strikeZoneTop: number;
  /** Strike zone bottom in feet above ground (batter-specific, per-game). */
  strikeZoneBottom: number;
  /** Strike zone width in inches (nominally 17). */
  strikeZoneWidth: number;
  /** Strike zone depth in inches. */
  strikeZoneDepth: number;
  /** Time from release to plate crossing in seconds. */
  plateTime: number;
  /** Pitcher's extension in feet. */
  extension: number;
  /**
   * Statcast zone identifier (1–9 = in zone, 11–14 = outside zone).
   * See: https://baseballsavant.mlb.com/leaderboard/zone for zone diagram.
   */
  zone: number;
  coordinates: PitchCoordinates;
  breaks: PitchBreaks;
}

// ---------------------------------------------------------------------------
// Batted ball
// ---------------------------------------------------------------------------

/** Statcast batted-ball data. Present only on in-play pitches. */
export interface BattedBallData {
  /** Exit velocity in mph. */
  launchSpeed: number | null;
  /** Launch angle in degrees. Negative = ground ball; positive = fly ball. */
  launchAngle: number | null;
  /** Projected total distance in feet. */
  totalDistance: number | null;
  /** Ball flight path: "ground_ball" | "fly_ball" | "line_drive" | "popup". */
  trajectory: string | null;
  /** Contact quality: "soft" | "medium" | "hard". */
  hardness: string | null;
  /** Fielder position code where the ball was fielded (1–9 and extensions). */
  location: string | null;
  /** Spray chart coordinates in pixels. */
  coordinates: { coordX: number; coordY: number } | null;
}

// ---------------------------------------------------------------------------
// Pitch event
// ---------------------------------------------------------------------------

export interface PitchEvent {
  /** Sequential pitch number within the at-bat. */
  pitchNumber: number;
  /** Pitch classification from Statcast (e.g. "Four-Seam Fastball", "Curveball"). */
  pitchType: string;
  /**
   * Statcast pitch type code (e.g. "FF" = 4-seam fastball, "SI" = sinker,
   * "SL" = slider, "CH" = changeup, "ST" = sweeper, "KC" = knuckle curve).
   * null when type classification is unavailable.
   */
  pitchTypeCode: string | null;
  /** Call result (e.g. "Called Strike", "Ball", "Foul", "In play, run(s)"). */
  call: string;
  isBall: boolean;
  isStrike: boolean;
  /** true on the final pitch of the at-bat when put in play. */
  isInPlay: boolean;
  /** Pitch velocity in mph. null when Statcast tracking data is unavailable. */
  speedMph: number | null;
  /** Ball/strike count after this pitch is resolved. */
  countAfter: { balls: number; strikes: number };
  /**
   * Full Statcast tracking data for this pitch.
   * null when Statcast tracking is unavailable (outage, spring training, etc.).
   */
  tracking: PitchTrackingData | null;
  /**
   * Batted-ball data (exit velocity, launch angle, distance, etc.).
   * null unless isInPlay === true.
   */
  hitData: BattedBallData | null;
}

// ---------------------------------------------------------------------------
// At-bat state
// ---------------------------------------------------------------------------

/**
 * A base runner on the field, enriched with season stolen-base stats sourced
 * from the live boxscore.
 */
export interface RunnerState {
  id: number;
  fullName: string;
  /** Season stolen bases to date. */
  seasonSb: number;
  /**
   * Season caught-stealing attempts (SB + CS). Used to compute SB%.
   * 0 means no attempts — percentage should not be shown.
   */
  seasonSbAttempts: number;
}

/**
 * One slot in the batting order, sourced from the live boxscore.
 * Reflects the current occupant of each slot (including pinch-hitters/runners).
 */
export interface LineupEntry {
  id: number;
  fullName: string;
  /**
   * Batting order slot encoded as slot×100 (100=1st, …, 900=9th).
   * Display slot: `Math.floor(battingOrder / 100)`.
   */
  battingOrder: number;
  /** Today's at-bats in this game (from boxscore stats.batting). */
  atBats: number;
  /** Today's hits in this game (from boxscore stats.batting). */
  hits: number;
  /**
   * Season OPS as a decimal string (e.g. ".752").
   * null when unavailable in the boxscore seasonStats.
   */
  seasonOps: string | null;
}

/**
 * Snapshot of the current plate appearance, attached to every `game-update`
 * emission while a plate appearance is in progress.
 *
 * null when:
 * - trackingMode is 'between-innings' or 'final'
 * - No active gamePk
 * - currentPlay is absent or already complete
 * - The feed/live fetch failed
 */
export interface AtBatState {
  batter: { id: number; fullName: string; battingOrder: number };
  pitcher: { id: number; fullName: string };
  /** Batter's hitting stance. */
  batSide: 'L' | 'R' | 'S';
  /** Pitcher's throwing hand. */
  pitchHand: 'L' | 'R';
  onDeck: { id: number; fullName: string } | null;
  inHole: { id: number; fullName: string } | null;
  /** Runner on first base. null when unoccupied. */
  first: RunnerState | null;
  /** Runner on second base. null when unoccupied. */
  second: RunnerState | null;
  /** Runner on third base. null when unoccupied. */
  third: RunnerState | null;
  /** Live ball/strike count for this plate appearance. */
  count: { balls: number; strikes: number };
  /**
   * Partial pitch sequence for the current in-progress at-bat, in
   * chronological order. Empty at the start of a new at-bat.
   */
  pitchSequence: PitchEvent[];
  /**
   * Full batting order for the batting team, ordered by batting slot.
   * Nine entries reflecting live substitutions. Empty array when unavailable.
   */
  lineup: LineupEntry[];
}

// ---------------------------------------------------------------------------
// Top-level types
// ---------------------------------------------------------------------------

export interface TeamInfo {
  id: number;
  name: string;
  abbreviation: string;
}

/**
 * Payload emitted on the `game-update` Socket.IO event.
 * Emitted every tick during 'live', once on 'between-innings' and 'final' transitions.
 */
export interface GameUpdate {
  gameStatus: string;
  /** MLB game identifier — used by clients to correlate `game-update` with `game-events` batches. */
  gamePk: number;
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
    half: 'Top' | 'Middle' | 'Bottom' | 'End';
    ordinal: string;
  };
  outs: number;
  /** Abbreviation of the team currently on defense (or defending next, during between-innings). */
  defendingTeam: string;
  /** Abbreviation of the team currently batting (or batting next, during between-innings). */
  battingTeam: string;
  /** true when the game is paused due to a rain delay, suspension, or similar. */
  isDelayed: boolean;
  /** Human-readable delay reason from the API (e.g. "Delayed: Rain"), null when not delayed. */
  delayDescription: string | null;
  /** true when the current inning exceeds scheduledInnings. */
  isExtraInnings: boolean;
  /** Number of innings originally scheduled (usually 9). */
  scheduledInnings: number;
  /**
   * 'live'            – game is in active play; emitted every tick.
   * 'between-innings' – half-inning just ended; emitted once on transition.
   * 'final'           – game has ended; emitted once, scheduler transitions to idle polling.
   */
  trackingMode: 'live' | 'between-innings' | 'final';
  /** 3 − current outs when defending, null otherwise. */
  outsRemaining: number | null;
  /**
   * Total defensive outs remaining for the rest of the game.
   * null in extra innings and when tracking runs.
   */
  totalOutsRemaining: number | null;
  /** Runs needed for the lead when batting in extras, null otherwise. */
  runsNeeded: number | null;
  /**
   * Pitcher currently on the mound during active play.
   * Includes computed stats (populated by the scheduler each tick).
   * null when not defending or during between-innings.
   */
  currentPitcher: (PitcherGameStats & { id: number; fullName: string }) | null;
  /**
   * All pitches thrown by the current pitcher this game, in chronological order.
   * Empty array until the first enrichment tick resolves.
   */
  pitchHistory: PitchEvent[];
  /**
   * Pitcher scheduled to take the mound for the next half-inning.
   * Only set when trackingMode === 'between-innings', null otherwise.
   */
  upcomingPitcher: { id: number; fullName: string } | null;
  /**
   * Live at-bat snapshot. null during between-innings, final, or when unavailable.
   */
  atBat: AtBatState | null;
  /** Abbreviation of the team being tracked (tied to CONFIG.teamId). */
  trackedTeamAbbr: string;
  /**
   * MLB venue identifier for the current game's ballpark.
   * null when the schedule response does not include venue data.
   */
  venueId: number | null;
  /**
   * Real ballpark fence distances fetched from the MLB venues API.
   * null until fetched (or if the fetch fails).
   */
  venueFieldInfo: VenueFieldInfo | null;
}
