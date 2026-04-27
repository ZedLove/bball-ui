import { render, screen } from '@testing-library/react';
import { RunsNeeded } from './RunsNeeded';

describe('RunsNeeded', () => {
  it('shows plural label for 2+ runs', () => {
    render(<RunsNeeded runsNeeded={2} />);
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('runs needed to take the lead')).toBeInTheDocument();
  });

  it('shows singular label for exactly 1 run', () => {
    render(<RunsNeeded runsNeeded={1} />);
    expect(screen.getByText('run needed to take the lead')).toBeInTheDocument();
  });

  it('has aria-live on the container', () => {
    const { container } = render(<RunsNeeded runsNeeded={2} />);
    expect(container.firstChild).toHaveAttribute('aria-live', 'polite');
  });
});
