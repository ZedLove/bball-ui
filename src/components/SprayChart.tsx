import type { BattedBallData, VenueFieldInfo } from '../game-update';
import {
  FieldOutline,
  SPRAY_VB_W,
  SPRAY_VB_H,
  SPRAY_HOME_X,
  SPRAY_HOME_Y,
  computeFieldScale,
} from './FieldOutline';

// ── MLB spray chart coordinate calibration ──────────────────────────────────
// These constants map Statcast spray chart pixel coordinates to field feet.
// Home plate origin and the pixel-to-foot ratio need calibration against real
// backend data — adjust MLB_PIXELS_PER_FOOT if dots appear misplaced.
const MLB_HOME_X = 125; // approximate home plate X in MLB pixel coords
const MLB_HOME_Y = 199; // approximate home plate Y in MLB pixel coords
const MLB_PIXELS_PER_FOOT = 1.43; // approximate MLB pixels per foot

function formatTrajectory(trajectory: string): string {
  return trajectory
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function buildAriaLabel(hitData: BattedBallData | null): string {
  if (hitData === null) return 'Spray chart: ball in play';
  if (hitData.coordinates === null) return 'Spray chart: ball in play, location unavailable';

  const metrics: string[] = [];
  if (hitData.trajectory != null) metrics.push(formatTrajectory(hitData.trajectory));
  if (hitData.launchSpeed != null) metrics.push(`${hitData.launchSpeed} mph exit velocity`);
  if (hitData.launchAngle != null) metrics.push(`${hitData.launchAngle}° launch angle`);
  if (hitData.totalDistance != null) metrics.push(`${hitData.totalDistance} feet`);

  if (metrics.length === 0) return 'Spray chart: ball in play';
  return `Spray chart: ${metrics.join(', ')}`;
}

interface SprayChartProps {
  /** The batted ball to display. null if in-play but no Statcast data yet. */
  hitData: BattedBallData | null;
  /** Venue field info for the outline. null → generic diamond. */
  venueFieldInfo: VenueFieldInfo | null;
}

export function SprayChart({ hitData, venueFieldInfo }: SprayChartProps) {
  const scale = computeFieldScale(venueFieldInfo);
  const ariaLabel = buildAriaLabel(hitData);

  // Convert MLB spray chart pixel coordinates to SVG position using the same
  // scale as FieldOutline so the dot aligns with the field outline geometry.
  const coords = hitData?.coordinates ?? null;
  let dotX: number | null = null;
  let dotY: number | null = null;
  if (coords !== null) {
    const feetX = (coords.coordX - MLB_HOME_X) / MLB_PIXELS_PER_FOOT;
    const feetY = (MLB_HOME_Y - coords.coordY) / MLB_PIXELS_PER_FOOT; // flip Y axis
    dotX = SPRAY_HOME_X + feetX * scale;
    dotY = SPRAY_HOME_Y - feetY * scale;
  }

  const trajectoryLabel = hitData?.trajectory != null ? formatTrajectory(hitData.trajectory) : null;

  return (
    <div role="img" aria-label={ariaLabel} className="relative">
      {/* Field outline — shares the same viewBox so the dot overlay aligns */}
      <FieldOutline venueFieldInfo={venueFieldInfo} ariaHidden />

      {/* Dot + label overlay — same viewBox as FieldOutline for pixel-perfect alignment */}
      <svg
        viewBox={`0 0 ${SPRAY_VB_W} ${SPRAY_VB_H}`}
        width="100%"
        className="absolute inset-0 overflow-visible"
        style={{ pointerEvents: 'none' }}
        aria-hidden
      >
        {dotX !== null && dotY !== null && (
          <circle
            cx={dotX}
            cy={dotY}
            r={8}
            fill="var(--color-accent-batting)"
            data-testid="hit-dot"
            style={{
              transformBox: 'fill-box',
              transformOrigin: 'center',
              animation: 'spray-dot-pulse 0.6s ease-out 1 both',
            }}
          />
        )}
        {trajectoryLabel !== null && (
          <text
            x={SPRAY_VB_W / 2}
            y={SPRAY_VB_H - 6}
            textAnchor="middle"
            fontSize={10}
            fill="var(--color-fg-muted)"
            fontFamily="inherit"
          >
            {trajectoryLabel}
          </text>
        )}
      </svg>
    </div>
  );
}
