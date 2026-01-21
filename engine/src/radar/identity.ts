/**
 * Wallet Identity Resolver
 * Resolves wallet addresses to human-readable names
 */

import { Connection, PublicKey } from '@solana/web3.js';

const SOLSCAN_API = 'https://api.solscan.io/account';
const RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

type WalletIdentity = {
    address: string;
    wallet_name?: string;
    twitter_handle?: string;
    profile_image_url?: string;
};

const identityCache = new Map<string, WalletIdentity>();

/**
 * Resolve wallet identity from multiple sources
 */
export const resolveWalletIdentity = async (address: string): Promise<WalletIdentity> => {
    // Check cache first
    if (identityCache.has(address)) {
        return identityCache.get(address)!;
    }

    const identity: WalletIdentity = { address };

    try {
        // Try Solscan API for Twitter/social links
        const response = await fetch(`${SOLSCAN_API}?address=${address}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0'
            }
        });

        if (response.ok) {
            const data = await response.json();

            // Solscan may provide social links or labels
            if (data.data?.label) {
                identity.wallet_name = data.data.label;
            }

            if (data.data?.twitter) {
                identity.twitter_handle = data.data.twitter;
            }
        }
    } catch (error) {
        console.warn(`Failed to resolve identity for ${address}:`, error);
    }

    // Fallback: Create a readable name from address
    if (!identity.wallet_name && !identity.twitter_handle) {
        identity.wallet_name = `Whale_${address.slice(0, 4)}`;
    }

    // Cache it
    identityCache.set(address, identity);

    return identity;
};

/**
 * Get display name for a wallet
 */
export const getWalletDisplayName = (address: string, identity?: WalletIdentity): string => {
    if (identity?.twitter_handle) {
        return `@${identity.twitter_handle}`;
    }
    if (identity?.wallet_name) {
        return identity.wallet_name;
    }
    // Fallback to shortened address
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

// Clear cache periodically
setInterval(() => {
    if (identityCache.size > 500) {
        const entries = Array.from(identityCache.entries());
        identityCache.clear();
        // Keep last 250
        entries.slice(-250).forEach(([addr, identity]) => {
            identityCache.set(addr, identity);
        });
        console.log('🧹 Identity cache trimmed to 250 entries');
    }
}, 60 * 60 * 1000); // Every hour
