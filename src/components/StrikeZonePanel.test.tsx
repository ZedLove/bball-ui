import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { StrikeZonePanel } from './StrikeZonePanel';
import type { AtBatState, BattedBallData, PitchEvent, PitchTrackingData } from '../game-update';

const mockStrikeZone = vi.fn(
  (_props: { pitches: PitchEvent[]; batter: unknown; count: unknown; showNumbers?: boolean }) => (
    <div data-testid="strike-zone" />
  )
);
vi.mock('./StrikeZone', () => ({
  StrikeZone: (props: Parameters<typeof mockStrikeZone>[0]) => mockStrikeZone(props),
}));

vi.mock('./SprayChart', () => ({
  SprayChart: (_props: unknown) => <div data-testid="spray-chart" />,
}));

vi.mock('./BattedBallOverlay', () => ({
  BattedBallOverlay: (_props: unknown) => <div data-testid="batted-ball-overlay" />,
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

function makeInPlayPitch(pitchNumber: number, hitData: BattedBallData | null = null): PitchEvent {
  return {
    pitchNumber,
    pitchType: 'Four-Seam Fastball',
    pitchTypeCode: 'FF',
    call: 'In play, run(s)',
    isBall: false,
    isStrike: false,
    isInPlay: true,
    speedMph: 95,
    countAfter: { balls: 0, strikes: 0 },
    tracking: makeTracking(),
    hitData,
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

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the StrikeZone and PitchFilterToggle by default', () => {
    render(<StrikeZonePanel atBat={null} pitchHistory={[]} venueFieldInfo={null} />);
    expect(screen.getByTestId('strike-zone')).toBeInTheDocument();
    expect(screen.getByRole('radiogroup', { name: 'Pitch filter' })).toBeInTheDocument();
  });

  it('defaults filter to "at-bat"', () => {
    render(<StrikeZonePanel atBat={null} pitchHistory={[]} venueFieldInfo={null} />);
    expect(screen.getByRole('radio', { name: 'AB' })).toHaveAttribute('aria-checked', 'true');
  });

  it('shows "All" option when pitchHistory is non-empty', () => {
    render(<StrikeZonePanel atBat={null} pitchHistory={[makePitch(1)]} venueFieldInfo={null} />);
    expect(screen.getByRole('radio', { name: 'All' })).toBeInTheDocument();
  });

  it('hides "All" option when pitchHistory is empty', () => {
    render(<StrikeZonePanel atBat={null} pitchHistory={[]} venueFieldInfo={null} />);
    expect(screen.queryByRole('radio', { name: 'All' })).not.toBeInTheDocument();
  });

  it('passes at-bat pitches to StrikeZone when filter is "at-bat"', () => {
    const pitchSequence = [makePitch(1), makePitch(2)];
    const atBat = makeAtBat({ pitchSequence });
    render(<StrikeZonePanel atBat={atBat} pitchHistory={[]} venueFieldInfo={null} />);
    const lastCall = mockStrikeZone.mock.calls.at(-1)![0];
    expect(lastCall.pitches).toHaveLength(2);
  });

  it('passes only the last pitch when filter is "last"', async () => {
    const pitchSequence = [makePitch(1), makePitch(2), makePitch(3)];
    const atBat = makeAtBat({ pitchSequence });
    render(<StrikeZonePanel atBat={atBat} pitchHistory={[]} venueFieldInfo={null} />);
    await userEvent.click(screen.getByRole('radio', { name: 'Last' }));
    const lastCall = mockStrikeZone.mock.calls.at(-1)![0];
    expect(lastCall.pitches).toHaveLength(1);
    expect(lastCall.pitches[0].pitchNumber).toBe(3);
  });

  it('passes pitchHistory to StrikeZone when filter is "all"', async () => {
    const pitchHistory = [makePitch(1), makePitch(2), makePitch(3)];
    render(<StrikeZonePanel atBat={null} pitchHistory={pitchHistory} venueFieldInfo={null} />);
    await userEvent.click(screen.getByRole('radio', { name: 'All' }));
    const lastCall = mockStrikeZone.mock.calls.at(-1)![0];
    expect(lastCall.pitches).toHaveLength(3);
  });

  it('passes showNumbers=true to StrikeZone in "at-bat" mode', () => {
    const atBat = makeAtBat({ pitchSequence: [makePitch(1)] });
    render(<StrikeZonePanel atBat={atBat} pitchHistory={[]} venueFieldInfo={null} />);
    const lastCall = mockStrikeZone.mock.calls.at(-1)![0];
    expect(lastCall.showNumbers).toBe(true);
  });

  it('passes showNumbers=false to StrikeZone in "all" mode', async () => {
    render(<StrikeZonePanel atBat={null} pitchHistory={[makePitch(1)]} venueFieldInfo={null} />);
    await userEvent.click(screen.getByRole('radio', { name: 'All' }));
    const lastCall = mockStrikeZone.mock.calls.at(-1)![0];
    expect(lastCall.showNumbers).toBe(false);
  });

  it('passes showNumbers=false to StrikeZone in "last" mode', async () => {
    const atBat = makeAtBat({ pitchSequence: [makePitch(1), makePitch(2)] });
    render(<StrikeZonePanel atBat={atBat} pitchHistory={[]} venueFieldInfo={null} />);
    await userEvent.click(screen.getByRole('radio', { name: 'Last' }));
    const lastCall = mockStrikeZone.mock.calls.at(-1)![0];
    expect(lastCall.showNumbers).toBe(false);
  });

  it('renders pitch list newest-first in "all" mode', async () => {
    const pitchHistory = [
      { ...makePitch(1), call: 'Ball', isBall: true, isStrike: false },
      { ...makePitch(2), call: 'Called Strike', isBall: false, isStrike: true },
    ];
    render(<StrikeZonePanel atBat={null} pitchHistory={pitchHistory} venueFieldInfo={null} />);
    await userEvent.click(screen.getByRole('radio', { name: 'All' }));
    const csEl = screen.getByText('CS');
    const bEl = screen.getByText('B');
    expect(csEl.compareDocumentPosition(bEl) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('renders pitch list oldest-first in "at-bat" mode', () => {
    const pitchSequence = [
      { ...makePitch(1), call: 'Ball', isBall: true, isStrike: false },
      { ...makePitch(2), call: 'Called Strike', isBall: false, isStrike: true },
    ];
    const atBat = makeAtBat({ pitchSequence });
    render(<StrikeZonePanel atBat={atBat} pitchHistory={[]} venueFieldInfo={null} />);
    const bEl = screen.getByText('B');
    const csEl = screen.getByText('CS');
    expect(bEl.compareDocumentPosition(csEl) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("passes raw pitches to StrikeZone — filtering is StrikeZone's responsibility", () => {
    const pitchSequence = [makePitch(1, false), makePitch(2, true), makePitch(3, false)];
    const atBat = makeAtBat({ pitchSequence });
    render(<StrikeZonePanel atBat={atBat} pitchHistory={[]} venueFieldInfo={null} />);
    const lastCall = mockStrikeZone.mock.calls.at(-1)![0];
    expect(lastCall.pitches).toHaveLength(3);
  });

  it('resets filter to "at-bat" when the batter changes', async () => {
    const atBat1 = makeAtBat({ batter: { id: 1, fullName: 'Batter One', battingOrder: 100 } });
    const atBat2 = makeAtBat({ batter: { id: 2, fullName: 'Batter Two', battingOrder: 200 } });
    const pitchHistory = [makePitch(1)];
    const { rerender } = render(
      <StrikeZonePanel atBat={atBat1} pitchHistory={pitchHistory} venueFieldInfo={null} />
    );
    await userEvent.click(screen.getByRole('radio', { name: 'All' }));
    expect(screen.getByRole('radio', { name: 'All' })).toHaveAttribute('aria-checked', 'true');
    rerender(<StrikeZonePanel atBat={atBat2} pitchHistory={pitchHistory} venueFieldInfo={null} />);
    expect(screen.getByRole('radio', { name: 'AB' })).toHaveAttribute('aria-checked', 'true');
  });

  it('handles null atBat gracefully — passes empty pitches and null batter', () => {
    render(<StrikeZonePanel atBat={null} pitchHistory={[]} venueFieldInfo={null} />);
    const lastCall = mockStrikeZone.mock.calls.at(-1)![0];
    expect(lastCall.pitches).toHaveLength(0);
    expect(lastCall.batter).toBeNull();
    expect(lastCall.count).toBeNull();
  });

  it('persists last at-bat pitches when atBat transitions to null', () => {
    const pitchSequence = [makePitch(1), makePitch(2)];
    const atBat = makeAtBat({ pitchSequence });
    const { rerender } = render(
      <StrikeZonePanel atBat={atBat} pitchHistory={[]} venueFieldInfo={null} />
    );
    rerender(<StrikeZonePanel atBat={null} pitchHistory={[]} venueFieldInfo={null} />);
    const lastCall = mockStrikeZone.mock.calls.at(-1)![0];
    expect(lastCall.pitches).toHaveLength(2);
  });

  // ── Zone/spray state machine ──────────────────────────────────────────────

  it('defaults to zone display mode', () => {
    render(<StrikeZonePanel atBat={null} pitchHistory={[]} venueFieldInfo={null} />);
    expect(screen.getByTestId('strike-zone')).toBeInTheDocument();
    expect(screen.queryByTestId('spray-chart')).not.toBeInTheDocument();
  });

  it('switches to spray chart when an in-play pitch is detected', () => {
    const atBat = makeAtBat({ pitchSequence: [makeInPlayPitch(1)] });
    render(<StrikeZonePanel atBat={atBat} pitchHistory={[]} venueFieldInfo={null} />);
    expect(screen.getByTestId('spray-chart')).toBeInTheDocument();
    expect(screen.queryByTestId('strike-zone')).not.toBeInTheDocument();
  });

  it('hides PitchFilterToggle during spray chart view', () => {
    const atBat = makeAtBat({ pitchSequence: [makeInPlayPitch(1)] });
    render(<StrikeZonePanel atBat={atBat} pitchHistory={[]} venueFieldInfo={null} />);
    expect(screen.queryByRole('radiogroup', { name: 'Pitch filter' })).not.toBeInTheDocument();
  });

  it('shows BattedBallOverlay when hitData is present', () => {
    const hitData: BattedBallData = {
      launchSpeed: 105,
      launchAngle: 18,
      totalDistance: 380,
      trajectory: 'line_drive',
      hardness: 'hard',
      location: '8',
      coordinates: { coordX: 150, coordY: 80 },
    };
    const atBat = makeAtBat({ pitchSequence: [makeInPlayPitch(1, hitData)] });
    render(<StrikeZonePanel atBat={atBat} pitchHistory={[]} venueFieldInfo={null} />);
    expect(screen.getByTestId('batted-ball-overlay')).toBeInTheDocument();
  });

  it('auto-reverts to zone after 8 seconds', () => {
    vi.useFakeTimers();
    const atBat = makeAtBat({ pitchSequence: [makeInPlayPitch(1)] });
    render(<StrikeZonePanel atBat={atBat} pitchHistory={[]} venueFieldInfo={null} />);

    expect(screen.getByTestId('spray-chart')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(8000);
    });

    expect(screen.getByTestId('strike-zone')).toBeInTheDocument();
    expect(screen.queryByTestId('spray-chart')).not.toBeInTheDocument();
  });

  it('reverts to zone when a new non-in-play pitch arrives before timer expires', () => {
    vi.useFakeTimers();
    const inPlayPitch = makeInPlayPitch(1);
    const atBat1 = makeAtBat({ pitchSequence: [inPlayPitch] });
    const { rerender } = render(
      <StrikeZonePanel atBat={atBat1} pitchHistory={[]} venueFieldInfo={null} />
    );

    expect(screen.getByTestId('spray-chart')).toBeInTheDocument();

    const atBat2 = makeAtBat({ pitchSequence: [inPlayPitch, makePitch(2)] });
    rerender(<StrikeZonePanel atBat={atBat2} pitchHistory={[]} venueFieldInfo={null} />);

    expect(screen.getByTestId('strike-zone')).toBeInTheDocument();
    expect(screen.queryByTestId('spray-chart')).not.toBeInTheDocument();
  });

  it('does not re-trigger spray view for the same in-play pitch on re-render', () => {
    const inPlayPitch = makeInPlayPitch(1);
    const atBat = makeAtBat({ pitchSequence: [inPlayPitch] });
    const { rerender } = render(
      <StrikeZonePanel atBat={atBat} pitchHistory={[]} venueFieldInfo={null} />
    );
    expect(screen.getByTestId('spray-chart')).toBeInTheDocument();

    // Same atBat re-rendered — must not reset to zone
    rerender(<StrikeZonePanel atBat={atBat} pitchHistory={[]} venueFieldInfo={null} />);
    expect(screen.getByTestId('spray-chart')).toBeInTheDocument();
  });

  it('reverts to zone when atBat becomes null', () => {
    const atBat = makeAtBat({ pitchSequence: [makeInPlayPitch(1)] });
    const { rerender } = render(
      <StrikeZonePanel atBat={atBat} pitchHistory={[]} venueFieldInfo={null} />
    );
    expect(screen.getByTestId('spray-chart')).toBeInTheDocument();

    rerender(<StrikeZonePanel atBat={null} pitchHistory={[]} venueFieldInfo={null} />);

    expect(screen.getByTestId('strike-zone')).toBeInTheDocument();
    expect(screen.queryByTestId('spray-chart')).not.toBeInTheDocument();
  });

  it('cleans up the auto-revert timer on unmount', () => {
    vi.useFakeTimers();
    const atBat = makeAtBat({ pitchSequence: [makeInPlayPitch(1)] });
    const { unmount } = render(
      <StrikeZonePanel atBat={atBat} pitchHistory={[]} venueFieldInfo={null} />
    );

    unmount();

    expect(() => act(() => vi.advanceTimersByTime(8000))).not.toThrow();
  });
});
