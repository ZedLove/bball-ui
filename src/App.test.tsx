import { render, screen } from '@testing-library/react';
import { beforeEach, vi } from 'vitest';
import App from './App';
import { useGameStore } from './store/gameStore';
import { makeUpdate } from './test/fixtures';

// useSocket and useGameTimers create real side-effects — mock both to no-ops for App tests
vi.mock('./hooks/useSocket', () => ({ useSocket: vi.fn() }));
vi.mock('./hooks/useGameTimers', () => ({ useGameTimers: vi.fn() }));

// useTheme calls matchMedia — stub it for jsdom
vi.mock('./hooks/useTheme', () => ({
  useTheme: () => ({
    resolvedTheme: 'dark' as const,
    preference: 'system' as const,
    cycleTheme: vi.fn(),
  }),
}));

// StrikeZonePanel renders SVG via @visx/scale — mock it for App-level test isolation
vi.mock('./components/StrikeZonePanel', () => ({
  StrikeZonePanel: () => <div data-testid="strike-zone-panel" />,
}));

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

  it('renders ThemeToggle', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /theme/i })).toBeInTheDocument();
  });
});
