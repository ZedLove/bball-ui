import type { PitcherGameStats } from '../game-update';
import { useGameStore } from '../store/gameStore';

interface PitcherInfoProps {
  pitcher: PitcherGameStats & { id: number; fullName: string };
}

export function PitcherInfo({ pitcher }: PitcherInfoProps) {
  const pitchingChangeId = useGameStore((s) => s.pitchingChangeId);
  const isPitchingChange = pitcher.id === pitchingChangeId;

  return (
    <div className="flex flex-col items-center gap-1.5 text-xs text-fg-faint">
      <div className="flex items-center justify-center gap-2">
        <span>Pitching: {pitcher.fullName}</span>
        {isPitchingChange && (
          <span className="px-1.5 py-0.5 rounded bg-accent-warning text-bg text-[10px] font-bold tracking-wide">
            NEW
          </span>
        )}
      </div>
      <p>
        {pitcher.pitchesThrown} pitches · {pitcher.strikes} S · {pitcher.balls} B
      </p>
      {pitcher.usage.length > 0 && (
        <p className="text-fg-faint">
          {pitcher.usage.map((u) => `${u.typeCode} ${u.pct}%`).join('  ')}
        </p>
      )}
    </div>
  );
}
