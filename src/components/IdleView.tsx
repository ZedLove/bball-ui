export function IdleView() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 text-center py-20">
      <p className="text-2xl text-gray-400 font-light">No active game</p>
      <p className="text-sm text-gray-600">Waiting for a game to start…</p>
    </div>
  );
}
