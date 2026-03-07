import { useState } from 'react';
import { useGameState } from '../game/gameState';
import { createNewGame } from '../ai/claudeAPI';

const DIFFICULTIES = {
    easy: { label: 'EASY', time: 1200 },
    normal: { label: 'NORMAL', time: 900 },
    hard: { label: 'HARD', time: 600 },
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

    // Loading state
    if (generating && state.screen === 'intro') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'var(--color-bg-dark)' }}>
                <div className="text-center animate-fadeIn">
                    <div className="relative mb-8">
                        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto animate-pulse-glow">
                            <span className="material-symbols-outlined text-primary" style={{ fontSize: '40px' }}>search</span>
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-text-primary mb-2 tracking-tight">Generating Your Mystery</h2>
                    <p className="text-text-muted text-sm mb-8">Creating suspects, alibis, and deception layers...</p>
                    <div className="flex justify-center gap-2">
                        <span className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative flex min-h-screen w-full flex-col" style={{ background: 'var(--color-bg-dark)' }}>
            {/* Hero Section with Background */}
            <div className="relative h-[55vh] w-full overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center scale-105"
                    style={{ backgroundImage: 'url("/hero-bg.png")' }}
                />
                <div className="absolute inset-0 anime-gradient" />

                {/* Title Overlay */}
                <div className="relative z-10 flex flex-col items-center justify-end h-full pb-8 px-6 text-center">
                    {/* Badge */}
                    <div className="mb-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/40 backdrop-blur-md animate-slideDown">
                        <span className="material-symbols-outlined text-primary text-sm">auto_awesome</span>
                        <span className="text-xs font-bold uppercase tracking-widest text-primary">AI Detective</span>
                    </div>

                    {/* Title */}
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-text-primary drop-shadow-2xl animate-fadeIn">
                        MIDNIGHT AT <br />
                        <span className="text-primary italic">BLACKWOOD MANOR</span>
                    </h1>

                    {/* Subtitle */}
                    <p className="mt-4 text-text-secondary max-w-md text-sm md:text-base animate-slideUp" style={{ animationDelay: '0.2s' }}>
                        Uncover the secrets hidden within the shadows of the estate. Every choice leads to a different truth.
                    </p>
                </div>
            </div>

            {/* Menu Area */}
            <div className="flex-1 px-4 pb-28 -mt-4 relative z-20">
                <div className="max-w-md mx-auto">

                    {/* Difficulty Selection */}
                    <div className="mb-8 animate-slideUp" style={{ animationDelay: '0.3s' }}>
                        <h2 className="text-text-muted text-xs font-bold uppercase tracking-[0.2em] text-center mb-4">Select Difficulty</h2>
                        <div className="flex h-12 items-center justify-center rounded-xl bg-bg-card/50 border border-border-subtle p-1.5 backdrop-blur-sm">
                            {Object.entries(DIFFICULTIES).map(([key, diff]) => (
                                <label
                                    key={key}
                                    className={`flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-lg px-2 text-sm font-bold transition-all duration-300 ${selectedDifficulty === key
                                            ? 'bg-primary text-white neon-glow-subtle'
                                            : 'text-text-muted hover:text-text-secondary'
                                        }`}
                                >
                                    <span className="truncate">{diff.label}</span>
                                    <input
                                        className="invisible w-0"
                                        name="difficulty"
                                        type="radio"
                                        value={key}
                                        checked={selectedDifficulty === key}
                                        onChange={() => setSelectedDifficulty(key)}
                                    />
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3 animate-slideUp" style={{ animationDelay: '0.4s' }}>
                        {/* Start Investigation */}
                        <button
                            onClick={handleStart}
                            disabled={generating}
                            className="group flex items-center justify-between overflow-hidden rounded-xl h-14 px-6 bg-primary text-white text-lg font-bold transition-all duration-300 hover:scale-[1.02] active:scale-95 neon-glow disabled:opacity-50 cursor-pointer"
                        >
                            <span className="flex items-center gap-3">
                                <span className="material-symbols-outlined">play_circle</span>
                                Start Investigation
                            </span>
                            <span className="material-symbols-outlined opacity-0 group-hover:opacity-100 transition-opacity">chevron_right</span>
                        </button>

                        {/* Features row */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center justify-center gap-2 rounded-xl h-12 px-4 bg-bg-card/40 border border-border-subtle text-text-secondary text-sm font-bold">
                                <span className="material-symbols-outlined text-lg text-primary">mic</span>
                                Voice Input
                            </div>
                            <div className="flex items-center justify-center gap-2 rounded-xl h-12 px-4 bg-bg-card/40 border border-border-subtle text-text-secondary text-sm font-bold">
                                <span className="material-symbols-outlined text-lg text-primary">psychology</span>
                                AI Brains
                            </div>
                        </div>
                    </div>

                    {/* Features Card */}
                    <div className="mt-8 p-5 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 animate-slideUp" style={{ animationDelay: '0.5s' }}>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="material-symbols-outlined text-primary text-sm">info</span>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-primary">How It Works</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="flex items-start gap-2">
                                <span className="material-symbols-outlined text-primary text-base mt-0.5">refresh</span>
                                <div>
                                    <p className="font-medium text-text-primary text-xs">New Story</p>
                                    <p className="text-text-muted text-xs">Fresh mystery each game</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="material-symbols-outlined text-primary text-base mt-0.5">face_retouching_off</span>
                                <div>
                                    <p className="font-medium text-text-primary text-xs">Expert Liars</p>
                                    <p className="text-text-muted text-xs">AI that deceives smartly</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="material-symbols-outlined text-primary text-base mt-0.5">mood</span>
                                <div>
                                    <p className="font-medium text-text-primary text-xs">Emotions</p>
                                    <p className="text-text-muted text-xs">Dynamic mood reactions</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="material-symbols-outlined text-primary text-base mt-0.5">timer</span>
                                <div>
                                    <p className="font-medium text-text-primary text-xs">Time Pressure</p>
                                    <p className="text-text-muted text-xs">{Math.floor(DIFFICULTIES[selectedDifficulty].time / 60)} min limit</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer note */}
                    <p className="text-center text-text-muted text-xs mt-6 animate-slideUp" style={{ animationDelay: '0.6s' }}>
                        🎧 Best experience with headphones
                    </p>
                </div>
            </div>
        </div>
    );
}
