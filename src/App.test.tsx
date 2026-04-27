import { render, screen } from '@testing-library/react';
import { beforeEach } from 'vitest';
import App from './App';
import { useGameStore } from './store/gameStore';
import { makeUpdate } from './test/fixtures';

// useSocket does real IO — mock it to a no-op for App tests
vi.mock('./hooks/useSocket', () => ({ useSocket: vi.fn() }));

describe('App', () => {
  beforeEach(() => {
    useGameStore.setState({ update: null, connectionStatus: 'connected' });
  });

  it('shows IdleView when update is null', () => {
    render(<App />);
    expect(screen.getByText('No active game')).toBeInTheDocument();
  });

  it('shows GameView when update exists', () => {
    useGameStore.setState({ update: makeUpdate({ trackingMode: 'outs', outs: 0 }) });
    render(<App />);
    expect(screen.getByText('3 outs remaining')).toBeInTheDocument();
  });
});
