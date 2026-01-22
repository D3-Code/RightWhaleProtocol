import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

async function migrate() {
    console.log('🔄 Starting Migration: Adding market_cap...');

    const db = await open({
        filename: path.join(__dirname, '../../database.sqlite'),
        driver: sqlite3.Database
    });

    try {
        await db.exec(`ALTER TABLE whale_sightings ADD COLUMN market_cap REAL DEFAULT 0`);
        console.log('✅ Added market_cap to whale_sightings');
    } catch (e) {
        console.log('⚠️ market_cap already exists or error:', (e as any).message);
    }
}

migrate();
