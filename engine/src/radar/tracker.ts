import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

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

    // 2. WHALE POSITION MANAGEMENT (Only if it's a identified Whale)
    // Only execute position logic if it's a significant trade (isWhale) OR if we are closing a position
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

            await database.run(
                `UPDATE positions SET status = 'CLOSED', sell_amount_sol = ?, sell_timestamp = ?, pnl_sol = ? WHERE id = ?`,
                amountSol, timestamp, pnl, position.id
            );

            console.log(`[Tracker] Closed position. PnL: ${pnl.toFixed(2)} SOL`);

            // UPDATE WALLET SCORE
            await updateWalletStats(wallet, pnl);
        } else {
            // Sold without a tracked buy? Maybe they bought before we started listening.
            // Ignore for PnL tracking to avoid skewed data.
            console.log(`[Tracker] Ignored sell (no open position) for ${wallet.slice(0, 4)}`);
        }
    }
};

const updateWalletStats = async (wallet: string, pnl: number) => {
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

    // Reputation Score Algorithm (Simple v1)
    // Base 50
    // +10 for every 10 SOL profit (capped at 50)
    // + WinRate * 0.5
    let score = 50 + Math.min(newTotalProfit * 1, 30) + (winRate * 0.2);
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
         SET win_rate = ?, total_profit_sol = ?, total_trades = ?, wins = ?, losses = ?, reputation_score = ?, avg_impact_volume = ?, avg_impact_buyers = ?, last_active = ?
         WHERE address = ?`,
        winRate, newTotalProfit, newTotalTrades, newWins, newLosses, Math.floor(score), avgImpactVol, avgImpactBuy, new Date().toISOString(), wallet
    );

    console.log(`[Tracker] Updated Stats for ${wallet.slice(0, 4)}: Score ${Math.floor(score)} | Impact ${avgImpactBuy.toFixed(1)} followers`);
};
