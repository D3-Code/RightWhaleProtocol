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
            <main className="flex-1 w-full max-w-[1800px] mx-auto p-6 z-10">

                {/* Top 5 Whales Hero Section */}
                {topWhales.length > 0 && (
                    <div className="mb-8 p-6 rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-black to-zinc-900 shadow-2xl">
                        <div className="flex items-center gap-3 mb-6">
                            <Trophy className="w-6 h-6 text-amber-500" />
                            <h2 className="text-xl font-bold text-white uppercase tracking-tight italic">Elite Whale Leaderboard // Real-time ROI</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            {topWhales.map((whale, index) => (
                                <div key={whale.address} className="bg-white/[0.02] border border-white/5 rounded-lg p-5 hover:border-amber-500/50 hover:bg-white/[0.04] transition-all group">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className={`text-2xl font-black ${index === 0 ? 'text-amber-500' : 'text-zinc-600'}`}>0{index + 1}</span>
                                        {index === 0 && <span className="text-xl drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">👑</span>}
                                    </div>
                                    <div className="mb-4">
                                        {whale.twitter_handle ? (
                                            <div className="text-sm font-bold text-emerald-400">@{whale.twitter_handle}</div>
                                        ) : whale.wallet_name ? (
                                            <div className="text-sm font-bold text-white uppercase">{whale.wallet_name}</div>
                                        ) : (
                                            <code className="text-xs text-zinc-400 font-mono bg-black/40 px-2 py-1 rounded">
                                                {whale.address.slice(0, 6)}...{whale.address.slice(-4)}
                                            </code>
                                        )}
                                    </div>
                                    <div className="space-y-3 mb-4 border-t border-white/5 pt-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-zinc-500">WIN RATE</span>
                                            <span className="text-sm font-bold text-emerald-400">{whale.win_rate?.toFixed(0)}%</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-zinc-500">PROFIT</span>
                                            <span className="text-sm font-bold text-amber-400">+{whale.total_profit_sol?.toFixed(1)}◎</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigator.clipboard.writeText(whale.address)}
                                        className="w-full px-3 py-2 bg-white/5 hover:bg-amber-500/20 border border-white/10 hover:border-amber-500/30 rounded text-[10px] font-black text-zinc-400 hover:text-amber-400 transition-all uppercase tracking-widest"
                                    >
                                        Copy Intel
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                    {/* Left: Whale Trades (3/4 width) */}
                    <div className="lg:col-span-3 border border-zinc-800 bg-black/40 rounded-xl overflow-hidden shadow-2xl backdrop-blur-sm flex flex-col max-h-[1200px]">
                        <div className="w-full">
                            {/* Table Header */}
                            <div className="grid grid-cols-12 gap-4 px-6 py-4 text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em] border-b border-white/5 bg-zinc-900/60 sticky top-0 z-20 backdrop-blur-md">
                                <div className="col-span-1">Time</div>
                                <div className="col-span-1">Type</div>
                                <div className="col-span-2">Token</div>
                                <div className="col-span-1">Size</div>
                                <div className="col-span-2">Identity</div>
                                <div className="col-span-2">KOL Impact</div>
                                <div className="col-span-1 text-center">Score</div>
                                <div className="col-span-1 text-center">Grade</div>
                                <div className="col-span-1 text-right">Intel</div>
                            </div>

                            {/* Table Body - Scrollable Area */}
                            <div className="overflow-y-auto max-h-[1100px] no-scrollbar p-2 space-y-1">
                                <AnimatePresence mode="popLayout">
                                    {filteredSightings.map((s) => (
                                        <motion.div
                                            key={`${s.id}-${s.timestamp}`}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className={`
                                                grid grid-cols-12 gap-4 px-6 py-4 items-center rounded-lg border-l-4
                                                ${s.isBuy
                                                    ? 'bg-emerald-500/[0.02] border-emerald-500 hover:bg-emerald-500/[0.06]'
                                                    : 'bg-red-500/[0.02] border-red-500 hover:bg-red-500/[0.06]'
                                                } transition-all border-y border-r border-transparent hover:border-white/10 group relative
                                            `}
                                        >
                                            {/* Time */}
                                            <div className="col-span-1 text-zinc-500 text-xs font-bold font-mono">
                                                {new Date(s.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}
                                            </div>

                                            {/* Type */}
                                            <div className="col-span-1">
                                                <span className={`
                                                    px-1.5 py-0.5 rounded text-[10px] font-black border
                                                    ${s.isBuy ? 'text-emerald-400 border-emerald-500/30' : 'text-red-400 border-red-500/30'}
                                                `}>
                                                    {s.isBuy ? 'BUY' : 'SELL'}
                                                </span>
                                            </div>

                                            {/* Token */}
                                            <div className="col-span-2 flex items-center gap-3 min-w-0">
                                                <div className="relative shrink-0">
                                                    {s.image_uri ? (
                                                        <img
                                                            src={s.image_uri}
                                                            alt={s.symbol}
                                                            className="w-6 h-6 rounded-full border border-zinc-700 shadow-sm"
                                                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                                        />
                                                    ) : (
                                                        <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                                                            <Target className="w-3 h-3 text-zinc-500" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-sm font-black text-white truncate uppercase tracking-tight">{s.symbol || 'UNKNOWN'}</span>
                                                    <span className="text-[9px] text-zinc-500 font-mono truncate">{s.mint}</span>
                                                </div>
                                            </div>

                                            {/* Size */}
                                            <div className="col-span-1">
                                                <span className={`text-sm font-black ${s.isBuy ? 'text-emerald-400' : 'text-red-400'}`}>
                                                    {s.amount.toFixed(1)}◎
                                                </span>
                                            </div>

                                            {/* Identity */}
                                            <div className="col-span-2 flex items-center gap-2 min-w-0">
                                                <div className="truncate flex-1">
                                                    <span className="text-xs font-bold text-zinc-300 truncate block">
                                                        {s.wallet_name || `${s.wallet.slice(0, 4)}...${s.wallet.slice(-4)}`}
                                                    </span>
                                                </div>
                                                {(s.reputation_score || 0) >= 60 && (
                                                    <Trophy className="w-4 h-4 text-amber-500 shrink-0 filter drop-shadow-[0_0_5px_rgba(245,158,11,0.4)]" />
                                                )}
                                            </div>

                                            {/* KOL Impact Stats */}
                                            <div className="col-span-2">
                                                {(s.avg_impact_buyers || 0) > 0 ? (
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-purple-400" title="Recent Followers">
                                                            <Users className="w-3.5 h-3.5" />
                                                            {s.avg_impact_buyers}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-400" title="Follower Volume">
                                                            <Activity className="w-3.5 h-3.5" />
                                                            {s.avg_impact_volume?.toFixed(1)}◎
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] text-zinc-700 tracking-widest">---</span>
                                                )}
                                            </div>

                                            {/* Signal Score */}
                                            <div className="col-span-1 text-center font-black text-zinc-400 text-sm">
                                                {s.signal?.score || 0}%
                                            </div>

                                            {/* Signal Grade */}
                                            <div className="col-span-1 flex justify-center">
                                                <div className={`
                                                    w-9 h-9 rounded-lg flex items-center justify-center font-black text-lg skew-x-[-12deg]
                                                    ${s.signal?.grade === 'S' ? 'bg-fuchsia-500/20 text-fuchsia-400 border-2 border-fuchsia-500 shadow-[0_0_20px_rgba(217,70,239,0.3)]' :
                                                        s.signal?.grade === 'A' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500' :
                                                            s.signal?.grade === 'B' ? 'bg-blue-500/20 text-blue-400 border border-blue-500' :
                                                                s.signal?.grade === 'C' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500' :
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
                                                    className="inline-flex items-center justify-center w-10 h-10 text-zinc-500 hover:text-white hover:bg-white/10 rounded-full transition-all border border-transparent hover:border-white/20"
                                                >
                                                    <ArrowUpRight className="w-4 h-4" />
                                                </a>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {filteredSightings.length === 0 && !isLoading && (
                                    <div className="p-24 text-center text-zinc-500 flex flex-col items-center gap-6">
                                        <Radar className="w-16 h-16 opacity-10 animate-pulse" />
                                        <p className="font-black tracking-[0.3em] text-sm italic">// INCOMING TRANSMISSIONS PENDING //</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar: Sticky Stats */}
                    <div className="lg:col-span-1 flex flex-col gap-6 sticky top-[130px] max-h-[calc(100vh-160px)] overflow-y-auto no-scrollbar pb-12">
                        <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-lg shadow-xl backdrop-blur-md">
                            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                <TrendingUp className="w-3 h-3 text-orange-500" />
                                Trending Assets
                            </h3>
                            <TopWhaleTokensCard />
                        </div>

                        <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-lg shadow-xl backdrop-blur-md">
                            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                <Clock className="w-3 h-3 text-emerald-500" />
                                Active Whale Positions
                            </h3>
                            <div className="max-h-[600px] overflow-y-auto no-scrollbar">
                                <ActivePositionsCard />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
