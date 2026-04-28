import type { GameUpdate } from '../game-update';

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
