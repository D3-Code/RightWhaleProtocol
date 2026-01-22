import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

let db: Database | null = null;

export const initDB = async () => {
    try {
        db = await open({
            filename: path.join(__dirname, '../database.sqlite'),
            driver: sqlite3.Database
        });

        await db.exec(`
            CREATE TABLE IF NOT EXISTS activity_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                type TEXT NOT NULL,
                amount REAL,
                txHash TEXT,
                timestamp TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS virtual_pots (
                name TEXT PRIMARY KEY,
                balance REAL DEFAULT 0
            );

            INSERT OR IGNORE INTO virtual_pots (name, balance) VALUES ('burn_pot', 0);
            INSERT OR IGNORE INTO virtual_pots (name, balance) VALUES ('lp_pot', 0);

            CREATE TABLE IF NOT EXISTS whale_sightings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                mint TEXT NOT NULL,
                symbol TEXT,
                image_uri TEXT,
                amount SOL,
                wallet TEXT NOT NULL,
                isBuy BOOLEAN,
                timestamp TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS tracked_wallets (
                address TEXT PRIMARY KEY,
                win_rate REAL DEFAULT 0,
                reputation_score REAL DEFAULT 0,
                total_trades INTEGER DEFAULT 0,
                total_profit_sol REAL DEFAULT 0,
                avg_hold_time_seconds REAL DEFAULT 0,
                avg_impact_volume REAL DEFAULT 0,
                avg_impact_buyers REAL DEFAULT 0,
                wallet_name TEXT,
                twitter_handle TEXT,
                profile_image_url TEXT,
                last_identity_check TEXT
            );

            CREATE TABLE IF NOT EXISTS positions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                wallet TEXT NOT NULL,
                mint TEXT NOT NULL,
                buy_amount_sol REAL,
                buy_timestamp TEXT,
                status TEXT DEFAULT 'OPEN', -- OPEN, CLOSED
                sell_amount_sol REAL DEFAULT 0,
                sell_timestamp TEXT,
                pnl_sol REAL DEFAULT 0,
                impact_volume REAL DEFAULT 0,
                impact_buyers INTEGER DEFAULT 0,
                monitoring_expires_at TEXT
            );
        `);

        console.log('✅ SQLite Database initialized');
    } catch (error) {
        console.error('❌ Failed to init DB:', error);
    }
};

export const addLog = async (type: string, amount: number, txHash?: string) => {
    if (!db) return;
    try {
        await db.run(
            'INSERT INTO activity_logs (type, amount, txHash, timestamp) VALUES (?, ?, ?, ?)',
            type, amount, txHash || '', new Date().toISOString()
        );
        console.log(`📝 Log added: ${type} - ${amount} SOL`);
    } catch (error) {
        console.error('Failed to add log:', error);
    }
};

export const logWhaleSighting = async (mint: string, symbol: string, imageUri: string, amount: number, wallet: string, isBuy: boolean) => {
    if (!db) return;
    try {
        await db.run(
            'INSERT INTO whale_sightings (mint, symbol, image_uri, amount, wallet, isBuy, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)',
            mint, symbol, imageUri, amount, wallet, isBuy, new Date().toISOString()
        );
        console.log(`🐋 DB Logged: Whale on ${symbol}`);
    } catch (error) {
        console.error('Failed to log whale sighting:', error);
    }
};

export const getLogs = async (limit = 50, type?: string) => {
    if (!db) return [];
    if (type) {
        return await db.all('SELECT * FROM activity_logs WHERE type = ? ORDER BY id DESC LIMIT ?', type, limit);
    }
    return await db.all('SELECT * FROM activity_logs ORDER BY id DESC LIMIT ?', limit);
};

export const getWhaleSightings = async (limit = 20, verifiedOnly = false) => {
    if (!db) return [];
    try {
        let query = `
            SELECT 
                ws.*,
                tw.win_rate,
                tw.reputation_score,
                tw.total_profit_sol,
                tw.total_trades,
                tw.avg_impact_volume,
                tw.avg_impact_buyers,
                tw.wallet_name,
                tw.twitter_handle,
                (SELECT COUNT(DISTINCT wallet) FROM whale_sightings WHERE mint = ws.mint AND isBuy = 1) as whale_consensus
            FROM whale_sightings ws
            LEFT JOIN tracked_wallets tw ON ws.wallet = tw.address
        `;

        // Add quality filter if requested
        if (verifiedOnly) {
            query += `
                WHERE tw.reputation_score >= 60 
                AND tw.win_rate >= 55 
                AND tw.total_trades >= 3
            `;
        }

        query += ` ORDER BY ws.id DESC LIMIT ?`;

        return await db.all(query, limit);
    } catch (error) {
        console.error('Failed to fetch whale sightings:', error);
        return [];
    }
};

export const getTopWallets = async (limit = 50) => {
    if (!db) return [];
    try {
        return await db.all(`
            SELECT * FROM tracked_wallets 
            WHERE reputation_score > 0 
            ORDER BY reputation_score DESC, win_rate DESC 
            LIMIT ?
        `, limit);
    } catch (error) {
        console.error('Failed to fetch top wallets:', error);
        return [];
    }
};

export const getOpenPositions = async (limit = 20) => {
    if (!db) return [];
    try {
        return await db.all(`
            SELECT 
                p.*,
                ws.symbol,
                tw.wallet_name,
                tw.twitter_handle,
                tw.reputation_score,
                tw.win_rate,
                (julianday('now') - julianday(p.buy_timestamp)) * 24 * 60 AS hold_minutes,
                (SELECT COUNT(DISTINCT wallet) FROM whale_sightings WHERE mint = p.mint AND isBuy = 1) as whale_consensus
            FROM positions p
            LEFT JOIN tracked_wallets tw ON p.wallet = tw.address
            LEFT JOIN (
                SELECT DISTINCT mint, symbol 
                FROM whale_sightings 
                WHERE symbol IS NOT NULL AND symbol != 'UNKNOWN'
            ) ws ON p.mint = ws.mint
            WHERE p.status = 'OPEN'
            ORDER BY p.buy_timestamp DESC
            LIMIT ?
        `, limit);
    } catch (error) {
        console.error('Failed to fetch open positions:', error);
        return [];
    }
};

export const getTopWhaleTokens = async (limit = 10, timeframeHours = 24) => {
    if (!db) return [];
    try {
        return await db.all(`
            SELECT 
                ws.mint,
                ws.symbol,
                COUNT(DISTINCT ws.wallet) as whale_count,
                SUM(ws.amount) as total_volume_sol,
                MAX(ws.timestamp) as last_buy
            FROM whale_sightings ws
            WHERE ws.isBuy = 1
            AND datetime(ws.timestamp) >= datetime('now', '-' || ? || ' hours')
            AND ws.symbol IS NOT NULL 
            AND ws.symbol != 'UNKNOWN'
            GROUP BY ws.mint, ws.symbol
            ORDER BY whale_count DESC, total_volume_sol DESC
            LIMIT ?
        `, timeframeHours, limit);
    } catch (error) {
        console.error('Failed to fetch top whale tokens:', error);
        return [];
    }
};

export const adjustPotBalance = async (name: string, delta: number) => {
    if (!db) return;
    try {
        await db.run(
            'UPDATE virtual_pots SET balance = balance + ? WHERE name = ?',
            delta, name
        );
        console.log(`💰 Virtual Pot ${name} adjusted by ${delta} SOL`);
    } catch (error) {
        console.error(`Failed to adjust pot ${name}:`, error);
    }
};

export const updateWalletIdentity = async (address: string, walletName?: string, twitterHandle?: string, profileImageUrl?: string) => {
    if (!db) return;
    try {
        await db.run(`
            UPDATE tracked_wallets 
            SET wallet_name = ?, twitter_handle = ?, profile_image_url = ?, last_identity_check = ?
            WHERE address = ?
        `, walletName, twitterHandle, profileImageUrl, new Date().toISOString(), address);
    } catch (error) {
        console.error('Failed to update wallet identity:', error);
    }
};

export const getVirtualPots = async () => {
    if (!db) return [];
    try {
        return await db.all('SELECT * FROM virtual_pots');
    } catch (error) {
        console.error('Failed to fetch virtual pots:', error);
        return [];
    }
};

