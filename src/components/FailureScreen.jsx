import { useEffect } from 'react';
import { useGameState } from '../game/gameState';
import { SUSPECTS } from '../game/suspects';
import { playFailureSound } from '../audio/soundEffects';

export default function FailureScreen() {
    const { state, dispatch } = useGameState();
    const accused = state.accusedSuspect ? SUSPECTS[state.accusedSuspect] : null;
    const ranOutOfTime = state.timeRemaining <= 0;

    useEffect(() => {
        if (state.soundEnabled) playFailureSound();
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-lg w-full text-center animate-fadeIn">
                <div className="text-6xl mb-4">😔</div>
                <h1 className="text-4xl font-bold mb-2 text-red-400">
                    {ranOutOfTime ? 'TIME\'S UP!' : 'CASE UNSOLVED'}
                </h1>
                <p className="text-gray-400 mb-8">
                    {ranOutOfTime
                        ? 'The killer escaped while you ran out of time...'
                        : 'Your accusation was wrong, Detective.'}
                </p>

                {accused && !accused.isGuilty && (
                    <div className="glass rounded-2xl p-6 mb-6 text-left animate-slideUp" style={{ animationDelay: '0.1s' }}>
                        <h3 className="text-red-400 font-bold mb-2">❌ You accused:</h3>
                        <div className="flex items-center gap-3 mb-3">
                            <span className="text-3xl">{accused.expressions.neutral}</span>
                            <div>
                                <div className="font-bold" style={{ color: accused.color }}>{accused.name}</div>
                                <div className="text-sm text-gray-500">{accused.role}</div>
                            </div>
                        </div>
                        <p className="text-sm text-gray-400">But {accused.name.split(' ')[0]} was <span className="text-green-400 font-bold">innocent</span>!</p>
                    </div>
                )}

                <div className="glass rounded-2xl p-6 mb-8 text-left animate-slideUp" style={{ animationDelay: '0.3s' }}>
                    <h3 className="text-yellow-400 font-bold mb-3">🔍 THE REAL KILLER:</h3>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-4xl">{SUSPECTS.eleanor.expressions.nervous}</span>
                        <div>
                            <div className="font-bold text-lg" style={{ color: SUSPECTS.eleanor.color }}>Dr. Eleanor Hayes</div>
                            <div className="text-sm text-gray-500">Family Physician</div>
                        </div>
                    </div>

                    <div className="border-t border-white/10 pt-4 space-y-2 text-sm">
                        <h4 className="text-yellow-400 font-bold">WHAT YOU MISSED:</h4>
                        <p className="text-gray-300">
                            <strong>Margaret Chen</strong> saw Dr. Hayes entering the study at <span className="text-yellow-400">9:45 PM</span> — just two minutes before Richard died.
                        </p>
                        <p className="text-gray-400">
                            Dr. Hayes claimed to be in the garden smoking, but <strong>her alibi was a lie</strong>.
                        </p>
                        <p className="text-gray-400">
                            <strong>Motive:</strong> Richard was blackmailing her over falsified medical records. She faced losing her medical license and criminal charges.
                        </p>
                        <p className="text-gray-400">
                            <strong>Method:</strong> As a physician, she had access to cyanide and the knowledge to administer a lethal dose in Richard's brandy.
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => dispatch({ type: 'RESTART' })}
                    className="px-8 py-3 rounded-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 transition-all shadow-lg shadow-purple-500/25 cursor-pointer"
                >
                    🔄 Try Again
                </button>
            </div>
        </div>
    );
}
