import { render, screen } from '@testing-library/react';
import { DelayBanner } from './DelayBanner';

it('shows the delay description when provided', () => {
  render(<DelayBanner description="Delayed: Rain" />);
  expect(screen.getByText('Delayed: Rain')).toBeInTheDocument();
  expect(screen.getByRole('alert')).toBeInTheDocument();
});

it('falls back to generic text when description is null', () => {
  render(<DelayBanner description={null} />);
  expect(screen.getByText('Game delayed')).toBeInTheDocument();
});
