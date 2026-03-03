import { useState } from 'react';
import { useGameState } from '../game/gameState';
import { getHint } from '../game/hintGenerator';
import { conversationManager } from '../ai/conversationManager';

export default function CaseFile() {
    const { state } = useGameState();
    const [showHint, setShowHint] = useState(false);

    const hint = getHint(state.evidence, conversationManager.getAllQuestionCounts());

    return (
        <div className="h-full flex flex-col gap-4 overflow-y-auto pr-1">
            {/* Victim Info */}
            <div className="glass rounded-xl p-4">
                <h3 className="text-yellow-400 font-bold text-sm mb-2 flex items-center gap-2">
                    <span>📋</span> CASE FILE
                </h3>
                <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Victim</span>
                        <span>Richard Blackwood</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Time of Death</span>
                        <span className="text-yellow-400">9:47 PM</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Cause</span>
                        <span className="text-red-400">Cyanide in brandy</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Location</span>
                        <span>Private study</span>
                    </div>
                </div>
            </div>

            {/* Evidence Board */}
            <div className="glass rounded-xl p-4 flex-1 min-h-0">
                <h3 className="text-green-400 font-bold text-sm mb-2 flex items-center gap-2">
                    <span>🔍</span> EVIDENCE ({state.evidence.length})
                </h3>
                {state.evidence.length === 0 ? (
                    <p className="text-gray-600 text-xs italic">No evidence yet. Start questioning suspects...</p>
                ) : (
                    <div className="space-y-1.5 overflow-y-auto max-h-64">
                        {state.evidence.map((e, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs animate-fadeIn bg-white/5 rounded-lg px-2 py-1.5">
                                <span>{e.icon}</span>
                                <div className="flex-1 min-w-0">
                                    <span className="text-gray-300">{e.label}</span>
                                    <span className="text-gray-600 block truncate">— {e.suspect}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Hint System */}
            <div className="glass rounded-xl p-4">
                <button
                    onClick={() => setShowHint(!showHint)}
                    className="w-full text-left text-sm font-bold text-yellow-400 flex items-center gap-2 cursor-pointer"
                >
                    <span>💡</span>
                    <span>{showHint ? 'HIDE HINT' : 'NEED A HINT?'}</span>
                    <span className="text-xs font-normal text-gray-600 ml-auto">{showHint ? '▲' : '▼'}</span>
                </button>
                {showHint && (
                    <p className="text-xs text-gray-400 mt-2 leading-relaxed animate-fadeIn">
                        {hint.text}
                    </p>
                )}
            </div>

            {/* Tips */}
            <div className="glass rounded-xl p-4">
                <h3 className="text-purple-400 font-bold text-sm mb-2">🎯 TIPS</h3>
                <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Ask about alibis and timelines</li>
                    <li>• Look for emotional reactions</li>
                    <li>• Cross-reference stories</li>
                    <li>• Press suspects on contradictions</li>
                </ul>
            </div>
        </div>
    );
}
