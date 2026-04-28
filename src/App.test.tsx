import { render, screen } from '@testing-library/react';
import { beforeEach } from 'vitest';
import App from './App';
import { useGameStore } from './store/gameStore';
import { makeUpdate } from './test/fixtures';

// useSocket and useGameTimers create real side-effects — mock both to no-ops for App tests
vi.mock('./hooks/useSocket', () => ({ useSocket: vi.fn() }));
vi.mock('./hooks/useGameTimers', () => ({ useGameTimers: vi.fn() }));

describe('App', () => {
  beforeEach(() => {
    useGameStore.setState({ update: null, connectionStatus: 'connected' });
  });

  it('shows IdleView when update is null', () => {
    render(<App />);
    expect(screen.getByText('No active game')).toBeInTheDocument();
  });

  it('shows GameView when update exists', () => {
    useGameStore.setState({ update: makeUpdate({ outs: 0, outsRemaining: 3 }) });
    render(<App />);
    expect(screen.getByText('3 outs remaining')).toBeInTheDocument();
  });
});
