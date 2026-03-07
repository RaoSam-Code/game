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
            <div className="glass-strong rounded-2xl p-6 max-w-md w-full border border-danger/20">
                <div className="flex items-center gap-3 mb-2">
                    <span className="material-symbols-outlined text-danger" style={{ fontSize: '28px' }}>gavel</span>
                    <h2 className="text-xl font-bold text-danger">Make Your Accusation</h2>
                </div>
                <p className="text-sm text-text-muted mb-6">
                    Choose carefully — this is your final answer. Who committed the murder?
                </p>
                <div className="space-y-2.5">
                    {state.suspects.map(s => (
                        <button
                            key={s.id}
                            onClick={() => handleAccuse(s.id)}
                            disabled={accusing}
                            className="w-full flex items-center gap-3 p-3 rounded-xl bg-danger/5 border border-danger/15 hover:bg-danger/15 hover:border-danger/30 transition-all cursor-pointer disabled:opacity-50 group"
                        >
                            <div className="w-10 h-10 rounded-lg bg-bg-card flex items-center justify-center text-lg border border-border-subtle">
                                {s.emoji}
                            </div>
                            <div className="text-left flex-1">
                                <div className="font-bold text-sm" style={{ color: s.color }}>{s.name}</div>
                                <div className="text-xs text-text-muted">{s.profession}</div>
                            </div>
                            <span className="material-symbols-outlined text-danger/0 group-hover:text-danger/60 transition-all" style={{ fontSize: '18px' }}>chevron_right</span>
                        </button>
                    ))}
                </div>
                <button
                    onClick={onClose}
                    disabled={accusing}
                    className="w-full mt-4 py-2.5 rounded-xl bg-bg-card border border-border-subtle text-text-muted hover:text-text-secondary hover:bg-bg-card/80 transition-all text-sm cursor-pointer"
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
        <div className="h-screen flex flex-col" style={{ background: 'var(--color-bg-dark)' }}>
            {/* Header */}
            <div className="glass-strong px-4 py-2.5 flex items-center justify-between border-b border-border-subtle">
                <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary" style={{ fontSize: '22px' }}>detective</span>
                    <h1 className="font-bold text-sm tracking-tight text-text-primary">
                        {state.story?.setting?.name || 'Investigation'}
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <Timer />
                    <button onClick={() => dispatch({ type: 'TOGGLE_SOUND' })} className="w-8 h-8 rounded-lg bg-bg-card/40 border border-border-subtle flex items-center justify-center hover:border-primary/30 transition-all cursor-pointer">
                        <span className="material-symbols-outlined text-text-muted" style={{ fontSize: '18px' }}>{state.soundEnabled ? 'volume_up' : 'volume_off'}</span>
                    </button>
                    <button onClick={() => dispatch({ type: 'TOGGLE_VOICE' })} className="w-8 h-8 rounded-lg bg-bg-card/40 border border-border-subtle flex items-center justify-center hover:border-primary/30 transition-all cursor-pointer">
                        <span className="material-symbols-outlined text-text-muted" style={{ fontSize: '18px' }}>{state.voiceOutputEnabled ? 'record_voice_over' : 'voice_over_off'}</span>
                    </button>
                </div>
            </div>

            {/* Main 3-panel */}
            <div className="flex-1 flex min-h-0">
                {/* Left — Suspects */}
                <div className="w-56 lg:w-64 border-r border-border-subtle flex flex-col p-3 gap-2">
                    <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-[0.15em] px-1 mb-1 flex items-center gap-1.5">
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>group</span>
                        Suspects
                    </h3>
                    <div className="flex-1 space-y-2 overflow-y-auto">
                        {state.suspects.map(s => <SuspectCard key={s.id} suspect={s} />)}
                    </div>
                    <div className="pt-2 border-t border-border-subtle">
                        <button
                            onClick={() => setShowAccusation(true)}
                            className="w-full py-2.5 rounded-xl bg-danger/10 border border-danger/20 text-danger font-bold text-sm hover:bg-danger/20 hover:border-danger/40 transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>gavel</span>
                            Make Accusation
                        </button>
                    </div>
                </div>

                {/* Center — Chat */}
                <div className="flex-1 flex flex-col min-w-0">
                    <ChatInterface />
                </div>

                {/* Right — Case File */}
                <div className="w-56 lg:w-72 border-l border-border-subtle p-3">
                    <CaseFile />
                </div>
            </div>

            {/* Toast */}
            {state.toastMessage && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-slideUp">
                    <div className="glass-strong rounded-xl px-5 py-3 text-sm font-medium text-primary border border-primary/20 neon-glow-subtle">
                        {state.toastMessage}
                    </div>
                </div>
            )}

            {showAccusation && <AccusationModal onClose={() => setShowAccusation(false)} />}
        </div>
    );
}
