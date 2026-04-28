import { useGameStore } from '../store/gameStore';
import type { ConnectionStatus as ConnectionStatusType } from '../store/gameStore';

const labels: Record<ConnectionStatusType, string> = {
  connected: 'Live',
  reconnecting: 'Reconnecting…',
  disconnected: 'Disconnected',
};

const dotColor: Record<ConnectionStatusType, string> = {
  connected: 'bg-accent-ok',
  reconnecting: 'bg-accent-warning animate-pulse',
  disconnected: 'bg-accent-error',
};

export function ConnectionStatus() {
  const status = useGameStore((s) => s.connectionStatus);

  return (
    <div className="flex items-center gap-1.5 text-xs text-fg-muted">
      <span className={`h-2 w-2 rounded-full ${dotColor[status]}`} aria-hidden="true" />
      <span aria-live="polite">{labels[status]}</span>
    </div>
  );
}
