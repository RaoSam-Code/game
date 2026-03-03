export function getHint(evidence, questionCounts) {
    const evidenceLabels = evidence.map(e => e.label.toLowerCase());
    const totalQuestions = Object.values(questionCounts).reduce((a, b) => a + b, 0);

    // Early game
    if (totalQuestions < 2) {
        return { text: "Start with Margaret Chen — as the housekeeper, she sees everything that happens in the manor.", priority: 'low' };
    }

    // Haven't talked to Margaret
    if ((questionCounts.margaret || 0) === 0 && totalQuestions > 3) {
        return { text: "Don't forget to question Margaret Chen. Housekeepers often notice things others miss.", priority: 'medium' };
    }

    // Haven't found the critical time
    if (!evidenceLabels.some(e => e.includes('9:45'))) {
        return { text: "The time of death was 9:47 PM. Ask suspects where they were around 9:45 PM — those two minutes are critical.", priority: 'medium' };
    }

    // Haven't found witness testimony from Margaret
    if (!evidenceLabels.some(e => e.includes('witness')) && (questionCounts.margaret || 0) < 3) {
        return { text: "Ask Margaret specifically if she SAW anything suspicious near the study. She's very observant.", priority: 'high' };
    }

    // Found key evidence but haven't confronted Eleanor
    if (evidenceLabels.some(e => e.includes('witness')) && (questionCounts.eleanor || 0) < 3) {
        return { text: "You have witness testimony. Confront Dr. Hayes about her whereabouts and press her on contradictions.", priority: 'high' };
    }

    // Found most evidence
    if (evidenceLabels.some(e => e.includes('9:45')) && evidenceLabels.some(e => e.includes('witness'))) {
        return { text: "You have strong evidence! Compare alibis — whose story doesn't add up? Focus on contradictions.", priority: 'high' };
    }

    // Check alibis
    if (!evidenceLabels.some(e => e.includes('alibi'))) {
        return { text: "Ask each suspect for their alibi. Where were they between 9:30 and 10:00 PM?", priority: 'medium' };
    }

    // Generic mid-game
    if (evidenceLabels.some(e => e.includes('garden'))) {
        return { text: "Someone claimed to be in the garden. Can anyone corroborate that? Ask Margaret what she saw.", priority: 'medium' };
    }

    return { text: "Look for contradictions in the suspects' stories. Someone's alibi doesn't match the evidence.", priority: 'low' };
}
