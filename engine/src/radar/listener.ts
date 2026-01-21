import WebSocket from 'ws';
import { initDB, logWhaleSighting } from '../db';
import { processTrade } from './tracker';

/**
 * RightWhale Radar: Real-Time Listener
 * 
 * Listens to PumpPortal trade stream.
 * Filters for > 1 SOL buys.
 */

const WS_URL = 'wss://pumpportal.fun/api/data';
const WHALE_THRESHOLD_SOL = 5.0; // Increased from 1.0 for higher quality signals

export const startRadar = async () => {
    // Ensure DB is ready
    await initDB();

    const ws = new WebSocket(WS_URL);

    ws.on('open', () => {
        console.log('📡 WRAS Online: Monitoring Pump.fun streams...');

        // Subscribe to New Token Creation (Always available global stream)
        // This is "Alpha" source #1
        ws.send(JSON.stringify({
            method: "subscribeNewToken"
        }));

        // Subscribe to Trades? 
        // Note: Global trade stream might be heavy or require specific keys.
        // We will try to subscribe, but usually you need to specify accounts/mints.
        // For MVP, tracking "New Token" events is a good proxy for "New Opportunities".

        // If we want WHALE tracker on specific coins, we'd need to subscribe to them.
        // Let's try to see if a global trade stream exists or if we settle for New Tokens + specific lists.
    });

    ws.on('message', async (data: WebSocket.Data) => {
        try {
            const event = JSON.parse(data.toString());

            // 1. New Token Alert
            if (event.txType === 'create') {
                console.log(`🆕 [NEW LAUNCH] ${event.name} ($${event.symbol})`);
                console.log(`   Mint: ${event.mint}`);
                console.log(`   Dev: ${event.traderPublicKey}`);

                // DYNAMIC DRAGNET: Immediately subscribe to trades for this new token
                // This allows us to catch the FIRST whales buying in
                ws.send(JSON.stringify({
                    method: "subscribeTokenTrade",
                    keys: [event.mint]
                }));
                console.log(`   📡 Dragnet Deployed: Tracking trades on ${event.symbol}...`);
                console.log('------------------------------------------------');
            }

            // 2. Trade Alert
            if (event.txType === 'buy' || event.txType === 'sell') {
                const solAmount = event.solAmount;
                const isBuy = event.txType === 'buy';

                // Determine if this is a Whale Event (for Visuals/Positions)
                const isWhale = solAmount >= WHALE_THRESHOLD_SOL;

                // Only log WHALE size trades VISUALLY (BUYS ONLY for cleaner feed)
                if (isWhale && isBuy) {
                    const type = '🟢 BUY';
                    console.log(`🐋 [WHALE ALERT] ${type} ${solAmount.toFixed(2)} SOL on ${event.mint}`);
                    console.log(`   Wallet: ${event.traderPublicKey}`);

                    // Log to Database (Visual Feed - BUYS ONLY)
                    await logWhaleSighting(
                        event.mint,
                        event.symbol || 'UNKNOWN',
                        solAmount,
                        event.traderPublicKey,
                        isBuy
                    );
                }

                // TRACKER: Process ALL trades for Smart Money Grading & Impact Analytics
                // (Follower trades contribute to the "Impact" score of open whale positions)
                await processTrade(
                    event.mint,
                    solAmount,
                    event.traderPublicKey,
                    isBuy,
                    new Date().toISOString(),
                    isWhale
                );
            }

        } catch (e) {
            // ignore parse errors
        }
    });

    ws.on('close', () => {
        console.log('Radar Disconnected. Reconnecting in 5s...');
        setTimeout(startRadar, 5000);
    });

    ws.on('error', (err) => {
        console.error('Radar Error:', err.message);
    });
};

// Run standalone if called directly
if (require.main === module) {
    startRadar();
}
