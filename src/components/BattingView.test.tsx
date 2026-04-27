import { render, screen } from '@testing-library/react';
import { BattingView } from './BattingView';
import { makeUpdate } from '../test/fixtures';

it('shows the batting team abbreviation', () => {
  render(<BattingView update={makeUpdate({ battingTeam: 'TOR', trackingMode: 'batting' })} />);
  expect(screen.getByText('TOR batting')).toBeInTheDocument();
});
