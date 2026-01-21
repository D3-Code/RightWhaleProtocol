import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

const migrate = async () => {
    const db = await open({
        filename: path.join(__dirname, '../database.sqlite'),
        driver: sqlite3.Database
    });

    try {
        // Add identity columns to tracked_wallets
        await db.exec(`
            ALTER TABLE tracked_wallets ADD COLUMN wallet_name TEXT;
        `);
        console.log('✅ Added wallet_name column');
    } catch (error: any) {
        if (error.message.includes('duplicate column name')) {
            console.log('⚠️  wallet_name already exists');
        } else {
            console.error('❌ Failed to add wallet_name:', error);
        }
    }

    try {
        await db.exec(`
            ALTER TABLE tracked_wallets ADD COLUMN twitter_handle TEXT;
        `);
        console.log('✅ Added twitter_handle column');
    } catch (error: any) {
        if (error.message.includes('duplicate column name')) {
            console.log('⚠️  twitter_handle already exists');
        }
    }

    try {
        await db.exec(`
            ALTER TABLE tracked_wallets ADD COLUMN profile_image_url TEXT;
        `);
        console.log('✅ Added profile_image_url column');
    } catch (error: any) {
        if (error.message.includes('duplicate column name')) {
            console.log('⚠️  profile_image_url already exists');
        }
    }

    try {
        await db.exec(`
            ALTER TABLE tracked_wallets ADD COLUMN last_identity_check TEXT;
        `);
        console.log('✅ Added last_identity_check column');
    } catch (error: any) {
        if (error.message.includes('duplicate column name')) {
            console.log('⚠️  last_identity_check already exists');
        }
    }

    console.log('✅ Migration complete: Wallet identity columns added');
    await db.close();
};

migrate();
