import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BaseDiamond } from './BaseDiamond';
import type { RunnerState } from '../game-update';

function makeRunner(overrides: Partial<RunnerState> = {}): RunnerState {
  return {
    id: 1,
    fullName: 'George Springer',
    seasonSb: 15,
    seasonSbAttempts: 18,
    ...overrides,
  };
}

describe('BaseDiamond', () => {
  it('renders three base indicators in the SVG', () => {
    const { container } = render(<BaseDiamond first={null} second={null} third={null} />);
    // Three base squares + home plate = 4 rects
    const rects = container.querySelectorAll('rect');
    expect(rects.length).toBe(4);
  });

  it('uses accent fill for an occupied base', () => {
    const { container } = render(<BaseDiamond first={makeRunner()} second={null} third={null} />);
    const filledRects = Array.from(container.querySelectorAll('rect')).filter(
      (r) => r.getAttribute('fill') === 'var(--color-accent-batting)'
    );
    expect(filledRects.length).toBe(1);
  });

  it('uses no fill for unoccupied bases', () => {
    const { container } = render(<BaseDiamond first={null} second={null} third={null} />);
    const noneFillRects = Array.from(container.querySelectorAll('rect')).filter(
      (r) => r.getAttribute('fill') === 'none'
    );
    // 3 empty bases + 1 home plate = 4 none-fill rects
    expect(noneFillRects.length).toBe(4);
  });

  it('shows runner name for an occupied base', () => {
    render(
      <BaseDiamond first={makeRunner({ fullName: 'George Springer' })} second={null} third={null} />
    );
    expect(screen.getByText(/G\. Springer/)).toBeInTheDocument();
  });

  it('shows SB stats when seasonSbAttempts > 0', () => {
    render(
      <BaseDiamond
        first={makeRunner({ seasonSb: 15, seasonSbAttempts: 18 })}
        second={null}
        third={null}
      />
    );
    expect(screen.getByText('(15/18 SB)')).toBeInTheDocument();
  });

  it('hides SB stats when seasonSbAttempts === 0', () => {
    render(
      <BaseDiamond
        first={makeRunner({ seasonSb: 0, seasonSbAttempts: 0 })}
        second={null}
        third={null}
      />
    );
    expect(screen.queryByText(/SB/)).not.toBeInTheDocument();
  });

  it('shows "Bases empty" aria-label when no runners are on base', () => {
    render(<BaseDiamond first={null} second={null} third={null} />);
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Bases empty');
  });

  it('shows correct aria-label for a single runner on first', () => {
    render(<BaseDiamond first={makeRunner()} second={null} third={null} />);
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Runner on first');
  });

  it('shows correct aria-label for runners on first and third', () => {
    render(<BaseDiamond first={makeRunner()} second={null} third={makeRunner({ id: 2 })} />);
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Runners on first and third');
  });

  it('shows correct aria-label for bases loaded', () => {
    render(
      <BaseDiamond
        first={makeRunner({ id: 1 })}
        second={makeRunner({ id: 2 })}
        third={makeRunner({ id: 3 })}
      />
    );
    expect(screen.getByRole('img')).toHaveAttribute(
      'aria-label',
      'Runners on first, second and third'
    );
  });

  it('does not show runner info when all bases are empty', () => {
    render(<BaseDiamond first={null} second={null} third={null} />);
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });
});
