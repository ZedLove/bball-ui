import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ConnectionStatus } from './ConnectionStatus';
import { useGameStore } from '../store/gameStore';

describe('ConnectionStatus', () => {
  beforeEach(() => {
    useGameStore.setState({
      connectionStatus: 'disconnected',
      lastUpdatedAt: null,
    });
  });

  it('shows "Live" when connected', () => {
    useGameStore.setState({ connectionStatus: 'connected' });
    render(<ConnectionStatus />);
    expect(screen.getByText('Live')).toBeInTheDocument();
  });

  it('shows "Reconnecting…" when reconnecting', () => {
    useGameStore.setState({ connectionStatus: 'reconnecting' });
    render(<ConnectionStatus />);
    expect(screen.getByText(/Reconnecting…/)).toBeInTheDocument();
  });

  it('shows "Disconnected" when disconnected', () => {
    render(<ConnectionStatus />);
    expect(screen.getByText('Disconnected')).toBeInTheDocument();
  });

  it('has aria-live on the status text', () => {
    render(<ConnectionStatus />);
    const liveRegion = screen.getByText(/Live|Reconnecting|Disconnected/);
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');
  });

  it('shows "Disconnected" with no timestamp when no cached data', () => {
    useGameStore.setState({ connectionStatus: 'disconnected', lastUpdatedAt: null });
    render(<ConnectionStatus />);
    expect(screen.getByText('Disconnected')).toBeInTheDocument();
    expect(screen.queryByText(/Updated/)).not.toBeInTheDocument();
  });

  it('shows staleness timestamp when disconnected with cached data', () => {
    const twoMinutesAgo = Date.now() - 2 * 60 * 1000;
    useGameStore.setState({ connectionStatus: 'disconnected', lastUpdatedAt: twoMinutesAgo });
    render(<ConnectionStatus />);
    expect(screen.getByText(/Disconnected · Updated 2m ago/)).toBeInTheDocument();
  });

  it('shows "just now" for very recent timestamps', () => {
    useGameStore.setState({ connectionStatus: 'disconnected', lastUpdatedAt: Date.now() - 5000 });
    render(<ConnectionStatus />);
    expect(screen.getByText(/Disconnected · Updated just now/)).toBeInTheDocument();
  });

  it('shows hours for old timestamps', () => {
    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
    useGameStore.setState({ connectionStatus: 'disconnected', lastUpdatedAt: twoHoursAgo });
    render(<ConnectionStatus />);
    expect(screen.getByText(/Disconnected · Updated 2h ago/)).toBeInTheDocument();
  });

  it('does not show staleness when connected even with cached data', () => {
    useGameStore.setState({ connectionStatus: 'connected', lastUpdatedAt: Date.now() - 60000 });
    render(<ConnectionStatus />);
    expect(screen.getByText('Live')).toBeInTheDocument();
    expect(screen.queryByText(/Updated/)).not.toBeInTheDocument();
  });
});
