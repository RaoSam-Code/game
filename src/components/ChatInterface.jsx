import { useState, useRef, useEffect } from 'react';
import { useGameState } from '../game/gameState';
import { SUSPECTS } from '../game/suspects';
import { DIFFICULTIES } from '../game/difficultySettings';
import { sendMessage } from '../ai/claudeAPI';
import { conversationManager } from '../ai/conversationManager';
import { analyzeMood } from '../ai/moodDetection';
import { detectEvidence } from '../game/evidenceDetection';
import { speakText, stopSpeaking } from '../audio/speechSynthesis';
import { createSpeechRecognition, isSpeechRecognitionSupported } from '../audio/speechRecognition';
import { playEvidenceChime } from '../audio/soundEffects';

export default function ChatInterface() {
    const { state, dispatch, showToast } = useGameState();
    const suspect = SUSPECTS[state.selectedSuspect];
    const [inputText, setInputText] = useState('');
    const [messages, setMessages] = useState([]);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const chatEndRef = useRef(null);
    const recognitionRef = useRef(null);
    const prevSuspectRef = useRef(state.selectedSuspect);

    // Update messages when suspect changes
    useEffect(() => {
        if (prevSuspectRef.current !== state.selectedSuspect) {
            prevSuspectRef.current = state.selectedSuspect;
            stopSpeaking();
            setIsSpeaking(false);
        }
        const history = conversationManager.getHistory(state.selectedSuspect);
        setMessages(history);
    }, [state.selectedSuspect]);

    // Auto-scroll
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, state.isLoading]);

    const handleSend = async () => {
        const text = inputText.trim();
        if (!text || state.isLoading) return;

        setInputText('');

        // Add user message
        conversationManager.addMessage(state.selectedSuspect, 'user', text);
        const updatedMessages = conversationManager.getHistory(state.selectedSuspect);
        setMessages([...updatedMessages]);

        dispatch({ type: 'SET_LOADING', payload: true });

        try {
            const difficulty = DIFFICULTIES[state.difficulty];
            const response = await sendMessage(
                state.apiKey,
                suspect.systemPrompt,
                updatedMessages,
                difficulty.promptModifier
            );

            // Add AI response
            conversationManager.addMessage(state.selectedSuspect, 'assistant', response);
            const finalMessages = conversationManager.getHistory(state.selectedSuspect);
            setMessages([...finalMessages]);

            // Analyze mood
            const mood = analyzeMood(response);
            dispatch({ type: 'SET_MOOD', payload: { suspect: state.selectedSuspect, mood } });

            // Reset mood after 8 seconds
            if (mood !== 'neutral') {
                setTimeout(() => {
                    dispatch({ type: 'SET_MOOD', payload: { suspect: state.selectedSuspect, mood: 'neutral' } });
                }, 8000);
            }

            // Detect evidence
            const newEvidence = detectEvidence(text, response, suspect.name, state.evidence);
            if (newEvidence.length > 0) {
                dispatch({ type: 'ADD_EVIDENCE', payload: newEvidence });
                if (state.soundEnabled) playEvidenceChime();
                showToast(`🔍 ${newEvidence.length} new clue${newEvidence.length > 1 ? 's' : ''} found!`);
            }

            // Voice output
            if (state.voiceOutputEnabled) {
                setIsSpeaking(true);
                speakText(response, suspect.voiceParams, () => setIsSpeaking(false));
            }

        } catch (error) {
            conversationManager.addMessage(state.selectedSuspect, 'assistant', `⚠️ Error: ${error.message}`);
            setMessages([...conversationManager.getHistory(state.selectedSuspect)]);
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const toggleVoiceInput = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }

        const recognition = createSpeechRecognition(
            (transcript) => {
                setInputText(transcript);
                setIsListening(false);
            },
            () => setIsListening(false)
        );

        if (recognition) {
            recognitionRef.current = recognition;
            recognition.start();
            setIsListening(true);
        } else {
            showToast('⚠️ Voice input not supported in this browser');
        }
    };

    const mood = state.currentMood[state.selectedSuspect] || 'neutral';
    const expression = suspect.expressions[mood];

    return (
        <div className="flex flex-col h-full">
            {/* Suspect Header */}
            <div className="glass-strong rounded-t-2xl p-4 flex items-center gap-4 border-b border-white/5">
                <div className={`text-5xl transition-all duration-500 ${mood !== 'neutral' ? 'scale-110' : ''} ${isSpeaking ? 'animate-pulse' : ''}`}>
                    {expression}
                </div>
                <div className="flex-1">
                    <h2 className="font-bold text-lg" style={{ color: suspect.color }}>{suspect.name}</h2>
                    <p className="text-xs text-gray-500">{suspect.role} • Age {suspect.age}</p>
                    {mood !== 'neutral' && (
                        <p className="text-xs mt-1 capitalize" style={{ color: suspect.color }}>
                            {mood === 'nervous' ? 'Seems nervous...' :
                                mood === 'angry' ? 'Getting agitated...' :
                                    mood === 'thinking' ? 'Thinking carefully...' :
                                        mood === 'happy' ? 'Appears relieved...' : ''}
                        </p>
                    )}
                </div>
                {isSpeaking && (
                    <button
                        onClick={() => { stopSpeaking(); setIsSpeaking(false); }}
                        className="text-xs text-gray-500 hover:text-white transition-colors bg-white/5 rounded-lg px-3 py-1 cursor-pointer"
                    >
                        🔇 Stop
                    </button>
                )}
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
                {messages.length === 0 && (
                    <div className="text-center text-gray-600 mt-16">
                        <p className="text-4xl mb-3">{suspect.expressions.neutral}</p>
                        <p className="text-sm">Start interrogating {suspect.name.split(' ')[0]}...</p>
                        <p className="text-xs text-gray-700 mt-1">Ask about their alibi, motive, or what they saw</p>
                    </div>
                )}
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                        <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${msg.role === 'user'
                                ? 'bg-purple-600/30 border border-purple-500/20 text-purple-100'
                                : 'bg-white/5 border border-white/5 text-gray-200'
                            }`}>
                            {msg.role !== 'user' && (
                                <span className="text-xs font-medium block mb-1" style={{ color: suspect.color }}>
                                    {suspect.name.split(' ')[0]}
                                </span>
                            )}
                            {msg.content}
                        </div>
                    </div>
                ))}
                {state.isLoading && (
                    <div className="flex justify-start animate-fadeIn">
                        <div className="bg-white/5 border border-white/5 rounded-2xl px-4 py-3 text-sm">
                            <span className="text-xs font-medium block mb-1" style={{ color: suspect.color }}>
                                {suspect.name.split(' ')[0]}
                            </span>
                            <span className="inline-flex gap-1">
                                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </span>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-white/5">
                <div className="flex items-center gap-2">
                    {isSpeechRecognitionSupported() && (
                        <button
                            onClick={toggleVoiceInput}
                            disabled={state.isLoading}
                            className={`p-3 rounded-xl transition-all duration-300 cursor-pointer ${isListening
                                    ? 'bg-red-500/20 text-red-400 animate-pulse-glow border border-red-500/30'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5'
                                }`}
                            title={isListening ? 'Stop listening' : 'Start voice input'}
                        >
                            🎤
                        </button>
                    )}
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={isListening ? '🎤 Listening... speak now' : `Ask ${suspect.name.split(' ')[0]} a question...`}
                        disabled={state.isLoading}
                        className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all disabled:opacity-50"
                    />
                    <button
                        onClick={handleSend}
                        disabled={state.isLoading || !inputText.trim()}
                        className="p-3 rounded-xl bg-purple-600/30 text-purple-300 hover:bg-purple-600/50 hover:text-white transition-all duration-300 border border-purple-500/20 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                        📤
                    </button>
                </div>
            </div>
        </div>
    );
}
