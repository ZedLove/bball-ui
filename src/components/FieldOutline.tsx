import type { VenueFieldInfo } from '../game-update';

// ── Coordinate space ────────────────────────────────────────────────────────
// Fixed viewBox for all spray chart components. Home plate is at the bottom
// centre; center field opens upward (decreasing Y in SVG coordinates).
// These constants are exported so SprayChart can share the same coordinate system.
export const SPRAY_VB_W = 250;
export const SPRAY_VB_H = 220;
export const SPRAY_HOME_X = 125;
export const SPRAY_HOME_Y = 205;
const SPRAY_TOP_MARGIN = 12;

// Generic fallback distances (feet) used when no venue data is available.
// Dashed stroke is applied to indicate these are approximate.
const GENERIC_FIELD = {
  leftLine: 330,
  leftCenter: 370,
  center: 400,
  rightCenter: 370,
  rightLine: 330,
} as const;

// ── Coordinate helpers ───────────────────────────────────────────────────────

/**
 * Returns px/ft scale so the tallest fence point sits at SPRAY_TOP_MARGIN.
 * Exported so SprayChart can use the same scale when positioning the hit dot.
 */
export function computeFieldScale(venueFieldInfo: VenueFieldInfo | null): number {
  const info = venueFieldInfo ?? GENERIC_FIELD;
  const maxFence = Math.max(
    info.center,
    info.leftLine,
    info.rightLine,
    info.leftCenter,
    info.rightCenter
  );
  return (SPRAY_HOME_Y - SPRAY_TOP_MARGIN) / maxFence;
}

interface Point {
  x: number;
  y: number;
}

/**
 * Convert a distance (feet) + angle (degrees, measured counterclockwise from
 * the positive X-axis in standard math convention) to SVG pixel coordinates.
 *
 * Angles used for the spray chart fan:
 *   Right foul line  →  45°   (up-right)
 *   Right-center     →  67.5°
 *   Center           →  90°   (straight up)
 *   Left-center      → 112.5°
 *   Left foul line   → 135°   (up-left)
 */
function fieldToSVG(distFt: number, angleDeg: number, scale: number): Point {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: SPRAY_HOME_X + distFt * scale * Math.cos(rad),
    y: SPRAY_HOME_Y - distFt * scale * Math.sin(rad),
  };
}

/** Catmull-Rom spline converted to cubic bezier SVG path string. */
function catmullRomPath(pts: Point[]): string {
  if (pts.length < 2) return '';
  const n = pts.length;
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(n - 1, i + 2)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)} ${cp2x.toFixed(1)} ${cp2y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

// ── Component ────────────────────────────────────────────────────────────────

interface FieldOutlineProps {
  /** Real fence distances. null → generic fallback outline with dashed stroke. */
  venueFieldInfo: VenueFieldInfo | null;
  /**
   * Set true when embedded inside SprayChart to suppress the redundant ARIA
   * landmark — SprayChart provides the accessible label for the whole visual.
   */
  ariaHidden?: boolean;
}

export function FieldOutline({ venueFieldInfo, ariaHidden }: FieldOutlineProps) {
  const info = venueFieldInfo ?? GENERIC_FIELD;
  const scale = computeFieldScale(venueFieldInfo);
  const isGeneric = venueFieldInfo === null;

  // Fence points ordered left-to-right (left foul line → right foul line)
  const fencePoints: Point[] = [
    fieldToSVG(info.leftLine, 135, scale),
    fieldToSVG(info.leftCenter, 112.5, scale),
    fieldToSVG(info.center, 90, scale),
    fieldToSVG(info.rightCenter, 67.5, scale),
    fieldToSVG(info.rightLine, 45, scale),
  ];
  const fencePath = catmullRomPath(fencePoints);

  // Infield diamond: 90 ft base paths, vertices at 45°/90°/135° from home
  const firstBase = fieldToSVG(90, 45, scale);
  const secondBase = fieldToSVG(90 * Math.SQRT2, 90, scale);
  const thirdBase = fieldToSVG(90, 135, scale);
  const diamondPath = [
    `M ${SPRAY_HOME_X.toFixed(1)} ${SPRAY_HOME_Y.toFixed(1)}`,
    `L ${firstBase.x.toFixed(1)} ${firstBase.y.toFixed(1)}`,
    `L ${secondBase.x.toFixed(1)} ${secondBase.y.toFixed(1)}`,
    `L ${thirdBase.x.toFixed(1)} ${thirdBase.y.toFixed(1)}`,
    'Z',
  ].join(' ');

  return (
    <svg
      viewBox={`0 0 ${SPRAY_VB_W} ${SPRAY_VB_H}`}
      width="100%"
      className="block"
      role={ariaHidden ? undefined : 'img'}
      aria-label={ariaHidden ? undefined : 'Baseball field outline'}
      aria-hidden={ariaHidden || undefined}
    >
      {/* Outfield fence */}
      <path
        d={fencePath}
        fill="none"
        stroke="var(--color-border)"
        strokeWidth={1.5}
        strokeDasharray={isGeneric ? '4 3' : undefined}
        data-testid="fence-outline"
      />

      {/* Foul lines */}
      <line
        x1={SPRAY_HOME_X}
        y1={SPRAY_HOME_Y}
        x2={fencePoints[0].x}
        y2={fencePoints[0].y}
        stroke="var(--color-border)"
        strokeWidth={1}
        data-testid="foul-line-left"
      />
      <line
        x1={SPRAY_HOME_X}
        y1={SPRAY_HOME_Y}
        x2={fencePoints[4].x}
        y2={fencePoints[4].y}
        stroke="var(--color-border)"
        strokeWidth={1}
        data-testid="foul-line-right"
      />

      {/* Infield diamond */}
      <path
        d={diamondPath}
        fill="none"
        stroke="var(--color-fg-faint)"
        strokeWidth={0.5}
        data-testid="infield-diamond"
      />
    </svg>
  );
}
