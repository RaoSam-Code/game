import { useEffect } from 'react';
import { useGameState } from '../game/gameState';
import { playVictoryFanfare } from '../audio/soundEffects';

const DIFF_LABELS = { easy: 'Easy', normal: 'Normal', hard: 'Hard' };
const DIFF_TIMES = { easy: 1200, normal: 900, hard: 600 };

export default function VictoryScreen() {
    const { state, dispatch } = useGameState();
    const result = state.accusationResult;
    const totalTime = DIFF_TIMES[state.difficulty] || 900;
    const timeUsed = totalTime - state.timeRemaining;
    const minutes = Math.floor(timeUsed / 60);
    const seconds = timeUsed % 60;
    const totalQuestions = Object.values(state.questionCounts).reduce((a, b) => a + b, 0);

    useEffect(() => { if (state.soundEnabled) playVictoryFanfare(); }, []);

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--color-bg-dark)' }}>
            <div className="max-w-lg w-full text-center animate-fadeIn">
                <div className="w-20 h-20 rounded-2xl bg-success/10 border border-success/20 flex items-center justify-center mx-auto mb-6">
                    <span className="material-symbols-outlined text-success" style={{ fontSize: '40px' }}>check_circle</span>
                </div>

                <h1 className="text-4xl font-bold mb-2 tracking-tight text-success">CASE SOLVED!</h1>
                <p className="text-text-muted mb-8">Excellent work, Detective!</p>

                <div className="glass rounded-2xl p-6 mb-6 text-left animate-slideUp" style={{ animationDelay: '0.2s' }}>
                    <h3 className="text-success font-bold text-sm mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>verified</span>
                        Killer Identified
                    </h3>
                    <div className="text-lg font-bold text-danger mb-4">{result?.killer?.name}</div>
                    <div className="border-t border-border-subtle pt-4 space-y-2 text-sm">
                        <p className="text-text-muted"><strong className="text-text-secondary">Motive:</strong> {result?.killer?.motive}</p>
                        <p className="text-text-muted"><strong className="text-text-secondary">Method:</strong> {result?.killer?.method}</p>
                        {result?.key_evidence && (
                            <p className="text-text-muted"><strong className="text-text-secondary">Key evidence:</strong> {result.key_evidence}</p>
                        )}
                    </div>
                </div>

                <div className="glass rounded-2xl p-6 mb-8 animate-slideUp" style={{ animationDelay: '0.4s' }}>
                    <h3 className="text-primary font-bold text-sm mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>bar_chart</span>
                        Your Stats
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        {[
                            { label: 'Difficulty', value: DIFF_LABELS[state.difficulty] || state.difficulty, icon: 'speed' },
                            { label: 'Time Used', value: `${minutes}m ${seconds}s`, icon: 'timer' },
                            { label: 'Evidence', value: `${state.evidence.length} clues`, icon: 'search' },
                            { label: 'Questions', value: totalQuestions, icon: 'chat' },
                        ].map(stat => (
                            <div key={stat.label} className="bg-bg-card rounded-xl p-3 border border-border-subtle">
                                <div className="flex items-center gap-1.5 text-text-muted text-xs mb-1">
                                    <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>{stat.icon}</span>
                                    {stat.label}
                                </div>
                                <div className="font-bold text-text-primary">{stat.value}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    onClick={() => dispatch({ type: 'RESTART' })}
                    className="px-8 py-3 rounded-xl font-bold bg-primary text-white hover:bg-primary-light transition-all neon-glow cursor-pointer flex items-center gap-2 mx-auto"
                >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>refresh</span>
                    Play Again (New Mystery)
                </button>
            </div>
        </div>
    );
}
