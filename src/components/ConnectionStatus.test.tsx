import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ConnectionStatus } from './ConnectionStatus';
import { useGameStore } from '../store/gameStore';

describe('ConnectionStatus', () => {
  beforeEach(() => {
    useGameStore.setState({ connectionStatus: 'disconnected' });
  });

  it('shows "Live" when connected', () => {
    useGameStore.setState({ connectionStatus: 'connected' });
    render(<ConnectionStatus />);
    expect(screen.getByText('Live')).toBeInTheDocument();
  });

  it('shows "Reconnecting…" when reconnecting', () => {
    useGameStore.setState({ connectionStatus: 'reconnecting' });
    render(<ConnectionStatus />);
    expect(screen.getByText('Reconnecting…')).toBeInTheDocument();
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
});
