const API_BASE = import.meta.env.VITE_API_BASE || '';

export async function createNewGame(difficulty = 'normal') {
    const response = await fetch(`${API_BASE}/api/new-game`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ difficulty }),
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail || `Failed to create game: ${response.status}`);
    }
    return response.json();
}

export async function sendMessage(sessionId, suspectId, message) {
    const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, suspect_id: suspectId, message }),
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail || `Chat failed: ${response.status}`);
    }
    return response.json();
}

export async function getHint(sessionId) {
    const response = await fetch(`${API_BASE}/api/hint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
    });
    if (!response.ok) return { hint: 'Keep investigating...', priority: 'low' };
    return response.json();
}

export async function makeAccusation(sessionId, suspectId) {
    const response = await fetch(`${API_BASE}/api/accuse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, suspect_id: suspectId }),
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail || `Accusation failed: ${response.status}`);
    }
    return response.json();
}
