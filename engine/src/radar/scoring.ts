/**
 * Whale Signal Scoring Engine
 * Quantifies the "strength" of a trade signal based on whale reputation, size, and momentum.
 */

export type SignalGrade = 'S' | 'A' | 'B' | 'C' | 'D';

export interface SignalScore {
    score: number;
    grade: SignalGrade;
    factors: {
        reputation: number;
        volume: number;
        momentum: number;
    };
}

/**
 * Calculates a signal score from 0-100
 * @param reputation Whale reputation score (0-100)
 * @param amountSol Buy amount in SOL
 * @param recentWhaleCount Number of unique whales in this token recently
 */
export const calculateSignalScore = (
    reputation: number = 0,
    amountSol: number = 0,
    recentWhaleCount: number = 1
): SignalScore => {
    // 1. Reputation Factor (Max 40 pts)
    // Weighted heavily - we trust proven whales most.
    const reputationFactor = (reputation / 100) * 40;

    // 2. Volume Factor (Max 35 pts)
    // 1 SOL = 10 pts, 5 SOL = 25 pts, 10+ SOL = 35 pts
    let volumeFactor = 0;
    if (amountSol >= 10) volumeFactor = 35;
    else if (amountSol >= 5) volumeFactor = 25;
    else if (amountSol >= 1) volumeFactor = Math.min(amountSol * 10, 20);

    // 3. Momentum Factor (Max 25 pts)
    // Consensus: How many other whales are in this token?
    // 1 whale = 5 pts, 3 whales = 15 pts, 5+ whales = 25 pts
    const momentumFactor = Math.min(recentWhaleCount * 5, 25);

    const totalScore = Math.floor(reputationFactor + volumeFactor + momentumFactor);

    let grade: SignalGrade = 'D';
    if (totalScore >= 85) grade = 'S';
    else if (totalScore >= 70) grade = 'A';
    else if (totalScore >= 50) grade = 'B';
    else if (totalScore >= 30) grade = 'C';

    return {
        score: totalScore,
        grade,
        factors: {
            reputation: Math.round(reputationFactor),
            volume: Math.round(volumeFactor),
            momentum: Math.round(momentumFactor)
        }
    };
};

/**
 * Common signal thresholds for alerts
 */
export const SIGNAL_THRESHOLDS = {
    AUDIO_ALERT: 75,        // Grade A+
    BROWSER_NOTIFY: 85,     // Grade S
    HOT_TOKEN: 3            // 3+ whales
};
