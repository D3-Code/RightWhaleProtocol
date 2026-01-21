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

/**
 * processTrade
 * Core logic to update "Smart Money" stats based on a new trade.
 */
export const processTrade = async (
    mint: string,
    amountSol: number,
    wallet: string,
    isBuy: boolean,
    timestamp: string
) => {
    const database = await getDB();

    if (isBuy) {
        // OPEN POSITION
        // We log a generic 'buy' position. 
        // Note: Realworld logic needs price-per-token to be exact, but for MVP we track SOL in vs SOL out per token/wallet pair.
        await database.run(
            `INSERT INTO positions (wallet, mint, buy_amount_sol, buy_timestamp, status) 
             VALUES (?, ?, ?, ?, 'OPEN')`,
            wallet, mint, amountSol, timestamp
        );
        console.log(`[Tracker] Opened position for ${wallet.slice(0, 4)} on ${mint}`);
    } else {
        // CLOSE POSITION (FIFO)
        // Find the oldest OPEN position for this wallet + mint
        const position = await database.get(
            `SELECT * FROM positions WHERE wallet = ? AND mint = ? AND status = 'OPEN' ORDER BY id ASC LIMIT 1`,
            wallet, mint
        );

        if (position) {
            // Calculate PnL
            // We assume they sold everything from that buy for simplicity in MVP 
            // OR if sell amount > buy amount, it's a win. 

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

    await database.run(
        `UPDATE tracked_wallets 
         SET win_rate = ?, total_profit_sol = ?, total_trades = ?, wins = ?, losses = ?, reputation_score = ?, last_active = ?
         WHERE address = ?`,
        winRate, newTotalProfit, newTotalTrades, newWins, newLosses, Math.floor(score), new Date().toISOString(), wallet
    );

    console.log(`[Tracker] Updated Stats for ${wallet.slice(0, 4)}: Score ${Math.floor(score)} | WR ${winRate.toFixed(1)}%`);
};
