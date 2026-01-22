"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radar, ExternalLink, Target, Filter, Clock, ArrowUpRight, Search, Trophy, TrendingUp, Users, Activity } from "lucide-react";
import { ActivePositionsCard } from "./ActivePositionsCard";
import { TopWhaleTokensCard } from "./TopWhaleTokensCard";

type WhaleSighting = {
    id: number;
    mint: string;
    symbol: string;
    image_uri?: string;
    amount: number;
    wallet: string;
    isBuy: boolean;
    timestamp: string;
    // Smart Money Stats 
    win_rate?: number;
    reputation_score?: number;
    total_profit_sol?: number;
    wallet_name?: string;
    twitter_handle?: string;
    // Impact Stats (KOL Effect)
    avg_impact_volume?: number;
    avg_impact_buyers?: number;
    signal?: {
        score: number;
        grade: string;
    };
};

type TopWhale = {
    address: string;
    reputation_score?: number;
    win_rate?: number;
    total_profit_sol?: number;
    avg_impact_volume?: number;
    avg_impact_buyers?: number;
    wallet_name?: string;
    twitter_handle?: string;
};

export const FullPageRadar = () => {
    const [sightings, setSightings] = useState<WhaleSighting[]>([]);
    const [topWhales, setTopWhales] = useState<TopWhale[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [onlySmartMoney, setOnlySmartMoney] = useState(false);
    const [verifiedOnly, setVerifiedOnly] = useState(false); // Default: show all whales
    const [lastAlertId, setLastAlertId] = useState<number | null>(null);

    const ENGINE_API = process.env.NEXT_PUBLIC_ENGINE_API || "http://localhost:3001";

    const playAlert = (grade: string) => {
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            // Higher pitch for S-grade
            osc.frequency.setValueAtTime(grade === 'S' ? 880 : 440, ctx.currentTime);
            osc.type = 'sine';

            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 0.5);
        } catch (e) {
            console.error("Audio alert failed", e);
        }
    };

    const fetchSightings = async () => {
        try {
            // Fetch live sightings with verified filter
            const res = await fetch(`${ENGINE_API}/radar?limit=50&verifiedOnly=${verifiedOnly}&t=${Date.now()}`);
            if (res.ok) {
                const data = await res.json();
                setSightings(data);
                setIsLoading(false);

                // Check for high-signal alerts
                if (data.length > 0) {
                    const topSighting = data[0];
                    if (topSighting.id !== lastAlertId) {
                        const grade = topSighting.signal?.grade;
                        if (grade === 'S' || grade === 'A') {
                            playAlert(grade);
                        }
                        setLastAlertId(topSighting.id);
                    }
                }
            }

            // Fetch top whales
            const topRes = await fetch(`${ENGINE_API}/radar/leaderboard?limit=5&t=${Date.now()}`);
            if (topRes.ok) {
                const topData = await topRes.json();
                setTopWhales(topData);
            }
        } catch (e) {
            console.error("Radar offline");
        }
    };

    useEffect(() => {
        fetchSightings();
        const interval = setInterval(fetchSightings, 2000);
        return () => clearInterval(interval);
    }, [verifiedOnly]); // Re-fetch when filter changes

    const filteredSightings = onlySmartMoney
        ? sightings.filter(s => (s.reputation_score || 0) >= 60 || (s.win_rate || 0) > 50)
        : sightings;

    return (
        <div className="w-full min-h-screen flex flex-col bg-black text-white font-mono-tech relative">

            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(0,255,127,0.03),rgba(0,0,0,0))] z-0 pointer-events-none bg-[length:100%_4px,50px_100%]"></div>

            {/* Header */}
            <header className="sticky top-0 w-full flex items-center justify-between p-6 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-lg z-50">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                        <Radar className="w-6 h-6 text-emerald-500 animate-spin-slow" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tighter uppercase text-white flex items-center gap-2">
                            RightWhale <span className="text-emerald-500">WRAS</span>
                        </h1>
                        <p className="text-xs text-zinc-500 tracking-widest uppercase">Whale Report Alert System // Live Intelligence Feed</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/5 border border-emerald-500/20 rounded-full">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        <span className="text-xs font-bold text-emerald-500">LIVE FEED CONNECTED</span>
                    </div>
                    <div className="text-right hidden md:block">
                        <p className="text-xs text-zinc-500">SYSTEM TIME</p>
                        <p className="text-sm font-bold text-zinc-300">{new Date().toLocaleTimeString()}</p>
                    </div>
                </div>
            </header>

            {/* Toolbar */}
            <div className="sticky top-[85px] flex items-center justify-between px-6 py-3 border-b border-zinc-800 bg-black/60 backdrop-blur-md z-40">
                <div className="flex gap-2 max-w-[1800px] mx-auto w-full">
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs text-zinc-300 transition-colors">
                        <Filter className="w-3 h-3" />
                        <span>Filter: &gt; 1.0 SOL</span>
                    </button>
                    <button
                        onClick={() => setOnlySmartMoney(!onlySmartMoney)}
                        className={`flex items-center gap-2 px-3 py-1.5 border rounded text-xs transition-colors ${onlySmartMoney
                            ? 'bg-amber-500/20 border-amber-500 text-amber-400 font-bold shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                            : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300'
                            }`}
                    >
                        <Trophy className="w-3 h-3" />
                        <span>SMART MONEY (WR &gt; 50%)</span>
                    </button>
                    <button
                        onClick={() => setVerifiedOnly(!verifiedOnly)}
                        className={`flex items-center gap-2 px-3 py-1.5 border rounded text-xs transition-colors ${verifiedOnly
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                            : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300'
                            }`}
                    >
                        <span>{verifiedOnly ? '🏆' : '👁️'}</span>
                        <span>VERIFIED ONLY</span>
                    </button>
                    <div className="h-4 w-[1px] bg-zinc-800 mx-1"></div>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-bold">
                        GRADE SCALE:
                        <span className="text-fuchsia-400">S</span>
                        <span className="text-emerald-400">A</span>
                        <span className="text-blue-400">B</span>
                        <span className="text-yellow-400">C</span>
                    </div>
                    <div className="ml-auto text-[10px] text-zinc-600 uppercase tracking-widest">
                        Displaying last 50 sightings
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 w-full max-w-[1800px] mx-auto p-4 z-10">

                {/* Top 5 Whales Hero Section */}
                {topWhales.length > 0 && (
                    <div className="mb-4 p-4 rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-black to-zinc-900 shadow-2xl">
                        <div className="flex items-center gap-2 mb-3">
                            <Trophy className="w-5 h-5 text-amber-500" />
                            <h2 className="text-lg font-bold text-white uppercase tracking-tight italic">Elite Whale Leaderboard</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                            {topWhales.map((whale, index) => (
                                <div key={whale.address} className="bg-white/[0.02] border border-white/5 rounded-lg p-3 hover:border-amber-500/50 hover:bg-white/[0.04] transition-all group">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`text-xl font-black ${index === 0 ? 'text-amber-500' : 'text-zinc-600'}`}>0{index + 1}</span>
                                        {index === 0 && <span className="text-lg drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">👑</span>}
                                    </div>
                                    <div className="mb-2">
                                        {whale.twitter_handle ? (
                                            <div className="text-xs font-bold text-emerald-400 truncate">@{whale.twitter_handle}</div>
                                        ) : whale.wallet_name ? (
                                            <div className="text-xs font-bold text-white uppercase truncate">{whale.wallet_name}</div>
                                        ) : (
                                            <code className="text-[10px] text-zinc-400 font-mono bg-black/40 px-1.5 py-0.5 rounded">
                                                {whale.address.slice(0, 4)}...{whale.address.slice(-4)}
                                            </code>
                                        )}
                                    </div>
                                    <div className="space-y-1 mb-2 border-t border-white/5 pt-2">
                                        <div className="flex justify-between items-center text-[10px]">
                                            <span className="text-zinc-500">WR</span>
                                            <span className="font-bold text-emerald-400">{whale.win_rate?.toFixed(0)}%</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px]">
                                            <span className="text-zinc-500">ROI</span>
                                            <span className="font-bold text-amber-400">+{whale.total_profit_sol?.toFixed(1)}◎</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigator.clipboard.writeText(whale.address)}
                                        className="w-full py-1 bg-white/5 hover:bg-amber-500/20 border border-white/10 hover:border-amber-500/30 rounded text-[9px] font-black text-zinc-500 hover:text-amber-400 transition-all uppercase tracking-widest"
                                    >
                                        Copy
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
                    {/* Left: Whale Trades (3/4 width) */}
                    <div className="lg:col-span-3 border border-zinc-800 bg-black/40 rounded-xl overflow-hidden shadow-2xl backdrop-blur-sm">
                        <div className="w-full">
                            {/* Table Header */}
                            <div className="grid grid-cols-12 gap-3 px-4 py-2 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] border-b border-white/5 bg-zinc-900/60">
                                <div className="col-span-1">Time</div>
                                <div className="col-span-1">Type</div>
                                <div className="col-span-2">Token</div>
                                <div className="col-span-1">Size</div>
                                <div className="col-span-2">Identity</div>
                                <div className="col-span-2">KOL Impact</div>
                                <div className="col-span-1 text-center">Score</div>
                                <div className="col-span-1 text-center">Grade</div>
                                <div className="col-span-1 text-right">Link</div>
                            </div>

                            {/* Table Body */}
                            <div className="p-1 space-y-0.5">
                                <AnimatePresence mode="popLayout">
                                    {filteredSightings.map((s) => (
                                        <motion.div
                                            key={`${s.id}-${s.timestamp}`}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className={`
                                                grid grid-cols-12 gap-3 px-4 py-2 items-center rounded-lg border-l-4
                                                ${s.isBuy
                                                    ? 'bg-emerald-500/[0.01] border-emerald-500 hover:bg-emerald-500/[0.04]'
                                                    : 'bg-red-500/[0.01] border-red-500 hover:bg-red-500/[0.04]'
                                                } transition-all border-y border-r border-transparent hover:border-white/10 group relative
                                            `}
                                        >
                                            {/* Time */}
                                            <div className="col-span-1 text-zinc-500 text-[10px] font-bold font-mono">
                                                {new Date(s.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}
                                            </div>

                                            {/* Type */}
                                            <div className="col-span-1">
                                                <span className={`
                                                    px-1 py-0.5 rounded text-[9px] font-black border
                                                    ${s.isBuy ? 'text-emerald-400 border-emerald-500/20' : 'text-red-400 border-red-500/20'}
                                                `}>
                                                    {s.isBuy ? 'BUY' : 'SELL'}
                                                </span>
                                            </div>

                                            {/* Token */}
                                            <div className="col-span-2 flex items-center gap-2 min-w-0">
                                                <div className="shrink-0">
                                                    {s.image_uri ? (
                                                        <img
                                                            src={s.image_uri}
                                                            alt={s.symbol}
                                                            className="w-5 h-5 rounded-full border border-zinc-700 shadow-sm"
                                                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                                        />
                                                    ) : (
                                                        <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                                                            <Target className="w-2.5 h-2.5 text-zinc-500" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-xs font-black text-white truncate uppercase tracking-tight">{s.symbol || '??'}</span>
                                                    <span className="text-[8px] text-zinc-500 font-mono truncate">{s.mint.slice(0, 8)}...</span>
                                                </div>
                                            </div>

                                            {/* Amount */}
                                            <div className="col-span-1">
                                                <span className={`text-xs font-black ${s.isBuy ? 'text-emerald-400' : 'text-red-400'}`}>
                                                    {s.amount.toFixed(1)}◎
                                                </span>
                                            </div>

                                            {/* Identity */}
                                            <div className="col-span-2 flex items-center gap-1.5 min-w-0">
                                                <div className="truncate flex-1">
                                                    <span className="text-[11px] font-bold text-zinc-300 truncate block uppercase">
                                                        {s.wallet_name || `${s.wallet.slice(0, 4)}...${s.wallet.slice(-4)}`}
                                                    </span>
                                                </div>
                                                {(s.reputation_score || 0) >= 60 && (
                                                    <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0 filter drop-shadow-[0_0_5px_rgba(245,158,11,0.4)]" />
                                                )}
                                            </div>

                                            {/* KOL Impact Stats */}
                                            <div className="col-span-2">
                                                {(s.avg_impact_buyers || 0) > 0 ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex items-center gap-1 text-[9px] font-bold text-purple-400" title="Recent Followers">
                                                            <Users className="w-3 h-3" />
                                                            {s.avg_impact_buyers}
                                                        </div>
                                                        <div className="flex items-center gap-1 text-[9px] font-bold text-blue-400" title="Follower Volume">
                                                            <Activity className="w-3 h-3" />
                                                            {s.avg_impact_volume?.toFixed(1)}◎
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-[9px] text-zinc-800 tracking-widest">--</span>
                                                )}
                                            </div>

                                            {/* Signal Score */}
                                            <div className="col-span-1 text-center font-black text-zinc-400 text-xs">
                                                {s.signal?.score || 0}%
                                            </div>

                                            {/* Signal Grade */}
                                            <div className="col-span-1 flex justify-center">
                                                <div className={`
                                                    w-7 h-7 rounded flex items-center justify-center font-black text-sm skew-x-[-12deg]
                                                    ${s.signal?.grade === 'S' ? 'bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/50 shadow-[0_0_10px_rgba(217,70,239,0.2)]' :
                                                        s.signal?.grade === 'A' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                                            s.signal?.grade === 'B' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                                                                s.signal?.grade === 'C' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                                                                    'bg-zinc-800 text-zinc-600 border border-zinc-700'}
                                                `}>
                                                    <span className="skew-x-[12deg]">{s.signal?.grade || 'D'}</span>
                                                </div>
                                            </div>

                                            {/* Action */}
                                            <div className="col-span-1 text-right">
                                                <a
                                                    href={`https://pump.fun/coin/${s.mint}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center justify-center w-8 h-8 text-zinc-600 hover:text-white hover:bg-white/10 rounded-full transition-all border border-transparent"
                                                >
                                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                                </a>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {filteredSightings.length === 0 && !isLoading && (
                                    <div className="p-12 text-center text-zinc-600 flex flex-col items-center gap-4">
                                        <Radar className="w-12 h-12 opacity-10 animate-pulse" />
                                        <p className="font-black tracking-[0.3em] text-xs italic">// SYNCING //</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar: Sticky Stats */}
                    <div className="lg:col-span-1 flex flex-col gap-4 sticky top-[110px]">
                        <div className="bg-zinc-900/40 border border-zinc-800 p-3 rounded-lg shadow-xl backdrop-blur-md">
                            <h3 className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                <TrendingUp className="w-3 h-3 text-orange-500" />
                                Trending Assets
                            </h3>
                            <TopWhaleTokensCard />
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Active Whale Positions (Full Width) */}
                <div className="mt-4">
                    <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-xl shadow-2xl backdrop-blur-md">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                                    <Clock className="w-4 h-4 text-emerald-500" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Active Whale Positions</h3>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-2 py-0.5 bg-white/5 rounded border border-white/10">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-tighter">MONITORING</span>
                            </div>
                        </div>
                        <ActivePositionsCard />
                    </div>
                </div>
            </main>
        </div>
    );
};
