export const DIFFICULTIES = {
    easy: {
        id: 'easy',
        time: 1200,
        label: 'Easy Detective',
        description: '20 minutes • Helpful suspects • Frequent hints',
        suspectBehavior: 'more helpful',
        hints: 'frequent',
        icon: '🟢',
        promptModifier: 'Be somewhat helpful and give clearer answers. Drop more obvious hints about your knowledge.'
    },
    normal: {
        id: 'normal',
        time: 900,
        label: 'Detective',
        description: '15 minutes • Balanced experience • Some hints',
        suspectBehavior: 'balanced',
        hints: 'moderate',
        icon: '🟡',
        promptModifier: 'Behave naturally according to your personality. Balance between being helpful and guarding secrets.'
    },
    hard: {
        id: 'hard',
        time: 600,
        label: 'Master Detective',
        description: '10 minutes • Evasive suspects • Rare hints',
        suspectBehavior: 'evasive',
        hints: 'rare',
        icon: '🔴',
        promptModifier: 'Be evasive and guarded. Give shorter, less helpful answers. Deflect questions more aggressively. Make the detective work hard for every piece of information.'
    }
};
