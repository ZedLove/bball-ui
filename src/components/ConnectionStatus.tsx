import { useGameStore } from '../store/gameStore';
import type { ConnectionStatus as ConnectionStatusType } from '../store/gameStore';

const labels: Record<ConnectionStatusType, string> = {
  connected: 'Live',
  reconnecting: 'Reconnecting…',
  disconnected: 'Disconnected',
};

const dotColor: Record<ConnectionStatusType, string> = {
  connected: 'bg-green-500',
  reconnecting: 'bg-amber-400 animate-pulse',
  disconnected: 'bg-red-500',
};

export function ConnectionStatus() {
  const status = useGameStore((s) => s.connectionStatus);

  return (
    <div className="flex items-center gap-1.5 text-xs text-gray-400">
      <span className={`h-2 w-2 rounded-full ${dotColor[status]}`} aria-hidden="true" />
      <span>{labels[status]}</span>
    </div>
  );
}
