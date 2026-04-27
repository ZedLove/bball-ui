import type { GameUpdate } from '../game-update';
import { Scoreboard } from './Scoreboard';
import { OutsDisplay } from './OutsDisplay';
import { RunsNeeded } from './RunsNeeded';
import { BetweenInningsView } from './BetweenInningsView';
import { BattingView } from './BattingView';
import { GameOverView } from './GameOverView';
import { DelayBanner } from './DelayBanner';

interface GameViewProps {
  update: GameUpdate;
}

export function GameView({ update }: GameViewProps) {
  if (update.trackingMode === 'final') {
    return <GameOverView update={update} />;
  }

  return (
    <div className="flex flex-col gap-6">
      {update.isDelayed && <DelayBanner description={update.delayDescription} />}
      <Scoreboard update={update} />
      <div key={update.trackingMode} className="animate-fade-in">
        <TrackingWidget update={update} />
      </div>
    </div>
  );
}

function TrackingWidget({ update }: { update: GameUpdate }) {
  switch (update.trackingMode) {
    case 'outs':
      return (
        <OutsDisplay
          outs={update.outs}
          totalOutsRemaining={update.totalOutsRemaining}
          currentPitcher={update.currentPitcher}
          pitchingChange={update.pitchingChange}
        />
      );
    case 'runs':
      // runsNeeded is guaranteed non-null when trackingMode === 'runs'
      return <RunsNeeded runsNeeded={update.runsNeeded!} />;
    case 'between-innings':
      return <BetweenInningsView update={update} />;
    case 'batting':
      return <BattingView update={update} />;
    case 'final':
      // Handled above via early return — this branch is unreachable
      return null;
    default:
      // Exhaustive check — TypeScript will error here if a new trackingMode is
      // added to game-update.ts without a corresponding case above.
      update.trackingMode satisfies never;
      return null;
  }
}
