import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { LineupCard } from './LineupCard';
import type { LineupEntry } from '../game-update';

function makeEntry(overrides: Partial<LineupEntry> = {}): LineupEntry {
  return {
    id: 1,
    fullName: 'Vladimir Guerrero Jr.',
    battingOrder: 300,
    atBats: 2,
    hits: 1,
    seasonOps: '.832',
    ...overrides,
  };
}

const sampleLineup: LineupEntry[] = [
  makeEntry({ id: 1, fullName: 'George Springer', battingOrder: 100 }),
  makeEntry({ id: 2, fullName: 'Bo Bichette', battingOrder: 200 }),
  makeEntry({ id: 3, fullName: 'Vladimir Guerrero Jr.', battingOrder: 300 }),
];

describe('LineupCard', () => {
  it('renders nothing when lineup is empty', () => {
    const { container } = render(<LineupCard lineup={[]} currentBatterId={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders a collapsible toggle button on mobile', () => {
    render(<LineupCard lineup={sampleLineup} currentBatterId={null} />);
    expect(screen.getByRole('button', { name: /lineup/i })).toBeInTheDocument();
  });

  it('lineup table is hidden by default on mobile (collapsed)', () => {
    render(<LineupCard lineup={sampleLineup} currentBatterId={null} />);
    // Before expansion, player names should not be visible via the mobile table
    // The desktop table is always rendered (hidden via CSS), but accessible
    // We test the toggle button's aria-expanded state
    const toggle = screen.getByRole('button', { name: /lineup/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('expands the mobile lineup on button click', async () => {
    render(<LineupCard lineup={sampleLineup} currentBatterId={null} />);
    const toggle = screen.getByRole('button', { name: /lineup/i });
    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });

  it('highlights the current batter row with aria-current', () => {
    render(<LineupCard lineup={sampleLineup} currentBatterId={3} />);
    // aria-current="true" is set on the current batter's row
    const currentRows = screen
      .getAllByRole('row')
      .filter((r) => r.getAttribute('aria-current') === 'true');
    expect(currentRows.length).toBeGreaterThanOrEqual(1);
  });

  it('shows batting slot numbers', () => {
    render(<LineupCard lineup={sampleLineup} currentBatterId={null} />);
    // Desktop table always renders — slot numbers visible
    const slotCells = screen.getAllByText('1');
    expect(slotCells.length).toBeGreaterThanOrEqual(1);
  });

  it('shows player names', () => {
    render(<LineupCard lineup={sampleLineup} currentBatterId={null} />);
    expect(screen.getAllByText('George Springer').length).toBeGreaterThanOrEqual(1);
  });

  it('shows season OPS', () => {
    render(<LineupCard lineup={sampleLineup} currentBatterId={null} />);
    expect(screen.getAllByText('.832').length).toBeGreaterThanOrEqual(1);
  });

  it('shows — when seasonOps is null', () => {
    const lineup = [makeEntry({ seasonOps: null })];
    render(<LineupCard lineup={lineup} currentBatterId={null} />);
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(1);
  });
});
