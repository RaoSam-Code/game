import { useEffect } from 'react';
import { useGameState } from '../game/gameState';
import { playFailureSound } from '../audio/soundEffects';

export default function FailureScreen() {
    const { state, dispatch } = useGameState();
    const result = state.accusationResult;
    const ranOutOfTime = state.timeRemaining <= 0;

    useEffect(() => {
        if (state.soundEnabled) playFailureSound();
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-lg w-full text-center animate-fadeIn">
                <div className="text-6xl mb-4">😔</div>
                <h1 className="text-4xl font-bold mb-2 text-red-400">
                    {ranOutOfTime ? "TIME'S UP!" : 'CASE UNSOLVED'}
                </h1>
                <p className="text-gray-400 mb-8">
                    {ranOutOfTime
                        ? 'The killer escaped while you ran out of time...'
                        : 'Your accusation was wrong, Detective.'}
                </p>

                {result && !result.correct && result.accused && (
                    <div className="glass rounded-2xl p-6 mb-6 text-left animate-slideUp" style={{ animationDelay: '0.1s' }}>
                        <h3 className="text-red-400 font-bold mb-2">❌ You accused:</h3>
                        <div className="font-bold text-white mb-2">{result.accused.name}</div>
                        <p className="text-sm text-gray-400">
                            But {result.accused.name.split(' ')[0]} was <span className="text-green-400 font-bold">innocent</span>!
                        </p>
                    </div>
                )}

                {result && (
                    <div className="glass rounded-2xl p-6 mb-8 text-left animate-slideUp" style={{ animationDelay: '0.3s' }}>
                        <h3 className="text-yellow-400 font-bold mb-3">🔍 THE REAL KILLER:</h3>
                        <div className="font-bold text-lg text-red-400 mb-4">{result.killer?.name}</div>
                        <div className="border-t border-white/10 pt-4 space-y-2 text-sm">
                            <h4 className="text-yellow-400 font-bold">WHAT HAPPENED:</h4>
                            <p className="text-gray-400"><strong>Motive:</strong> {result.killer?.motive}</p>
                            <p className="text-gray-400"><strong>Method:</strong> {result.killer?.method}</p>
                            {result.killer?.alibi_was_false && (
                                <p className="text-gray-400">Their alibi was <span className="text-red-400 font-bold">a lie</span>.</p>
                            )}
                            {result.key_evidence && (
                                <p className="text-gray-400"><strong>Key evidence:</strong> {result.key_evidence}</p>
                            )}
                        </div>
                    </div>
                )}

                <button
                    onClick={() => dispatch({ type: 'RESTART' })}
                    className="px-8 py-3 rounded-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 transition-all shadow-lg shadow-purple-500/25 cursor-pointer"
                >
                    🔄 Try Again (New Mystery)
                </button>
            </div>
        </div>
    );
}
