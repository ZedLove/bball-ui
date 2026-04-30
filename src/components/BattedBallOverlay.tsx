import type { BattedBallData } from '../game-update';

interface BattedBallOverlayProps {
  hitData: BattedBallData;
}

function formatTrajectory(trajectory: string): string {
  return trajectory
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function BattedBallOverlay({ hitData }: BattedBallOverlayProps) {
  const hasAnyData =
    hitData.launchSpeed != null ||
    hitData.launchAngle != null ||
    hitData.totalDistance != null ||
    hitData.trajectory != null;

  if (!hasAnyData) {
    return <p className="text-center text-sm text-fg-muted py-1">In play</p>;
  }

  const isHighVelo = hitData.launchSpeed != null && hitData.launchSpeed >= 95;

  return (
    <div className="flex items-center justify-center gap-3 py-1 flex-wrap">
      {hitData.trajectory != null && (
        <span className="text-xs px-2 py-0.5 rounded bg-surface text-fg-muted">
          {formatTrajectory(hitData.trajectory)}
        </span>
      )}
      {hitData.launchSpeed != null && (
        <span className={`text-lg font-bold ${isHighVelo ? 'text-accent-outs' : 'text-fg'}`}>
          {hitData.launchSpeed} mph
        </span>
      )}
      {hitData.launchAngle != null && (
        <span className="text-sm text-fg-muted">{hitData.launchAngle}°</span>
      )}
      {hitData.totalDistance != null && (
        <span className="text-sm text-fg-muted">{hitData.totalDistance} ft</span>
      )}
    </div>
  );
}
