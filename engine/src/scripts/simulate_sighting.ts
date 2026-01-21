import { initDB, logWhaleSighting } from '../db';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function simulate() {
    await initDB();

    console.log('🧪 Injecting TEST Whale Sighting...');

    // 1. Create a "KOL Info" record for this wallet (High Impact)
    const wallet = 'KOL_KING_WALLET_999';
    await initDB();
    const sqlite3 = require('sqlite3');
    const { open } = require('sqlite');
    const path = require('path');

    const directDB = await open({
        filename: path.join(__dirname, '../../database.sqlite'),
        driver: sqlite3.Database
    });

    await directDB.run(`INSERT OR REPLACE INTO tracked_wallets 
        (address, win_rate, reputation_score, avg_impact_volume, avg_impact_buyers) 
        VALUES (?, ?, ?, ?, ?)`,
        wallet, 85.0, 95, 500.5, 25
    );

    // 2. Inject the Sighting
    await logWhaleSighting(
        'AdwrMB45dAVuSfDT7YRVshK4QJtzaJyAKVKimJDrpump',
        'KOL_COIN',
        250.0,
        wallet,
        true
    );

    console.log('✅ Injected KOL KING Sighting (Impact: 25 Buyers, 500 SOL).');
}

simulate();
