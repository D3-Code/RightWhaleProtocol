import fs from 'fs/promises';
import path from 'path';

export const backupDatabase = async () => {
    try {
        const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
        const backupDir = path.join(__dirname, '../backups');
        const backupPath = path.join(backupDir, `database_${timestamp}.sqlite`);
        const dbPath = path.join(__dirname, '../database.sqlite');

        // Ensure backup directory exists
        await fs.mkdir(backupDir, { recursive: true });

        // Copy database file
        await fs.copyFile(dbPath, backupPath);

        console.log(`💾 Database backed up: ${backupPath}`);

        // Cleanup old backups (keep last 30 days)
        await cleanupOldBackups(backupDir, 30);

        return true;
    } catch (error) {
        console.error('❌ Backup failed:', error);
        return false;
    }
};

const cleanupOldBackups = async (backupDir: string, retentionDays: number) => {
    try {
        const files = await fs.readdir(backupDir);
        const now = Date.now();
        const maxAge = retentionDays * 24 * 60 * 60 * 1000; // Convert days to milliseconds

        for (const file of files) {
            if (!file.endsWith('.sqlite')) continue;

            const filePath = path.join(backupDir, file);
            const stats = await fs.stat(filePath);
            const age = now - stats.mtimeMs;

            if (age > maxAge) {
                await fs.unlink(filePath);
                console.log(`🗑️  Deleted old backup: ${file}`);
            }
        }
    } catch (error) {
        console.error('Failed to cleanup old backups:', error);
    }
};
