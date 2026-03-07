import { useState } from 'react';
import { useGameState } from '../game/gameState';
import { getHint } from '../ai/claudeAPI';

export default function CaseFile() {
    const { state } = useGameState();
    const [showHint, setShowHint] = useState(false);
    const [hintText, setHintText] = useState('');
    const [loadingHint, setLoadingHint] = useState(false);

    const story = state.story;
    if (!story) return null;

    const handleGetHint = async () => {
        if (showHint) { setShowHint(false); return; }
        setShowHint(true);
        setLoadingHint(true);
        try {
            const data = await getHint(state.sessionId);
            setHintText(data.hint);
        } catch {
            setHintText('Keep investigating...');
        } finally {
            setLoadingHint(false);
        }
    };

    return (
        <div className="h-full flex flex-col gap-3 overflow-y-auto pr-1">
            {/* Case File */}
            <div className="glass rounded-xl p-4">
                <h3 className="text-primary text-[10px] font-bold uppercase tracking-[0.15em] mb-3 flex items-center gap-1.5">
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>description</span>
                    Case File
                </h3>
                <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                        <span className="text-text-muted">Victim</span>
                        <span className="text-text-primary font-medium">{story.victim.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-text-muted">Age</span>
                        <span className="text-text-secondary">{story.victim.age}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-text-muted">Profession</span>
                        <span className="text-text-secondary">{story.victim.profession}</span>
                    </div>
                    <div className="h-px bg-border-subtle my-1" />
                    <div className="flex justify-between items-center">
                        <span className="text-text-muted">Time of Death</span>
                        <span className="text-warning font-medium">{story.murder.time}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-text-muted">Method</span>
                        <span className="text-danger font-medium text-right text-[11px]">{story.murder.method}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-text-muted">Location</span>
                        <span className="text-text-secondary text-right">{story.murder.location_detail}</span>
                    </div>
                </div>
            </div>

            {/* Setting */}
            <div className="glass rounded-xl p-4">
                <h3 className="text-primary text-[10px] font-bold uppercase tracking-[0.15em] mb-2 flex items-center gap-1.5">
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>location_on</span>
                    {story.setting.name}
                </h3>
                <p className="text-xs text-text-muted leading-relaxed">{story.setting.description}</p>
            </div>

            {/* Evidence Board */}
            <div className="glass rounded-xl p-4 flex-1 min-h-0">
                <h3 className="text-primary text-[10px] font-bold uppercase tracking-[0.15em] mb-3 flex items-center gap-1.5">
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>search</span>
                    Evidence ({state.evidence.length})
                </h3>
                {state.evidence.length === 0 ? (
                    <p className="text-text-muted text-xs italic">No evidence yet. Start questioning...</p>
                ) : (
                    <div className="space-y-1.5 overflow-y-auto max-h-48">
                        {state.evidence.map((e, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs animate-fadeIn bg-bg-card/40 rounded-lg px-2.5 py-2 border border-border-subtle">
                                <span>{e.icon}</span>
                                <div className="flex-1 min-w-0">
                                    <span className="text-text-primary text-[11px]">{e.label}</span>
                                    <span className="text-text-muted block truncate text-[10px]">— {e.suspect}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Hint */}
            <div className="glass rounded-xl p-4">
                <button
                    onClick={handleGetHint}
                    className="w-full text-left text-xs font-bold text-warning flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
                >
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>lightbulb</span>
                    <span>{showHint ? 'Hide Hint' : 'Need a Hint?'}</span>
                    <span className="material-symbols-outlined ml-auto text-text-muted" style={{ fontSize: '14px' }}>
                        {showHint ? 'expand_less' : 'expand_more'}
                    </span>
                </button>
                {showHint && (
                    <p className="text-xs text-text-muted mt-2 leading-relaxed animate-fadeIn">
                        {loadingHint ? 'Thinking...' : hintText}
                    </p>
                )}
            </div>
        </div>
    );
}
