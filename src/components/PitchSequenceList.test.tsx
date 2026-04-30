import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PitchSequenceList } from './PitchSequenceList';
import type { PitchEvent } from '../game-update';

function makePitch(overrides: Partial<PitchEvent> = {}): PitchEvent {
  return {
    pitchNumber: 1,
    pitchType: 'Four-Seam Fastball',
    pitchTypeCode: 'FF',
    call: 'Called Strike',
    isBall: false,
    isStrike: true,
    isInPlay: false,
    speedMph: 95,
    countAfter: { balls: 0, strikes: 1 },
    tracking: null,
    hitData: null,
    ...overrides,
  };
}

describe('PitchSequenceList', () => {
  it('renders nothing when pitches is empty', () => {
    const { container } = render(<PitchSequenceList pitches={[]} showNumbers={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders a row for each pitch', () => {
    const pitches = [
      makePitch({ pitchNumber: 1, call: 'Ball' }),
      makePitch({ pitchNumber: 2, call: 'Called Strike' }),
      makePitch({ pitchNumber: 3, call: 'Foul' }),
    ];
    render(<PitchSequenceList pitches={pitches} showNumbers={false} />);
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('CS')).toBeInTheDocument();
    expect(screen.getByText('F')).toBeInTheDocument();
  });

  it('abbreviates known call strings correctly', () => {
    const cases: [string, string][] = [
      ['Ball', 'B'],
      ['Called Strike', 'CS'],
      ['Swinging Strike', 'SS'],
      ['Swinging Strike (Blocked)', 'SS(B)'],
      ['Foul', 'F'],
      ['Foul Tip', 'FT'],
      ['In play, out(s)', 'IP(O)'],
      ['In play, run(s)', 'IP(R)'],
      ['In play, no out', 'IP'],
      ['Hit By Pitch', 'HBP'],
    ];
    for (const [call, expected] of cases) {
      const { unmount } = render(
        <PitchSequenceList pitches={[makePitch({ call })]} showNumbers={false} />
      );
      expect(screen.getByText(expected)).toBeInTheDocument();
      unmount();
    }
  });

  it('falls back to first word for unknown call strings', () => {
    render(<PitchSequenceList pitches={[makePitch({ call: 'Pitchout' })]} showNumbers={false} />);
    expect(screen.getByText('Pitchout')).toBeInTheDocument();
  });

  it('shows sequence numbers when showNumbers is true', () => {
    const pitches = [
      makePitch({ pitchNumber: 1 }),
      makePitch({ pitchNumber: 2 }),
      makePitch({ pitchNumber: 3 }),
    ];
    render(<PitchSequenceList pitches={pitches} showNumbers={true} />);
    // Displayed oldest-first, so numbers shown are 1, 2, 3
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('does not show sequence numbers when showNumbers is false', () => {
    const pitches = [makePitch({ pitchNumber: 1 }), makePitch({ pitchNumber: 2 })];
    render(<PitchSequenceList pitches={pitches} showNumbers={false} />);
    expect(screen.queryByText('1')).not.toBeInTheDocument();
    expect(screen.queryByText('2')).not.toBeInTheDocument();
  });

  it('renders speed as rounded integer', () => {
    render(<PitchSequenceList pitches={[makePitch({ speedMph: 94.7 })]} showNumbers={false} />);
    expect(screen.getByText('95')).toBeInTheDocument();
  });

  it('renders em-dash for null speedMph', () => {
    render(<PitchSequenceList pitches={[makePitch({ speedMph: null })]} showNumbers={false} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders pitch type code, falling back to ?? for null', () => {
    render(
      <PitchSequenceList pitches={[makePitch({ pitchTypeCode: null })]} showNumbers={false} />
    );
    expect(screen.getByText('??')).toBeInTheDocument();
  });

  it('displays pitches oldest-first', () => {
    const pitches = [
      makePitch({ pitchNumber: 1, call: 'Ball' }),
      makePitch({ pitchNumber: 2, call: 'Called Strike' }),
    ];
    const { container } = render(<PitchSequenceList pitches={pitches} showNumbers={false} />);
    const rows = container.querySelectorAll('.flex.items-center');
    // First row (oldest) should contain B
    expect(rows[0].textContent).toContain('B');
    // Second row (newest) should contain CS
    expect(rows[1].textContent).toContain('CS');
  });
});
