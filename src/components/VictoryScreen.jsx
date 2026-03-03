import { useEffect } from 'react';
import { useGameState } from '../game/gameState';
import { SUSPECTS } from '../game/suspects';
import { DIFFICULTIES } from '../game/difficultySettings';
import { conversationManager } from '../ai/conversationManager';
import { playVictoryFanfare } from '../audio/soundEffects';

export default function VictoryScreen() {
    const { state, dispatch } = useGameState();
    const difficulty = DIFFICULTIES[state.difficulty];
    const timeUsed = difficulty.time - state.timeRemaining;
    const minutes = Math.floor(timeUsed / 60);
    const seconds = timeUsed % 60;
    const totalQuestions = conversationManager.getTotalQuestions();

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
                    <h3 className="text-green-400 font-bold mb-3">✅ You correctly identified:</h3>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-4xl">{SUSPECTS.eleanor.expressions.nervous}</span>
                        <div>
                            <div className="font-bold text-lg" style={{ color: SUSPECTS.eleanor.color }}>Dr. Eleanor Hayes</div>
                            <div className="text-sm text-gray-500">Family Physician</div>
                        </div>
                    </div>

                    <div className="border-t border-white/10 pt-4 space-y-2 text-sm">
                        <h4 className="text-yellow-400 font-bold">THE TRUTH:</h4>
                        <p className="text-gray-300">Dr. Hayes poisoned Richard's brandy with cyanide at <span className="text-yellow-400">9:45 PM</span>.</p>
                        <p className="text-gray-400"><strong>Motive:</strong> Richard was blackmailing her over falsified medical records.</p>
                        <p className="text-gray-400"><strong>Method:</strong> Cyanide in brandy, using her medical knowledge and access.</p>
                        <p className="text-gray-400"><strong>Key evidence:</strong> Margaret Chen saw her entering the study at 9:45 PM. Her garden alibi was a lie.</p>
                    </div>
                </div>

                <div className="glass rounded-2xl p-6 mb-8 animate-slideUp" style={{ animationDelay: '0.4s' }}>
                    <h3 className="text-purple-400 font-bold mb-3">📊 YOUR STATS</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="bg-white/5 rounded-xl p-3">
                            <div className="text-gray-500">Difficulty</div>
                            <div className="font-bold">{difficulty.icon} {difficulty.label}</div>
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
                    🔄 Play Again
                </button>
            </div>
        </div>
    );
}
