import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StrikeZonePanel } from './StrikeZonePanel';
import type { AtBatState, PitchEvent, PitchTrackingData } from '../game-update';

// Mock StrikeZone to record props passed to it — allows filtering logic to be tested separately
const mockStrikeZone = vi.fn(
  (_props: { pitches: PitchEvent[]; batter: unknown; count: unknown; showNumbers?: boolean }) => (
    <div data-testid="strike-zone" />
  )
);
vi.mock('./StrikeZone', () => ({
  StrikeZone: (props: Parameters<typeof mockStrikeZone>[0]) => mockStrikeZone(props),
}));

function makeTracking(overrides?: Partial<PitchTrackingData>): PitchTrackingData {
  return {
    startSpeed: 95,
    endSpeed: 87,
    strikeZoneTop: 3.4,
    strikeZoneBottom: 1.6,
    strikeZoneWidth: 17,
    strikeZoneDepth: 17,
    plateTime: 0.41,
    extension: 6.2,
    zone: 5,
    coordinates: {
      pX: 0.1,
      pZ: 2.4,
      x: 120,
      y: 180,
      x0: -1.5,
      y0: 50,
      z0: 6,
      vX0: 5,
      vY0: -130,
      vZ0: -5,
      aX: 10,
      aY: 30,
      aZ: -15,
      pfxX: 8,
      pfxZ: 14,
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

function makePitch(pitchNumber: number, hasTracking = true): PitchEvent {
  return {
    pitchNumber,
    pitchType: 'Four-Seam Fastball',
    pitchTypeCode: 'FF',
    call: 'Called Strike',
    isBall: false,
    isStrike: true,
    isInPlay: false,
    speedMph: 95,
    countAfter: { balls: 0, strikes: pitchNumber },
    tracking: hasTracking ? makeTracking() : null,
    hitData: null,
  };
}

function makeAtBat(overrides: Partial<AtBatState> = {}): AtBatState {
  return {
    batter: { id: 100, fullName: 'Test Batter', battingOrder: 100 },
    pitcher: { id: 200, fullName: 'Test Pitcher' },
    batSide: 'R',
    pitchHand: 'R',
    onDeck: null,
    inHole: null,
    first: null,
    second: null,
    third: null,
    count: { balls: 1, strikes: 2 },
    pitchSequence: [],
    lineup: [],
    ...overrides,
  };
}

describe('StrikeZonePanel', () => {
  beforeEach(() => {
    mockStrikeZone.mockClear();
  });

  it('renders the StrikeZone and PitchFilterToggle', () => {
    render(<StrikeZonePanel atBat={null} pitchHistory={[]} />);
    expect(screen.getByTestId('strike-zone')).toBeInTheDocument();
    expect(screen.getByRole('radiogroup', { name: 'Pitch filter' })).toBeInTheDocument();
  });

  it('defaults filter to "at-bat"', () => {
    render(<StrikeZonePanel atBat={null} pitchHistory={[]} />);
    expect(screen.getByRole('radio', { name: 'AB' })).toHaveAttribute('aria-checked', 'true');
  });

  it('shows "All" option when pitchHistory is non-empty', () => {
    render(<StrikeZonePanel atBat={null} pitchHistory={[makePitch(1)]} />);
    expect(screen.getByRole('radio', { name: 'All' })).toBeInTheDocument();
  });

  it('hides "All" option when pitchHistory is empty', () => {
    render(<StrikeZonePanel atBat={null} pitchHistory={[]} />);
    expect(screen.queryByRole('radio', { name: 'All' })).not.toBeInTheDocument();
  });

  it('passes at-bat pitches to StrikeZone when filter is "at-bat"', () => {
    const pitchSequence = [makePitch(1), makePitch(2)];
    const atBat = makeAtBat({ pitchSequence });
    render(<StrikeZonePanel atBat={atBat} pitchHistory={[]} />);
    const lastCall = mockStrikeZone.mock.calls.at(-1)![0];
    expect(lastCall.pitches).toHaveLength(2);
  });

  it('passes only the last pitch when filter is "last"', async () => {
    const pitchSequence = [makePitch(1), makePitch(2), makePitch(3)];
    const atBat = makeAtBat({ pitchSequence });
    render(<StrikeZonePanel atBat={atBat} pitchHistory={[]} />);
    await userEvent.click(screen.getByRole('radio', { name: 'Last' }));
    const lastCall = mockStrikeZone.mock.calls.at(-1)![0];
    expect(lastCall.pitches).toHaveLength(1);
    expect(lastCall.pitches[0].pitchNumber).toBe(3);
  });

  it('passes pitchHistory to StrikeZone when filter is "all"', async () => {
    const pitchHistory = [makePitch(1), makePitch(2), makePitch(3)];
    render(<StrikeZonePanel atBat={null} pitchHistory={pitchHistory} />);
    await userEvent.click(screen.getByRole('radio', { name: 'All' }));
    const lastCall = mockStrikeZone.mock.calls.at(-1)![0];
    expect(lastCall.pitches).toHaveLength(3);
  });

  it('passes showNumbers=true to StrikeZone in "at-bat" mode', () => {
    const atBat = makeAtBat({ pitchSequence: [makePitch(1)] });
    render(<StrikeZonePanel atBat={atBat} pitchHistory={[]} />);
    const lastCall = mockStrikeZone.mock.calls.at(-1)![0];
    expect(lastCall.showNumbers).toBe(true);
  });

  it('passes showNumbers=false to StrikeZone in "all" mode', async () => {
    render(<StrikeZonePanel atBat={null} pitchHistory={[makePitch(1)]} />);
    await userEvent.click(screen.getByRole('radio', { name: 'All' }));
    const lastCall = mockStrikeZone.mock.calls.at(-1)![0];
    expect(lastCall.showNumbers).toBe(false);
  });

  it('passes showNumbers=false to StrikeZone in "last" mode', async () => {
    const atBat = makeAtBat({ pitchSequence: [makePitch(1), makePitch(2)] });
    render(<StrikeZonePanel atBat={atBat} pitchHistory={[]} />);
    await userEvent.click(screen.getByRole('radio', { name: 'Last' }));
    const lastCall = mockStrikeZone.mock.calls.at(-1)![0];
    expect(lastCall.showNumbers).toBe(false);
  });

  it('renders pitch list newest-first in "all" mode', async () => {
    // pitchHistory arrives oldest-first from the backend
    const pitchHistory = [
      { ...makePitch(1), call: 'Ball', isBall: true, isStrike: false }, // oldest
      { ...makePitch(2), call: 'Called Strike', isBall: false, isStrike: true }, // newest
    ];
    render(<StrikeZonePanel atBat={null} pitchHistory={pitchHistory} />);
    await userEvent.click(screen.getByRole('radio', { name: 'All' }));
    // Newest-first: "CS" row should precede "B" row in the DOM
    const csEl = screen.getByText('CS');
    const bEl = screen.getByText('B');
    expect(csEl.compareDocumentPosition(bEl) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('renders pitch list oldest-first in "at-bat" mode', () => {
    const pitchSequence = [
      { ...makePitch(1), call: 'Ball', isBall: true, isStrike: false }, // oldest
      { ...makePitch(2), call: 'Called Strike', isBall: false, isStrike: true }, // newest
    ];
    const atBat = makeAtBat({ pitchSequence });
    render(<StrikeZonePanel atBat={atBat} pitchHistory={[]} />);
    // Oldest-first: "B" row should precede "CS" row in the DOM
    const bEl = screen.getByText('B');
    const csEl = screen.getByText('CS');
    expect(bEl.compareDocumentPosition(csEl) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("passes raw pitches (including untracked) to StrikeZone — filtering is StrikeZone's responsibility", () => {
    const pitchSequence = [makePitch(1, false), makePitch(2, true), makePitch(3, false)];
    const atBat = makeAtBat({ pitchSequence });
    render(<StrikeZonePanel atBat={atBat} pitchHistory={[]} />);
    const lastCall = mockStrikeZone.mock.calls.at(-1)![0];
    expect(lastCall.pitches).toHaveLength(3);
  });

  it('resets filter to "at-bat" when the batter changes', async () => {
    const atBat1 = makeAtBat({ batter: { id: 1, fullName: 'Batter One', battingOrder: 100 } });
    const atBat2 = makeAtBat({ batter: { id: 2, fullName: 'Batter Two', battingOrder: 200 } });
    const pitchHistory = [makePitch(1)];

    const { rerender } = render(<StrikeZonePanel atBat={atBat1} pitchHistory={pitchHistory} />);

    // Switch to 'all' filter
    await userEvent.click(screen.getByRole('radio', { name: 'All' }));
    expect(screen.getByRole('radio', { name: 'All' })).toHaveAttribute('aria-checked', 'true');

    // New batter arrives
    rerender(<StrikeZonePanel atBat={atBat2} pitchHistory={pitchHistory} />);

    // Filter should reset to 'at-bat'
    expect(screen.getByRole('radio', { name: 'AB' })).toHaveAttribute('aria-checked', 'true');
  });

  it('handles null atBat gracefully — passes empty pitches and null batter', () => {
    render(<StrikeZonePanel atBat={null} pitchHistory={[]} />);
    const lastCall = mockStrikeZone.mock.calls.at(-1)![0];
    expect(lastCall.pitches).toHaveLength(0);
    expect(lastCall.batter).toBeNull();
    expect(lastCall.count).toBeNull();
  });

  it('persists last at-bat pitches when atBat transitions to null', () => {
    const pitchSequence = [makePitch(1), makePitch(2)];
    const atBat = makeAtBat({ pitchSequence });
    const { rerender } = render(<StrikeZonePanel atBat={atBat} pitchHistory={[]} />);

    // Transition to null atBat (between plate appearances)
    rerender(<StrikeZonePanel atBat={null} pitchHistory={[]} />);

    const lastCall = mockStrikeZone.mock.calls.at(-1)![0];
    // Pitches from the last at-bat should still be shown
    expect(lastCall.pitches).toHaveLength(2);
  });
});
