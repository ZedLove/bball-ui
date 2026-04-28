import type { GameUpdate } from '../game-update';
import { Scoreboard } from './Scoreboard';

interface GameOverViewProps {
  update: GameUpdate;
}

export function GameOverView({ update }: GameOverViewProps) {
  return (
    <div className="flex flex-col items-center gap-8 py-6" role="status" aria-label="Game over">
      <div className="flex items-center gap-3">
        <span className="px-2 py-1 rounded text-xs font-bold tracking-widest bg-accent-final text-bg">
          FINAL
        </span>
      </div>
      <Scoreboard update={update} />
      <p className="text-sm text-fg-faint">Checking for next game…</p>
    </div>
  );
}
