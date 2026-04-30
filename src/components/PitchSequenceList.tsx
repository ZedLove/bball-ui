import type { PitchEvent } from '../game-update';
import { getPitchColor } from '../pitch-colors';

interface PitchSequenceListProps {
  pitches: PitchEvent[];
  showNumbers: boolean;
}

const CALL_ABBREVIATIONS: Record<string, string> = {
  Ball: 'B',
  'Called Strike': 'CS',
  'Swinging Strike': 'SS',
  'Swinging Strike (Blocked)': 'SS(B)',
  Foul: 'F',
  'Foul Tip': 'FT',
  'Foul Bunt': 'FB',
  'Missed Bunt': 'MB',
  'In play, out(s)': 'IP(O)',
  'In play, run(s)': 'IP(R)',
  'In play, no out': 'IP',
  'Hit By Pitch': 'HBP',
  'Intent Ball': 'IB',
};

function abbreviateCall(call: string): string {
  return CALL_ABBREVIATIONS[call] ?? call.split(' ')[0];
}

function callColor(pitch: PitchEvent): string {
  if (pitch.isInPlay) return 'var(--color-accent-batting)';
  if (pitch.isStrike) return 'var(--color-accent-warm)';
  return 'var(--color-fg-muted)';
}

export function PitchSequenceList({ pitches, showNumbers }: PitchSequenceListProps) {
  if (pitches.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-0.5 min-w-0">
      {pitches.map((pitch, displayIdx) => {
        const seqNumber = showNumbers ? displayIdx + 1 : null;
        const abbr = abbreviateCall(pitch.call);
        const speed = pitch.speedMph !== null ? `${Math.round(pitch.speedMph)}` : '—';

        return (
          <div key={pitch.pitchNumber} className="flex items-center gap-1.5 text-xs">
            {seqNumber !== null && (
              <span className="text-fg-faint w-4 text-right shrink-0">{seqNumber}</span>
            )}
            {/* Pitch type colour dot */}
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: getPitchColor(pitch.pitchTypeCode) }}
            />
            {/* Type code */}
            <span className="text-fg-muted font-mono w-5 shrink-0">
              {pitch.pitchTypeCode ?? '??'}
            </span>
            {/* Speed */}
            <span className="text-fg-muted font-mono w-7 text-right shrink-0">{speed}</span>
            {/* Call abbreviation */}
            <span className="font-medium shrink-0" style={{ color: callColor(pitch) }}>
              {abbr}
            </span>
          </div>
        );
      })}
    </div>
  );
}
