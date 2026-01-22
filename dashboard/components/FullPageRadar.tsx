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
    is_dev?: boolean;
    amount: number;
    token_amount?: number;
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
    song_tag?: string;
    whale_consensus?: number;
    market_cap?: number; // Added for filtering
    pod_reputation_sum?: number;
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
    max_win_sol?: number;
    alpha_score?: number;
};

export const FullPageRadar = () => {
    const [sightings, setSightings] = useState<WhaleSighting[]>([]);
    const [topWhales, setTopWhales] = useState<TopWhale[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [onlySmartMoney, setOnlySmartMoney] = useState(false);
    const [verifiedOnly, setVerifiedOnly] = useState(false); // Default: show all whales
    const [verifiedOnly, setVerifiedOnly] = useState(false); // Default: show all whales
    const [lastAlertId, setLastAlertId] = useState<number | null>(null);

    const ENGINE_API = process.env.NEXT_PUBLIC_ENGINE_API || "http://localhost:3001";
    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001";

    const playAlert = (grade: string) => {
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            // Higher pitch for ALPHA/S-grade
            let frequency = 440;
            if (grade === 'S') frequency = 880;
            if (grade === 'ALPHA') frequency = 1320; // Piercing high for ripples

            osc.frequency.setValueAtTime(frequency, ctx.currentTime);
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
                        const isAlphaSighting = (topSighting.reputation_score || 0) >= 70 && topSighting.whale_consensus <= 1;

                        if (isAlphaSighting) {
                            // Salinity Sensor: Special high-pitched alert for early alpha ripples
                            playAlert('ALPHA');
                        } else if (grade === 'S' || grade === 'A') {
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
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Initial Fetch
        fetchSightings();

        // WebSocket Connection
        const ws = new WebSocket(WS_URL);

        ws.onopen = () => {
            console.log('📡 Connected to Radar Stream');
        };

        ws.onmessage = (event) => {
            try {
                const payload = JSON.parse(event.data);
                if (payload.type === 'whale-sighting') {
                    const newSighting = payload.data;

                    // Play Alert
                    const grade = newSighting.signal?.grade;
                    const isAlphaSighting = (newSighting.reputation_score || 0) >= 70 && newSighting.whale_consensus <= 1;

                    if (isAlphaSighting) {
                        playAlert('ALPHA');
                    } else if (grade === 'S' || grade === 'A') {
                        playAlert(grade);
                    }

                    setSightings(prev => {
                        // Prevent duplicates
                        if (prev.find(s => s.id === newSighting.id)) return prev;
                        return [newSighting, ...prev].slice(0, 50);
                    });
                }
            } catch (e) {
                console.error('WS Parse Error', e);
            }
        };

        return () => {
            ws.close();
        };
    }, []); // Run once on mount

    useEffect(() => {
        fetchSightings(); // Re-fetch when filter changes
    }, [verifiedOnly]);

    const filteredSightings = sightings.filter(s => {
        // 1. Verified Filter
        if (verifiedOnly && (s.reputation_score || 0) < 60) return false;
        // 2. Smart Money Filter
        if (onlySmartMoney && ((s.reputation_score || 0) < 60 && (s.win_rate || 0) <= 50)) return false;

        return true;
    });



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
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-xs font-bold text-emerald-500">REALTIME FEED</span>
                    </div>
                    <div className="text-right hidden md:block">
                        <p className="text-xs text-zinc-500">SYSTEM TIME</p>
                        <p className="text-sm font-bold text-zinc-300">{new Date().toLocaleTimeString()}</p>
                    </div>
                </div>
            </header>

            {/* Toolbar */}
            <div className="sticky top-[85px] flex items-center justify-between px-6 py-3 border-b border-zinc-800 bg-black/60 backdrop-blur-md z-40">
                <div className="flex gap-2 max-w-[1800px] mx-auto w-full items-center">
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



                    <div className="ml-auto text-[10px] text-zinc-600 uppercase tracking-widest">
                        Displaying last 50 sightings
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 w-full max-w-[1800px] mx-auto p-6 z-10">

                {/* Top 5 Whales - Compact Hero Strip */}
                {topWhales.length > 0 && (
                    <div className="mb-6 px-6 py-4 rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-md shadow-lg overflow-x-auto no-scrollbar">
                        <div className="flex items-center gap-8 min-w-max">
                            <div className="flex items-center gap-2 pr-8 border-r border-zinc-800">
                                <Trophy className="w-5 h-5 text-amber-500" />
                                <span className="text-xs font-black text-white uppercase tracking-widest whitespace-nowrap">Elite Leaderboard</span>
                            </div>
                            {topWhales.map((whale, index) => (
                                <div key={whale.address} className="flex items-center gap-4 group">
                                    <span className="text-lg font-black text-zinc-600 group-hover:text-amber-500 transition-colors">0{index + 1}</span>
                                    <div className="flex flex-col">
                                        <div className="text-xs font-bold text-white uppercase flex items-center gap-1.5 min-w-[120px]">
                                            {whale.twitter_handle ? `@${whale.twitter_handle}` : whale.wallet_name || `${whale.address.slice(0, 4)}...${whale.address.slice(-4)}`}
                                            {index === 0 && <span className="text-xs">👑</span>}
                                        </div>
                                        <div className="flex gap-3 text-[9px] font-bold">
                                            <span className="text-emerald-500">{whale.win_rate?.toFixed(0)}% WR</span>
                                            <span className="text-amber-500">+{whale.total_profit_sol?.toFixed(1)} SOL</span>
                                            {whale.max_win_sol && whale.max_win_sol > 0 && (
                                                <span className="text-purple-400">🌊 DEPTH: {whale.max_win_sol.toFixed(0)}S</span>
                                            )}
                                        </div>
                                    </div>
                                    {index < topWhales.length - 1 && <div className="ml-4 w-1 h-1 bg-zinc-800 rounded-full"></div>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 3-Column Command Center Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start h-[calc(100vh-220px)]">

                    {/* Left Column: Trending Assets (Column Span 3) */}
                    <div className="lg:col-span-3 flex flex-col h-full bg-zinc-900/30 border border-zinc-800/50 rounded-xl overflow-hidden shadow-xl backdrop-blur-sm">
                        <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-orange-500" />
                                <h3 className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.2em]">Trending Intelligence</h3>
                            </div>
                            <span className="px-2 py-0.5 bg-orange-500/10 text-orange-500 border border-orange-500/20 rounded text-[9px] font-bold">HOT</span>
                        </div>
                        <div className="flex-1 overflow-y-auto no-scrollbar p-2">
                            <TopWhaleTokensCard />
                        </div>
                    </div>

                    {/* Center Column: Live Whale Feed (Column Span 6) */}
                    <div className="lg:col-span-6 flex flex-col h-full border border-zinc-800 bg-black/40 rounded-xl overflow-hidden shadow-2xl backdrop-blur-sm relative group">
                        {/* Table Header (Pinned) */}
                        <div className="grid grid-cols-12 gap-3 px-6 py-4 text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em] border-b border-white/5 bg-zinc-900/80 sticky top-0 z-20 backdrop-blur-md">
                            <div className="col-span-1">Time</div>
                            <div className="col-span-3">Token</div>
                            <div className="col-span-1">Sol</div>
                            <div className="col-span-3">Wallet</div>
                            <div className="col-span-2">Impact</div>
                            <div className="col-span-1 text-center">Score</div>
                            <div className="col-span-1 text-right">Pump</div>
                        </div>

                        {/* Table Body - Independent Scroll */}
                        <div className="flex-1 overflow-y-auto no-scrollbar p-1 space-y-1">
                            <AnimatePresence mode="popLayout">
                                {filteredSightings.map((s) => (
                                    <motion.div
                                        key={`${s.id}-${s.timestamp}`}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className={`
                                            grid grid-cols-12 gap-3 px-6 py-3.5 items-center rounded-lg border-l-4
                                            ${s.isBuy
                                                ? 'bg-emerald-500/[0.015] border-emerald-500/60 hover:bg-emerald-500/[0.04]'
                                                : 'bg-red-500/[0.015] border-red-500/60 hover:bg-red-500/[0.04]'
                                            } transition-all border-y border-r border-transparent hover:border-white/5 group relative
                                            ${s.whale_consensus && s.whale_consensus >= 5 ? 'ring-1 ring-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)]' : ''}
                                        `}
                                    >
                                        {/* Pod Pulse Indicator */}
                                        {s.whale_consensus && s.whale_consensus >= 3 && (
                                            <div className="absolute -left-[2px] top-0 bottom-0 w-1 bg-emerald-500 animate-pulse z-10 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                        )}
                                        <div className="col-span-1 text-zinc-500 text-[10px] font-bold font-mono">
                                            {new Date(s.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                        </div>

                                        <div className="col-span-3 flex items-center gap-3 min-w-0">
                                            <div className="relative shrink-0">
                                                {s.image_uri ? (
                                                    <img
                                                        src={s.image_uri}
                                                        alt={s.symbol}
                                                        className="w-7 h-7 rounded-full border border-zinc-800 shadow-sm"
                                                        onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
                                                    />
                                                ) : null}
                                                <div className={`w-7 h-7 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800 ${s.image_uri ? 'hidden' : ''}`}>
                                                    <Target className="w-3.5 h-3.5 text-zinc-600" />
                                                </div>
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-[13px] font-black text-white truncate uppercase tracking-tight">{s.symbol || '---'}</span>
                                                <span className="text-[8px] text-zinc-600 font-mono truncate max-w-[80px]">{s.mint}</span>
                                            </div>
                                        </div>

                                        <div className="col-span-1">
                                            <span className={`text-[13px] font-black ${s.isBuy ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {s.amount.toFixed(1)} SOL
                                            </span>
                                        </div>

                                        <div className="col-span-3 flex items-center gap-2 min-w-0">
                                            <div className="truncate flex-1 flex items-center gap-1.5">
                                                <span className="text-[11px] font-bold text-zinc-400 truncate block">
                                                    {s.wallet_name || `${s.wallet.slice(0, 4)}...${s.wallet.slice(-4)}`}
                                                </span>
                                                {s.is_dev && (
                                                    <span className="px-1 py-0.5 bg-red-500/10 border border-red-500/20 rounded text-[8px] font-black text-red-500 uppercase tracking-tighter shrink-0">DEV</span>
                                                )}
                                            </div>
                                            {(s.reputation_score || 0) >= 60 && (
                                                <Trophy className="w-3.5 h-3.5 text-amber-500/80 shrink-0" />
                                            )}
                                        </div>

                                        <div className="col-span-2">
                                            {s.song_tag ? (
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] font-black text-amber-400/90 animate-pulse tracking-tight whitespace-nowrap">
                                                        {s.song_tag}
                                                    </span>
                                                    {s.whale_consensus && s.whale_consensus >= 3 && (
                                                        <div className="flex items-center gap-1 text-[8px] font-bold text-emerald-500/80 uppercase">
                                                            <Activity className="w-2 h-2" />
                                                            Pod Active
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (s.avg_impact_buyers || 0) > 0 ? (
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center gap-1 text-[10px] font-bold text-purple-400/80">
                                                        <Users className="w-3 h-3" />
                                                        {s.avg_impact_buyers}
                                                    </div>
                                                    <div className="flex items-center gap-1 text-[10px] font-bold text-blue-400/80">
                                                        <Activity className="w-3 h-3" />
                                                        {s.avg_impact_volume?.toFixed(1)} SOL
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] text-zinc-800 font-black">SYSTEM_IDLE</span>
                                            )}
                                        </div>

                                        <div className="col-span-1 text-center font-black text-zinc-500 text-[11px]">
                                            {s.signal?.score || 0}%
                                        </div>

                                        <div className="col-span-1 text-right">
                                            <a
                                                href={`https://pump.fun/coin/${s.mint}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center justify-center gap-1.5 px-3 py-1 bg-[#10B981]/10 hover:bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30 rounded-full transition-all group/pump"
                                            >
                                                <span className="text-[10px] font-black tracking-tighter">PUMP</span>
                                                <ExternalLink className="w-2.5 h-2.5 group-hover/pump:translate-x-0.5 group-hover/pump:-translate-y-0.5 transition-transform" />
                                            </a>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Right Column: Active Whale Positions (Column Span 3) */}
                    <div className="lg:col-span-3 flex flex-col h-full bg-zinc-900/30 border border-zinc-800/50 rounded-xl overflow-hidden shadow-xl backdrop-blur-sm">
                        <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-emerald-500" />
                                <h3 className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.2em]">Live Smart Positions</h3>
                            </div>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 rounded border border-emerald-500/20">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                <span className="text-[9px] font-bold text-emerald-500 uppercase">ACTIVE</span>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto no-scrollbar">
                            <ActivePositionsCard />
                        </div>
                    </div>
                </div>
            </main >
        </div >
    );
};
