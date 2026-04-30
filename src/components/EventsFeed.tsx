import { useState } from 'react';
import type { GameEvent, PlateAppearanceCompletedEvent } from '../game-events';

interface EventsFeedProps {
  events: GameEvent[];
}

type FeedFilter = 'all' | 'scoring';

function formatHalfInning(halfInning: 'top' | 'bottom', inning: number): string {
  return `${halfInning === 'top' ? 'T' : 'B'}${inning}`;
}

function isPlateAppearance(event: GameEvent): event is PlateAppearanceCompletedEvent {
  return event.category === 'plate-appearance-completed';
}

function isScoring(event: GameEvent): boolean {
  return isPlateAppearance(event) && event.isScoringPlay;
}

function categoryLabel(event: GameEvent): string {
  switch (event.category) {
    case 'pitching-substitution':
      return 'P-SUB';
    case 'offensive-substitution':
      return 'O-SUB';
    case 'defensive-substitution':
      return 'D-SUB';
    case 'plate-appearance-completed':
      return '';
  }
}

export function EventsFeed({ events }: EventsFeedProps) {
  const [filter, setFilter] = useState<FeedFilter>('all');

  const hasScoringPlays = events.some(isScoring);

  const filtered =
    filter === 'scoring' ? events.filter((e) => !isPlateAppearance(e) || isScoring(e)) : events;

  return (
    <div className="flex flex-col gap-2">
      {/* Tab bar */}
      <div className="flex gap-2 text-xs">
        <button
          className={`px-2 py-0.5 rounded ${filter === 'all' ? 'bg-surface-alt text-fg font-medium' : 'text-fg-muted'}`}
          onClick={() => setFilter('all')}
          aria-pressed={filter === 'all'}
        >
          All
        </button>
        <button
          className={`px-2 py-0.5 rounded ${filter === 'scoring' ? 'bg-surface-alt text-fg font-medium' : 'text-fg-muted'} disabled:opacity-40`}
          onClick={() => setFilter('scoring')}
          aria-pressed={filter === 'scoring'}
          disabled={!hasScoringPlays}
        >
          Scoring
        </button>
      </div>

      {/* Event list */}
      <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="text-xs text-fg-faint">No events yet.</p>
        ) : (
          filtered.map((event, idx) => {
            const label = categoryLabel(event);
            const scoring = isScoring(event);
            return (
              <div
                key={`${event.gamePk}-${event.atBatIndex}-${idx}`}
                className={`flex gap-2 text-xs items-start ${scoring ? 'border-l-2 border-accent-warm pl-1.5' : ''}`}
              >
                <span className="text-fg-faint shrink-0 font-mono">
                  {formatHalfInning(event.halfInning, event.inning)}
                </span>
                {label && (
                  <span className="text-fg-faint shrink-0 font-mono text-[10px]">{label}</span>
                )}
                <span className="text-fg-muted leading-tight">{event.description}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
