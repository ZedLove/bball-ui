import { useSocket } from './hooks/useSocket';
import { useGameStore } from './store/gameStore';
import { ConnectionStatus } from './components/ConnectionStatus';

export default function App() {
  useSocket(); // establish connection, write to store

  const update = useGameStore((s) => s.update);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-lg font-semibold tracking-wide">bball</h1>
        <ConnectionStatus />
      </header>

      <main>
        {update ? (
          <pre className="text-xs text-gray-300 bg-gray-900 rounded-lg p-4 overflow-auto">
            {JSON.stringify(update, null, 2)}
          </pre>
        ) : (
          <p className="text-gray-500">Waiting for game data…</p>
        )}
      </main>
    </div>
  );
}
