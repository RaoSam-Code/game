import { createContext, useContext, useReducer, useCallback, useRef, useEffect } from 'react';

const GameContext = createContext(null);

const DIFFICULTY_TIMES = { easy: 1200, normal: 900, hard: 600 };

const initialState = {
    screen: 'intro', // intro | loading | game | victory | failure
    difficulty: null,
    sessionId: null,
    story: null,       // dynamic from backend
    suspects: [],      // from backend story
    selectedSuspect: null,
    evidence: [],
    timeRemaining: 900,
    isTimerRunning: false,
    soundEnabled: true,
    voiceOutputEnabled: true,
    isLoading: false,
    currentMood: {},
    tensionLevels: {},
    accusationResult: null,
    toastMessage: null,
    messages: {},     // suspect_id -> [{role, content}]
    questionCounts: {},
};

function gameReducer(state, action) {
    switch (action.type) {
        case 'SET_SCREEN':
            return { ...state, screen: action.payload };
        case 'SET_DIFFICULTY':
            return { ...state, difficulty: action.payload, timeRemaining: DIFFICULTY_TIMES[action.payload] };
        case 'SET_STORY': {
            const story = action.payload.story;
            const suspects = story.suspects || [];
            return {
                ...state,
                sessionId: action.payload.session_id,
                story,
                suspects,
                selectedSuspect: suspects[0]?.id || null,
                screen: 'game',
                isTimerRunning: true,
                evidence: [],
                messages: {},
                questionCounts: {},
                currentMood: {},
                tensionLevels: {},
                accusationResult: null,
                timeRemaining: DIFFICULTY_TIMES[state.difficulty] || 900,
            };
        }
        case 'SELECT_SUSPECT':
            return { ...state, selectedSuspect: action.payload };
        case 'ADD_USER_MESSAGE': {
            const sid = action.payload.suspectId;
            const msgs = state.messages[sid] || [];
            return {
                ...state,
                messages: { ...state.messages, [sid]: [...msgs, { role: 'user', content: action.payload.text }] },
            };
        }
        case 'ADD_AI_MESSAGE': {
            const sid = action.payload.suspectId;
            const msgs = state.messages[sid] || [];
            return {
                ...state,
                messages: { ...state.messages, [sid]: [...msgs, { role: 'assistant', content: action.payload.text }] },
                questionCounts: { ...state.questionCounts, [sid]: action.payload.questionCount || (state.questionCounts[sid] || 0) + 1 },
            };
        }
        case 'SET_MOOD':
            return {
                ...state,
                currentMood: { ...state.currentMood, [action.payload.suspect]: action.payload.mood },
                tensionLevels: action.payload.tension !== undefined
                    ? { ...state.tensionLevels, [action.payload.suspect]: action.payload.tension }
                    : state.tensionLevels,
            };
        case 'ADD_EVIDENCE': {
            // Deduplicate by key
            const newEvidence = action.payload.filter(
                e => !state.evidence.some(existing => existing.suspect === e.suspect && existing.label === e.label)
            );
            if (newEvidence.length === 0) return state;
            return { ...state, evidence: [...state.evidence, ...newEvidence] };
        }
        case 'TICK_TIMER': {
            const t = state.timeRemaining - 1;
            if (t <= 0) return { ...state, timeRemaining: 0, isTimerRunning: false, screen: 'failure' };
            return { ...state, timeRemaining: t };
        }
        case 'START_TIMER':
            return { ...state, isTimerRunning: true };
        case 'STOP_TIMER':
            return { ...state, isTimerRunning: false };
        case 'TOGGLE_SOUND':
            return { ...state, soundEnabled: !state.soundEnabled };
        case 'TOGGLE_VOICE':
            return { ...state, voiceOutputEnabled: !state.voiceOutputEnabled };
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };
        case 'SET_ACCUSATION_RESULT':
            return {
                ...state,
                accusationResult: action.payload,
                isTimerRunning: false,
                screen: action.payload.correct ? 'victory' : 'failure',
            };
        case 'SHOW_TOAST':
            return { ...state, toastMessage: action.payload };
        case 'HIDE_TOAST':
            return { ...state, toastMessage: null };
        case 'RESTART':
            return { ...initialState, soundEnabled: state.soundEnabled, voiceOutputEnabled: state.voiceOutputEnabled };
        default:
            return state;
    }
}

export function GameStateProvider({ children }) {
    const [state, dispatch] = useReducer(gameReducer, initialState);
    const timerRef = useRef(null);

    useEffect(() => {
        if (state.isTimerRunning) {
            timerRef.current = setInterval(() => dispatch({ type: 'TICK_TIMER' }), 1000);
        } else if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [state.isTimerRunning]);

    useEffect(() => {
        if (state.toastMessage) {
            const t = setTimeout(() => dispatch({ type: 'HIDE_TOAST' }), 3000);
            return () => clearTimeout(t);
        }
    }, [state.toastMessage]);

    const showToast = useCallback((msg) => dispatch({ type: 'SHOW_TOAST', payload: msg }), []);

    return (
        <GameContext.Provider value={{ state, dispatch, showToast }}>
            {children}
        </GameContext.Provider>
    );
}

export function useGameState() {
    const context = useContext(GameContext);
    if (!context) throw new Error('useGameState must be used within GameStateProvider');
    return context;
}
