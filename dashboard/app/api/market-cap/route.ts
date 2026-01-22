import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const mint = searchParams.get('mint');

    if (!mint) {
        return NextResponse.json({ error: 'Missing mint parameter' }, { status: 400 });
    }

    try {
        // 1. Try DexScreener First
        const dexRes = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${mint}`);
        if (dexRes.ok) {
            const data = await dexRes.json();
            const pair = data.pairs?.[0];
            if (pair) {
                return NextResponse.json({
                    marketCap: pair.fdv || pair.marketCap || 0,
                    source: 'dexscreener'
                });
            }
        }

        // 2. Try GeckoTerminal (Reliable for Pre-Bond)
        const geckRes = await fetch(`https://api.geckoterminal.com/api/v2/networks/solana/tokens/${mint}`);
        if (geckRes.ok) {
            const data = await geckRes.json();
            const attr = data.data?.attributes;
            if (attr && (attr.fdv_usd || attr.market_cap_usd)) {
                return NextResponse.json({
                    marketCap: parseFloat(attr.fdv_usd || attr.market_cap_usd || '0'),
                    source: 'geckoterminal'
                });
            }
        }

        // 3. Try Pump.fun Frontend API
        const pumpRes = await fetch(`https://frontend-api.pump.fun/coins/${mint}`, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
                "Referer": "https://pump.fun/",
                "Origin": "https://pump.fun"
            }
        });

        if (pumpRes.ok) {
            const data = await pumpRes.json();

            // Fetch SOL Price for USD conversion
            let solPrice = 150;
            try {
                const solRes = await fetch(`https://api.dexscreener.com/latest/dex/tokens/So11111111111111111111111111111111111111112`);
                const solData = await solRes.json();
                if (solData.pairs?.[0]) {
                    solPrice = parseFloat(solData.pairs[0].priceUsd);
                }
            } catch (e) {
                console.error("Failed to fetch SOL price", e);
            }

            const mcSol = data.market_cap || 0;
            const mcUsd = mcSol * solPrice;

            return NextResponse.json({
                marketCap: mcUsd,
                source: 'pumpfun'
            });
        }

        return NextResponse.json({ error: 'Market cap not found' }, { status: 404 });

    } catch (e) {
        console.error('Proxy Error:', e);
        return NextResponse.json({ error: 'Failed to fetch market cap' }, { status: 500 });
    }
}
