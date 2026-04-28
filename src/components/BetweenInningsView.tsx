import type { GameUpdate } from '../game-update';

interface BetweenInningsViewProps {
  update: GameUpdate;
}

export function BetweenInningsView({ update }: BetweenInningsViewProps) {
  const { inning, teams, upcomingPitcher } = update;

  // 'End' = bottom just finished → away team bats next (new inning top)
  // 'Middle' = top just finished → home team bats next (inning bottom)
  const isEndOfFullInning = inning.half === 'End';
  const teamAboutToBat = isEndOfFullInning ? teams.away.abbreviation : teams.home.abbreviation;

  return (
    <div className="flex flex-col items-center gap-2 text-center py-6">
      <p className="text-xl text-fg font-light">Half inning over</p>
      <p className="text-sm text-fg-faint">{teamAboutToBat} batting next</p>
      {upcomingPitcher && (
        <p className="text-sm text-fg-faint">Pitching next: {upcomingPitcher.fullName}</p>
      )}
    </div>
  );
}
