import { render, screen } from '@testing-library/react';
import { Scoreboard } from './Scoreboard';
import { makeUpdate } from '../test/fixtures';

describe('Scoreboard', () => {
  it('renders team abbreviations and scores', () => {
    render(<Scoreboard update={makeUpdate()} />);
    expect(screen.getByText('TOR')).toBeInTheDocument();
    expect(screen.getByText('NYM')).toBeInTheDocument();
    expect(screen.getAllByText(/3|2/).length).toBeGreaterThan(0);
  });

  it('shows "Top 5th" inning label', () => {
    render(<Scoreboard update={makeUpdate()} />);
    expect(screen.getByText('Top 5th')).toBeInTheDocument();
  });

  it('shows "Mid" label for Middle (between-innings)', () => {
    render(
      <Scoreboard update={makeUpdate({ inning: { number: 5, half: 'Middle', ordinal: '5th' } })} />
    );
    expect(screen.getByText('Mid 5th')).toBeInTheDocument();
  });

  it('does not show EXTRA INNINGS badge in regulation', () => {
    render(<Scoreboard update={makeUpdate({ isExtraInnings: false })} />);
    expect(screen.queryByText('EXTRA INNINGS')).not.toBeInTheDocument();
  });

  it('shows EXTRA INNINGS badge when isExtraInnings', () => {
    render(
      <Scoreboard
        update={makeUpdate({
          isExtraInnings: true,
          inning: { number: 10, half: 'Top', ordinal: '10th' },
        })}
      />
    );
    expect(screen.getByText('EXTRA INNINGS')).toBeInTheDocument();
  });

  it('renders defending team with brighter styling than batting team', () => {
    // NYM is defending (home), TOR is batting (away)
    render(<Scoreboard update={makeUpdate({ defendingTeam: 'NYM' })} />);
    const awayLabel = screen.getByText('TOR');
    const homeLabel = screen.getByText('NYM');
    // Away (batting) should have text-gray-400; Home (defending) should have text-white
    expect(awayLabel.className).toContain('text-gray-400');
    expect(homeLabel.className).toContain('text-white');
  });
});
