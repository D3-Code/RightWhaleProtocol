import fetch from 'cross-fetch';

// Types for our "Brain"
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
}

// 1. The Eyes: Fetch Data (Mock for now, ready for DexScreener)
export async function fetchMarketData(tokenAddress: string): Promise<MarketData> {
    console.log(`👀 AICore: Watching chart for ${tokenAddress}...`);

    // TODO: Replace with real DexScreener API call
    // const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`);

    // Mocking "Dumping" scenario
    return {
        price: 0.0045,
        volume24h: 150000,
        priceChange5m: -5.2, // Pumping down FAST
        lastCandles: [
            { close: 0.0048, volume: 100 },
            { close: 0.0047, volume: 120 },
            { close: 0.0045, volume: 500 } // High volume sell off
        ]
    };
}

// 2. The Brain: Analyze and Decide (Mock LLM)
export async function getAiDecision(data: MarketData): Promise<AiDecision> {
    console.log(`🧠 AICore: Analyzing market structure...`);

    // This is where we would call OpenAI/Claude
    // const prompt = `Price: ${data.price}, Change: ${data.priceChange1h}%... Decide!`;

    // STRATEGY: "The Elastic Floor" (Algorithmic Market Making)
    // TIMEFRAME: 5 Minutes (m5) - Optimized for High Volatility (Pump.fun)

    // 1. FLOOR DEFENDER (Buy + LP)
    // If Price is dumping fast (< -5% in 5m) - Panic selling detected
    if (data.priceChange5m < -5) {
        return {
            action: 'ADD_LP',
            reason: `📉 FLASH DUMP DETECTED (${data.priceChange5m}% in 5m). \nStrategy: HARDEN THE FLOOR.\nAction: Injecting Liquidity immediately to stop the panic bleed.`,
            confidence: 0.98
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

    // 3. STALE MARKET SPARK (Boredom Breaker)
    // If we have cash (implied by execution) and price is flat (-2% to +2%)
    else if (data.priceChange5m > -2 && data.priceChange5m < 2) {
        return {
            action: 'BUY_BURN',
            reason: `😴 STAGNATION DETECTED (${data.priceChange5m}% in 5m). \nStrategy: BOREDOM BREAKER.\nAction: Executing Buyback to create a volatility spark and wake up the chart.`,
            confidence: 0.75
        };
    }

    // 4. ACCUMULATION ZONE (Wait - Low confidence fallback)
    else {
        return {
            action: 'WAIT',
            reason: `🤔 INDECISION (${data.priceChange5m}%). \nStrategy: HOLD.\nAction: No clear signal. Better to wait for a sharper move before deploying.`,
            confidence: 0.50
        };
    }
}

// 3. The Hands: Execution Loop
export async function runAiCycle() {
    const token = process.env.TOKEN_MINT_ADDRESS || "mock-token";

    const data = await fetchMarketData(token);
    const decision = await getAiDecision(data);

    console.log(`\n🤖 AI DECISION FINALIZED:`);
    console.log(`➤ Action: ${decision.action}`);
    console.log(`➤ Confidence: ${decision.confidence * 100}%`);
    console.log(`➤ Reasoning: "${decision.reason}"`);

    return decision;
}
