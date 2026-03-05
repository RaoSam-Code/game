import { useState } from 'react';
import { useGameState } from '../game/gameState';
import { createNewGame } from '../ai/claudeAPI';

const DIFFICULTIES = {
    easy: { label: 'Easy Detective', description: '20 minutes • Helpful suspects • Frequent hints', icon: '🟢', time: 1200 },
    normal: { label: 'Detective', description: '15 minutes • Balanced experience • Some hints', icon: '🟡', time: 900 },
    hard: { label: 'Master Detective', description: '10 minutes • Expert liars • Rare hints', icon: '🔴', time: 600 },
};

export default function IntroScreen() {
    const { state, dispatch, showToast } = useGameState();
    const [selectedDifficulty, setSelectedDifficulty] = useState('normal');
    const [generating, setGenerating] = useState(false);

    const handleStart = async () => {
        setGenerating(true);
        dispatch({ type: 'SET_DIFFICULTY', payload: selectedDifficulty });

        try {
            const gameData = await createNewGame(selectedDifficulty);
            dispatch({ type: 'SET_STORY', payload: gameData });
        } catch (err) {
            showToast(`⚠️ ${err.message}`);
            setGenerating(false);
        }
    };

    if (generating && state.screen === 'intro') {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center animate-fadeIn">
                    <div className="text-6xl mb-6 animate-float">🕵️</div>
                    <h2 className="text-2xl font-bold text-purple-300 mb-3">Generating Your Mystery...</h2>
                    <p className="text-gray-500 text-sm mb-6">Creating unique suspects, motives, and alibis</p>
                    <div className="flex justify-center gap-2">
                        <span className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-2xl w-full animate-fadeIn">
                <div className="text-center mb-10">
                    <div className="text-6xl mb-4 animate-float">🕵️</div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-purple-400 via-pink-300 to-purple-400 bg-clip-text text-transparent">
                        Midnight at
                    </h1>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-300 via-yellow-300 to-purple-300 bg-clip-text text-transparent">
                        Blackwood Manor
                    </h1>
                    <p className="text-gray-400 text-lg">An AI-Powered Voice Detective Mystery</p>
                    <p className="text-purple-400/60 text-sm mt-1">🔄 New mystery every game</p>
                </div>

                <div className="glass rounded-2xl p-6 mb-6 animate-slideUp" style={{ animationDelay: '0.1s' }}>
                    <h2 className="text-yellow-400 font-bold text-lg mb-3 flex items-center gap-2">
                        <span>📋</span> HOW IT WORKS
                    </h2>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                            <span className="text-purple-400">🔄</span>
                            <span>New story each game</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-purple-400">🧠</span>
                            <span>AI suspects with unique brains</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-purple-400">🤥</span>
                            <span>Expert-level lying & deception</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-purple-400">😰</span>
                            <span>Dynamic emotional reactions</span>
                        </div>
                    </div>
                </div>

                <div className="glass rounded-2xl p-6 mb-6 animate-slideUp" style={{ animationDelay: '0.2s' }}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-2xl">🎤</span>
                            <span className="text-gray-300">Voice Input</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-2xl">🤖</span>
                            <span className="text-gray-300">AI Suspects</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-2xl">😰</span>
                            <span className="text-gray-300">Emotions</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-2xl">🔊</span>
                            <span className="text-gray-300">Audio</span>
                        </div>
                    </div>
                </div>

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

                <button
                    onClick={handleStart}
                    disabled={generating}
                    className="w-full py-4 rounded-2xl font-bold text-lg bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 active:scale-[0.98] animate-slideUp cursor-pointer disabled:opacity-50"
                    style={{ animationDelay: '0.4s' }}
                >
                    🕵️ Generate New Mystery
                </button>

                <p className="text-center text-gray-600 text-xs mt-4">
                    🎧 Best with headphones • Works with voice or keyboard
                </p>
            </div>
        </div>
    );
}
