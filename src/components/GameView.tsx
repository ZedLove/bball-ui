import type { GameUpdate } from '../game-update';
import { useGameStore } from '../store/gameStore';
import { Scoreboard } from './Scoreboard';
import { OutsDisplay } from './OutsDisplay';
import { RunsNeeded } from './RunsNeeded';
import { BetweenInningsView } from './BetweenInningsView';
import { GameOverView } from './GameOverView';
import { DelayBanner } from './DelayBanner';
import { PitcherInfo } from './PitcherInfo';
import { StrikeZonePanel } from './StrikeZonePanel';
import { BaseDiamond } from './BaseDiamond';
import { OnDeckInHole } from './OnDeckInHole';
import { LineupCard } from './LineupCard';
import { EventsFeed } from './EventsFeed';

interface GameViewProps {
  update: GameUpdate;
}

export function GameView({ update }: GameViewProps) {
  const gameEvents = useGameStore((s) => s.gameEvents);

  if (update.trackingMode === 'final') {
    return <GameOverView update={update} />;
  }

  const lineup = update.atBat?.lineup ?? [];
  const currentBatterId = update.atBat?.batter.id ?? null;

  return (
    <div className="flex flex-col gap-6">
      {update.isDelayed && <DelayBanner description={update.delayDescription} />}
      <div style={{ viewTransitionName: 'scoreboard' }}>
        <Scoreboard update={update} />
      </div>
      <div
        key={getDisplayMode(update)}
        className="animate-fade-in flex justify-center gap-6 px-6"
        style={{ viewTransitionName: 'tracking-content' }}
      >
        <div className="w-full flex flex-col gap-4">
          <TrackingWidget update={update} />
          {/* Mobile: events feed always visible at bottom */}
          {gameEvents.length > 0 && (
            <div className="sm:hidden">
              <EventsFeed events={gameEvents} />
            </div>
          )}
          {lineup.length > 0 && (
            <div className="sm:hidden">
              <LineupCard lineup={lineup} currentBatterId={currentBatterId} />
            </div>
          )}
        </div>
        {/* Desktop right column: events feed + lineup */}
        <div className="hidden sm:flex flex-col gap-4 w-48 shrink-0">
          <EventsFeed events={gameEvents} />
          {lineup.length > 0 && <LineupCard lineup={lineup} currentBatterId={currentBatterId} />}
        </div>
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
  return (
    <div className="flex flex-col gap-4">
      <StrikeZonePanel
        atBat={update.atBat}
        pitchHistory={update.pitchHistory}
        venueFieldInfo={update.venueFieldInfo}
      />
      {update.currentPitcher && <PitcherInfo pitcher={update.currentPitcher} />}
      <LiveModeContext update={update} />
    </div>
  );
}

function LiveModeContext({ update }: { update: GameUpdate }) {
  if (update.outsRemaining !== null) {
    return <DefendingContext update={update} />;
  }
  if (update.runsNeeded !== null) {
    return <BattingExtrasContext update={update} />;
  }
  return <BattingContext update={update} />;
}

function DefendingContext({ update }: { update: GameUpdate }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <OutsDisplay
        outs={update.outs}
        outsRemaining={update.outsRemaining!}
        totalOutsRemaining={update.totalOutsRemaining}
      />
    </div>
  );
}

function BattingContext({ update }: { update: GameUpdate }) {
  return (
    <div className="flex flex-col items-center gap-4">
      {update.atBat && (
        <>
          <BaseDiamond
            first={update.atBat.first}
            second={update.atBat.second}
            third={update.atBat.third}
          />
          <OnDeckInHole onDeck={update.atBat.onDeck} inHole={update.atBat.inHole} />
        </>
      )}
    </div>
  );
}

function BattingExtrasContext({ update }: { update: GameUpdate }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <RunsNeeded runsNeeded={update.runsNeeded!} />
      {update.atBat && (
        <>
          <BaseDiamond
            first={update.atBat.first}
            second={update.atBat.second}
            third={update.atBat.third}
          />
          <OnDeckInHole onDeck={update.atBat.onDeck} inHole={update.atBat.inHole} />
        </>
      )}
    </div>
  );
}
