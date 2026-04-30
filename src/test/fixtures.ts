import type {
  GameUpdate,
  AtBatState,
  PitchEvent,
  PitchTrackingData,
  RunnerState,
  LineupEntry,
} from '../game-update';

export function makeUpdate(overrides: Partial<GameUpdate> = {}): GameUpdate {
  return {
    gameStatus: 'In Progress',
    gamePk: 717171,
    teams: {
      away: { id: 141, name: 'Toronto Blue Jays', abbreviation: 'TOR' },
      home: { id: 121, name: 'New York Mets', abbreviation: 'NYM' },
    },
    score: { away: 3, home: 2 },
    inning: { number: 5, half: 'Top', ordinal: '5th' },
    outs: 1,
    defendingTeam: 'NYM',
    battingTeam: 'TOR',
    isDelayed: false,
    delayDescription: null,
    isExtraInnings: false,
    scheduledInnings: 9,
    trackingMode: 'live',
    outsRemaining: 2,
    totalOutsRemaining: 14,
    runsNeeded: null,
    currentPitcher: {
      id: 800001,
      fullName: 'Max Fried',
      pitchesThrown: 43,
      strikes: 28,
      balls: 15,
      usage: [
        { typeCode: 'FF', typeName: 'Four-Seam Fastball', count: 26, pct: 60 },
        { typeCode: 'SL', typeName: 'Slider', count: 11, pct: 25 },
        { typeCode: 'CH', typeName: 'Changeup', count: 6, pct: 15 },
      ],
    },
    pitchHistory: [],
    upcomingPitcher: null,
    atBat: null,
    trackedTeamAbbr: 'TOR',
    venueId: null,
    venueFieldInfo: null,
    ...overrides,
  };
}

export function makeAtBat(overrides: Partial<AtBatState> = {}): AtBatState {
  return {
    batter: { id: 900001, fullName: 'Vladimir Guerrero Jr.', battingOrder: 300 },
    pitcher: { id: 800001, fullName: 'Max Fried' },
    batSide: 'R',
    pitchHand: 'L',
    onDeck: { id: 900002, fullName: 'Bo Bichette' },
    inHole: { id: 900003, fullName: 'Daulton Varsho' },
    first: null,
    second: null,
    third: null,
    count: { balls: 1, strikes: 2 },
    pitchSequence: [],
    lineup: [],
    ...overrides,
  };
}

export function makeTracking(overrides: Partial<PitchTrackingData> = {}): PitchTrackingData {
  return {
    startSpeed: 95.4,
    endSpeed: 87.2,
    strikeZoneTop: 3.4,
    strikeZoneBottom: 1.6,
    strikeZoneWidth: 17,
    strikeZoneDepth: 17,
    plateTime: 0.41,
    extension: 6.2,
    zone: 5,
    coordinates: {
      pX: 0.2,
      pZ: 2.5,
      x: 120,
      y: 180,
      x0: -1.5,
      y0: 50,
      z0: 6.0,
      vX0: 5.0,
      vY0: -130,
      vZ0: -5.0,
      aX: 10.0,
      aY: 30.0,
      aZ: -15.0,
      pfxX: 8.0,
      pfxZ: 14.0,
    },
    breaks: {
      spinRate: 2200,
      spinDirection: 210,
      breakAngle: 25,
      breakVertical: -14,
      breakVerticalInduced: 16,
      breakHorizontal: 8,
    },
    ...overrides,
  };
}

export function makePitchEvent(overrides: Partial<PitchEvent> = {}): PitchEvent {
  return {
    pitchNumber: 1,
    pitchType: 'Four-Seam Fastball',
    pitchTypeCode: 'FF',
    call: 'Called Strike',
    isBall: false,
    isStrike: true,
    isInPlay: false,
    speedMph: 95.4,
    countAfter: { balls: 0, strikes: 1 },
    tracking: makeTracking(),
    hitData: null,
    ...overrides,
  };
}

export function makeRunner(overrides: Partial<RunnerState> = {}): RunnerState {
  return {
    id: 900010,
    fullName: 'George Springer',
    seasonSb: 15,
    seasonSbAttempts: 18,
    ...overrides,
  };
}

export function makeLineupEntry(overrides: Partial<LineupEntry> = {}): LineupEntry {
  return {
    id: 900001,
    fullName: 'Vladimir Guerrero Jr.',
    battingOrder: 300,
    atBats: 2,
    hits: 1,
    seasonOps: '.832',
    ...overrides,
  };
}
