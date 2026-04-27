import type { GameUpdate } from '../game-update';

interface BattingViewProps {
  update: GameUpdate;
}

export function BattingView({ update }: BattingViewProps) {
  const { battingTeam } = update;

  return (
    <div className="flex flex-col items-center gap-2 text-center py-6">
      <p className="text-xl text-gray-300 font-light">{battingTeam} batting</p>
      <p className="text-sm text-gray-500">Nothing to track right now</p>
    </div>
  );
}
