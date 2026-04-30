/**
 * Maps Statcast pitch type codes to CSS custom property references.
 * Colours are defined in index.css and registered in the @theme block.
 * Used by StrikeZone and future visualization components for SVG fill/stroke.
 */

const PITCH_TYPE_COLORS: Record<string, string> = {
  FF: 'var(--color-pitch-ff)',
  SI: 'var(--color-pitch-si)',
  FC: 'var(--color-pitch-fc)',
  CH: 'var(--color-pitch-ch)',
  FS: 'var(--color-pitch-fs)',
  SL: 'var(--color-pitch-sl)',
  ST: 'var(--color-pitch-st)',
  CU: 'var(--color-pitch-cu)',
  KC: 'var(--color-pitch-kc)',
  KN: 'var(--color-pitch-kn)',
};

const FALLBACK_COLOR = 'var(--color-pitch-other)';

export function getPitchColor(typeCode: string | null): string {
  if (!typeCode) return FALLBACK_COLOR;
  return PITCH_TYPE_COLORS[typeCode] ?? FALLBACK_COLOR;
}
