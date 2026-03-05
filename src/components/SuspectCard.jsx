import { useGameState } from '../game/gameState';

export default function SuspectCard({ suspect }) {
    const { state, dispatch } = useGameState();
    const isSelected = state.selectedSuspect === suspect.id;
    const qCount = state.questionCounts[suspect.id] || 0;
    const mood = state.currentMood[suspect.id] || 'neutral';
    const tension = state.tensionLevels[suspect.id] || 0;

    const EXPRESSIONS = {
        neutral: suspect.emoji,
        nervous: '😰',
        angry: '😠',
        happy: '😊',
        thinking: '🤔',
        defensive: '😤',
    };
    const expression = EXPRESSIONS[mood] || suspect.emoji;

    return (
        <button
            onClick={() => dispatch({ type: 'SELECT_SUSPECT', payload: suspect.id })}
            className={`w-full text-left rounded-xl p-3 transition-all duration-300 border cursor-pointer ${isSelected
                    ? 'border-purple-500/60 bg-purple-500/15 shadow-lg shadow-purple-500/10'
                    : 'border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/15'
                }`}
        >
            <div className="flex items-center gap-3">
                <div className={`text-3xl transition-transform duration-300 ${mood !== 'neutral' ? 'scale-110' : ''}`}>
                    {expression}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate" style={{ color: suspect.color }}>
                        {suspect.name}
                    </div>
                    <div className="text-xs text-gray-500 truncate">{suspect.profession}</div>
                </div>
                {qCount > 0 && (
                    <div className="text-xs text-gray-500 flex items-center gap-1">💬 {qCount}</div>
                )}
            </div>
            {/* Tension bar */}
            {tension > 0.1 && (
                <div className="mt-2 ml-12">
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                                width: `${tension * 100}%`,
                                background: tension > 0.6 ? '#ef4444' : tension > 0.3 ? '#eab308' : '#9333ea',
                            }}
                        />
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5">
                        {tension > 0.6 ? '🔥 High tension' : tension > 0.3 ? '⚡ Rising tension' : ''}
                    </div>
                </div>
            )}
            {mood !== 'neutral' && (
                <div className="mt-1 text-xs text-gray-500 italic pl-12 capitalize">
                    {mood === 'nervous' ? '😰 Seems nervous...' :
                        mood === 'angry' ? '😠 Getting angry...' :
                            mood === 'thinking' ? '🤔 Thinking carefully...' :
                                mood === 'happy' ? '😊 Seems relieved...' :
                                    mood === 'defensive' ? '😤 Getting defensive...' : ''}
                </div>
            )}
        </button>
    );
}
