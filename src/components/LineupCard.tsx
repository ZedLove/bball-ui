import { useState } from 'react';
import type { LineupEntry } from '../game-update';

interface LineupCardProps {
  lineup: LineupEntry[];
  currentBatterId: number | null;
}

export function LineupCard({ lineup, currentBatterId }: LineupCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile: collapsible with smooth max-height transition */}
      <div className="sm:hidden w-full">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center justify-between w-full px-3 py-2 bg-surface rounded-lg text-sm text-fg-muted"
          aria-expanded={open}
        >
          <span>Lineup</span>
          <span aria-hidden>{open ? '▲' : '▼'}</span>
        </button>
        <div
          className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-96' : 'max-h-0'}`}
        >
          <LineupTable lineup={lineup} currentBatterId={currentBatterId} />
        </div>
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
  if (lineup.length === 0) {
    return <p className="text-[10px] text-fg-faint px-1 py-2">Lineup unavailable</p>;
  }

  return (
    <table className="w-full text-xs mt-1">
      <thead>
        <tr>
          <th className="text-left py-0.5 pr-1 w-5 text-[10px] text-fg-faint font-normal">#</th>
          <th className="text-left py-0.5 pr-2 text-[10px] text-fg-faint font-normal">Name</th>
          <th className="text-right py-0.5 pr-2 text-[10px] text-fg-faint font-normal">H/AB</th>
          <th className="text-right py-0.5 text-[10px] text-fg-faint font-normal">OPS</th>
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
              <td
                className={`py-0.5 pr-2 truncate max-w-[100px] ${
                  isCurrent ? 'text-fg' : 'text-fg-muted'
                }`}
              >
                {entry.fullName}
              </td>
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
