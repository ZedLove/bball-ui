export function IdleView() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 text-center py-20">
      <p className="text-2xl text-fg-muted font-light">No active game</p>
      <p className="text-sm text-fg-faint">Waiting for a game to start…</p>
    </div>
  );
}
