import { useState, useRef, useEffect } from 'react';
import { useGameState } from '../game/gameState';
import { sendMessage } from '../ai/claudeAPI';
import { speakText, stopSpeaking } from '../audio/speechSynthesis';
import { createSpeechRecognition, isSpeechRecognitionSupported } from '../audio/speechRecognition';
import { playEvidenceChime } from '../audio/soundEffects';

export default function ChatInterface() {
    const { state, dispatch, showToast } = useGameState();
    const [inputText, setInputText] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const chatEndRef = useRef(null);
    const recognitionRef = useRef(null);

    const suspect = state.suspects.find(s => s.id === state.selectedSuspect);
    const messages = state.messages[state.selectedSuspect] || [];
    const mood = state.currentMood[state.selectedSuspect] || 'neutral';

    const MOOD_ICONS = {
        neutral: 'person', nervous: 'sentiment_stressed', angry: 'sentiment_extremely_dissatisfied',
        happy: 'sentiment_satisfied', thinking: 'psychology', defensive: 'shield',
    };

    useEffect(() => { stopSpeaking(); setIsSpeaking(false); }, [state.selectedSuspect]);
    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, state.isLoading]);

    const handleSend = async () => {
        const text = inputText.trim();
        if (!text || state.isLoading || !suspect) return;

        setInputText('');
        dispatch({ type: 'ADD_USER_MESSAGE', payload: { suspectId: suspect.id, text } });
        dispatch({ type: 'SET_LOADING', payload: true });

        try {
            const result = await sendMessage(state.sessionId, suspect.id, text);
            dispatch({ type: 'ADD_AI_MESSAGE', payload: { suspectId: suspect.id, text: result.response, questionCount: result.question_count } });

            if (result.mood) {
                dispatch({ type: 'SET_MOOD', payload: { suspect: suspect.id, mood: result.mood.mood, tension: result.mood.tension } });
                if (result.mood.mood !== 'neutral') {
                    setTimeout(() => dispatch({ type: 'SET_MOOD', payload: { suspect: suspect.id, mood: 'neutral' } }), 8000);
                }
            }

            if (result.evidence?.length > 0) {
                const mapped = result.evidence.map(e => ({ ...e, key: `${e.suspect}:${e.label}`, timestamp: new Date().toLocaleTimeString() }));
                dispatch({ type: 'ADD_EVIDENCE', payload: mapped });
                if (state.soundEnabled) playEvidenceChime();
                showToast(`🔍 New clue${mapped.length > 1 ? 's' : ''} found!`);
            }

            if (state.voiceOutputEnabled && suspect.voice_params) {
                setIsSpeaking(true);
                speakText(result.response, suspect.voice_params, () => setIsSpeaking(false));
            }
        } catch (error) {
            dispatch({ type: 'ADD_AI_MESSAGE', payload: { suspectId: suspect.id, text: `⚠️ Error: ${error.message}` } });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const toggleVoiceInput = () => {
        if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return; }
        const recognition = createSpeechRecognition(
            (transcript) => { setInputText(transcript); setIsListening(false); },
            () => setIsListening(false)
        );
        if (recognition) { recognitionRef.current = recognition; recognition.start(); setIsListening(true); }
        else showToast('⚠️ Voice input not supported');
    };

    if (!suspect) return <div className="flex-1 flex items-center justify-center text-text-muted">Select a suspect</div>;

    return (
        <div className="flex flex-col h-full">
            {/* Suspect Header */}
            <div className="glass-strong px-5 py-4 flex items-center gap-4 border-b border-border-subtle">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-primary/10 border border-primary/20 transition-all duration-500 ${isSpeaking ? 'animate-pulse-glow' : ''}`}>
                    {suspect.emoji}
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h2 className="font-bold text-base" style={{ color: suspect.color }}>{suspect.name}</h2>
                        {mood !== 'neutral' && (
                            <span className="material-symbols-outlined text-primary animate-breathe" style={{ fontSize: '16px' }}>
                                {MOOD_ICONS[mood]}
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-text-muted">{suspect.profession} • {suspect.relationship}</p>
                </div>
                {isSpeaking && (
                    <button
                        onClick={() => { stopSpeaking(); setIsSpeaking(false); }}
                        className="flex items-center gap-1 text-xs text-text-muted hover:text-text-primary transition-colors bg-bg-card rounded-lg px-3 py-1.5 cursor-pointer border border-border-subtle"
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>volume_off</span>
                        Stop
                    </button>
                )}
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
                {messages.length === 0 && (
                    <div className="text-center mt-16 animate-fadeIn">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 border border-primary/20">
                            <span className="text-3xl">{suspect.emoji}</span>
                        </div>
                        <p className="text-sm text-text-secondary font-medium">Begin interrogating {suspect.name.split(' ')[0]}</p>
                        <p className="text-xs text-text-muted mt-1">Ask about their alibi, motive, or observations</p>
                    </div>
                )}
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                        <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${msg.role === 'user'
                                ? 'bg-primary/20 border border-primary/30 text-text-primary'
                                : 'bg-bg-card/60 border border-border-subtle text-text-primary'
                            }`}>
                            {msg.role !== 'user' && (
                                <span className="text-xs font-bold block mb-1" style={{ color: suspect.color }}>
                                    {suspect.name.split(' ')[0]}
                                </span>
                            )}
                            {msg.content}
                        </div>
                    </div>
                ))}
                {state.isLoading && (
                    <div className="flex justify-start animate-fadeIn">
                        <div className="bg-bg-card/60 border border-border-subtle rounded-2xl px-4 py-3">
                            <span className="text-xs font-bold block mb-1.5" style={{ color: suspect.color }}>
                                {suspect.name.split(' ')[0]}
                            </span>
                            <span className="inline-flex gap-1.5">
                                <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </span>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border-subtle">
                <div className="flex items-center gap-2">
                    {isSpeechRecognitionSupported() && (
                        <button
                            onClick={toggleVoiceInput}
                            disabled={state.isLoading}
                            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 cursor-pointer border ${isListening
                                    ? 'bg-danger/20 text-danger animate-pulse-glow border-danger/30'
                                    : 'bg-bg-card text-text-muted hover:text-primary hover:border-primary/30 border-border-subtle'
                                }`}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>mic</span>
                        </button>
                    )}
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={isListening ? '🎤 Listening...' : `Question ${suspect.name.split(' ')[0]}...`}
                        disabled={state.isLoading}
                        className="flex-1 bg-bg-card border border-border-subtle rounded-xl px-4 py-3 text-sm text-text-primary placeholder-text-muted transition-all disabled:opacity-50"
                    />
                    <button
                        onClick={handleSend}
                        disabled={state.isLoading || !inputText.trim()}
                        className="w-11 h-11 rounded-xl bg-primary text-white flex items-center justify-center transition-all duration-300 hover:bg-primary-light disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>send</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
