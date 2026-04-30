export type PitchFilter = 'all' | 'at-bat' | 'last';

const FILTER_LABELS: Record<PitchFilter, string> = {
  all: 'All',
  'at-bat': 'AB',
  last: 'Last',
};

interface PitchFilterToggleProps {
  value: PitchFilter;
  onChange: (filter: PitchFilter) => void;
  options: PitchFilter[];
}

export function PitchFilterToggle({ value, onChange, options }: PitchFilterToggleProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Pitch filter"
      className="flex rounded-full bg-surface border border-border overflow-hidden"
    >
      {options.map((option) => {
        const isActive = option === value;
        return (
          <button
            key={option}
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(option)}
            className={[
              'min-h-[44px] px-4 text-sm font-medium transition-colors',
              isActive ? 'bg-surface-alt text-fg' : 'text-fg-muted hover:text-fg',
            ].join(' ')}
          >
            {FILTER_LABELS[option]}
          </button>
        );
      })}
    </div>
  );
}
