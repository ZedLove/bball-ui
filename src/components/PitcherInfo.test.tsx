import { render, screen } from '@testing-library/react';
import { PitcherInfo } from './PitcherInfo';

const pitcher = { id: 800001, fullName: 'Max Fried' };

it('shows pitcher name', () => {
  render(<PitcherInfo pitcher={pitcher} pitchingChange={false} />);
  expect(screen.getByText('Pitching: Max Fried')).toBeInTheDocument();
});

it('shows NEW badge on pitching change', () => {
  render(<PitcherInfo pitcher={pitcher} pitchingChange={true} />);
  expect(screen.getByText('NEW')).toBeInTheDocument();
});

it('does not show NEW badge when no pitching change', () => {
  render(<PitcherInfo pitcher={pitcher} pitchingChange={false} />);
  expect(screen.queryByText('NEW')).not.toBeInTheDocument();
});
