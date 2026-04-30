import { useState, useEffect, useRef } from 'react';
import type { AtBatState, BattedBallData, PitchEvent, VenueFieldInfo } from '../game-update';
import type { PitchFilter } from './PitchFilterToggle';
import { PitchFilterToggle } from './PitchFilterToggle';
import { StrikeZone } from './StrikeZone';
import { PitchSequenceList } from './PitchSequenceList';
import { SprayChart } from './SprayChart';
import { BattedBallOverlay } from './BattedBallOverlay';

interface StrikeZonePanelProps {
  atBat: AtBatState | null;
  pitchHistory: PitchEvent[];
  venueFieldInfo: VenueFieldInfo | null;
}

export function StrikeZonePanel({
  atBat,
  pitchHistory: rawPitchHistory,
  venueFieldInfo,
}: StrikeZonePanelProps) {
  // Guard against null/undefined from stale persisted state or unexpected backend values
  const pitchHistory: PitchEvent[] = rawPitchHistory ?? [];
  const [filter, setFilter] = useState<PitchFilter>('at-bat');

  // ── Zone/spray state machine ─────────────────────────────────────────────
  const [displayMode, setDisplayMode] = useState<'zone' | 'spray'>('zone');
  const [inPlayHitData, setInPlayHitData] = useState<BattedBallData | null>(null);
  // Track which in-play pitch has been "seen" to avoid re-triggering on re-renders
  const lastInPlayRef = useRef<number | null>(null);

  // Transition zone → spray when the latest pitch in the sequence is in-play
  useEffect(() => {
    const seq = atBat?.pitchSequence ?? [];
    const lastPitch = seq.at(-1);
    if (!lastPitch?.isInPlay) return;
    if (lastPitch.pitchNumber === lastInPlayRef.current) return;
    lastInPlayRef.current = lastPitch.pitchNumber;
    setInPlayHitData(lastPitch.hitData);
    setDisplayMode('spray');
  }, [atBat]);

  // Auto-revert to zone after 8 seconds
  useEffect(() => {
    if (displayMode !== 'spray') return;
    const timer = setTimeout(() => setDisplayMode('zone'), 8000);
    return () => clearTimeout(timer);
  }, [displayMode]);

  // Revert immediately when new pitch data arrives after the in-play pitch
  useEffect(() => {
    if (displayMode !== 'spray') return;
    const seq = atBat?.pitchSequence ?? [];
    const lastPitch = seq.at(-1);
    if (atBat === null || seq.length === 0 || (lastPitch !== undefined && !lastPitch.isInPlay)) {
      setDisplayMode('zone');
    }
  }, [atBat, displayMode]);

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
      {displayMode === 'spray' ? (
        <div className="animate-fade-in w-full flex flex-col gap-2">
          <SprayChart hitData={inPlayHitData} venueFieldInfo={venueFieldInfo} />
          {inPlayHitData !== null && <BattedBallOverlay hitData={inPlayHitData} />}
        </div>
      ) : (
        <div className="animate-fade-in flex sm:flex-row flex-col gap-4 w-full sm:items-start">
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
      )}
      {displayMode === 'zone' && (
        <PitchFilterToggle value={activeFilter} onChange={setFilter} options={availableOptions} />
      )}
    </div>
  );
}
