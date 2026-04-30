import { useState } from 'react';
import type { LineupEntry } from '../game-update';

interface LineupCardProps {
  lineup: LineupEntry[];
  currentBatterId: number | null;
}

export function LineupCard({ lineup, currentBatterId }: LineupCardProps) {
  const [open, setOpen] = useState(false);

  if (lineup.length === 0) return null;

  return (
    <>
      {/* Mobile: collapsible */}
      <div className="sm:hidden w-full">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center justify-between w-full px-3 py-2 bg-surface rounded-lg text-sm text-fg-muted"
          aria-expanded={open}
        >
          <span>Lineup</span>
          <span aria-hidden>{open ? '▲' : '▼'}</span>
        </button>
        {open && <LineupTable lineup={lineup} currentBatterId={currentBatterId} />}
      </div>

      {/* Desktop: always visible */}
      <div className="hidden sm:block">
        <LineupTable lineup={lineup} currentBatterId={currentBatterId} />
      </div>
    </>
  );
}

function LineupTable({
  lineup,
  currentBatterId,
}: {
  lineup: LineupEntry[];
  currentBatterId: number | null;
}) {
  return (
    <table className="w-full text-xs mt-1">
      <thead>
        <tr className="text-fg-faint">
          <th className="text-left py-0.5 pr-1 w-5">#</th>
          <th className="text-left py-0.5 pr-2">Name</th>
          <th className="text-right py-0.5 pr-2">H/AB</th>
          <th className="text-right py-0.5">OPS</th>
        </tr>
      </thead>
      <tbody>
        {lineup.map((entry) => {
          const slot = Math.floor(entry.battingOrder / 100);
          const isCurrent = entry.id === currentBatterId;
          return (
            <tr
              key={entry.id}
              className={isCurrent ? 'bg-surface-alt rounded' : ''}
              aria-current={isCurrent ? 'true' : undefined}
            >
              <td className="py-0.5 pr-1 text-fg-faint">{slot}</td>
              <td className="py-0.5 pr-2 text-fg truncate max-w-[100px]">{entry.fullName}</td>
              <td className="py-0.5 pr-2 text-fg-muted text-right">
                {entry.hits}/{entry.atBats}
              </td>
              <td className="py-0.5 text-fg-muted text-right">{entry.seasonOps ?? '—'}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
