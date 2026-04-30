import { render, screen } from '@testing-library/react';
import { OutsDisplay } from './OutsDisplay';

describe('OutsDisplay', () => {
  it('renders 3 circles', () => {
    const { container } = render(
      <OutsDisplay outs={0} outsRemaining={3} totalOutsRemaining={null} />
    );
    const circles = container.querySelectorAll('.rounded-full');
    expect(circles).toHaveLength(3);
  });

  it('shows "3 outs remaining" with 0 outs', () => {
    render(<OutsDisplay outs={0} outsRemaining={3} totalOutsRemaining={null} />);
    expect(screen.getByText('3 outs remaining')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: '3 outs remaining' })).toBeInTheDocument();
  });

  it('shows "1 out remaining" (singular) with 2 outs', () => {
    render(<OutsDisplay outs={2} outsRemaining={1} totalOutsRemaining={null} />);
    expect(screen.getByText('1 out remaining')).toBeInTheDocument();
  });

  it('fills the correct number of circles for 1 out', () => {
    const { container } = render(
      <OutsDisplay outs={1} outsRemaining={2} totalOutsRemaining={null} />
    );
    const circles = container.querySelectorAll('.rounded-full');
    const filled = Array.from(circles).filter((c) => c.className.includes('bg-accent-outs'));
    const hollow = Array.from(circles).filter((c) => c.className.includes('border-accent-outs'));
    expect(filled).toHaveLength(1);
    expect(hollow).toHaveLength(2);
  });

  it('all circles filled with 2 outs (one remaining)', () => {
    const { container } = render(
      <OutsDisplay outs={2} outsRemaining={1} totalOutsRemaining={null} />
    );
    const filled = container.querySelectorAll('.bg-accent-outs.rounded-full');
    expect(filled).toHaveLength(2);
  });

  it('shows totalOutsRemaining when provided', () => {
    render(<OutsDisplay outs={1} outsRemaining={2} totalOutsRemaining={14} />);
    expect(screen.getByText('14 outs left in the game')).toBeInTheDocument();
  });

  it('does not show total outs line when totalOutsRemaining is null', () => {
    render(<OutsDisplay outs={1} outsRemaining={2} totalOutsRemaining={null} />);
    expect(screen.queryByText(/outs left in the game/)).not.toBeInTheDocument();
  });

  it('shows singular label when totalOutsRemaining is 1', () => {
    render(<OutsDisplay outs={2} outsRemaining={1} totalOutsRemaining={1} />);
    expect(screen.getByText('1 out left in the game')).toBeInTheDocument();
  });
});
