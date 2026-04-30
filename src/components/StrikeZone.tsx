import { scaleLinear } from '@visx/scale';
import type { PitchEvent } from '../game-update';
import { getPitchColor } from '../pitch-colors';

// Visible data range constants — tune during visual feedback
const X_RANGE = [-1.5, 1.5] as const;
// Top extended to 5.5 ft to accommodate legitimately high pitches (~5.0–5.2 ft pZ)
// while keeping the same px/ft density as the original [0.5, 4.5] range.
const Y_RANGE = [0.5, 5.5] as const;
// Extra vertical scale factor — makes the SVG taller than the raw aspect ratio
const HEIGHT_SCALE = 1.4;

// Fixed viewBox dimensions — the SVG scales via width="100%" and preserves aspect ratio.
// No JS measurement required; eliminates the ResizeObserver bootstrap delay.
const VIEWBOX_WIDTH = 240;
const VIEWBOX_HEIGHT = Math.round(
  ((VIEWBOX_WIDTH * (Y_RANGE[1] - Y_RANGE[0])) / (X_RANGE[1] - X_RANGE[0])) * HEIGHT_SCALE
); // 560

const DEFAULT_ZONE_TOP = 3.5;
const DEFAULT_ZONE_BOTTOM = 1.5;

const PITCH_RADIUS = 10;
const IN_PLAY_RING_RADIUS = 15;

interface StrikeZoneProps {
  pitches: PitchEvent[];
  batter: { fullName: string; batSide: 'L' | 'R' | 'S' } | null;
  count: { balls: number; strikes: number } | null;
  /** When true, render sequence number labels inside each pitch dot. */
  showNumbers?: boolean;
}

export function StrikeZone({ pitches, batter, count, showNumbers = false }: StrikeZoneProps) {
  const xScale = scaleLinear({ domain: [X_RANGE[0], X_RANGE[1]], range: [0, VIEWBOX_WIDTH] });
  const yScale = scaleLinear({ domain: [Y_RANGE[0], Y_RANGE[1]], range: [VIEWBOX_HEIGHT, 0] });

  // Derive zone bounds from the most recent pitch with tracking data
  const trackedPitches = pitches.filter((p) => p.tracking !== null);
  const lastTracked = trackedPitches.at(-1);
  const zoneTop = lastTracked?.tracking?.strikeZoneTop ?? DEFAULT_ZONE_TOP;
  const zoneBottom = lastTracked?.tracking?.strikeZoneBottom ?? DEFAULT_ZONE_BOTTOM;

  const PLATE_HALF_WIDTH = 17 / 2 / 12; // 17 inches → feet, half-width

  const zoneLeft = xScale(-PLATE_HALF_WIDTH);
  const zoneRight = xScale(PLATE_HALF_WIDTH);
  const zoneTopY = yScale(zoneTop);
  const zoneBottomY = yScale(zoneBottom);
  const zoneWidth = zoneRight - zoneLeft;
  const zoneHeight = zoneBottomY - zoneTopY;

  const zoneCenterX = (zoneLeft + zoneRight) / 2;

  const ariaLabel = buildAriaLabel(trackedPitches.length, count, batter);

  return (
    <svg
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
      width="100%"
      role="img"
      aria-label={ariaLabel}
      className="overflow-visible"
    >
      {/* Zone rectangle */}
      <rect
        x={zoneLeft}
        y={zoneTopY}
        width={zoneWidth}
        height={zoneHeight}
        fill="none"
        stroke="var(--color-fg-faint)"
        strokeWidth={1.5}
      />

      {/* Count display */}
      {count !== null && (
        <text
          x={zoneCenterX}
          y={zoneTopY - 10}
          textAnchor="middle"
          fontSize={14}
          fill="var(--color-fg)"
          fontFamily="inherit"
        >
          {count.balls}-{count.strikes}
        </text>
      )}

      {/* Batter name */}
      {batter !== null && (
        <text
          x={zoneCenterX}
          y={zoneBottomY + 18}
          textAnchor="middle"
          fontSize={11}
          fill="var(--color-fg-muted)"
          fontFamily="inherit"
        >
          {batter.fullName}
        </text>
      )}

      {/* Pitch dots */}
      {pitches.map((pitch, idx) => {
        if (!pitch.tracking) return null;
        const t = pitch.tracking;
        // Clamp to viewBox bounds so extreme outliers (tracking glitches, wild
        // pitches far outside the display range) pin to the edge rather than
        // rendering far off-screen via overflow-visible.
        const cx = Math.max(0, Math.min(VIEWBOX_WIDTH, xScale(t.coordinates.pX)));
        const cy = Math.max(0, Math.min(VIEWBOX_HEIGHT, yScale(t.coordinates.pZ)));
        const isLast = idx === pitches.length - 1;
        const opacity = isLast ? 1 : 0.75;
        const fill = getPitchColor(pitch.pitchTypeCode);

        return (
          <g key={`pitch-${pitch.pitchNumber}-${idx}`}>
            {pitch.isInPlay && (
              <circle
                cx={cx}
                cy={cy}
                r={IN_PLAY_RING_RADIUS}
                fill="none"
                stroke={fill}
                strokeWidth={1.5}
                opacity={opacity}
              />
            )}
            <circle
              cx={cx}
              cy={cy}
              r={PITCH_RADIUS}
              fill={fill}
              stroke="rgba(0,0,0,0.3)"
              strokeWidth={1}
              opacity={opacity}
            />
            {showNumbers && (
              <text
                x={cx}
                y={cy + 3.5}
                textAnchor="middle"
                fontSize={9}
                fontWeight="bold"
                fill="white"
                fontFamily="inherit"
                style={{ userSelect: 'none' }}
                opacity={opacity}
              >
                {idx + 1}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function buildAriaLabel(
  pitchCount: number,
  count: { balls: number; strikes: number } | null,
  batter: { fullName: string; batSide: 'L' | 'R' | 'S' } | null
): string {
  if (pitchCount === 0 && batter === null) {
    return 'Strike zone: no pitches to display.';
  }
  const parts: string[] = [
    `Strike zone: ${pitchCount} ${pitchCount === 1 ? 'pitch' : 'pitches'} shown.`,
  ];
  if (count !== null) {
    parts.push(`Count: ${count.balls}-${count.strikes}.`);
  }
  if (batter !== null) {
    const handedness =
      batter.batSide === 'L'
        ? 'left-handed'
        : batter.batSide === 'R'
          ? 'right-handed'
          : 'switch-hitter';
    parts.push(`Batter: ${batter.fullName}, ${handedness}.`);
  }
  return parts.join(' ');
}
