import { useEffect, useState } from 'react';
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

function formatRelativeTime(epochMs: number): string {
  const diffMs = Date.now() - epochMs;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  return `${diffHr}h ago`;
}

export function ConnectionStatus() {
  const status = useGameStore((s) => s.connectionStatus);
  const lastUpdatedAt = useGameStore((s) => s.lastUpdatedAt);
  const [, setTick] = useState(0);

  // Re-render every 30s to keep the relative timestamp fresh
  useEffect(() => {
    if (status === 'connected' || lastUpdatedAt === null) return;
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, [status, lastUpdatedAt]);

  const showStaleness = status !== 'connected' && lastUpdatedAt !== null;
  const stalenessText = showStaleness ? ` · Updated ${formatRelativeTime(lastUpdatedAt)}` : '';

  return (
    <div className="flex items-center gap-1.5 text-xs text-fg-muted">
      <span className={`h-2 w-2 rounded-full ${dotColor[status]}`} aria-hidden="true" />
      <span aria-live="polite">
        {labels[status]}
        {stalenessText}
      </span>
    </div>
  );
}
