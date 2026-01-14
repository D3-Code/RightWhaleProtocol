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
import { marketMonitor } from './market_monitor'; // Correct import
import { lastAiDecision } from './ai_trader';

import { initDB, getLogs } from './db';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Init DB
initDB();

// API Routes
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/logs', async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
        const type = req.query.type as string | undefined;
        const logs = await getLogs(limit, type); // Pass type filter
        res.json(logs);
    } catch (err) {
        res.status(500).send('Error fetching logs');
    }
});

app.get('/ai-status', (req, res) => {
    res.json(lastAiDecision || { action: 'WAIT', reason: 'System Initializing...', confidence: 0, timestamp: new Date().toISOString() });
});

app.get('/stats', (req, res) => {
    res.json(globalStats);
});

// Start Server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// Start Services
setupBot();
startMonitor();
startMarketMonitor();
startMonitor();
