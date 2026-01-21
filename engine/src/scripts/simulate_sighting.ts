import { initDB, logWhaleSighting } from '../db';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function simulate() {
    await initDB();

    console.log('🧪 Injecting TEST Whale Sighting...');

    // Inject a fake BUY
    await logWhaleSighting(
        'AdwrMB45dAVuSfDT7YRVshK4QJtzaJyAKVKimJDrpump',
        'TIMMY',
        150.5,
        'WhaleTesterWalletAddress123456789',
        true
    );

    console.log('✅ Injected. Refresh dashboard to see "TIMMY".');
}

simulate();
