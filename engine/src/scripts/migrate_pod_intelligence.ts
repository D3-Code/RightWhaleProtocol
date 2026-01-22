import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

async function migrate() {
    console.log('🔄 Starting Migration v3: Pod Intelligence...');

    const db = await open({
        filename: path.join(__dirname, '../../database.sqlite'),
        driver: sqlite3.Database
    });

    try {
        await db.exec(`ALTER TABLE tracked_wallets ADD COLUMN max_win_sol REAL DEFAULT 0`);
        console.log('✅ Added max_win_sol to tracked_wallets');
    } catch (e) { console.log('⚠️ max_win_sol already exists or error:', (e as any).message); }

    try {
        await db.exec(`ALTER TABLE tracked_wallets ADD COLUMN max_hold_time INTEGER DEFAULT 0`);
        console.log('✅ Added max_hold_time to tracked_wallets');
    } catch (e) { console.log('⚠️ max_hold_time already exists or error:', (e as any).message); }

    try {
        await db.exec(`ALTER TABLE tracked_wallets ADD COLUMN alpha_score INTEGER DEFAULT 0`);
        console.log('✅ Added alpha_score to tracked_wallets');
    } catch (e) { console.log('⚠️ alpha_score already exists or error:', (e as any).message); }

    console.log('✅ Pod Intelligence Migration Complete.');
}

migrate();
