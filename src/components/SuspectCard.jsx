import { useGameState } from '../game/gameState';

export default function SuspectCard({ suspect }) {
    const { state, dispatch } = useGameState();
    const isSelected = state.selectedSuspect === suspect.id;
    const qCount = state.questionCounts[suspect.id] || 0;
    const mood = state.currentMood[suspect.id] || 'neutral';
    const tension = state.tensionLevels[suspect.id] || 0;

    const MOOD_ICONS = {
        neutral: 'person',
        nervous: 'sentiment_stressed',
        angry: 'sentiment_extremely_dissatisfied',
        happy: 'sentiment_satisfied',
        thinking: 'psychology',
        defensive: 'shield',
    };
    const MOOD_LABELS = {
        nervous: 'Nervous',
        angry: 'Agitated',
        thinking: 'Thinking...',
        happy: 'Relieved',
        defensive: 'Defensive',
    };

    return (
        <button
            onClick={() => dispatch({ type: 'SELECT_SUSPECT', payload: suspect.id })}
            className={`w-full text-left rounded-xl p-3 transition-all duration-300 border cursor-pointer ${isSelected
                    ? 'border-primary/50 bg-primary/15 neon-glow-subtle'
                    : 'border-border-subtle bg-bg-card/30 hover:bg-bg-card/60 hover:border-border-subtle'
                }`}
        >
            <div className="flex items-center gap-3">
                <div className="relative">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all duration-300 ${isSelected ? 'bg-primary/20' : 'bg-bg-card'
                        }`}>
                        {suspect.emoji}
                    </div>
                    {mood !== 'neutral' && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-bg-dark flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary" style={{ fontSize: '12px' }}>
                                {MOOD_ICONS[mood]}
                            </span>
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm truncate" style={{ color: isSelected ? suspect.color : 'var(--color-text-primary)' }}>
                        {suspect.name}
                    </div>
                    <div className="text-xs text-text-muted truncate">{suspect.profession}</div>
                </div>
                {qCount > 0 && (
                    <div className="flex items-center gap-1 text-xs text-text-muted bg-bg-card/50 rounded-full px-2 py-0.5">
                        <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>chat_bubble</span>
                        {qCount}
                    </div>
                )}
            </div>

            {/* Tension bar */}
            {tension > 0.1 && (
                <div className="mt-2.5 ml-13">
                    <div className="h-1 bg-border-subtle rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                                width: `${tension * 100}%`,
                                background: tension > 0.6 ? 'var(--color-danger)' : tension > 0.3 ? 'var(--color-warning)' : 'var(--color-primary)',
                            }}
                        />
                    </div>
                </div>
            )}

            {mood !== 'neutral' && MOOD_LABELS[mood] && (
                <div className="mt-1.5 flex items-center gap-1 text-xs text-primary ml-13">
                    <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>{MOOD_ICONS[mood]}</span>
                    <span className="italic">{MOOD_LABELS[mood]}</span>
                </div>
            )}
        </button>
    );
}
