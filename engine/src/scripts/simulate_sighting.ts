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

    // 3. Inject a NEW (Unverified) Whale Sighting - Should NOT appear in Top Tokens
    const unverifiedWallet = 'SUS_BOT_666_v2';
    await logWhaleSighting(
        'RUG_MINT_v2_9999999999999999999999999999',
        'RUG_PUMP',
        '',
        100.0, // High SOL amount but from SUS wallet
        1000000000,
        unverifiedWallet,
        true
    );

    console.log('✅ Injected RUG PUMP sighting from Unverified wallet.');
}

simulate();
