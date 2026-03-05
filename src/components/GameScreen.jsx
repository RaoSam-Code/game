import { useState } from 'react';
import { useGameState } from '../game/gameState';
import { makeAccusation } from '../ai/claudeAPI';
import { playAccusationDrum } from '../audio/soundEffects';
import SuspectCard from './SuspectCard';
import ChatInterface from './ChatInterface';
import CaseFile from './CaseFile';
import Timer from './Timer';

function AccusationModal({ onClose }) {
    const { state, dispatch, showToast } = useGameState();
    const [accusing, setAccusing] = useState(false);

    const handleAccuse = async (suspectId) => {
        setAccusing(true);
        if (state.soundEnabled) playAccusationDrum();

        try {
            const result = await makeAccusation(state.sessionId, suspectId);
            dispatch({ type: 'SET_ACCUSATION_RESULT', payload: result });
        } catch (err) {
            showToast(`⚠️ ${err.message}`);
            setAccusing(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="glass-strong rounded-2xl p-6 max-w-md w-full">
                <h2 className="text-xl font-bold text-red-400 mb-2 text-center">⚠️ Make Your Accusation</h2>
                <p className="text-sm text-gray-400 text-center mb-6">
                    Choose carefully — this is your final answer. Who committed the murder?
                </p>
                <div className="space-y-3">
                    {state.suspects.map(s => (
                        <button
                            key={s.id}
                            onClick={() => handleAccuse(s.id)}
                            disabled={accusing}
                            className="w-full flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40 transition-all cursor-pointer disabled:opacity-50"
                        >
                            <span className="text-3xl">{s.emoji}</span>
                            <div className="text-left">
                                <div className="font-medium" style={{ color: s.color }}>{s.name}</div>
                                <div className="text-xs text-gray-500">{s.profession}</div>
                            </div>
                        </button>
                    ))}
                </div>
                <button
                    onClick={onClose}
                    disabled={accusing}
                    className="w-full mt-4 py-2 rounded-xl bg-white/5 text-gray-400 hover:bg-white/10 transition-all text-sm cursor-pointer"
                >
                    Cancel — Continue Investigating
                </button>
            </div>
        </div>
    );
}

export default function GameScreen() {
    const { state, dispatch } = useGameState();
    const [showAccusation, setShowAccusation] = useState(false);

    return (
        <div className="h-screen flex flex-col">
            {/* Header */}
            <div className="glass-strong px-4 py-3 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-3">
                    <span className="text-xl">🕵️</span>
                    <h1 className="font-bold text-sm md:text-base bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent">
                        {state.story?.setting?.name || 'Investigation'}
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <Timer />
                    <button onClick={() => dispatch({ type: 'TOGGLE_SOUND' })} className="text-lg hover:opacity-80 transition-opacity cursor-pointer">
                        {state.soundEnabled ? '🔊' : '🔇'}
                    </button>
                    <button onClick={() => dispatch({ type: 'TOGGLE_VOICE' })} className="text-lg hover:opacity-80 transition-opacity cursor-pointer">
                        {state.voiceOutputEnabled ? '🎙️' : '🔕'}
                    </button>
                </div>
            </div>

            {/* Main 3-panel */}
            <div className="flex-1 flex min-h-0">
                {/* Left — Suspects */}
                <div className="w-56 lg:w-64 border-r border-white/5 flex flex-col p-3 gap-2">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1 mb-1">Suspects</h3>
                    <div className="flex-1 space-y-2 overflow-y-auto">
                        {state.suspects.map(s => (
                            <SuspectCard key={s.id} suspect={s} />
                        ))}
                    </div>
                    <div className="pt-2 border-t border-white/5">
                        <button
                            onClick={() => setShowAccusation(true)}
                            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600/30 to-red-500/30 border border-red-500/30 text-red-300 font-bold text-sm hover:from-red-600/50 hover:to-red-500/50 transition-all cursor-pointer"
                        >
                            ⚖️ Make Accusation
                        </button>
                    </div>
                </div>

                {/* Center — Chat */}
                <div className="flex-1 flex flex-col min-w-0">
                    <ChatInterface />
                </div>

                {/* Right — Case File */}
                <div className="w-56 lg:w-72 border-l border-white/5 p-3">
                    <CaseFile />
                </div>
            </div>

            {/* Toast */}
            {state.toastMessage && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-slideUp">
                    <div className="glass-strong rounded-xl px-5 py-3 text-sm font-medium text-green-300 shadow-xl">
                        {state.toastMessage}
                    </div>
                </div>
            )}

            {showAccusation && <AccusationModal onClose={() => setShowAccusation(false)} />}
        </div>
    );
}
