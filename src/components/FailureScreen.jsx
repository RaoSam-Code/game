import { useEffect } from 'react';
import { useGameState } from '../game/gameState';
import { playFailureSound } from '../audio/soundEffects';

export default function FailureScreen() {
    const { state, dispatch } = useGameState();
    const result = state.accusationResult;
    const ranOutOfTime = state.timeRemaining <= 0;

    useEffect(() => { if (state.soundEnabled) playFailureSound(); }, []);

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--color-bg-dark)' }}>
            <div className="max-w-lg w-full text-center animate-fadeIn">
                <div className="w-20 h-20 rounded-2xl bg-danger/10 border border-danger/20 flex items-center justify-center mx-auto mb-6">
                    <span className="material-symbols-outlined text-danger" style={{ fontSize: '40px' }}>
                        {ranOutOfTime ? 'timer_off' : 'close'}
                    </span>
                </div>

                <h1 className="text-4xl font-bold mb-2 tracking-tight text-danger">
                    {ranOutOfTime ? "TIME'S UP!" : 'CASE UNSOLVED'}
                </h1>
                <p className="text-text-muted mb-8">
                    {ranOutOfTime ? 'The killer escaped while you ran out of time...' : 'Your accusation was wrong, Detective.'}
                </p>

                {result && !result.correct && result.accused && (
                    <div className="glass rounded-2xl p-6 mb-6 text-left animate-slideUp" style={{ animationDelay: '0.1s' }}>
                        <h3 className="text-danger font-bold text-sm mb-2 flex items-center gap-2">
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>cancel</span>
                            You Accused
                        </h3>
                        <div className="font-bold text-text-primary mb-2">{result.accused.name}</div>
                        <p className="text-sm text-text-muted">
                            {result.accused.name.split(' ')[0]} was <span className="text-success font-bold">innocent</span>!
                        </p>
                    </div>
                )}

                {result && (
                    <div className="glass rounded-2xl p-6 mb-8 text-left animate-slideUp" style={{ animationDelay: '0.3s' }}>
                        <h3 className="text-warning font-bold text-sm mb-3 flex items-center gap-2">
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>visibility</span>
                            The Real Killer
                        </h3>
                        <div className="font-bold text-lg text-danger mb-4">{result.killer?.name}</div>
                        <div className="border-t border-border-subtle pt-4 space-y-2 text-sm">
                            <p className="text-text-muted"><strong className="text-text-secondary">Motive:</strong> {result.killer?.motive}</p>
                            <p className="text-text-muted"><strong className="text-text-secondary">Method:</strong> {result.killer?.method}</p>
                            {result.killer?.alibi_was_false && (
                                <p className="text-text-muted">Their alibi was <span className="text-danger font-bold">a lie</span>.</p>
                            )}
                            {result.key_evidence && (
                                <p className="text-text-muted"><strong className="text-text-secondary">Key evidence:</strong> {result.key_evidence}</p>
                            )}
                        </div>
                    </div>
                )}

                <button
                    onClick={() => dispatch({ type: 'RESTART' })}
                    className="px-8 py-3 rounded-xl font-bold bg-primary text-white hover:bg-primary-light transition-all neon-glow cursor-pointer flex items-center gap-2 mx-auto"
                >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>refresh</span>
                    Try Again (New Mystery)
                </button>
            </div>
        </div>
    );
}
