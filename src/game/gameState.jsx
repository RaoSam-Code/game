import { createContext, useContext, useReducer, useCallback, useRef, useEffect } from 'react';
import { SUSPECTS } from './suspects';
import { DIFFICULTIES } from './difficultySettings';
import { conversationManager } from '../ai/conversationManager';

const GameContext = createContext(null);

const initialState = {
    screen: 'intro', // intro | game | victory | failure
    difficulty: null,
    apiKey: '',
    selectedSuspect: 'victoria',
    evidence: [],
    timeRemaining: 900,
    isTimerRunning: false,
    soundEnabled: true,
    voiceOutputEnabled: true,
    isLoading: false,
    currentMood: {},
    accusedSuspect: null,
    toastMessage: null,
};

function gameReducer(state, action) {
    switch (action.type) {
        case 'SET_SCREEN':
            return { ...state, screen: action.payload };
        case 'SET_DIFFICULTY':
            return {
                ...state,
                difficulty: action.payload,
                timeRemaining: DIFFICULTIES[action.payload].time
            };
        case 'SET_API_KEY':
            return { ...state, apiKey: action.payload };
        case 'SELECT_SUSPECT':
            return { ...state, selectedSuspect: action.payload };
        case 'ADD_EVIDENCE':
            return {
                ...state,
                evidence: [...state.evidence, ...action.payload]
            };
        case 'TICK_TIMER':
            const newTime = state.timeRemaining - 1;
            if (newTime <= 0) {
                return { ...state, timeRemaining: 0, isTimerRunning: false, screen: 'failure' };
            }
            return { ...state, timeRemaining: newTime };
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
        case 'SET_MOOD':
            return {
                ...state,
                currentMood: { ...state.currentMood, [action.payload.suspect]: action.payload.mood }
            };
        case 'ACCUSE':
            const suspect = SUSPECTS[action.payload];
            return {
                ...state,
                accusedSuspect: action.payload,
                isTimerRunning: false,
                screen: suspect.isGuilty ? 'victory' : 'failure'
            };
        case 'SHOW_TOAST':
            return { ...state, toastMessage: action.payload };
        case 'HIDE_TOAST':
            return { ...state, toastMessage: null };
        case 'START_GAME':
            return {
                ...state,
                screen: 'game',
                isTimerRunning: true,
                evidence: [],
                currentMood: {},
                accusedSuspect: null,
                selectedSuspect: 'victoria',
                timeRemaining: DIFFICULTIES[state.difficulty].time,
            };
        case 'RESTART':
            conversationManager.reset();
            return {
                ...initialState,
                apiKey: state.apiKey,
                soundEnabled: state.soundEnabled,
                voiceOutputEnabled: state.voiceOutputEnabled,
            };
        default:
            return state;
    }
}

export function GameStateProvider({ children }) {
    const [state, dispatch] = useReducer(gameReducer, initialState);
    const timerRef = useRef(null);

    // Timer effect
    useEffect(() => {
        if (state.isTimerRunning) {
            timerRef.current = setInterval(() => {
                dispatch({ type: 'TICK_TIMER' });
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [state.isTimerRunning]);

    // Toast auto-hide
    useEffect(() => {
        if (state.toastMessage) {
            const timer = setTimeout(() => dispatch({ type: 'HIDE_TOAST' }), 3000);
            return () => clearTimeout(timer);
        }
    }, [state.toastMessage]);

    const showToast = useCallback((msg) => {
        dispatch({ type: 'SHOW_TOAST', payload: msg });
    }, []);

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
