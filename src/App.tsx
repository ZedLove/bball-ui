import { useSocket } from './hooks/useSocket';
import { useGameStore } from './store/gameStore';
import { ConnectionStatus } from './components/ConnectionStatus';
import { GameView } from './components/GameView';
import { IdleView } from './components/IdleView';

export default function App() {
  useSocket();

  const update = useGameStore((s) => s.update);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="flex items-center justify-end p-4">
        <ConnectionStatus />
      </header>

      <main className="flex justify-center px-6 pb-10">
        <div className="w-full max-w-sm">
          {update ? <GameView update={update} /> : <IdleView />}
        </div>
      </main>
    </div>
  );
}
