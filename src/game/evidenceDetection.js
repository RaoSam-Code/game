const EVIDENCE_KEYWORDS = {
    'affair': { label: 'Affair discovered', icon: '💔' },
    'divorce': { label: 'Divorce threat', icon: '📄' },
    'inherit': { label: 'Inheritance motive', icon: '💰' },
    'blackmail': { label: 'Blackmail scheme', icon: '🔒' },
    'medical record': { label: 'Falsified records', icon: '📋' },
    'falsif': { label: 'Falsified records', icon: '📋' },
    'insurance': { label: 'Insurance fraud', icon: '🏥' },
    'cyanide': { label: 'Cyanide knowledge', icon: '☠️' },
    'poison': { label: 'Poison discussed', icon: '🧪' },
    'brandy': { label: 'Brandy was poisoned', icon: '🥃' },
    '9:45': { label: 'Critical time: 9:45 PM', icon: '🕘' },
    'nine forty': { label: 'Critical time: 9:45 PM', icon: '🕘' },
    'quarter to ten': { label: 'Critical time: 9:45 PM', icon: '🕘' },
    'study': { label: 'Study access noted', icon: '🚪' },
    'garden': { label: 'Garden alibi claimed', icon: '🌿' },
    'smoking': { label: 'Smoking alibi noted', icon: '🚬' },
    'cigarette': { label: 'Smoking alibi noted', icon: '🚬' },
    'saw': { label: 'Witness testimony', icon: '👁️' },
    'witness': { label: 'Witness testimony', icon: '👁️' },
    'forced out': { label: 'Business betrayal', icon: '💼' },
    'fired': { label: 'Business betrayal', icon: '💼' },
    'company': { label: 'Business disputes', icon: '🏢' },
    'cards': { label: 'Card game alibi', icon: '🃏' },
    'poker': { label: 'Card game alibi', icon: '🃏' },
    'library': { label: 'Library alibi', icon: '📚' },
    'dining room': { label: 'Dining room alibi', icon: '🍽️' },
    'kitchen': { label: 'Kitchen alibi', icon: '🍳' },
    'license': { label: 'Medical license threat', icon: '⚕️' },
    'nervous': { label: 'Suspect showed nervousness', icon: '😰' },
    'lying': { label: 'Possible deception detected', icon: '🤥' },
};

export function detectEvidence(question, response, suspectName, existingEvidence) {
    const newEvidence = [];
    const combined = (question + ' ' + response).toLowerCase();

    Object.entries(EVIDENCE_KEYWORDS).forEach(([keyword, data]) => {
        const evidenceKey = `${suspectName}:${data.label}`;
        const alreadyFound = existingEvidence.some(e => e.key === evidenceKey);

        if (combined.includes(keyword) && !alreadyFound) {
            newEvidence.push({
                key: evidenceKey,
                suspect: suspectName,
                label: data.label,
                icon: data.icon,
                timestamp: new Date().toLocaleTimeString()
            });
        }
    });

    return newEvidence;
}
