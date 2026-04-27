interface RunsNeededProps {
  runsNeeded: number;
}

export function RunsNeeded({ runsNeeded }: RunsNeededProps) {
  const label = runsNeeded === 1 ? 'run needed to take the lead' : 'runs needed to take the lead';

  return (
    <div
      className="flex flex-col items-center gap-3 text-center"
      aria-live="polite"
      aria-label={`${runsNeeded} ${label}`}
    >
      <span className="text-8xl font-bold font-mono text-white leading-none">{runsNeeded}</span>
      <p className="text-gray-400 text-sm">{label}</p>
    </div>
  );
}
