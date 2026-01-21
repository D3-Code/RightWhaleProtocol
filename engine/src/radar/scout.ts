import fetch from 'cross-fetch';

/**
 * Scout: The Whale Analyzer
 * 
 * Purpose: Fetch trade history for a successful token and identify "Winner Wallets".
 * Usage: npx ts-node engine/src/radar/scout.ts <TOKEN_MINT>
 */

interface PumpTrade {
    signature: string;
    mint: string;
    solAmount: number;
    tokenAmount: number;
    isBuy: boolean;
    user: string;
    timestamp: number;
    virtualSolReserves: number;
    virtualTokenReserves: number;
}

// Standard Pump.fun Frontend API
const PUMP_DATA_API = 'https://frontend-api.pump.fun/trades/all';

async function fetchTrades(mint: string): Promise<PumpTrade[]> {
    console.log(`📡 Scouting trades for mint: ${mint}...`);
    try {
        const url = `${PUMP_DATA_API}/${mint}?limit=1000&offset=0&sort=desc`;

        // Add User-Agent to avoid blocking
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://pump.fun/'
            }
        });

        if (!res.ok) throw new Error(`API Error: ${res.status} ${res.statusText}`);

        const data = await res.json();
        return data as PumpTrade[];
    } catch (e) {
        console.error('❌ Scout Failed:', e);
        return [];
    }
}

async function analyze(mint: string) {
    const trades = await fetchTrades(mint);
    console.log(`✅ Retrieved ${trades.length} trades.`);

    if (trades.length === 0) return;

    // Analysis: Profit Calculator per Wallet
    const walletStats: Record<string, { bought: number; sold: number; invested: number; returned: number; txCount: number }> = {};

    for (const trade of trades) {
        const wallet = trade.user;
        if (!walletStats[wallet]) {
            walletStats[wallet] = { bought: 0, sold: 0, invested: 0, returned: 0, txCount: 0 };
        }

        const stats = walletStats[wallet];
        stats.txCount++;

        if (trade.isBuy) {
            stats.bought += trade.tokenAmount;
            stats.invested += trade.solAmount;
        } else {
            stats.sold += trade.tokenAmount;
            stats.returned += trade.solAmount;
        }
    }

    // Identify Whales:
    // Criteria:
    // 1. Made > 10 SOL profit
    // 2. Or still holding huge bags (potential insider/believer) but unrealized

    // Calculate PnL
    const whales = Object.entries(walletStats).map(([wallet, s]) => {
        const pnl = s.returned - s.invested;
        const held = s.bought - s.sold;
        return { wallet, pnl, held, ...s };
    });

    // Sort by Realized Profit
    const topWinners = whales.sort((a, b) => b.pnl - a.pnl).slice(0, 20);

    console.log('\n🏆 TOP 20 REALIZED PROFIT WHALES (from last 1000 trades) 🏆\n');
    topWinners.forEach((w, i) => {
        console.log(`#${i + 1} [${w.wallet}]`);
        console.log(`   💰 Profit: ${w.pnl.toFixed(2)} SOL`);
        console.log(`   📉 Invested: ${w.invested.toFixed(2)} | 📈 Returned: ${w.returned.toFixed(2)}`);
        console.log(`   🎒 Still Holding: ${w.held.toLocaleString()} tokens`);
        console.log('------------------------------------------------');
    });

    console.log('\n👀 Use these wallets to build your "Smart Money" watchlist.');
}

// Run if called directly
const args = process.argv.slice(2);
const MINT_TO_ANALYZE = args[0] || 'AdwrMB45dAVuSfDT7YRVshK4QJtzaJyAKVKimJDrpump'; // Default to our own for test

if (require.main === module) {
    analyze(MINT_TO_ANALYZE);
}
