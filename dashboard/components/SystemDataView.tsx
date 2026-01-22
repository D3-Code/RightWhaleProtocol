"use client";

import { useEffect, useState } from "react";
import { Activity, Database, Server, Cpu, Trophy, TrendingUp, Radar, Clock } from "lucide-react";

export const SystemDataView = () => {
    const [data, setData] = useState<any>({
        stats: null,
        aiStatus: null,
        leaderboard: [],
        topTokens: [],
        sightings: [],
        positions: []
    });
    const [lastUpdate, setLastUpdate] = useState<string>('');
    const [showRaw, setShowRaw] = useState(false);

    const ENGINE_API = process.env.NEXT_PUBLIC_ENGINE_API || "http://localhost:3001";

    const fetchAllData = async () => {
        try {
            const [stats, aiStatus, leaderboard, topTokens, sightings, positions] = await Promise.all([
                fetch(`${ENGINE_API}/stats`).then(r => r.json()).catch(() => null),
                fetch(`${ENGINE_API}/ai-status`).then(r => r.json()).catch(() => null),
                fetch(`${ENGINE_API}/radar/leaderboard?limit=5`).then(r => r.json()).catch(() => []),
                fetch(`${ENGINE_API}/radar/top-tokens?limit=5`).then(r => r.json()).catch(() => []),
                fetch(`${ENGINE_API}/radar?limit=10`).then(r => r.json()).catch(() => []),
                fetch(`${ENGINE_API}/radar/positions?limit=5`).then(r => r.json()).catch(() => [])
            ]);

            setData({ stats, aiStatus, leaderboard, topTokens, sightings, positions });
            setLastUpdate(new Date().toLocaleTimeString());
        } catch (e) {
            console.error("Failed to fetch system data", e);
        }
    };

    useEffect(() => {
        fetchAllData();
        const interval = setInterval(fetchAllData, 5000); // 5s Refresh
        return () => clearInterval(interval);
    }, []);

    const Section = ({ title, icon: Icon, children, className = "" }: any) => (
        <div className={`p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm ${className}`}>
            <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-2">
                <Icon className="w-4 h-4 text-emerald-500" />
                <h3 className="text-xs font-black text-zinc-300 uppercase tracking-widest">{title}</h3>
            </div>
            {children}
        </div>
    );

    const JsonBlock = ({ data }: { data: any }) => (
        <pre className="text-[10px] text-zinc-500 font-mono bg-black/50 p-2 rounded overflow-x-auto max-h-[150px] overflow-y-auto no-scrollbar">
            {JSON.stringify(data, null, 2)}
        </pre>
    );

    return (
        <div className="min-h-screen bg-black text-white font-mono-tech p-6">
            <header className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-xl font-bold uppercase tracking-tight flex items-center gap-2">
                        <Database className="w-5 h-5 text-emerald-500" />
                        System Data Inspector
                    </h1>
                    <p className="text-xs text-zinc-500 tracking-widest uppercase mt-1">
                        Aggregated Data View // Last Sync: <span className="text-emerald-500">{lastUpdate}</span>
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowRaw(!showRaw)}
                        className={`px-3 py-1.5 text-xs font-bold border rounded transition-all ${showRaw
                                ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500'
                                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                            }`}
                    >
                        {showRaw ? '{ RAW JSON }' : 'VISUAL VIEW'}
                    </button>
                    <a href="/radar" className="px-3 py-1.5 text-xs font-bold text-zinc-400 border border-zinc-800 rounded bg-zinc-900 hover:text-white hover:bg-zinc-800 transition-colors">
                        Back to Radar
                    </a>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* 1. System Stats */}
                <Section title="System Core" icon={Server}>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                            <div className="p-3 bg-zinc-900 rounded border border-zinc-800">
                                <div className="text-[10px] text-zinc-500 uppercase">Burn Pot</div>
                                <div className="text-lg font-black text-orange-500">{data.stats?.burnPot?.toFixed(2) || '0.00'} S</div>
                            </div>
                            <div className="p-3 bg-zinc-900 rounded border border-zinc-800">
                                <div className="text-[10px] text-zinc-500 uppercase">LP Pot</div>
                                <div className="text-lg font-black text-emerald-500">{data.stats?.lpPot?.toFixed(2) || '0.00'} S</div>
                            </div>
                        </div>
                        {showRaw && <JsonBlock data={data.stats} />}
                    </div>
                </Section>

                {/* 2. AI Intelligence */}
                <Section title="Neural State" icon={Cpu}>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-zinc-400">Action:</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${data.aiStatus?.action === 'BUY' ? 'bg-emerald-500/20 text-emerald-500' :
                                    data.aiStatus?.action === 'WAIT' ? 'bg-zinc-700 text-zinc-400' :
                                        'bg-red-500/20 text-red-500'
                                }`}>
                                {data.aiStatus?.action || 'OFFLINE'}
                            </span>
                        </div>
                        <div className="p-2 bg-black/40 rounded border border-zinc-800/50 min-h-[60px]">
                            <p className="text-[10px] text-zinc-500 leading-relaxed">
                                {data.aiStatus?.reason || 'Waiting for neural feed...'}
                            </p>
                        </div>
                        {showRaw && <JsonBlock data={data.aiStatus} />}
                    </div>
                </Section>

                {/* 3. Leaderboard */}
                <Section title="Elite Traders" icon={Trophy}>
                    <div className="space-y-2">
                        {data.leaderboard.map((w: any, i: number) => (
                            <div key={i} className="flex justify-between items-center text-xs border-b border-zinc-800/50 pb-1 last:border-0">
                                <span className="text-zinc-400 truncate max-w-[100px]">{w.wallet_name || w.address.slice(0, 4)}</span>
                                <div className="flex gap-2 font-mono">
                                    <span className="text-emerald-500">{w.win_rate}%</span>
                                    <span className="text-amber-500">+{w.total_profit_sol?.toFixed(1)}</span>
                                </div>
                            </div>
                        ))}
                        {data.leaderboard.length === 0 && <div className="text-[10px] text-zinc-600 italic">No data</div>}
                        {showRaw && <JsonBlock data={data.leaderboard} />}
                    </div>
                </Section>

                {/* 4. Top Tokens */}
                <Section title="Trending Assets" icon={TrendingUp}>
                    <div className="space-y-2">
                        {data.topTokens.map((t: any, i: number) => (
                            <div key={i} className="flex justify-between items-center text-xs border-b border-zinc-800/50 pb-1 last:border-0">
                                <span className="font-bold text-white">${t.symbol}</span>
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] text-zinc-400">{Math.round(t.market_cap).toLocaleString()} MC</span>
                                    <span className="text-[9px] text-emerald-600">{t.whale_count} Whales</span>
                                </div>
                            </div>
                        ))}
                        {data.topTokens.length === 0 && <div className="text-[10px] text-zinc-600 italic">No data</div>}
                        {showRaw && <JsonBlock data={data.topTokens} />}
                    </div>
                </Section>

                {/* 5. Live Feed (Wide) */}
                <Section title="Live Radar Feed" icon={Radar} className="md:col-span-2">
                    <div className="space-y-1">
                        {data.sightings.map((s: any, i: number) => (
                            <div key={i} className="grid grid-cols-4 gap-2 text-[10px] items-center p-1 hover:bg-white/5 rounded">
                                <div className="text-zinc-500">{new Date(s.timestamp).toLocaleTimeString()}</div>
                                <div className={`font-bold ${s.isBuy ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {s.isBuy ? 'BUY' : 'SELL'} {s.amount.toFixed(2)} S
                                </div>
                                <div className="font-bold text-white">${s.symbol}</div>
                                <div className="text-right text-zinc-600 font-mono">
                                    MC: {s.market_cap ? Math.round(s.market_cap) : '-'}
                                </div>
                            </div>
                        ))}
                        {showRaw && <JsonBlock data={data.sightings} />}
                    </div>
                </Section>

                {/* 6. Active Positions (Wide) */}
                <Section title="Active Positions" icon={Clock} className="md:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {data.positions.map((p: any, i: number) => (
                            <div key={i} className="p-2 bg-zinc-900/40 border border-zinc-800 rounded flex justify-between items-center">
                                <div>
                                    <div className="text-xs font-bold text-white">${p.symbol || 'UNKNOWN'}</div>
                                    <div className="text-[10px] text-zinc-500">{p.mint.slice(0, 6)}...</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-bold text-emerald-400">{p.buy_amount_sol.toFixed(2)} S</div>
                                    <div className="text-[10px] text-zinc-600">{Math.round(p.hold_minutes)}m hold</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {data.positions.length === 0 && <div className="text-[10px] text-zinc-600 italic p-2">No active positions</div>}
                    {showRaw && <JsonBlock data={data.positions} />}
                </Section>

            </div>
        </div>
    );
};
