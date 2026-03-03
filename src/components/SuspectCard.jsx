import { useGameState } from '../game/gameState';
import { SUSPECTS } from '../game/suspects';
import { conversationManager } from '../ai/conversationManager';

export default function SuspectCard({ suspectId }) {
    const { state, dispatch } = useGameState();
    const suspect = SUSPECTS[suspectId];
    const isSelected = state.selectedSuspect === suspectId;
    const qCount = conversationManager.getQuestionCount(suspectId);
    const mood = state.currentMood[suspectId] || 'neutral';
    const expression = suspect.expressions[mood];

    return (
        <button
            onClick={() => dispatch({ type: 'SELECT_SUSPECT', payload: suspectId })}
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
                    <div className="text-xs text-gray-500 truncate">{suspect.role}</div>
                </div>
                {qCount > 0 && (
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                        💬 {qCount}
                    </div>
                )}
            </div>
            {mood !== 'neutral' && (
                <div className="mt-1 text-xs text-gray-500 italic pl-12 capitalize">
                    {mood === 'nervous' ? '😰 Seems nervous...' :
                        mood === 'angry' ? '😠 Getting angry...' :
                            mood === 'thinking' ? '🤔 Thinking carefully...' :
                                mood === 'happy' ? '😊 Seems relieved...' : ''}
                </div>
            )}
        </button>
    );
}
