import { render, screen } from '@testing-library/react';
import { OutsDisplay } from './OutsDisplay';

describe('OutsDisplay', () => {
  it('renders 3 circles', () => {
    const { container } = render(<OutsDisplay outs={0} />);
    const circles = container.querySelectorAll('.rounded-full');
    expect(circles).toHaveLength(3);
  });

  it('shows "3 outs remaining" with 0 outs', () => {
    render(<OutsDisplay outs={0} />);
    expect(screen.getByText('3 outs remaining')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: '3 outs remaining' })).toBeInTheDocument();
  });

  it('shows "1 out remaining" (singular) with 2 outs', () => {
    render(<OutsDisplay outs={2} />);
    expect(screen.getByText('1 out remaining')).toBeInTheDocument();
  });

  it('fills the correct number of circles for 1 out', () => {
    const { container } = render(<OutsDisplay outs={1} />);
    const circles = container.querySelectorAll('.rounded-full');
    const filled = Array.from(circles).filter((c) => c.className.includes('bg-white'));
    const hollow = Array.from(circles).filter((c) => c.className.includes('border-white'));
    expect(filled).toHaveLength(1);
    expect(hollow).toHaveLength(2);
  });

  it('all circles filled with 2 outs (one remaining)', () => {
    const { container } = render(<OutsDisplay outs={2} />);
    const filled = container.querySelectorAll('.bg-white.rounded-full');
    expect(filled).toHaveLength(2);
  });
});
