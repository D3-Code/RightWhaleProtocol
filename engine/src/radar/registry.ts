/**
 * Token Registry
 * Caches token names and symbols from launch events
 */

type TokenInfo = {
    name: string;
    symbol: string;
    mint: string;
};

const tokenRegistry = new Map<string, TokenInfo>();

export const registerToken = (mint: string, name: string, symbol: string) => {
    tokenRegistry.set(mint, { mint, name, symbol });
};

export const getTokenInfo = (mint: string): TokenInfo | null => {
    return tokenRegistry.get(mint) || null;
};

export const getTokenName = (mint: string): string => {
    const info = tokenRegistry.get(mint);
    return info?.name || info?.symbol || 'Unknown Token';
};

export const getTokenSymbol = (mint: string): string => {
    const info = tokenRegistry.get(mint);
    return info?.symbol || 'UNKNOWN';
};

// Clear registry periodically to avoid memory bloat (keep last 1000 tokens)
setInterval(() => {
    if (tokenRegistry.size > 1000) {
        const entries = Array.from(tokenRegistry.entries());
        tokenRegistry.clear();
        // Keep last 500
        entries.slice(-500).forEach(([mint, info]) => {
            tokenRegistry.set(mint, info);
        });
        console.log('🧹 Token registry trimmed to 500 entries');
    }
}, 30 * 60 * 1000); // Every 30 minutes
