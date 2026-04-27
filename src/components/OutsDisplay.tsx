interface OutsDisplayProps {
  /** Current out count in the half-inning (0–2). outsRemaining = 3 - outs. */
  outs: number;
}

export function OutsDisplay({ outs }: OutsDisplayProps) {
  const outsRemaining = 3 - outs;
  const label = outsRemaining === 1 ? '1 out remaining' : `${outsRemaining} outs remaining`;

  return (
    <div className="flex flex-col items-center gap-6">
      <div role="img" aria-label={label} className="flex items-center gap-4">
        {Array.from({ length: 3 }, (_, i) => {
          const recorded = i < outs;
          return (
            <div
              key={i}
              className={`h-12 w-12 rounded-full transition-all duration-300 ${
                recorded ? 'bg-white' : 'border-2 border-white'
              }`}
            />
          );
        })}
      </div>
      <p className="text-gray-400 text-sm">{label}</p>
    </div>
  );
}
