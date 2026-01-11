import express from 'express';
import cors from 'cors';
// Global Stats Store (In-memory for prototype, move to DB for prod)
export const globalStats = {
    totalBurned: 0, // Millions of tokens burned
    totalLP: 0,          // SOL Added to LP
    totalRevShare: 0,    // SOL Distributed
    distributions: 0
};
import dotenv from 'dotenv';
import { setupBot } from './bot';
import { startMonitor } from './monitor';
import { startMarketMonitor } from './market';

import { initDB, getLogs } from './db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Init DB
initDB();

// API Routes
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/history', async (req, res) => {
    const logs = await getLogs();
    res.json(logs);
});

app.get('/stats', (req, res) => {
    res.json(globalStats);
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// Start Services
setupBot();
startMonitor();
startMarketMonitor();
startMonitor();
