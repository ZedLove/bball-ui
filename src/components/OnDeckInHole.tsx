interface OnDeckInHoleProps {
  onDeck: { id: number; fullName: string } | null;
  inHole: { id: number; fullName: string } | null;
}

export function OnDeckInHole({ onDeck, inHole }: OnDeckInHoleProps) {
  if (onDeck === null && inHole === null) return null;

  return (
    <div className="flex flex-col gap-0.5 text-xs text-fg-faint">
      {onDeck !== null && (
        <p>
          <span>On deck:</span> {onDeck.fullName}
        </p>
      )}
      {inHole !== null && (
        <p>
          <span>In the hole:</span> {inHole.fullName}
        </p>
      )}
    </div>
  );
}
