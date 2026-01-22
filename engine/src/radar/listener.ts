import WebSocket from 'ws';
import { broadcast } from '../server_ws';
import { calculateSignalScore } from './scoring';
import { initDB, logWhaleSighting, registerTokenCreator, getWalletStats, getConsensusStats } from '../db';
import { processTrade, classifyTradeSong } from './tracker';
import { fetchTokenMetadata } from './metadata';
import { registerToken, getTokenSymbol, getTokenName } from './registry';
import { isQualityWhale } from './filters';

/**
 * RightWhale Radar: Real-Time Listener
 * 
 * Listens to PumpPortal trade stream.
 * Filters for > 1 SOL buys.
 */

const WS_URL = 'wss://pumpportal.fun/api/data';
const WHALE_THRESHOLD_SOL = 1.0;

export const startRadar = async () => {
    // Ensure DB is ready
    await initDB();

    const ws = new WebSocket(WS_URL);

    ws.on('open', () => {
        console.log('📡 WRAS Online: Monitoring Pump.fun streams...');

        // 1. Subscribe to New Token Creation (Alpha Source)
        ws.send(JSON.stringify({
            method: "subscribeNewToken"
        }));

        // 2. Subscribe to GLOBAL TRADES (The Bonding Curve Program)
        ws.send(JSON.stringify({
            method: "subscribeAccountTrade",
            keys: ["6EF8rrecthR5Dzo7QZCr6dgQC2CHJ9ay98uREy6Bmp"]
        }));

        console.log('   📡 Global Dragnet Deployed: Tracking ALL non-migrated tokens...');
    });

    ws.on('message', async (data: WebSocket.Data) => {
        try {
            const event = JSON.parse(data.toString());

            // 1. New Token Alert
            if (event.txType === 'create') {
                console.log(`🆕 [NEW LAUNCH] ${event.name} ($${event.symbol})`);
                console.log(`   Mint: ${event.mint}`);
                console.log(`   Dev: ${event.traderPublicKey}`);

                registerToken(event.mint, event.name, event.symbol);
                await registerTokenCreator(event.mint, event.traderPublicKey);

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
                const isWhale = solAmount >= WHALE_THRESHOLD_SOL;

                const walletStats = await getWalletStats(event.traderPublicKey);
                const reputation = walletStats?.reputation_score || 50;
                const isVerified = walletStats ? isQualityWhale(walletStats) : false;

                if (reputation < 40) {
                    await processTrade(event.mint, solAmount, event.traderPublicKey, isBuy, new Date().toISOString(), false);
                    return;
                }

                if (!isVerified && solAmount < 2.0 && isWhale) {
                    await processTrade(event.mint, solAmount, event.traderPublicKey, isBuy, new Date().toISOString(), false);
                    return;
                }

                let tokenName = getTokenName(event.mint);
                let tokenSymbol = getTokenSymbol(event.mint);
                let imageUri = '';

                if (tokenSymbol === 'UNKNOWN') {
                    const metadata = await fetchTokenMetadata(event.mint);
                    if (metadata) {
                        tokenName = metadata.name;
                        tokenSymbol = metadata.symbol;
                        imageUri = metadata.image_uri || '';
                        registerToken(event.mint, tokenName, tokenSymbol);
                    }
                }

                // CLASSIFY TRADE SONG
                const songTag = await classifyTradeSong(event.traderPublicKey, event.mint, solAmount, isBuy);

                if (isWhale) {
                    const type = isBuy ? '🟢 BUY' : '🔴 SELL';
                    const songLabel = songTag ? ` [${songTag}]` : '';
                    const marketCap = event.marketCapSol || 0;

                    console.log(`🐋 [WHALE ALERT]${songLabel} ${type} ${solAmount.toFixed(2)} SOL on ${tokenName} ($${tokenSymbol}) | MC: ${marketCap.toFixed(0)} SOL`);

                    if (!imageUri) {
                        const metadata = await fetchTokenMetadata(event.mint);
                        imageUri = metadata?.image_uri || '';
                    }

                    const result = await logWhaleSighting(
                        event.mint,
                        tokenSymbol,
                        imageUri,
                        solAmount,
                        event.tokenAmount || event.vTokens || 0,
                        event.traderPublicKey,
                        isBuy,
                        songTag,
                        marketCap
                    );

                    if (result && result.id) {
                        const { whale_consensus, pod_reputation_sum } = await getConsensusStats(event.mint);
                        const signal = calculateSignalScore(reputation, solAmount, whale_consensus);

                        broadcast('whale-sighting', {
                            id: result.id,
                            mint: event.mint,
                            symbol: tokenSymbol,
                            image_uri: imageUri,
                            amount: solAmount,
                            token_amount: event.tokenAmount || event.vTokens || 0,
                            wallet: event.traderPublicKey,
                            isBuy,
                            timestamp: new Date().toISOString(),
                            is_dev: result.isDev,
                            signal,
                            song_tag: songTag,
                            whale_consensus,
                            pod_reputation_sum,
                            reputation_score: reputation,
                            wallet_name: walletStats?.wallet_name,
                            twitter_handle: walletStats?.twitter_handle,
                            avg_impact_volume: walletStats?.avg_impact_volume,
                            avg_impact_buyers: walletStats?.avg_impact_buyers
                        });
                    }
                }

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

if (require.main === module) {
    startRadar();
}
