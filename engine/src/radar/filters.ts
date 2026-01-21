/**
 * Quality Whale Filters
 * Filters for proven profitable traders
 */

export type TrackedWallet = {
    address: string;
    win_rate: number;
    reputation_score: number;
    total_trades: number;
    total_profit_sol: number;
    avg_impact_buyers: number;
};

// Quality thresholds
export const MIN_REPUTATION_SCORE = 60;  // 0-100 scale
export const MIN_WIN_RATE = 55;          // 55%+
export const MIN_TRADES = 3;              // At least 3 completed trades

/**
 * Check if a wallet meets quality standards
 */
export const isQualityWhale = (wallet: Partial<TrackedWallet>): boolean => {
    // Must have track record
    if (!wallet.total_trades || wallet.total_trades < MIN_TRADES) {
        return false;
    }

    // Must be profitable
    if (!wallet.win_rate || wallet.win_rate < MIN_WIN_RATE) {
        return false;
    }

    // Must have reputation
    if (!wallet.reputation_score || wallet.reputation_score < MIN_REPUTATION_SCORE) {
        return false;
    }

    return true;
};

/**
 * Get verification badge for wallet
 */
export const getVerificationBadge = (wallet: Partial<TrackedWallet>): string => {
    if (isQualityWhale(wallet)) {
        return '🏆 VERIFIED';
    }

    if (wallet.total_trades && wallet.total_trades > 0) {
        return '⚠️ UNVERIFIED';
    }

    return '🆕 NEW';
};
