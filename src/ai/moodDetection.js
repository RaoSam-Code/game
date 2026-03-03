export function analyzeMood(text) {
    const lower = text.toLowerCase();

    // Check for nervous indicators
    const nervousPatterns = ['...', 'i...', 'well...', 'um', 'uh', 'i suppose', "that's not", 'impossible',
        'nervous', 'uncomfortable', 'hesitat', 'i don\'t remember', 'i can\'t recall', 'may have', 'perhaps'];
    if (nervousPatterns.some(p => lower.includes(p))) return 'nervous';

    // Check for angry indicators
    const angryPatterns = ['how dare', 'absurd', 'offended', 'outrageous', 'ridiculous', 'accus',
        'insult', 'preposterous', '!', 'enough!', 'stop!', 'i refuse'];
    const exclamationCount = (text.match(/!/g) || []).length;
    if (exclamationCount >= 2 || angryPatterns.some(p => lower.includes(p))) return 'angry';

    // Check for thinking indicators
    const thinkingPatterns = ['recall', 'think', 'remember', 'if i recall', 'let me think',
        'as far as i know', 'to my knowledge', 'believe', 'trying to remember'];
    if (thinkingPatterns.some(p => lower.includes(p))) return 'thinking';

    // Check for happy/relieved indicators
    const happyPatterns = ['glad', 'relieved', 'appreciate', 'thank', 'certainly', 'of course',
        'happy to', 'pleased', 'wonderful'];
    if (happyPatterns.some(p => lower.includes(p))) return 'happy';

    return 'neutral';
}
