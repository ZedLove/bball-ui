import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { OnDeckInHole } from './OnDeckInHole';

describe('OnDeckInHole', () => {
  it('renders on-deck batter name', () => {
    render(<OnDeckInHole onDeck={{ id: 1, fullName: 'Bo Bichette' }} inHole={null} />);
    expect(screen.getByText('Bo Bichette')).toBeInTheDocument();
    expect(screen.getByText('On deck:')).toBeInTheDocument();
  });

  it('renders in-the-hole batter name', () => {
    render(<OnDeckInHole onDeck={null} inHole={{ id: 2, fullName: 'Daulton Varsho' }} />);
    expect(screen.getByText('Daulton Varsho')).toBeInTheDocument();
    expect(screen.getByText('In the hole:')).toBeInTheDocument();
  });

  it('hides on-deck line when onDeck is null', () => {
    render(<OnDeckInHole onDeck={null} inHole={{ id: 2, fullName: 'Daulton Varsho' }} />);
    expect(screen.queryByText('On deck:')).not.toBeInTheDocument();
  });

  it('hides in-the-hole line when inHole is null', () => {
    render(<OnDeckInHole onDeck={{ id: 1, fullName: 'Bo Bichette' }} inHole={null} />);
    expect(screen.queryByText('In the hole:')).not.toBeInTheDocument();
  });

  it('renders nothing when both are null', () => {
    const { container } = render(<OnDeckInHole onDeck={null} inHole={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders both lines when both are provided', () => {
    render(
      <OnDeckInHole
        onDeck={{ id: 1, fullName: 'Bo Bichette' }}
        inHole={{ id: 2, fullName: 'Daulton Varsho' }}
      />
    );
    expect(screen.getByText('Bo Bichette')).toBeInTheDocument();
    expect(screen.getByText('Daulton Varsho')).toBeInTheDocument();
  });
});
