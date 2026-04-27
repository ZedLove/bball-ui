import type { GameUpdate } from '../game-update';

interface ScoreboardProps {
  update: GameUpdate;
}

const halfLabel: Record<GameUpdate['inning']['half'], string> = {
  Top: 'Top',
  Middle: 'Mid',
  Bottom: 'Bot',
  End: 'End',
};

export function Scoreboard({ update }: ScoreboardProps) {
  const { teams, score, inning, defendingTeam, isExtraInnings } = update;

  const awayIsDefending = teams.away.abbreviation === defendingTeam;

  const scoreDescription = `${teams.away.abbreviation} ${score.away}, ${teams.home.abbreviation} ${score.home}. ${halfLabel[inning.half]} ${inning.ordinal}.${isExtraInnings ? ' Extra innings.' : ''}`;

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Scores row */}
      <div className="flex items-center gap-4" aria-label={scoreDescription}>
        {/* Away */}
        <div className="flex flex-col items-center gap-0.5">
          <span
            className={`text-xs font-semibold tracking-widest ${
              awayIsDefending ? 'text-white' : 'text-gray-400'
            }`}
          >
            {teams.away.abbreviation}
          </span>
          <span className="text-4xl font-mono font-bold text-white">{score.away}</span>
        </div>

        <span className="text-2xl text-gray-600 pb-1">—</span>

        {/* Home */}
        <div className="flex flex-col items-center gap-0.5">
          <span
            className={`text-xs font-semibold tracking-widest ${
              !awayIsDefending ? 'text-white' : 'text-gray-400'
            }`}
          >
            {teams.home.abbreviation}
          </span>
          <span className="text-4xl font-mono font-bold text-white">{score.home}</span>
        </div>
      </div>

      {/* Inning + extras */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-400">
          {halfLabel[inning.half]} {inning.ordinal}
        </span>
        {isExtraInnings && (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider bg-amber-500 text-black">
            EXTRA INNINGS
          </span>
        )}
      </div>
    </div>
  );
}
