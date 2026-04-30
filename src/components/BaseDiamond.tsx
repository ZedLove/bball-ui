import type { RunnerState } from '../game-update';

interface BaseDiamondProps {
  first: RunnerState | null;
  second: RunnerState | null;
  third: RunnerState | null;
}

const SIZE = 80;
const CENTER = SIZE / 2;
const BASE_SIZE = 14; // side length of each base square

// Base positions (centre of each base square)
const BASES = {
  second: { x: CENTER, y: 8 },
  third: { x: 8, y: CENTER },
  first: { x: SIZE - 8, y: CENTER },
  home: { x: CENTER, y: SIZE - 8 },
};

function buildAriaLabel(
  first: RunnerState | null,
  second: RunnerState | null,
  third: RunnerState | null
): string {
  const occupied = [
    first ? 'first' : null,
    second ? 'second' : null,
    third ? 'third' : null,
  ].filter(Boolean);

  if (occupied.length === 0) return 'Bases empty';
  if (occupied.length === 1) return `Runner on ${occupied[0]}`;
  const last = occupied.pop();
  return `Runners on ${occupied.join(', ')} and ${last}`;
}

function formatName(fullName: string): string {
  const parts = fullName.split(' ');
  if (parts.length < 2) return fullName;
  const first = parts[0];
  const rest = parts.slice(1).join(' ');
  return `${first[0]}. ${rest}`;
}

function RunnerInfo({ label, runner }: { label: string; runner: RunnerState }) {
  const name = formatName(runner.fullName);
  const hasSb = runner.seasonSbAttempts > 0;
  return (
    <li className="text-xs text-fg-muted">
      <span className="text-fg-faint">{label}:</span> {name}
      {hasSb && (
        <span className="text-fg-faint ml-1">
          ({runner.seasonSb}/{runner.seasonSbAttempts} SB)
        </span>
      )}
    </li>
  );
}

function BaseSquare({ cx, cy, occupied }: { cx: number; cy: number; occupied: boolean }) {
  return (
    <rect
      x={cx - BASE_SIZE / 2}
      y={cy - BASE_SIZE / 2}
      width={BASE_SIZE}
      height={BASE_SIZE}
      transform={`rotate(45 ${cx} ${cy})`}
      fill={occupied ? 'var(--color-accent-batting)' : 'none'}
      stroke={occupied ? 'var(--color-accent-batting)' : 'var(--color-border)'}
      strokeWidth={1.5}
    />
  );
}

export function BaseDiamond({ first, second, third }: BaseDiamondProps) {
  const ariaLabel = buildAriaLabel(first, second, third);
  const runners = [
    first ? { label: '1B', runner: first } : null,
    second ? { label: '2B', runner: second } : null,
    third ? { label: '3B', runner: third } : null,
  ].filter((r): r is { label: string; runner: RunnerState } => r !== null);

  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        width={SIZE}
        height={SIZE}
        role="img"
        aria-label={ariaLabel}
        className="overflow-visible"
      >
        {/* Base lines */}
        <polygon
          points={`${CENTER},${BASES.second.y} ${BASES.first.x},${CENTER} ${CENTER},${BASES.home.y} ${BASES.third.x},${CENTER}`}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={1}
        />
        {/* Bases */}
        <BaseSquare cx={BASES.second.x} cy={BASES.second.y} occupied={second !== null} />
        <BaseSquare cx={BASES.first.x} cy={BASES.first.y} occupied={first !== null} />
        <BaseSquare cx={BASES.third.x} cy={BASES.third.y} occupied={third !== null} />
        {/* Home plate (pentagon-ish — simple square rotated) */}
        <rect
          x={CENTER - BASE_SIZE / 2}
          y={BASES.home.y - BASE_SIZE / 2}
          width={BASE_SIZE}
          height={BASE_SIZE}
          transform={`rotate(45 ${CENTER} ${BASES.home.y})`}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={1}
          strokeDasharray="3 2"
        />
      </svg>
      {runners.length > 0 && (
        <ul className="list-none p-0 m-0 flex flex-col gap-0.5">
          {runners.map(({ label, runner }) => (
            <RunnerInfo key={runner.id} label={label} runner={runner} />
          ))}
        </ul>
      )}
    </div>
  );
}
