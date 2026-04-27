import { render, screen } from '@testing-library/react';
import { IdleView } from './IdleView';

it('renders the idle message', () => {
  render(<IdleView />);
  expect(screen.getByText('No active game')).toBeInTheDocument();
});
