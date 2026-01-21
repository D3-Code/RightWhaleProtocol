import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

const migrate = async () => {
    const db = await open({
        filename: path.join(__dirname, '../database.sqlite'),
        driver: sqlite3.Database
    });

    try {
        // Add image_uri column to whale_sightings
        await db.exec(`
            ALTER TABLE whale_sightings ADD COLUMN image_uri TEXT;
        `);
        console.log('✅ Migration complete: Added image_uri to whale_sightings');
    } catch (error: any) {
        if (error.message.includes('duplicate column name')) {
            console.log('⚠️  Column already exists, skipping migration');
        } else {
            console.error('❌ Migration failed:', error);
        }
    }

    await db.close();
};

migrate();
