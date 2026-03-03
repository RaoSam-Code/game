class ConversationManager {
    constructor() {
        this.conversations = {};
    }

    initSuspect(suspectId) {
        if (!this.conversations[suspectId]) {
            this.conversations[suspectId] = [];
        }
    }

    addMessage(suspectId, role, content) {
        this.initSuspect(suspectId);
        this.conversations[suspectId].push({ role, content });
    }

    getHistory(suspectId) {
        this.initSuspect(suspectId);
        return [...this.conversations[suspectId]];
    }

    getQuestionCount(suspectId) {
        this.initSuspect(suspectId);
        return this.conversations[suspectId].filter(m => m.role === 'user').length;
    }

    getAllQuestionCounts() {
        const counts = {};
        Object.keys(this.conversations).forEach(id => {
            counts[id] = this.getQuestionCount(id);
        });
        return counts;
    }

    getTotalQuestions() {
        return Object.values(this.conversations).reduce(
            (total, msgs) => total + msgs.filter(m => m.role === 'user').length, 0
        );
    }

    reset() {
        this.conversations = {};
    }
}

export const conversationManager = new ConversationManager();
