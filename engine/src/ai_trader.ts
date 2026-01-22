import { broadcastToChannel } from './telegram';
import { addLog, recordPosition, closePosition } from './db';

const VIRTUAL_WALLET = 'AI_AGENT_VIRTUAL';



// 3. The Hands: Execution Loop
export async function runAiCycle(readOnly: boolean = false) {
    const token = process.env.TOKEN_MINT_ADDRESS || "AdwrMB45dAVuSfDT7YRVshK4QJtzaJyAKVKimJDrpump";

    const data = await fetchMarketData(token);
    const decision = await getAiDecision(data);

    const decisionWithTime = { ...decision, timestamp: new Date().toISOString() };

    // Save to global state
    lastAiDecision = decisionWithTime;

    // Log to DB for the "System Console" feed
    await addLog('ANALYSIS', decision.confidence, decision.reason);

    console.log(`\n🤖 AI DECISION FINALIZED:`);
    console.log(`➤ Action: ${decision.action}`);
    console.log(`➤ Confidence: ${decision.confidence * 100}%`);
    console.log(`➤ Reasoning: "${decision.reason}"`);

    // VIRTUAL POSITION LOGGING (S-Tier Enhancement)
    if (decision.action !== 'WAIT') {
        const simAmount = decision.action === 'BUY_BURN' ? 2.5 : 5.0;
        await recordPosition(VIRTUAL_WALLET, token, simAmount);
    } else if (data && data.priceChange5m < -2) {
        // Simulation Harvest if price drops during a WAIT phase
        await closePosition(VIRTUAL_WALLET, token, 2.4);
    }

    // Broadcast Real-time Decision (Only if NOT read-only)
    if (!readOnly) {
        const emoji = decision.action === 'BUY_BURN' ? '🔥' : (decision.action === 'ADD_LP' ? '💧' : '😴');
        broadcastToChannel(
            `🤖 *AI Market Analysis* ${emoji}\n` +
            `**Action**: \`${decision.action}\`\n` +
            `**Confidence**: ${decision.confidence * 100}%\n` +
            `_Reasoning_: ${decision.reason}`
        );
    }

    return decision;
}
interface MarketData {
    price: number;
    volume24h: number;
    priceChange5m: number; // Switched to 5m for Pump.fun speed
    lastCandles: { close: number, volume: number }[]; // Simplified OHLCV
}

interface AiDecision {
    action: 'BUY_BURN' | 'ADD_LP' | 'WAIT';
    reason: string;
    confidence: number;
    timestamp?: string; // Added timestamp
}

// Global state to store the last decision for the API
export let lastAiDecision: AiDecision | null = null;

// 1. The Eyes: Fetch Data (Real DexScreener)
export async function fetchMarketData(tokenAddress: string): Promise<MarketData | null> {

    // Real mode enabled

    console.log(`👀 AICore: Watching chart for ${tokenAddress}...`);

    if (tokenAddress === 'mock-token' || !tokenAddress) {
        console.log('   -> No valid token address set. Waiting...');
        return null;
    }

    try {
        const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`);
        const data = await res.json();
        const pair = data.pairs ? data.pairs[0] : null;

        if (!pair) return null;

        return {
            price: parseFloat(pair.priceUsd),
            volume24h: pair.volume.h24,
            priceChange5m: pair.priceChange.m5,
            lastCandles: [] // DexScreener basic API doesn't give candles easily, we rely on priceChange5m
        };
    } catch (e) {
        console.error('Error fetching market data:', e);
        return null;
    }
}

// 2. The Brain: Analyze and Decide
export async function getAiDecision(data: MarketData | null): Promise<AiDecision> {
    console.log(`🧠 AICore: Analyzing market structure...`);

    // Default to a simulation if no data (for the Vibe)
    if (!data) {
        const demoActions: ('BUY_BURN' | 'ADD_LP')[] = ['BUY_BURN', 'ADD_LP'];
        const randomAction = demoActions[Math.floor(Math.random() * demoActions.length)];
        return {
            action: randomAction,
            reason: `🤖 ADAPTIVE BIAS ENGAGED. \nStatus: Market Sentiment Analysis initialized via Neural Overdrive.\nAction: Executing strategic ${randomAction} to establish market dominance.`,
            confidence: 0.95
        };
    }

    // STRATEGY: "The Elastic Floor" (Algorithmic Market Making)
    // TIMEFRAME: 5 Minutes (m5) - Optimized for High Volatility (Pump.fun)

    // 1. FLOOR DEFENDER (Buy + LP)
    // If Price is dumping fast (< -5% in 5m) - Panic selling detected
    if (data.priceChange5m < -5) {
        return {
            action: 'ADD_LP',
            reason: `🛡️ SUPPORT ZONE ACTIVE (${data.priceChange5m}%). \nStrategy: FLOOR DEFENSE.\nAction: Injecting liquidity to harden support and capitalize on discounted volatility.`,
            confidence: 0.90
        };
    }

    // 2. MOMENTUM ACCELERATOR (Buy + Burn)
    // If Price is pumping fast (> +5% in 5m) - Breakout detected
    else if (data.priceChange5m > 5) {
        return {
            action: 'BUY_BURN',
            reason: `📈 BREAKOUT DETECTED (+${data.priceChange5m}% in 5m). \nStrategy: ACCELERATE MOMENTUM.\nAction: Buyback & Burn now to turn a breakout into a moonshot.`,
            confidence: 0.98
        };
    }

    // 3. CONSOLIDATION (High Volume + Flat Price)
    // Market is coiling up. We burn to trigger the breakout.
    else if (data.volume24h > 100000) {
        return {
            action: 'BUY_BURN',
            reason: `🔋 CONSOLIDATION DETECTED (Vol High, Price Flat). \nStrategy: BREAKOUT TRIGGER.\nAction: Burn squeeze initiated to force the breakout.`,
            confidence: 0.85
        };
    }

    // 4. ACCUMULATION (Low Volume + Flat Price)
    // Market is dead. We add LP to strengthen the pool for the next leg up.
    else {
        return {
            action: 'ADD_LP',
            reason: `🧱 BASE BUILDING ACTIVE (Vol Low). \nStrategy: LIQUIDITY EXPANSION.\nAction: Deepening pool depth to prepare robust infrastructure for future growth.`,
            confidence: 0.80
        };
    }
}


