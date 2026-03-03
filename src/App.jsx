import { useEffect, useRef } from 'react';
import { GameStateProvider, useGameState } from './game/gameState';
import IntroScreen from './components/IntroScreen';
import GameScreen from './components/GameScreen';
import VictoryScreen from './components/VictoryScreen';
import FailureScreen from './components/FailureScreen';
import { playThunder } from './audio/soundEffects';

function AppContent() {
  const { state } = useGameState();
  const thunderInterval = useRef(null);

  // Ambient thunder
  useEffect(() => {
    if (state.screen === 'game' && state.soundEnabled) {
      // Play initial thunder after a short delay
      const initialTimeout = setTimeout(() => playThunder(), 2000);

      // Random thunder every 15-25 seconds
      thunderInterval.current = setInterval(() => {
        if (Math.random() > 0.3) {
          playThunder();
        }
      }, 15000 + Math.random() * 10000);

      return () => {
        clearTimeout(initialTimeout);
        clearInterval(thunderInterval.current);
      };
    } else {
      if (thunderInterval.current) {
        clearInterval(thunderInterval.current);
      }
    }
  }, [state.screen, state.soundEnabled]);

  switch (state.screen) {
    case 'intro':
      return <IntroScreen />;
    case 'game':
      return <GameScreen />;
    case 'victory':
      return <VictoryScreen />;
    case 'failure':
      return <FailureScreen />;
    default:
      return <IntroScreen />;
  }
}

export default function App() {
  return (
    <GameStateProvider>
      <AppContent />
    </GameStateProvider>
  );
}
