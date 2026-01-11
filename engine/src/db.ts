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
            )
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

export const getLogs = async (limit = 50) => {
    if (!db) return [];
    return await db.all('SELECT * FROM activity_logs ORDER BY id DESC LIMIT ?', limit);
};
