interface PitcherInfoProps {
  pitcher: { id: number; fullName: string };
  pitchingChange: boolean;
}

export function PitcherInfo({ pitcher, pitchingChange }: PitcherInfoProps) {
  return (
    <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
      <span>Pitching: {pitcher.fullName}</span>
      {pitchingChange && (
        <span className="px-1.5 py-0.5 rounded bg-amber-500 text-black text-[10px] font-bold tracking-wide">
          NEW
        </span>
      )}
    </div>
  );
}
