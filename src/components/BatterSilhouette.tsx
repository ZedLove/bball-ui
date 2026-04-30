interface BatterSilhouetteProps {
  side: 'L' | 'R';
  height: number;
  fill?: string;
}

/**
 * Stylised batter silhouette in batting stance, rendered as an SVG <g> element
 * for embedding inside another SVG. Designed for RHB; LHB is mirrored horizontally.
 *
 * The silhouette fits within a bounding box of approximately width×height,
 * centred on x=0, y=0.
 */
export function BatterSilhouette({
  side,
  height,
  fill = 'var(--color-fg-faint)',
}: BatterSilhouetteProps) {
  // All path coordinates are normalised to a 40×80 viewBox (RHB facing left).
  // We scale to the requested height.
  const scale = height / 80;
  const w = 40 * scale;
  const h = 80 * scale;

  // Mirror for LHB (faces right in catcher's view)
  const transform =
    side === 'L'
      ? `scale(-1, 1) translate(${-w / 2}, ${-h / 2})`
      : `translate(${-w / 2}, ${-h / 2})`;

  return (
    <g transform={transform}>
      <g fill={fill} transform={`scale(${scale})`}>
        {/* Head */}
        <circle cx={28} cy={5} r={5} />
        {/* Torso */}
        <rect x={20} y={11} width={12} height={22} rx={3} />
        {/* Back arm (holding bat at top) */}
        <rect x={28} y={8} width={5} height={18} rx={2} transform="rotate(20 30 10)" />
        {/* Bat handle up — vertical rect near shoulder */}
        <rect x={30} y={3} width={3} height={22} rx={1.5} transform="rotate(15 31 10)" />
        {/* Front arm (extended toward bat) */}
        <rect x={14} y={13} width={14} height={4} rx={2} />
        {/* Hips */}
        <rect x={19} y={32} width={14} height={8} rx={2} />
        {/* Back leg */}
        <rect x={22} y={40} width={7} height={22} rx={3} transform="rotate(8 26 45)" />
        {/* Front leg */}
        <rect x={18} y={40} width={7} height={22} rx={3} transform="rotate(-10 22 45)" />
        {/* Back foot */}
        <rect x={24} y={60} width={12} height={4} rx={2} transform="rotate(8 30 62)" />
        {/* Front foot */}
        <rect x={8} y={60} width={12} height={4} rx={2} transform="rotate(-10 14 62)" />
      </g>
    </g>
  );
}
