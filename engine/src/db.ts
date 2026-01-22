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
        `);

        // Whale Sightings (Historical Feed)
        await db.exec(`
            CREATE TABLE IF NOT EXISTS whale_sightings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                mint TEXT NOT NULL,
                symbol TEXT,
                amount REAL,
                token_amount REAL,
                wallet TEXT NOT NULL,
                isBuy BOOLEAN,
                timestamp TEXT NOT NULL,
                image_uri TEXT,
                is_dev BOOLEAN DEFAULT 0
            )
        `);

        // Token Creators Cache
        await db.exec(`
            CREATE TABLE IF NOT EXISTS token_creators (
                mint TEXT PRIMARY KEY,
                creator_wallet TEXT NOT NULL,
                is_rugged BOOLEAN DEFAULT 0,
                created_at TEXT NOT NULL
            )
        `);

        await db.exec(`
            CREATE TABLE IF NOT EXISTS tracked_wallets (
                address TEXT PRIMARY KEY,
                win_rate REAL DEFAULT 0,
                reputation_score REAL DEFAULT 0,
                total_trades INTEGER DEFAULT 0,
                total_profit_sol REAL DEFAULT 0,
                avg_hold_time_seconds REAL DEFAULT 0,
                avg_impact_volume REAL DEFAULT 0,
                avg_impact_buyers REAL DEFAULT 0,
                max_win_sol REAL DEFAULT 0,
                max_hold_time INTEGER DEFAULT 0,
                alpha_score INTEGER DEFAULT 0,
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

export const logWhaleSighting = async (mint: string, symbol: string, imageUri: string, amount: number, tokenAmount: number, wallet: string, isBuy: boolean, songTag?: string, marketCap?: number) => {
    if (!db) return;
    try {
        // Check if this wallet is the developer
        const creator = await db.get('SELECT creator_wallet FROM token_creators WHERE mint = ?', mint);
        const isDev = creator && creator.creator_wallet === wallet;

        const result = await db.run(
            'INSERT INTO whale_sightings (mint, symbol, image_uri, amount, token_amount, wallet, isBuy, timestamp, is_dev, song_tag, market_cap) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            mint, symbol, imageUri, amount, tokenAmount, wallet, isBuy, new Date().toISOString(), isDev ? 1 : 0, songTag, marketCap || 0
        );
        console.log(`🐋 DB Logged: Whale on ${symbol} ${isDev ? '(DEV)' : ''}`);
        return { id: result.lastID, isDev };
    } catch (error) {
        console.error('Failed to log whale sighting:', error);
    }
};

export const registerTokenCreator = async (mint: string, creatorWallet: string) => {
    if (!db) return;
    try {
        await db.run(
            'INSERT OR IGNORE INTO token_creators (mint, creator_wallet, created_at) VALUES (?, ?, ?)',
            mint, creatorWallet, new Date().toISOString()
        );
    } catch (e) {
        console.error('Failed to register creator');
    }
};

export const getConsensusStats = async (mint: string) => {
    if (!db) return { whale_consensus: 1, pod_reputation_sum: 50 };
    try {
        const result = await db.get(`
            SELECT 
                (SELECT COUNT(DISTINCT wallet) FROM whale_sightings WHERE mint = ? AND isBuy = 1) as whale_consensus,
                (SELECT SUM(reputation_score) FROM whale_sightings s JOIN tracked_wallets w ON s.wallet = w.address WHERE s.mint = ? AND s.isBuy = 1) as pod_reputation_sum
        `, mint, mint);
        return {
            whale_consensus: result?.whale_consensus || 1,
            pod_reputation_sum: result?.pod_reputation_sum || 50
        };
    } catch (e) {
        return { whale_consensus: 1, pod_reputation_sum: 50 };
    }
};

export const flagTokenRugged = async (mint: string) => {
    if (!db) return;
    try {
        await db.run('UPDATE token_creators SET is_rugged = 1 WHERE mint = ?', mint);
        console.log(`🚨 TOKEN FLAGGED AS RUGGED: ${mint}`);
    } catch (e) {
        console.error('Failed to flag rug');
    }
};

export const getLogs = async (limit = 50, type?: string) => {
    if (!db) return [];
    if (type) {
        return await db.all('SELECT * FROM activity_logs WHERE type = ? ORDER BY id DESC LIMIT ?', type, limit);
    }
    return await db.all('SELECT * FROM activity_logs ORDER BY id DESC LIMIT ?', limit);
};

export const getWhaleSightings = async (limit = 50, verifiedOnly = false, filter = 'launched') => {
    if (!db) return [];
    try {
        let marketCapFilter = '';

        if (filter === 'prebond') {
            marketCapFilter = 'AND ws.market_cap < 500';
        } else if (filter === 'bonded_low') {
            marketCapFilter = 'AND ws.market_cap >= 500 AND ws.market_cap < 800';
        }

        const query = `
            SELECT 
                ws.*,
                tw.wallet_name,
                tw.twitter_handle,
                tw.reputation_score,
                tw.total_trades,
                tw.avg_impact_volume,
                tw.avg_impact_buyers,
                ws.song_tag,
                COALESCE(tc.is_rugged, 0) as is_rugged,
                (SELECT COUNT(DISTINCT wallet) FROM whale_sightings WHERE mint = ws.mint AND isBuy = 1) as whale_consensus,
                (SELECT SUM(reputation_score) FROM whale_sightings s JOIN tracked_wallets w ON s.wallet = w.address WHERE s.mint = ws.mint AND s.isBuy = 1) as pod_reputation_sum
            FROM whale_sightings ws
            LEFT JOIN tracked_wallets tw ON ws.wallet = tw.address
            LEFT JOIN token_creators tc ON ws.mint = tc.mint
            WHERE (tc.is_rugged = 0 OR tc.is_rugged IS NULL) -- Hide rugged tokens by default in radar
            AND (tw.reputation_score >= 40 OR tw.reputation_score IS NULL) -- Filter out known bad actors (Default 50 for new)
            ${verifiedOnly ? 'AND tw.reputation_score >= 60' : ''}
            ${marketCapFilter}
            ORDER BY ws.id DESC
            LIMIT ?
        `;
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
            SELECT address, reputation_score, win_rate, total_profit_sol, avg_impact_buyers, wallet_name, twitter_handle, max_win_sol, max_hold_time, alpha_score 
            FROM tracked_wallets 
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
                SELECT DISTINCT mint, symbol, market_cap
                FROM whale_sightings 
                WHERE symbol IS NOT NULL AND symbol != 'UNKNOWN'
                ORDER BY timestamp DESC
            ) ws ON p.mint = ws.mint
            LEFT JOIN token_creators tc ON p.mint = tc.mint
            WHERE p.status = 'OPEN'
            AND (tc.is_rugged = 0 OR tc.is_rugged IS NULL)
            AND (ws.market_cap > 10 OR ws.market_cap IS NULL) -- Hide if MC < 10 SOL (Dead)
            ORDER BY p.buy_timestamp DESC
            LIMIT ?
        `, limit);
    } catch (error) {
        console.error('Failed to fetch open positions:', error);
        return [];
    }
};

export const getTopWhaleTokens = async (limit = 10, timeframeHours = 24, verifiedOnly = false) => {
    if (!db) return [];
    try {
        const query = `
            SELECT 
                ws.mint,
                ws.symbol,
                ws.image_uri,
                COUNT(DISTINCT CASE WHEN ws.isBuy = 1 THEN ws.wallet END) as whale_count,
                SUM(CASE WHEN ws.isBuy = 1 THEN ws.amount ELSE 0 END) as buy_volume,
                SUM(CASE WHEN ws.isBuy = 0 THEN ws.amount ELSE 0 END) as sell_volume,
                SUM(ws.amount) as total_volume_sol,
                SUM(CASE WHEN ws.isBuy = 1 THEN ws.token_amount ELSE 0 END) as total_tokens_acquired,
                SUM(COALESCE(tw.reputation_score, 50)) as elite_consensus_score,
                MAX(ws.timestamp) as last_active,
                MAX(ws.market_cap) as market_cap,
                (SELECT COUNT(DISTINCT wallet) FROM positions WHERE mint = ws.mint AND status = 'OPEN') as holders_count
            FROM whale_sightings ws
            LEFT JOIN tracked_wallets tw ON ws.wallet = tw.address
            LEFT JOIN token_creators tc ON ws.mint = tc.mint
            WHERE datetime(ws.timestamp) >= datetime('now', '-' || ? || ' hours')
            AND (tc.is_rugged = 0 OR tc.is_rugged IS NULL)
            AND ws.symbol IS NOT NULL 
            AND ws.symbol != 'UNKNOWN'
            ${verifiedOnly ? 'AND tw.reputation_score >= 60' : ''}
            GROUP BY ws.mint, ws.symbol
            HAVING whale_count > 0 
            AND buy_volume > sell_volume -- Positive Trend: Net buying
            AND buy_volume > 0.1 -- Good Volume: At least 0.1 SOL bought
            AND total_tokens_acquired >= 500000 -- Min 0.05% Supply (Assuming 1B Supply)
            ORDER BY elite_consensus_score DESC, total_volume_sol DESC
            LIMIT ?
        `;
        return await db.all(query, timeframeHours, limit);
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
        console.error(`Failed to adjust pot ${name}: `, error);
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

export const getWalletStats = async (address: string) => {
    if (!db) return null;
    try {
        return await db.get(`SELECT * FROM tracked_wallets WHERE address = ? `, address);
    } catch (error) {
        console.error('Failed to fetch wallet stats:', error);
        return null;
    }
};

/**
 * Pod Intelligence: Social Consensus
 * Calculates the combined weight of whales in a specific token
 */
export const getPodStrength = async (mint: string) => {
    if (!db) return { score: 0, count: 0 };
    try {
        const result = await db.get(`
            SELECT
        COUNT(DISTINCT wallet) as count,
            SUM(reputation_score) as total_reputation,
            SUM(amount) as total_sol
            FROM whale_sightings ws
            JOIN tracked_wallets tw ON ws.wallet = tw.address
            WHERE ws.mint = ? AND ws.isBuy = 1
            `, mint);

        const count = result.count || 0;
        if (count === 0) return { score: 0, count: 0 };

        const avgRep = (result.total_reputation || 0) / count;
        const volFactor = Math.min((result.total_sol || 0) / 10, 1) * 30;
        const repFactor = (avgRep / 100) * 70;
        const podBonus = Math.min((count - 1) * 5, 20);

        return {
            score: Math.min(Math.round(repFactor + volFactor + podBonus), 100),
            count
        };
    } catch (error) {
        console.error('Failed to calculate pod strength:', error);
        return { score: 0, count: 0 };
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

