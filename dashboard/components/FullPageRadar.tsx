"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radar, ExternalLink, Target, Filter, Clock, ArrowUpRight, Search, Trophy, TrendingUp, Users, Activity } from "lucide-react";

type WhaleSighting = {
    id: number;
    mint: string;
    symbol: string;
    amount: number;
    wallet: string;
    isBuy: boolean;
    timestamp: string;
    // Smart Money Stats 
    win_rate?: number;
    reputation_score?: number;
    total_profit_sol?: number;
    // Impact Stats (KOL Effect)
    avg_impact_volume?: number;
    avg_impact_buyers?: number;
};

export const FullPageRadar = () => {
    const [sightings, setSightings] = useState<WhaleSighting[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [onlySmartMoney, setOnlySmartMoney] = useState(false);

    const ENGINE_API = process.env.NEXT_PUBLIC_ENGINE_API || "http://localhost:3001";

    const fetchSightings = async () => {
        try {
            // Fetch more logs for the full page
            const res = await fetch(`${ENGINE_API}/radar?limit=50&t=${Date.now()}`);
            if (res.ok) {
                const data = await res.json();
                setSightings(data);
                setIsLoading(false);
            }
        } catch (e) {
            console.error("Radar offline");
        }
    };

    useEffect(() => {
        fetchSightings();
        const interval = setInterval(fetchSightings, 2000);
        return () => clearInterval(interval);
    }, []);

    const filteredSightings = onlySmartMoney
        ? sightings.filter(s => (s.reputation_score || 0) >= 60 || (s.win_rate || 0) > 50)
        : sightings;

    return (
        <div className="w-full h-screen flex flex-col bg-black text-white font-mono-tech overflow-hidden relative">

            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(0,255,127,0.03),rgba(0,0,0,0))] z-0 pointer-events-none bg-[length:100%_4px,50px_100%]"></div>

            {/* Header */}
            <header className="flex items-center justify-between p-6 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md z-10">
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
            <div className="flex items-center justify-between px-6 py-3 border-b border-zinc-800 bg-zinc-900/30 z-10">
                <div className="flex gap-2">
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
                </div>
                <div className="text-[10px] text-zinc-600 uppercase tracking-widest">
                    Displaying last 50 sightings
                </div>
            </div>

            {/* Data Table */}
            <div className="flex-1 overflow-auto p-6 z-10 w-full overflow-x-hidden">
                <div className="w-full max-w-7xl mx-auto">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-4 px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider border-b border-white/5">
                        <div className="col-span-1">Time</div>
                        <div className="col-span-1">Type</div>
                        <div className="col-span-2">Token</div>
                        <div className="col-span-2 text-right">Amount</div>
                        <div className="col-span-2 text-center">Wallet</div>
                        <div className="col-span-2 text-center">KOL Impact (10m)</div>
                        <div className="col-span-1 text-center">Score</div>
                        <div className="col-span-1 text-right">Action</div>
                    </div>

                    {/* Table Body */}
                    <div className="space-y-1 mt-2">
                        <AnimatePresence mode="popLayout">
                            {filteredSightings.map((s) => (
                                <motion.div
                                    key={`${s.id}-${s.timestamp}`}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`
                                        grid grid-cols-12 gap-4 px-4 py-3 items-center rounded border-l-2
                                        ${s.isBuy
                                            ? 'bg-emerald-500/5 border-emerald-500 hover:bg-emerald-500/10'
                                            : 'bg-red-500/5 border-red-500 hover:bg-red-500/10'
                                        } transition-colors border-y border-r border-transparent hover:border-white/10 group
                                    `}
                                >
                                    {/* Time */}
                                    <div className="col-span-1 flex items-center gap-2 text-zinc-400 text-xs text-nowrap truncate">
                                        {new Date(s.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}
                                    </div>

                                    {/* Type */}
                                    <div className="col-span-1">
                                        <span className={`
                                            px-2 py-1 rounded text-[10px] font-bold uppercase
                                            ${s.isBuy ? 'text-emerald-400' : 'text-red-400'}
                                        `}>
                                            {s.isBuy ? 'BUY' : 'SELL'}
                                        </span>
                                    </div>

                                    {/* Token */}
                                    <div className="col-span-2 flex flex-col">
                                        <div className="flex items-center gap-2 font-bold text-white text-xs truncate">
                                            <Target className="w-3 h-3 text-zinc-500" />
                                            {s.symbol || 'UNKNOWN'}
                                        </div>
                                        <span className="text-[9px] text-zinc-500 font-mono truncate">{s.mint}</span>
                                    </div>

                                    {/* Amount */}
                                    <div className="col-span-2 text-right">
                                        <span className={`text-sm font-bold ${s.isBuy ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {s.amount.toFixed(2)} SOL
                                        </span>
                                    </div>

                                    {/* Wallet */}
                                    <div className="col-span-2 text-center">
                                        <code className="px-1 py-0.5 bg-black/50 rounded text-[10px] text-zinc-400 font-mono">
                                            {s.wallet.slice(0, 4)}...{s.wallet.slice(-4)}
                                        </code>
                                    </div>

                                    {/* KOL Impact Stats */}
                                    <div className="col-span-2 flex flex-col items-center gap-1">
                                        {(s.avg_impact_buyers || 0) > 0 && (
                                            <div className="flex items-center gap-3 w-full justify-center">
                                                <div className="flex items-center gap-1 text-[10px] text-purple-400" title="Followers (Unique Buyers)">
                                                    <Users className="w-3 h-3" />
                                                    {s.avg_impact_buyers}
                                                </div>
                                                <div className="flex items-center gap-1 text-[10px] text-blue-400" title="Volume Impact">
                                                    <Activity className="w-3 h-3" />
                                                    {s.avg_impact_volume?.toFixed(1)}◎
                                                </div>
                                            </div>
                                        )}
                                        {/* Signal Strength Bar */}
                                        {(s.avg_impact_buyers || 0) > 5 && (
                                            <div className="w-16 h-1 bg-zinc-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                                                    style={{ width: `${Math.min((s.avg_impact_buyers || 0) * 5, 100)}%` }}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Reputation / Score */}
                                    <div className="col-span-1 flex justify-center">
                                        {(s.win_rate || 0) > 50 ? (
                                            <div className="flex items-center gap-1 text-amber-500" title="Win Rate">
                                                <Trophy className="w-3 h-3" />
                                                <span className="text-[10px] font-bold">{s.win_rate?.toFixed(0)}%</span>
                                            </div>
                                        ) : (
                                            <span className="text-[10px] text-zinc-600">-</span>
                                        )}
                                    </div>

                                    {/* Action */}
                                    <div className="col-span-1 text-right">
                                        <a
                                            href={`https://pump.fun/coin/${s.mint}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center justify-center p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                                        >
                                            <ArrowUpRight className="w-4 h-4" />
                                        </a>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {filteredSightings.length === 0 && !isLoading && (
                            <div className="p-12 text-center text-zinc-500 flex flex-col items-center gap-4">
                                <Radar className="w-12 h-12 opacity-20 animate-pulse" />
                                <p>SCANNING GLOBAL STREAMS FOR WHALE ACTIVITY...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
