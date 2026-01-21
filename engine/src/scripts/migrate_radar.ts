import { initDB } from '../db';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

async function migrate() {
    console.log('🔄 Starting Migration v2: Impact Analytics...');

    const db = await open({
        filename: path.join(__dirname, '../../database.sqlite'),
        driver: sqlite3.Database
    });

    try {
        await db.exec(`ALTER TABLE tracked_wallets ADD COLUMN avg_impact_volume REAL DEFAULT 0`);
        console.log('✅ Added avg_impact_volume to tracked_wallets');
    } catch (e) { console.log('⚠️ avg_impact_volume already exists or error:', (e as any).message); }

    try {
        await db.exec(`ALTER TABLE tracked_wallets ADD COLUMN avg_impact_buyers INTEGER DEFAULT 0`);
        console.log('✅ Added avg_impact_buyers to tracked_wallets');
    } catch (e) { console.log('⚠️ avg_impact_buyers already exists or error:', (e as any).message); }

    try {
        await db.exec(`ALTER TABLE positions ADD COLUMN impact_volume REAL DEFAULT 0`);
        console.log('✅ Added impact_volume to positions');
    } catch (e) { console.log('⚠️ impact_volume already exists or error:', (e as any).message); }

    try {
        await db.exec(`ALTER TABLE positions ADD COLUMN impact_buyers INTEGER DEFAULT 0`);
        console.log('✅ Added impact_buyers to positions');
    } catch (e) { console.log('⚠️ impact_buyers already exists or error:', (e as any).message); }

    try {
        await db.exec(`ALTER TABLE positions ADD COLUMN monitoring_expires_at TEXT`);
        console.log('✅ Added monitoring_expires_at to positions');
    } catch (e) { console.log('⚠️ monitoring_expires_at already exists or error:', (e as any).message); }

    console.log('✅ Migration Complete.');
}

migrate();
