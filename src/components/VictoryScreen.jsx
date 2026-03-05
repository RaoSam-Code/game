import { useEffect } from 'react';
import { useGameState } from '../game/gameState';
import { playVictoryFanfare } from '../audio/soundEffects';

const DIFFICULTY_LABELS = { easy: '🟢 Easy Detective', normal: '🟡 Detective', hard: '🔴 Master Detective' };
const DIFFICULTY_TIMES = { easy: 1200, normal: 900, hard: 600 };

export default function VictoryScreen() {
    const { state, dispatch } = useGameState();
    const result = state.accusationResult;
    const story = state.story;

    const totalTime = DIFFICULTY_TIMES[state.difficulty] || 900;
    const timeUsed = totalTime - state.timeRemaining;
    const minutes = Math.floor(timeUsed / 60);
    const seconds = timeUsed % 60;
    const totalQuestions = Object.values(state.questionCounts).reduce((a, b) => a + b, 0);

    useEffect(() => {
        if (state.soundEnabled) playVictoryFanfare();
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-lg w-full text-center animate-fadeIn">
                <div className="text-6xl mb-4">🎉</div>
                <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-yellow-400 via-green-400 to-yellow-400 bg-clip-text text-transparent">
                    CASE SOLVED!
                </h1>
                <p className="text-gray-400 mb-8">Excellent work, Detective!</p>

                <div className="glass rounded-2xl p-6 mb-6 text-left animate-slideUp" style={{ animationDelay: '0.2s' }}>
                    <h3 className="text-green-400 font-bold mb-3">✅ You correctly identified the killer:</h3>
                    <div className="mb-4">
                        <div className="font-bold text-lg text-red-400">{result?.killer?.name}</div>
                    </div>
                    <div className="border-t border-white/10 pt-4 space-y-2 text-sm">
                        <h4 className="text-yellow-400 font-bold">THE TRUTH:</h4>
                        <p className="text-gray-400"><strong>Motive:</strong> {result?.killer?.motive}</p>
                        <p className="text-gray-400"><strong>Method:</strong> {result?.killer?.method}</p>
                        {result?.key_evidence && (
                            <p className="text-gray-400"><strong>Key evidence:</strong> {result.key_evidence}</p>
                        )}
                    </div>
                </div>

                <div className="glass rounded-2xl p-6 mb-8 animate-slideUp" style={{ animationDelay: '0.4s' }}>
                    <h3 className="text-purple-400 font-bold mb-3">📊 YOUR STATS</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="bg-white/5 rounded-xl p-3">
                            <div className="text-gray-500">Difficulty</div>
                            <div className="font-bold">{DIFFICULTY_LABELS[state.difficulty] || state.difficulty}</div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-3">
                            <div className="text-gray-500">Time Used</div>
                            <div className="font-bold">{minutes}m {seconds}s</div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-3">
                            <div className="text-gray-500">Evidence Found</div>
                            <div className="font-bold">{state.evidence.length} clues</div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-3">
                            <div className="text-gray-500">Questions Asked</div>
                            <div className="font-bold">{totalQuestions}</div>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => dispatch({ type: 'RESTART' })}
                    className="px-8 py-3 rounded-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 transition-all shadow-lg shadow-purple-500/25 cursor-pointer"
                >
                    🔄 Play Again (New Mystery)
                </button>
            </div>
        </div>
    );
}
