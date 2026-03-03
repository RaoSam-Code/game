export function speakText(text, voiceParams = {}, onEnd = null) {
    if (!window.speechSynthesis) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = voiceParams.pitch || 1.0;
    utterance.rate = voiceParams.rate || 1.0;
    utterance.volume = 0.8;

    // Try to select a good voice
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
        // Prefer English voices
        const englishVoices = voices.filter(v => v.lang.startsWith('en'));
        if (englishVoices.length > 0) {
            utterance.voice = englishVoices[0];
        }
    }

    if (onEnd) {
        utterance.onend = onEnd;
    }

    window.speechSynthesis.speak(utterance);
    return utterance;
}

export function stopSpeaking() {
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
}

export function isSpeechSynthesisSupported() {
    return 'speechSynthesis' in window;
}
