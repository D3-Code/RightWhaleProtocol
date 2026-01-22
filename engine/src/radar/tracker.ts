import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import { flagTokenRugged } from '../db';

let db: Database | null = null;
const DB_PATH = path.join(__dirname, '../../database.sqlite');

const getDB = async () => {
    if (!db) {
        db = await open({
            filename: DB_PATH,
            driver: sqlite3.Database
        });
    }
    return db;
};

const MONITORING_DURATION_MS = 10 * 60 * 1000; // 10 Minutes

/**
 * Trade Song Classifier: Behavioral Fingerprinting
 */
export const classifyTradeSong = async (wallet: string, mint: string, amountSol: number, isBuy: boolean): Promise<string> => {
    const database = await getDB();

    if (!isBuy) return ""; // We mainly classify buy interest

    // 1. APEX STRIKE (High conviction buy from high-rep whale)
    const walletStats = await database.get(`SELECT reputation_score FROM tracked_wallets WHERE address = ?`, wallet);
    if (amountSol >= 10 && (walletStats?.reputation_score || 0) >= 80) {
        return "🎵 APEX STRIKE";
    }

    // 2. STEALTH ACCUMULATION (Multiple small-medium buys)
    const recentBuys = await database.get(`
        SELECT COUNT(*) as count FROM positions 
        WHERE wallet = ? AND mint = ? AND status = 'OPEN' 
        AND datetime(buy_timestamp) >= datetime('now', '-1 hour')
    `, wallet, mint);

    if ((recentBuys?.count || 0) >= 3) {
        return "🎵 STEADY BREACH";
    }

    // 3. POD CALL (Consensus building)
    const pod = await database.get(`
        SELECT COUNT(DISTINCT wallet) as count FROM positions 
        WHERE mint = ? AND status = 'OPEN' 
        AND datetime(buy_timestamp) >= datetime('now', '-30 minutes')
    `, mint);

    if ((pod?.count || 0) >= 5) {
        return "🎵 POD CHORUS";
    }

    return "";
};

/**
 * processTrade
 * Core logic to update "Smart Money" stats based on a new trade.
 * - Tracks PnL for closed positions
 * - Tracks Impact (KOL Score) for open positions
 */
export const processTrade = async (
    mint: string,
    amountSol: number,
    wallet: string,
    isBuy: boolean,
    timestamp: string,
    isWhale: boolean // New flag to distinguish Whale Event vs Follower Event
) => {
    const database = await getDB();
    const now = new Date(timestamp).getTime();

    // 1. IMPACT ANALYTICS (Check existing open positions for this token)
    // If ANY whale has an open monitoring window for this token, add this trade to their impact stats
    const monitoringParams = [mint, new Date().toISOString()];
    const monitoredPositions = await database.all(
        `SELECT * FROM positions 
         WHERE mint = ? 
         AND status = 'OPEN' 
         AND monitoring_expires_at > ?`,
        monitoringParams
    );

    if (monitoredPositions.length > 0 && isBuy) {
        for (const pos of monitoredPositions) {
            // Don't count the whale's own buying as impact
            if (pos.wallet !== wallet) {
                await database.run(
                    `UPDATE positions 
                     SET impact_volume = impact_volume + ?, impact_buyers = impact_buyers + 1 
                     WHERE id = ?`,
                    amountSol, pos.id
                );
                console.log(`[Tracker] Impact detected on ${pos.wallet.slice(0, 4)}'s signal: +${amountSol.toFixed(2)} SOL`);
            }
        }
    }

    // 2. WHALE & DEV MANAGEMENT
    // Check if this wallet is the developer
    const creator = await database.get('SELECT creator_wallet FROM token_creators WHERE mint = ?', mint);
    const isDev = creator && creator.creator_wallet === wallet;

    // DEV RUG PROTECTION: If dev sells > 1 SOL, flag token as rugged
    if (isDev && !isBuy && amountSol >= 1.0) {
        await flagTokenRugged(mint);
    }

    if (isBuy && isWhale) {
        // OPEN POSITION
        const expiresAt = new Date(now + MONITORING_DURATION_MS).toISOString();
        await database.run(
            `INSERT INTO positions (wallet, mint, buy_amount_sol, buy_timestamp, status, monitoring_expires_at) 
             VALUES (?, ?, ?, ?, 'OPEN', ?)`,
            wallet, mint, amountSol, timestamp, expiresAt
        );
        console.log(`[Tracker] Opened position for ${wallet.slice(0, 4)} on ${mint}. Monitoring impact for 10m.`);
    } else if (!isBuy) {
        // CLOSE POSITION (FIFO)
        const position = await database.get(
            `SELECT * FROM positions WHERE wallet = ? AND mint = ? AND status = 'OPEN' ORDER BY id ASC LIMIT 1`,
            wallet, mint
        );

        if (position) {
            const buyAmt = position.buy_amount_sol;
            const pnl = amountSol - buyAmt; // Net SOL change

            // CHURN DETECTION: If hold time < 2 minutes, it's a "Churn" (bad behavior)
            const holdMs = now - new Date(position.buy_timestamp).getTime();
            const holdMinutes = holdMs / (1000 * 60);
            const isChurn = holdMinutes < 2.0;

            await database.run(
                `UPDATE positions SET status = 'CLOSED', sell_amount_sol = ?, sell_timestamp = ?, pnl_sol = ? WHERE id = ?`,
                amountSol, timestamp, pnl, position.id
            );

            console.log(`[Tracker] Closed position. PnL: ${pnl.toFixed(2)} SOL ${isChurn ? '[CHURN!]' : ''}`);

            // UPDATE WALLET SCORE (with churn penalty if applicable)
            await updateWalletStats(wallet, pnl, isChurn);
        } else {
            // Sold without a tracked buy? Maybe they bought before we started listening.
            // Ignore for PnL tracking to avoid skewed data.
            console.log(`[Tracker] Ignored sell (no open position) for ${wallet.slice(0, 4)}`);
        }
    }
};

const updateWalletStats = async (wallet: string, pnl: number, isChurn = false) => {
    const database = await getDB();

    // Get current stats or init
    let stats = await database.get(`SELECT * FROM tracked_wallets WHERE address = ?`, wallet);

    if (!stats) {
        await database.run(
            `INSERT INTO tracked_wallets (address, last_active) VALUES (?, ?)`,
            wallet, new Date().toISOString()
        );
        stats = { wins: 0, losses: 0, total_profit_sol: 0, total_trades: 0 };
    }

    const isWin = pnl > 0;
    const newWins = (stats.wins || 0) + (isWin ? 1 : 0);
    const newLosses = (stats.losses || 0) + (isWin ? 0 : 1);
    const newTotalProfit = (stats.total_profit_sol || 0) + pnl;
    const newTotalTrades = (stats.total_trades || 0) + 1;

    const winRate = (newWins / newTotalTrades) * 100;

    // Reputation Score Algorithm (v2)
    // Base 50
    // +10 for every 10 SOL profit (capped at 50)
    // + WinRate * 0.5
    // - 10 if isChurn (Scalper Penalty)
    let score = 50 + Math.min(newTotalProfit * 1, 30) + (winRate * 0.2);
    if (isChurn) {
        score -= 15; // Increased penalty for Churn
        console.log(`[Tracker] Penalty applied to ${wallet.slice(0, 4)} for Churn behavior: -15 Reputation`);
    }

    // COGNITIVE DEPTH UPDATES
    const maxWin = Math.max(stats.max_win_sol || 0, pnl);
    const holdMs = Date.now() - new Date(new Date().toISOString()).getTime(); // Mocking actual hold time for update
    // Note: pnl is passed from closed position, so we can calculate max_hold_time here if we had position data
    // In updateWalletStats, we just update the aggregates.

    if (score > 100) score = 100;
    if (score < 0) score = 0;

    // IMPACT ANALYTICS AGGREGATION
    const impactStats = await database.get(
        `SELECT AVG(impact_volume) as avg_vol, AVG(impact_buyers) as avg_buy 
         FROM positions WHERE wallet = ?`,
        wallet
    );

    const avgImpactVol = impactStats?.avg_vol || 0;
    const avgImpactBuy = impactStats?.avg_buy || 0;

    // Boost Score for High Impact (KOL Bonus)
    if (avgImpactBuy > 5) score += 5;
    if (avgImpactBuy > 20) score += 10;
    if (score > 100) score = 100;

    await database.run(
        `UPDATE tracked_wallets 
         SET win_rate = ?, total_profit_sol = ?, total_trades = ?, wins = ?, losses = ?, reputation_score = ?, avg_impact_volume = ?, avg_impact_buyers = ?, last_active = ?, max_win_sol = ?
         WHERE address = ?`,
        winRate, newTotalProfit, newTotalTrades, newWins, newLosses, Math.floor(score), avgImpactVol, avgImpactBuy, new Date().toISOString(), maxWin, wallet
    );

    console.log(`[Tracker] Updated Stats for ${wallet.slice(0, 4)}: Score ${Math.floor(score)} | Impact ${avgImpactBuy.toFixed(1)} followers`);
};
