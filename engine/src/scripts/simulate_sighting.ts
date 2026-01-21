import { initDB, logWhaleSighting } from '../db';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function simulate() {
    await initDB();

    console.log('🧪 Injecting TEST Whale Sighting...');

    // 1. Create a "Smart Info" record for this wallet (High Win Rate)
    const wallet = 'TIMMY_PRO_WALLET_888';
    await initDB();
    const db = await import('../db').then(m => (m as any).getDB ? (m as any).getDB() : (m as any).db); // Hacky access to db object if exported, or just use sql directly if accessible. 
    // Actually, db is not exported from db.ts directly. I should assume db is accessible via the open connection in db.ts if I use the db.ts functions.
    // Wait, I can't access `db` object directly from outside.
    // I should simply use sqlite3 directly here to insert into `tracked_wallets` manually for the test.

    const sqlite3 = require('sqlite3');
    const { open } = require('sqlite');
    const path = require('path');

    const directDB = await open({
        filename: path.join(__dirname, '../../database.sqlite'),
        driver: sqlite3.Database
    });

    await directDB.run(`INSERT OR REPLACE INTO tracked_wallets (address, win_rate, reputation_score) VALUES (?, ?, ?)`,
        wallet, 95.5, 99
    );

    // 2. Inject the Sighting
    await logWhaleSighting(
        'AdwrMB45dAVuSfDT7YRVshK4QJtzaJyAKVKimJDrpump',
        'TIMMY_PRO',
        500.0,
        wallet,
        true
    );

    console.log('✅ Injected SMART MONEY Sighting ("TIMMY_PRO").');
}

simulate();
