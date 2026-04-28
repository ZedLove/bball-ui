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
      <div style={{ viewTransitionName: 'scoreboard' }}>
        <Scoreboard update={update} />
      </div>
      <div
        key={getDisplayMode(update)}
        className="animate-fade-in"
        style={{ viewTransitionName: 'tracking-content' }}
      >
        <TrackingWidget update={update} />
      </div>
    </div>
  );
}

function getDisplayMode(update: GameUpdate): string {
  if (update.trackingMode !== 'live') return update.trackingMode;
  if (update.outsRemaining !== null) return 'outs';
  if (update.runsNeeded !== null) return 'runs';
  return 'batting';
}

function TrackingWidget({ update }: { update: GameUpdate }) {
  switch (update.trackingMode) {
    case 'live':
      return <LiveModeContent update={update} />;
    case 'between-innings':
      return <BetweenInningsView update={update} />;
    case 'final':
      // Handled above via early return — this branch is unreachable
      return null;
    default:
      update.trackingMode satisfies never;
      return null;
  }
}

function LiveModeContent({ update }: { update: GameUpdate }) {
  if (update.outsRemaining !== null) {
    return (
      <OutsDisplay
        outs={update.outs}
        outsRemaining={update.outsRemaining}
        totalOutsRemaining={update.totalOutsRemaining}
        currentPitcher={update.currentPitcher}
      />
    );
  }

  if (update.runsNeeded !== null) {
    return <RunsNeeded runsNeeded={update.runsNeeded} />;
  }

  return <BattingView update={update} />;
}
