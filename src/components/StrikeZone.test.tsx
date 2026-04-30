import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StrikeZone } from './StrikeZone';
import type { PitchEvent } from '../game-update';

// Helper to make a pitch event
function makePitch(overrides: Partial<PitchEvent> = {}): PitchEvent {
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
    tracking: {
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
    },
    hitData: null,
    ...overrides,
  };
}

describe('StrikeZone', () => {
  it('renders an SVG with role="img" and aria-label', () => {
    render(<StrikeZone pitches={[]} batter={null} count={null} />);
    const svg = screen.getByRole('img');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-label', 'Strike zone: no pitches to display.');
  });

  it('renders the zone rectangle', () => {
    const { container } = render(<StrikeZone pitches={[]} batter={null} count={null} />);
    const rects = container.querySelectorAll('rect');
    expect(rects.length).toBeGreaterThanOrEqual(1);
  });

  it('renders a circle for each pitch with tracking data', () => {
    const pitches = [makePitch({ pitchNumber: 1 }), makePitch({ pitchNumber: 2 })];
    const { container } = render(<StrikeZone pitches={pitches} batter={null} count={null} />);
    // Each tracked pitch renders a filled circle; in-play pitches also get a ring
    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBe(2);
  });

  it('skips rendering for pitches without tracking data', () => {
    const pitches = [makePitch({ pitchNumber: 1, tracking: null }), makePitch({ pitchNumber: 2 })];
    const { container } = render(<StrikeZone pitches={pitches} batter={null} count={null} />);
    // Only the tracked pitch renders a circle
    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBe(1);
  });

  it('renders an in-play ring for isInPlay pitches', () => {
    const pitch = makePitch({ isInPlay: true });
    const { container } = render(<StrikeZone pitches={[pitch]} batter={null} count={null} />);
    // 1 filled circle + 1 ring circle
    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBe(2);
  });

  it('renders count text when count is provided', () => {
    render(<StrikeZone pitches={[]} batter={null} count={{ balls: 1, strikes: 2 }} />);
    expect(screen.getByText('1-2')).toBeInTheDocument();
  });

  it('does not render count text when count is null', () => {
    render(<StrikeZone pitches={[]} batter={null} count={null} />);
    expect(screen.queryByText(/\d-\d/)).not.toBeInTheDocument();
  });

  it('renders batter name when batter is provided', () => {
    render(
      <StrikeZone
        pitches={[]}
        batter={{ fullName: 'Vladimir Guerrero Jr.', batSide: 'R' }}
        count={null}
      />
    );
    expect(screen.getByText('Vladimir Guerrero Jr.')).toBeInTheDocument();
  });

  it('does not render batter name when batter is null', () => {
    render(<StrikeZone pitches={[]} batter={null} count={null} />);
    expect(screen.queryByText('Vladimir Guerrero Jr.')).not.toBeInTheDocument();
  });

  it('uses the correct fill colour for known pitch type codes', () => {
    const pitch = makePitch({ pitchTypeCode: 'FF' });
    const { container } = render(<StrikeZone pitches={[pitch]} batter={null} count={null} />);
    const filledCircle = Array.from(container.querySelectorAll('circle')).find(
      (c) => c.getAttribute('fill') !== 'none'
    );
    expect(filledCircle?.getAttribute('fill')).toBe('var(--color-pitch-ff)');
  });

  it('uses the fallback colour for null pitch type code', () => {
    const pitch = makePitch({ pitchTypeCode: null });
    const { container } = render(<StrikeZone pitches={[pitch]} batter={null} count={null} />);
    const filledCircle = Array.from(container.querySelectorAll('circle')).find(
      (c) => c.getAttribute('fill') !== 'none'
    );
    expect(filledCircle?.getAttribute('fill')).toBe('var(--color-pitch-other)');
  });

  it('renders an empty zone with default bounds when pitches is empty', () => {
    const { container } = render(<StrikeZone pitches={[]} batter={null} count={null} />);
    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBe(0);
    // zone rect still present
    const rects = container.querySelectorAll('rect');
    expect(rects.length).toBe(1);
  });

  it('includes pitch count in aria-label when pitches are present', () => {
    const pitches = [makePitch({ pitchNumber: 1 }), makePitch({ pitchNumber: 2 })];
    render(
      <StrikeZone
        pitches={pitches}
        batter={{ fullName: 'Test', batSide: 'R' }}
        count={{ balls: 2, strikes: 1 }}
      />
    );
    const label = screen.getByRole('img').getAttribute('aria-label') ?? '';
    expect(label).toContain('2 pitches');
    expect(label).toContain('Count: 2-1');
    expect(label).toContain('right-handed');
  });

  it('uses the fallback colour for unknown pitch type codes', () => {
    const pitch = makePitch({ pitchTypeCode: 'ZZ' });
    const { container } = render(<StrikeZone pitches={[pitch]} batter={null} count={null} />);
    const filledCircle = Array.from(container.querySelectorAll('circle')).find(
      (c) => c.getAttribute('fill') !== 'none'
    );
    expect(filledCircle?.getAttribute('fill')).toBe('var(--color-pitch-other)');
  });

  it('renders sequence number labels when showNumbers is true', () => {
    const pitches = [
      makePitch({ pitchNumber: 1 }),
      makePitch({ pitchNumber: 2 }),
      makePitch({ pitchNumber: 3 }),
    ];
    const { container } = render(
      <StrikeZone pitches={pitches} batter={null} count={null} showNumbers={true} />
    );
    const labels = container.querySelectorAll('text');
    // Each pitch gets a number label; batter name text is absent
    const numberLabels = Array.from(labels).filter((t) =>
      ['1', '2', '3'].includes(t.textContent ?? '')
    );
    expect(numberLabels.length).toBe(3);
  });

  it('does not render number labels when showNumbers is false', () => {
    const pitch = makePitch({ pitchNumber: 1 });
    const { container } = render(
      <StrikeZone pitches={[pitch]} batter={null} count={null} showNumbers={false} />
    );
    const labels = container.querySelectorAll('text');
    expect(labels.length).toBe(0);
  });

  it('skips number label for pitches without tracking data', () => {
    const pitches = [makePitch({ pitchNumber: 1, tracking: null }), makePitch({ pitchNumber: 2 })];
    const { container } = render(
      <StrikeZone pitches={pitches} batter={null} count={null} showNumbers={true} />
    );
    // Only the tracked pitch (idx=1) gets a number — shows "2"
    const labels = container.querySelectorAll('text');
    expect(Array.from(labels).some((t) => t.textContent === '2')).toBe(true);
    expect(Array.from(labels).some((t) => t.textContent === '1')).toBe(false);
  });

  it('clamps pitch circles to the viewBox when coordinates are extreme outliers', () => {
    // pX=5.0 and pZ=10.0 are far outside the normal data range and would
    // otherwise map to cx/cy values outside [0,240] × [0,560].
    const pitch = makePitch({
      tracking: {
        ...makePitch().tracking!,
        coordinates: { ...makePitch().tracking!.coordinates, pX: 5.0, pZ: 10.0 },
      },
    });
    const { container } = render(<StrikeZone pitches={[pitch]} batter={null} count={null} />);
    const circle = container.querySelector('circle');
    const cx = Number(circle?.getAttribute('cx'));
    const cy = Number(circle?.getAttribute('cy'));
    expect(cx).toBeGreaterThanOrEqual(0);
    expect(cx).toBeLessThanOrEqual(240);
    expect(cy).toBeGreaterThanOrEqual(0);
    expect(cy).toBeLessThanOrEqual(560);
  });
});
