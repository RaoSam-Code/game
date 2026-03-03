const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function sendMessage(apiKey, systemPrompt, messages, difficultyModifier = '') {
    const fullSystemPrompt = systemPrompt + (difficultyModifier ? `\n\nDIFFICULTY MODIFIER: ${difficultyModifier}` : '');

    // Use env key if no explicit key passed
    const key = apiKey || import.meta.env.VITE_GROQ_API_KEY;
    if (!key) throw new Error('No Groq API key found. Set VITE_GROQ_API_KEY in .env');

    try {
        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${key}`,
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                max_tokens: 300,
                messages: [
                    { role: 'system', content: fullSystemPrompt },
                    ...messages,
                ],
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `API error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            throw new Error('Network error. Please check your internet connection.');
        }
        throw error;
    }
}
