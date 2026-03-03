import { useState } from 'react';
import { useGameState } from '../game/gameState';
import { DIFFICULTIES } from '../game/difficultySettings';

export default function IntroScreen() {
    const { state, dispatch } = useGameState();
    const [selectedDifficulty, setSelectedDifficulty] = useState('normal');
    const envKey = import.meta.env.VITE_GROQ_API_KEY;
    const [apiKey, setApiKey] = useState(state.apiKey || '');
    const [showApiInput, setShowApiInput] = useState(!envKey);

    const handleStart = () => {
        if (!envKey && !apiKey.trim()) {
            setShowApiInput(true);
            return;
        }
        if (apiKey.trim()) {
            dispatch({ type: 'SET_API_KEY', payload: apiKey.trim() });
        }
        dispatch({ type: 'SET_DIFFICULTY', payload: selectedDifficulty });
        dispatch({ type: 'START_GAME' });
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-2xl w-full animate-fadeIn">
                {/* Title */}
                <div className="text-center mb-10">
                    <div className="text-6xl mb-4 animate-float">🕵️</div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-purple-400 via-pink-300 to-purple-400 bg-clip-text text-transparent">
                        Midnight at
                    </h1>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-300 via-yellow-300 to-purple-300 bg-clip-text text-transparent">
                        Blackwood Manor
                    </h1>
                    <p className="text-gray-400 text-lg">An AI-Powered Voice Detective Mystery</p>
                </div>

                {/* Crime Briefing */}
                <div className="glass rounded-2xl p-6 mb-6 animate-slideUp" style={{ animationDelay: '0.1s' }}>
                    <h2 className="text-yellow-400 font-bold text-lg mb-3 flex items-center gap-2">
                        <span>📋</span> THE CRIME
                    </h2>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                            <span className="text-gray-500">Victim:</span>
                            <span>Richard Blackwood, 55</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-gray-500">Cause:</span>
                            <span className="text-red-400">Cyanide poisoning</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-gray-500">Time:</span>
                            <span className="text-yellow-400">9:47 PM</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-gray-500">Location:</span>
                            <span>Private study</span>
                        </div>
                    </div>
                    <p className="text-purple-300 mt-3 text-sm font-medium">
                        Four suspects. One killer. 🔍 Interrogate them to find the truth.
                    </p>
                </div>

                {/* Features */}
                <div className="glass rounded-2xl p-6 mb-6 animate-slideUp" style={{ animationDelay: '0.2s' }}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-2xl">🎤</span>
                            <span className="text-gray-300">Voice Interrogation</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-2xl">🤖</span>
                            <span className="text-gray-300">AI Suspects</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-2xl">😰</span>
                            <span className="text-gray-300">Dynamic Emotions</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-2xl">🔊</span>
                            <span className="text-gray-300">Immersive Audio</span>
                        </div>
                    </div>
                </div>

                {/* API Key (only if no env key) */}
                {showApiInput && (
                    <div className="glass rounded-2xl p-6 mb-6 animate-slideUp" style={{ animationDelay: '0.25s' }}>
                        <label className="block text-sm text-gray-400 mb-2">
                            🔑 Groq API Key <span className="text-gray-600">(or set VITE_GROQ_API_KEY in .env)</span>
                        </label>
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="gsk_..."
                            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all"
                        />
                    </div>
                )}

                {/* Difficulty Selection */}
                <div className="glass rounded-2xl p-6 mb-6 animate-slideUp" style={{ animationDelay: '0.3s' }}>
                    <h3 className="text-gray-300 font-semibold mb-4">Choose Difficulty</h3>
                    <div className="space-y-3">
                        {Object.entries(DIFFICULTIES).map(([key, diff]) => (
                            <button
                                key={key}
                                onClick={() => setSelectedDifficulty(key)}
                                className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 border ${selectedDifficulty === key
                                        ? 'border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/10'
                                        : 'border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/15'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">{diff.icon}</span>
                                        <span className="font-medium">{diff.label}</span>
                                    </div>
                                    <span className="text-sm text-gray-500">{Math.floor(diff.time / 60)}:00</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1 ml-9">{diff.description}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Start Button */}
                <button
                    onClick={handleStart}
                    className="w-full py-4 rounded-2xl font-bold text-lg bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 active:scale-[0.98] animate-slideUp cursor-pointer"
                    style={{ animationDelay: '0.4s' }}
                >
                    🕵️ Begin Investigation
                </button>

                <p className="text-center text-gray-600 text-xs mt-4">
                    🎧 Best with headphones • Works with voice or keyboard
                </p>
            </div>
        </div>
    );
}
