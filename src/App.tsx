import { useSocket } from './hooks/useSocket';
import { useGameTimers } from './hooks/useGameTimers';
import { useGameStore } from './store/gameStore';
import { ConnectionStatus } from './components/ConnectionStatus';
import { ThemeToggle } from './components/ThemeToggle';
import { GameView } from './components/GameView';
import { IdleView } from './components/IdleView';

export default function App() {
  useSocket();
  useGameTimers();

  const update = useGameStore((s) => s.update);

  return (
    <div className="min-h-screen bg-bg text-fg">
      <header className="flex items-center justify-between p-4">
        <ConnectionStatus />
        <ThemeToggle />
      </header>

      <main className="flex justify-center px-6 pb-10">
        <div className="w-full max-w-sm sm:max-w-2xl">
          {update ? <GameView update={update} /> : <IdleView />}
        </div>
      </main>
    </div>
  );
}
