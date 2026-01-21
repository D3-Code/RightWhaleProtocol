/**
 * Token Metadata Fetcher
 * Fetches token images and metadata from Pump.fun API
 */

const PUMP_API = 'https://pump.fun/coin';

type TokenMetadata = {
    mint: string;
    name: string;
    symbol: string;
    image_uri?: string;
};

const cache = new Map<string, TokenMetadata>();

export const fetchTokenMetadata = async (mint: string): Promise<TokenMetadata | null> => {
    // Check cache first
    if (cache.has(mint)) {
        return cache.get(mint)!;
    }

    try {
        const response = await fetch(`${PUMP_API}/${mint}.json`, {
            headers: {
                'User-Agent': 'Mozilla/5.0'
            }
        });
        if (!response.ok) {
            console.warn(`Failed to fetch metadata for ${mint}: ${response.status}`);
            return null;
        }

        const data = await response.json();
        const metadata: TokenMetadata = {
            mint,
            name: data.name || '',
            symbol: data.symbol || '',
            image_uri: data.image_uri || data.image || ''
        };

        // Cache it
        cache.set(mint, metadata);

        return metadata;
    } catch (error) {
        console.error(`Error fetching metadata for ${mint}:`, error);
        return null;
    }
};

// Clear cache periodically (every hour) to avoid memory bloat
setInterval(() => {
    cache.clear();
    console.log('🧹 Token metadata cache cleared');
}, 60 * 60 * 1000);
