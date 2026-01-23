import express from 'express';
import { createServer } from 'http';
import { initWebSocketServer } from './server_ws';
import cors from 'cors';
// Global Stats Store (In-memory for prototype, move to DB for prod)
export const globalStats = {
    totalBurned: 0, // Millions of tokens burned
    totalLP: 0,          // SOL Added to LP
    totalRevShare: 0,    // SOL Distributed
    distributions: 0
};
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { loadWallet } from './wallet';
import { initDB, getLogs, getVirtualPots, getWhaleSightings, getTopWallets, getOpenPositions, getTopWhaleTokens, getRadarStats, getWalletTradeHistory, getWalletDetailedStats, addToWatchlist, removeFromWatchlist, getWatchlist, isInWatchlist } from './db';
import dotenv from 'dotenv';
import { setupBot } from './bot';
import { startMonitor } from './monitor';
import { calculateSignalScore } from './radar/scoring';
import { startMarketMonitor } from './market';
import { lastAiDecision } from './ai_trader';
import { fetchTokenMetadata } from './radar/metadata';
import { getTokenSymbol, getTokenName } from './radar/registry';
import { backupDatabase } from './backup';
import { convertToCSV } from './export';

dotenv.config();

const app = express();
const server = createServer(app);
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Init DB
initDB();

// API Routes
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/logs', async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
        const type = req.query.type as string | undefined;
        const logs = await getLogs(limit, type); // Pass type filter
        res.json(logs);
    } catch (err) {
        res.status(500).send('Error fetching logs');
    }
});

app.get('/history', async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
        const logs = await getLogs(limit);
        res.json(logs);
    } catch (err) {
        res.status(500).send('Error fetching history');
    }
});

app.get('/ai-status', (req, res) => {
    res.json(lastAiDecision || { action: 'WAIT', reason: 'System Initializing...', confidence: 0, timestamp: new Date().toISOString() });
});

app.get('/stats', (req, res) => {
    res.json(globalStats);
});



app.get('/reserves', async (req, res) => {
    try {
        const keypair = loadWallet();
        if (!keypair) return res.status(500).send('Wallet not loaded');

        const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
        const connection = new Connection(rpcUrl, 'confirmed');
        const balance = await connection.getBalance(keypair.publicKey);
        const solBalance = balance / LAMPORTS_PER_SOL;

        const pots = await getVirtualPots();
        const burnPot = pots.find(p => p.name === 'burn_pot')?.balance || 0;
        const lpPot = pots.find(p => p.name === 'lp_pot')?.balance || 0;
        const operational = solBalance - (burnPot + lpPot);

        res.json({
            total: solBalance,
            burnPot,
            lpPot,
            operational,
            address: keypair.publicKey.toBase58()
        });
    } catch (err) {
        res.status(500).send('Error fetching reserves');
    }
});

app.get('/radar', async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
        const verifiedOnly = req.query.verifiedOnly === 'true';
        const sightings = await getWhaleSightings(limit, verifiedOnly);
        const scoredSightings = sightings.map((s: any) => ({
            ...s,
            signal: calculateSignalScore(s.reputation_score || 0, s.amount || 0, s.whale_consensus || 1)
        }));
        res.json(scoredSightings);
    } catch (err) {
        res.status(500).send('Error fetching radar data');
    }
});

app.get('/radar/leaderboard', async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
        const wallets = await getTopWallets(limit);
        res.json(wallets);
    } catch (err) {
        res.status(500).send('Error fetching leaderboard');
    }
});

app.get('/radar/positions', async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
        const positions = await getOpenPositions(limit);

        // Enrich with metadata if missing
        const enrichedPositions = await Promise.all(positions.map(async (p: any) => {
            let symbol = p.symbol;

            // If symbol is missing or UNKNOWN, try to resolve it
            if (!symbol || symbol === 'UNKNOWN') {
                // 1. Check Registry
                symbol = getTokenSymbol(p.mint);
                console.log(`[Enrich] Registry check for ${p.mint}: ${symbol}`);

                // 2. Fetch from Pump.fun if still unknown
                if (symbol === 'UNKNOWN') {
                    console.log(`[Enrich] Fetching metadata for ${p.mint}...`);
                    try {
                        const metadata = await fetchTokenMetadata(p.mint);
                        if (metadata) {
                            symbol = metadata.symbol;
                            console.log(`[Enrich] Resolved: ${symbol}`);
                        } else {
                            console.log(`[Enrich] Failed to resolve metadata for ${p.mint}`);
                        }
                    } catch (e) {
                        console.error(`[Enrich] Error fetching metadata:`, e);
                    }
                }
            }

            return {
                ...p,
                symbol,
                signal: calculateSignalScore(p.reputation_score || 0, p.buy_amount_sol || 0, p.whale_consensus || 1)
            };
        }));

        res.json(enrichedPositions);
    } catch (err) {
        res.status(500).send('Error fetching positions');
    }
});

app.get('/radar/top-tokens', async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
        const hours = req.query.hours ? parseInt(req.query.hours as string) : 24;
        const verifiedOnly = req.query.verifiedOnly !== 'false'; // Default to true for safety

        const tokens = await getTopWhaleTokens(limit, hours, verifiedOnly);
        res.json(tokens);
    } catch (err) {
        res.status(500).send('Error fetching top tokens');
    }
});

app.get('/radar/stats', async (req, res) => {
    try {
        const hours = req.query.hours ? parseInt(req.query.hours as string) : 24;
        const stats = await getRadarStats(hours);
        res.json(stats);
    } catch (err) {
        res.status(500).send('Error fetching radar stats');
    }
});

app.get('/radar/wallet/:address', async (req, res) => {
    try {
        const { address } = req.params;
        const [stats, tradeHistory] = await Promise.all([
            getWalletDetailedStats(address),
            getWalletTradeHistory(address, 20)
        ]);

        if (!stats) {
            return res.status(404).json({ error: 'Wallet not found' });
        }

        res.json({
            ...stats,
            trade_history: tradeHistory
        });
    } catch (err) {
        console.error('Error fetching wallet details:', err);
        res.status(500).send('Error fetching wallet details');
    }
});

// Watchlist endpoints
app.post('/radar/watchlist', async (req, res) => {
    try {
        const { address, notes } = req.body;
        if (!address) {
            return res.status(400).json({ error: 'Wallet address is required' });
        }
        const success = await addToWatchlist(address, notes);
        res.json({ success });
    } catch (err) {
        console.error('Error adding to watchlist:', err);
        res.status(500).send('Error adding to watchlist');
    }
});

app.delete('/radar/watchlist/:address', async (req, res) => {
    try {
        const { address } = req.params;
        const success = await removeFromWatchlist(address);
        res.json({ success });
    } catch (err) {
        console.error('Error removing from watchlist:', err);
        res.status(500).send('Error removing from watchlist');
    }
});

app.get('/radar/watchlist', async (req, res) => {
    try {
        const watchlist = await getWatchlist();
        res.json(watchlist);
    } catch (err) {
        console.error('Error fetching watchlist:', err);
        res.status(500).send('Error fetching watchlist');
    }
});

app.get('/radar/watchlist/check/:address', async (req, res) => {
    try {
        const { address } = req.params;
        const inWatchlist = await isInWatchlist(address);
        res.json({ inWatchlist });
    } catch (err) {
        console.error('Error checking watchlist:', err);
        res.status(500).send('Error checking watchlist');
    }
});

// Export endpoint
app.get('/radar/wallet/:address/export', async (req, res) => {
    try {
        const { address } = req.params;
        const format = req.query.format || 'csv';
        const trades = await getWalletTradeHistory(address, 1000);

        if (format === 'csv') {
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="wallet_${address.slice(0, 8)}_trades.csv"`);
            res.send(convertToCSV(trades));
        } else {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename="wallet_${address.slice(0, 8)}_trades.json"`);
            res.json(trades);
        }
    } catch (err) {
        console.error('Error exporting wallet data:', err);
        res.status(500).send('Error exporting wallet data');
    }
});

// Start Server
// Start Server
initWebSocketServer(server);
server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

// Start Services
setupBot();
startMonitor();
startMarketMonitor();

// Initialize backup system
backupDatabase(); // Initial backup on startup
setInterval(backupDatabase, 24 * 60 * 60 * 1000); // Daily backups
console.log('💾 Backup system initialized (daily at startup + 24h intervals)');

// Start RightWhale Radar (Whale Tracker)
import { startRadar } from './radar/listener';
startRadar();

// Initial AI Cycle to populate dashboard
import { runAiCycle } from './ai_trader';

// Run immediately on start
runAiCycle(true);

// Loop every 15 seconds to update "Neural Feed" (ReadOnly = true)
setInterval(() => {
    runAiCycle(true);
}, 15000);

// Force Reload Check
