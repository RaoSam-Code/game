import { useEffect, useRef } from 'react';
import { useGameState } from '../game/gameState';
import { playClockTick } from '../audio/soundEffects';

export default function Timer() {
    const { state } = useGameState();
    const prevTimeRef = useRef(state.timeRemaining);

    const minutes = Math.floor(state.timeRemaining / 60);
    const seconds = state.timeRemaining % 60;
    const isLow = state.timeRemaining <= 60;
    const isCritical = state.timeRemaining <= 30;

    // Clock tick when under 60 seconds
    useEffect(() => {
        if (isLow && state.soundEnabled && state.isTimerRunning && state.timeRemaining !== prevTimeRef.current) {
            playClockTick();
        }
        prevTimeRef.current = state.timeRemaining;
    }, [state.timeRemaining, isLow, state.soundEnabled, state.isTimerRunning]);

    return (
        <div className={`font-mono text-lg font-bold flex items-center gap-2 transition-colors duration-300 ${isCritical ? 'text-red-400 animate-pulse' : isLow ? 'text-yellow-400' : 'text-gray-300'
            }`}>
            <span>⏱️</span>
            <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
        </div>
    );
}
