import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { PitchFilterToggle } from './PitchFilterToggle';
import type { PitchFilter } from './PitchFilterToggle';

describe('PitchFilterToggle', () => {
  const allOptions: PitchFilter[] = ['all', 'at-bat', 'last'];

  it('renders all provided options as radio buttons', () => {
    render(<PitchFilterToggle value="at-bat" onChange={() => {}} options={allOptions} />);
    expect(screen.getByRole('radio', { name: 'All' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'AB' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Last' })).toBeInTheDocument();
  });

  it('marks only the active option as aria-checked="true"', () => {
    render(<PitchFilterToggle value="at-bat" onChange={() => {}} options={allOptions} />);
    expect(screen.getByRole('radio', { name: 'AB' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'All' })).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByRole('radio', { name: 'Last' })).toHaveAttribute('aria-checked', 'false');
  });

  it('calls onChange with the correct filter value on click', async () => {
    const onChange = vi.fn();
    render(<PitchFilterToggle value="at-bat" onChange={onChange} options={allOptions} />);
    await userEvent.click(screen.getByRole('radio', { name: 'Last' }));
    expect(onChange).toHaveBeenCalledWith('last');
  });

  it('calls onChange with "all" when the All button is clicked', async () => {
    const onChange = vi.fn();
    render(<PitchFilterToggle value="at-bat" onChange={onChange} options={allOptions} />);
    await userEvent.click(screen.getByRole('radio', { name: 'All' }));
    expect(onChange).toHaveBeenCalledWith('all');
  });

  it('hides options not in the options array', () => {
    const battingOptions: PitchFilter[] = ['at-bat', 'last'];
    render(<PitchFilterToggle value="at-bat" onChange={() => {}} options={battingOptions} />);
    expect(screen.queryByRole('radio', { name: 'All' })).not.toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'AB' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Last' })).toBeInTheDocument();
  });

  it('has accessible radiogroup role with aria-label', () => {
    render(<PitchFilterToggle value="at-bat" onChange={() => {}} options={allOptions} />);
    expect(screen.getByRole('radiogroup', { name: 'Pitch filter' })).toBeInTheDocument();
  });
});
