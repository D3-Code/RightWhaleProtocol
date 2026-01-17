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

export const getLogs = async (limit = 50, type?: string) => {
    if (!db) return [];
    if (type) {
        return await db.all('SELECT * FROM activity_logs WHERE type = ? ORDER BY id DESC LIMIT ?', type, limit);
    }
    return await db.all('SELECT * FROM activity_logs ORDER BY id DESC LIMIT ?', limit);
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

export const getVirtualPots = async () => {
    if (!db) return [];
    try {
        return await db.all('SELECT * FROM virtual_pots');
    } catch (error) {
        console.error('Failed to fetch virtual pots:', error);
        return [];
    }
};
