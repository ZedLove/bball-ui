import { useState, useEffect, useRef } from 'react';
import type { AtBatState, PitchEvent } from '../game-update';
import type { PitchFilter } from './PitchFilterToggle';
import { PitchFilterToggle } from './PitchFilterToggle';
import { StrikeZone } from './StrikeZone';
import { PitchSequenceList } from './PitchSequenceList';

interface StrikeZonePanelProps {
  atBat: AtBatState | null;
  pitchHistory: PitchEvent[];
}

export function StrikeZonePanel({ atBat, pitchHistory: rawPitchHistory }: StrikeZonePanelProps) {
  // Guard against null/undefined from stale persisted state or unexpected backend values
  const pitchHistory: PitchEvent[] = rawPitchHistory ?? [];
  const [filter, setFilter] = useState<PitchFilter>('at-bat');

  // Persist the last known at-bat so the zone stays populated between plate appearances
  const lastAtBatRef = useRef<AtBatState | null>(null);
  if (atBat !== null) {
    lastAtBatRef.current = atBat;
  }
  const effectiveAtBat = atBat ?? lastAtBatRef.current;

  // Reset filter to 'at-bat' when the batter changes.
  // Use effectiveAtBat (not atBat) so a null transition between plate appearances
  // doesn't trigger a spurious reset while the ref still holds the prior batter.
  const effectiveBatterId = effectiveAtBat?.batter.id ?? null;
  useEffect(() => {
    setFilter('at-bat');
  }, [effectiveBatterId]);

  // Available filter options depend on whether pitch history is present
  const hasHistory = pitchHistory.length > 0;
  const availableOptions: PitchFilter[] = hasHistory
    ? ['all', 'at-bat', 'last']
    : ['at-bat', 'last'];

  // If current filter is 'all' but history is gone, fall back to 'at-bat'
  const activeFilter = filter === 'all' && !hasHistory ? 'at-bat' : filter;

  const pitchSequence = effectiveAtBat?.pitchSequence ?? [];

  const rawPitches: PitchEvent[] =
    activeFilter === 'all'
      ? pitchHistory
      : activeFilter === 'at-bat'
        ? pitchSequence
        : pitchSequence.slice(-1);

  const batter =
    effectiveAtBat !== null
      ? { fullName: effectiveAtBat.batter.fullName, batSide: effectiveAtBat.batSide }
      : null;

  const count = effectiveAtBat?.count ?? null;
  // Sequence numbers are only meaningful in 'at-bat' context. In 'all' mode the
  // numbers represent position in the pitcher's game history (1–63+), which
  // conflicts with the 1-indexed at-bat numbers shown when switching back to 'AB'.
  const showNumbers = activeFilter === 'at-bat';
  // In 'all' mode show newest pitches first so recent activity is immediately
  // visible without scrolling. The zone receives rawPitches in chronological order
  // so the most-recent pitch (last element) retains full opacity.
  const pitchesForList = activeFilter === 'all' ? [...rawPitches].reverse() : rawPitches;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex sm:flex-row flex-col gap-4 w-full sm:items-start">
        <div className="w-full max-w-[240px] mx-auto sm:mx-0 sm:flex-1 sm:min-w-0">
          <StrikeZone
            pitches={rawPitches}
            batter={batter}
            count={count}
            showNumbers={showNumbers}
          />
        </div>
        {rawPitches.length > 0 && (
          <div className="w-full max-w-[240px] mx-auto sm:mx-0 sm:w-36 shrink-0 max-h-64 overflow-y-auto">
            <PitchSequenceList pitches={pitchesForList} showNumbers={showNumbers} />
          </div>
        )}
      </div>
      <PitchFilterToggle value={activeFilter} onChange={setFilter} options={availableOptions} />
    </div>
  );
}
