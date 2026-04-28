import type { PitcherGameStats } from '../game-update';
import { PitcherInfo } from './PitcherInfo';

interface OutsDisplayProps {
  /** Current out count in the half-inning (0–2). */
  outs: number;
  /** 3 − outs, from the backend. */
  outsRemaining: number;
  totalOutsRemaining: number | null;
  currentPitcher: (PitcherGameStats & { id: number; fullName: string }) | null;
}

export function OutsDisplay({
  outs,
  outsRemaining,
  totalOutsRemaining,
  currentPitcher,
}: OutsDisplayProps) {
  const label = outsRemaining === 1 ? '1 out remaining' : `${outsRemaining} outs remaining`;
  const totalLabel =
    totalOutsRemaining === 1
      ? '1 out left in the game'
      : `${totalOutsRemaining} outs left in the game`;

  return (
    <div className="flex flex-col items-center gap-6">
      <div role="img" aria-label={label} className="flex items-center gap-4">
        {Array.from({ length: 3 }, (_, i) => {
          const recorded = i < outs;
          return (
            <div
              key={i}
              className={`h-12 w-12 rounded-full transition-all duration-300 ${
                recorded ? 'bg-white' : 'border-2 border-white'
              }`}
            />
          );
        })}
      </div>

      <div className="flex flex-col items-center gap-1.5">
        <p className="text-gray-400 text-sm">{label}</p>
        {totalOutsRemaining !== null && <p className="text-gray-600 text-xs">{totalLabel}</p>}
      </div>

      {currentPitcher && <PitcherInfo pitcher={currentPitcher} />}
    </div>
  );
}
