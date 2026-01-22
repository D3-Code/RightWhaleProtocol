"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, ExternalLink, TrendingUp, Trophy, Users, Activity } from "lucide-react";

type OpenPosition = {
    id: number;
    wallet: string;
    mint: string;
    symbol?: string;
    buy_amount_sol: number;
    buy_timestamp: string;
    status: string;
    hold_minutes: number;
    wallet_name?: string;
    twitter_handle?: string;
    reputation_score?: number;
    win_rate?: number;
    impact_volume?: number;
    impact_buyers?: number;
};

const formatHoldTime = (minutes: number): string => {
    if (minutes < 60) {
        return `${Math.floor(minutes)}m`;
    } else if (minutes < 1440) { // < 24 hours
        const hours = Math.floor(minutes / 60);
        const mins = Math.floor(minutes % 60);
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    } else {
        const days = Math.floor(minutes / 1440);
        const hours = Math.floor((minutes % 1440) / 60);
        return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
    }
};

const getHoldColor = (minutes: number): string => {
    if (minutes < 60) return 'text-emerald-400'; // Fresh (< 1 hour)
    if (minutes < 360) return 'text-yellow-400'; // Holding (1-6 hours)
    return 'text-red-400'; // Diamond hands (> 6 hours)
};

const getHoldEmoji = (minutes: number): string => {
    if (minutes < 60) return '🟢';
    if (minutes < 360) return '🟡';
    return '💎'; // Diamond hands
};

export const ActivePositionsCard = () => {
    const [positions, setPositions] = useState<OpenPosition[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Use hardcoded tunnel for reliability if env is missing
    const ENGINE_API = process.env.NEXT_PUBLIC_ENGINE_API || "https://da14aa08cf9bd5.lhr.life";

    const fetchPositions = async () => {
        try {
            const res = await fetch(`${ENGINE_API}/radar/positions?limit=50&t=${Date.now()}`);
            if (res.ok) {
                const data = await res.json();
                setPositions(data);
            }
        } catch (e) {
            console.error("Failed to fetch positions");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPositions();
        const interval = setInterval(fetchPositions, 5000);
        return () => clearInterval(interval);
    }, []);

    const getWalletDisplay = (pos: OpenPosition): string => {
        if (pos.twitter_handle) return `@${pos.twitter_handle}`;
        if (pos.wallet_name) return pos.wallet_name;
        return `${pos.wallet.slice(0, 4)}...${pos.wallet.slice(-4)}`;
    };

    // Apply the user's business rules: min 2m hold and sort by time desc
    const filteredPositions = positions
        .filter(pos => pos.hold_minutes >= 2)
        .sort((a, b) => b.hold_minutes - a.hold_minutes);

    return (
        <div className="h-full flex flex-col bg-black/20 rounded-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-900 bg-zinc-900/40">
                <div className="flex items-center gap-2">
                    <span className="text-xl">💎</span>
                    <h3 className="text-xs font-black text-white uppercase tracking-tighter">Active Positions</h3>
                </div>
                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                    {filteredPositions.length} TRACKING
                </div>
            </div>

            {/* Positions List */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-2">
                {isLoading ? (
                    <div className="flex items-center justify-center p-12">
                        <div className="text-center space-y-3">
                            <Clock className="w-8 h-8 text-zinc-800 animate-pulse mx-auto" />
                            <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.2em]">Syncing Intelligence...</p>
                        </div>
                    </div>
                ) : filteredPositions.length === 0 ? (
                    <div className="flex items-center justify-center p-12 bg-white/[0.01] rounded-xl border border-dashed border-zinc-800/50">
                        <div className="text-center space-y-4">
                            <TrendingUp className="w-10 h-10 text-zinc-800 mx-auto opacity-30" />
                            <div className="space-y-1">
                                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em]">No Long-Term Holds</p>
                                <p className="text-[9px] text-zinc-700 font-bold uppercase tracking-widest">Min hold requirement: 2.0m</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {filteredPositions.map((pos) => (
                            <motion.div
                                key={pos.id}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="bg-zinc-900/60 border border-zinc-800/80 rounded-lg p-3 hover:border-emerald-500/30 transition-all group shadow-lg"
                            >
                                {/* Whale Highlight (Wallet First) */}
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="font-black text-white text-[13px] truncate uppercase tracking-tight">
                                                {getWalletDisplay(pos)}
                                            </span>
                                            {pos.reputation_score && pos.reputation_score >= 60 && (
                                                <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0 filter drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]" />
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Holding</span>
                                            <span className="text-[10px] font-black text-emerald-400 group-hover:text-emerald-300 transition-colors">${pos.symbol || 'UNKNOWN'}</span>
                                        </div>
                                    </div>
                                    <a
                                        href={`https://pump.fun/coin/${pos.mint}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="p-1.5 bg-white/5 hover:bg-white/10 rounded transition-all opacity-0 group-hover:opacity-100 shrink-0 border border-white/5"
                                    >
                                        <ExternalLink className="w-3 h-3 text-zinc-400" />
                                    </a>
                                </div>

                                {/* Metrics */}
                                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-white/5 mb-2">
                                    <div>
                                        <div className="text-zinc-600 uppercase text-[8px] font-black mb-0.5 tracking-tighter">Position Size</div>
                                        <div className="font-black text-zinc-300 text-[11px]">{pos.buy_amount_sol.toFixed(2)} SOL</div>
                                    </div>
                                    <div>
                                        <div className="text-zinc-600 uppercase text-[8px] font-black mb-0.5 tracking-tighter">Time Held</div>
                                        <div className={`font-black flex items-center gap-1 text-[11px] ${getHoldColor(pos.hold_minutes)}`}>
                                            <span>{formatHoldTime(pos.hold_minutes)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Impact (Live Flow) */}
                                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                                    <div className="text-zinc-600 uppercase text-[8px] font-black tracking-tighter underline decoration-zinc-800 underline-offset-2">Live Impact Flow</div>
                                    <div className="flex flex-col items-end gap-0.5">
                                        {(pos.impact_buyers || 0) > 0 ? (
                                            <>
                                                <div className="flex items-center gap-1 text-[9px] font-black text-purple-400">
                                                    <Users className="w-2.5 h-2.5" />
                                                    {pos.impact_buyers}
                                                </div>
                                                <div className="flex items-center gap-1 text-[9px] font-black text-blue-400">
                                                    <Activity className="w-2.5 h-2.5" />
                                                    {pos.impact_volume?.toFixed(1)} SOL
                                                </div>
                                            </>
                                        ) : (
                                            <span className="text-[8px] text-zinc-700 font-black uppercase tracking-widest">Awaiting Alpha</span>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
};
