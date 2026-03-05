"""
Server-side mood detection with tension tracking.
Analyzes AI responses for emotional state and tracks escalation per suspect.
"""

# Pattern weights for more nuanced detection
MOOD_PATTERNS = {
    "nervous": {
        "strong": ["i...", "well...", "um", "uh", "that's not", "impossible", "you can't prove",
                    "i don't remember", "i can't recall", "may have", "perhaps", "i'm not sure"],
        "weak": ["...", "honestly", "to be frank", "look", "believe me", "i swear"],
    },
    "angry": {
        "strong": ["how dare", "absurd", "outrageous", "ridiculous", "preposterous",
                    "enough!", "i refuse", "stop accusing", "baseless", "slander"],
        "weak": ["offended", "insulting", "unfair", "uncalled for", "excuse me"],
    },
    "thinking": {
        "strong": ["let me think", "if i recall", "trying to remember", "as far as i know",
                    "to my knowledge", "i believe it was"],
        "weak": ["recall", "remember", "think", "believe"],
    },
    "happy": {
        "strong": ["glad you asked", "happy to help", "certainly", "of course", "absolutely"],
        "weak": ["pleased", "appreciate", "thank you", "wonderful"],
    },
    "defensive": {
        "strong": ["why are you asking me", "what about", "why don't you ask",
                    "you should be looking at", "i'm not the one", "focus on"],
        "weak": ["instead", "rather", "shouldn't you", "what makes you think"],
    },
}


class MoodEngine:
    def __init__(self):
        self.tension_levels = {}  # suspect_id -> float (0.0 to 1.0)
        self.mood_history = {}   # suspect_id -> list of moods

    def analyze(self, suspect_id, response_text):
        """Analyze AI response text and return mood + tension data."""
        text_lower = response_text.lower()

        # Count exclamation marks as anger indicator
        exclamation_count = response_text.count("!")
        ellipsis_count = response_text.count("...")

        scores = {}
        for mood, patterns in MOOD_PATTERNS.items():
            score = 0
            for p in patterns["strong"]:
                if p in text_lower:
                    score += 2
            for p in patterns["weak"]:
                if p in text_lower:
                    score += 1
            scores[mood] = score

        # Boost anger from exclamations
        if exclamation_count >= 2:
            scores["angry"] = scores.get("angry", 0) + exclamation_count

        # Boost nervous from ellipsis
        if ellipsis_count >= 2:
            scores["nervous"] = scores.get("nervous", 0) + ellipsis_count

        # Find dominant mood
        if max(scores.values(), default=0) == 0:
            detected_mood = "neutral"
        else:
            detected_mood = max(scores, key=scores.get)

        # Calculate confidence
        total_score = sum(scores.values())
        confidence = min(1.0, max(scores.values(), default=0) / max(total_score, 1))

        # Update tension
        tension_delta = {
            "nervous": 0.15,
            "angry": 0.1,
            "defensive": 0.12,
            "thinking": 0.05,
            "happy": -0.1,
            "neutral": -0.03,
        }
        current_tension = self.tension_levels.get(suspect_id, 0.0)
        new_tension = max(0.0, min(1.0, current_tension + tension_delta.get(detected_mood, 0)))
        self.tension_levels[suspect_id] = new_tension

        # Track history
        if suspect_id not in self.mood_history:
            self.mood_history[suspect_id] = []
        self.mood_history[suspect_id].append(detected_mood)

        return {
            "mood": detected_mood,
            "confidence": round(confidence, 2),
            "tension": round(new_tension, 2),
            "scores": scores,
        }

    def get_tension(self, suspect_id):
        return self.tension_levels.get(suspect_id, 0.0)

    def reset(self):
        self.tension_levels = {}
        self.mood_history = {}
