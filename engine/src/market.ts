import { broadcastToChannel } from './telegram';

// Placeholder for Token Mint - In prod, use real mint
// We will use a popular token like BONK or WIF for testing if needed, or the placeholder
const TOKEN_MINT = process.env.TOKEN_MINT_ADDRESS || '7GCihgDB8fe6KW9b21f3kF2374241641614761476147';
const DEXSCREENER_API = `https://api.dexscreener.com/latest/dex/tokens/`;

// State
let maxMarketCap = 0;
let lastProcessedTxId: string | null = null;

// Helper to fetch data
// Since we are in Node environment without 'axios' installed yet, we use native fetch (Available in Node 18+)
const fetchTokenData = async () => {
    try {
        const response = await fetch(`${DEXSCREENER_API}${TOKEN_MINT}`);
        const data = await response.json();
        return data.pairs ? data.pairs[0] : null; // Get first pair (usually most liquid)
    } catch (err) {
        console.error('Market Monitor Error:', err);
        return null;
    }
};

export const startMarketMonitor = () => {
    console.log('📈 Market Monitor Started...');

    // Poll every 30 seconds
    setInterval(async () => {
        const pair = await fetchTokenData();
        if (!pair) return;

        // 1. ATH Check
        const currentMcap = pair.fdv || pair.marketCap;
        if (currentMcap > maxMarketCap) {
            // Only alert if we significantly broke the previous ATH (avoid jitter)
            // For MVP initialization, set initial max to current to avoid instant alert on startup
            if (maxMarketCap === 0) {
                maxMarketCap = currentMcap;
            } else if (currentMcap > maxMarketCap * 1.05) { // 5% break needed
                const price = pair.priceUsd;
                await broadcastToChannel(
                    `🚀 *NEW ALL-TIME HIGH!* 🚀\n\n` +
                    `We just broke the previous ceiling!\n` +
                    `💎 **Market Cap**: \`$${(currentMcap / 1000).toFixed(1)}k\`\n` +
                    `💰 **Price**: \`$${price}\`\n\n` +
                    `🌕 *Next stop: The Moon.*`
                );
                maxMarketCap = currentMcap;
            }
        }

        // 2. Whale Watcher
        // Note: DexScreener API doesn't list individual recent trades easily in the free endpoint,
        // it gives volume/tx counts. 
        // For a REAL implementation, we need a Helius/Birdeye webhook for "Swaps > X".
        // HOWEVER, for this MVP, we will simulate the check or if data allows.
        // Since we cannot reliably get "last trade > 5 SOL" from simple periodic polling without missing some,
        // we will use a Mock/Simulation trigger here to demonstrate the FEATURE to the user.
        // In PROD: Replace this with `connection.onLogs` subscription.

        // --- SIMULATION BLOCK (Uncomment to test) ---
        // const randomVal = Math.random();
        // if (randomVal > 0.98) { // Occasional random whale
        //    await broadcastToChannel(
        //        `🚨 *WHALE ALERT* 🚨\n\n` +
        //        `A giant splash detected! \`50.0 SOL\` bought!\n` +
        //        `[View TX](https://solscan.io/)`
        //    );
        // }

    }, 30000); // 30s
};
