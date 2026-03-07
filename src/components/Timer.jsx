import { useEffect, useRef } from 'react';
import { useGameState } from '../game/gameState';
import { playClockTick } from '../audio/soundEffects';

export default function Timer() {
    const { state } = useGameState();
    const lastTickRef = useRef(null);
    const minutes = Math.floor(state.timeRemaining / 60);
    const seconds = state.timeRemaining % 60;
    const isUrgent = state.timeRemaining <= 60;
    const isCritical = state.timeRemaining <= 30;

    useEffect(() => {
        if (isUrgent && state.soundEnabled && state.isTimerRunning) {
            if (lastTickRef.current !== state.timeRemaining) {
                playClockTick();
                lastTickRef.current = state.timeRemaining;
            }
        }
    }, [state.timeRemaining, isUrgent, state.soundEnabled, state.isTimerRunning]);

    return (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-500 ${isCritical ? 'bg-danger/20 border-danger/40 text-danger animate-pulse' :
                isUrgent ? 'bg-warning/20 border-warning/40 text-warning' :
                    'bg-bg-card/40 border-border-subtle text-text-secondary'
            }`}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>timer</span>
            <span className="font-bold text-sm tabular-nums tracking-wide">{minutes}:{seconds.toString().padStart(2, '0')}</span>
        </div>
    );
}
