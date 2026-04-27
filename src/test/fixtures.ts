import type { GameUpdate } from '../game-update';

export function makeUpdate(overrides: Partial<GameUpdate> = {}): GameUpdate {
  return {
    gameStatus: 'In Progress',
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
    trackingMode: 'outs',
    outsRemaining: 2,
    totalOutsRemaining: 14,
    runsNeeded: null,
    currentPitcher: { id: 800001, fullName: 'Max Fried' },
    pitchingChange: false,
    inningBreakLength: null,
    ...overrides,
  };
}
