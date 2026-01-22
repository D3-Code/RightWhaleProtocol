"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, ExternalLink, TrendingUp, Trophy } from "lucide-react";

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

    const ENGINE_API = process.env.NEXT_PUBLIC_ENGINE_API || "http://localhost:3001";

    const fetchPositions = async () => {
        try {
            const res = await fetch(`${ENGINE_API}/radar/positions?limit=20&t=${Date.now()}`);
            if (res.ok) {
                const data = await res.json();
                setPositions(data);
                setIsLoading(false);
            }
        } catch (e) {
            console.error("Failed to fetch positions");
        }
    };

    useEffect(() => {
        fetchPositions();
        const interval = setInterval(fetchPositions, 5000); // Update every 5 seconds
        return () => clearInterval(interval);
    }, []);

    const getWalletDisplay = (pos: OpenPosition): string => {
        if (pos.twitter_handle) return `@${pos.twitter_handle}`;
        if (pos.wallet_name) return pos.wallet_name;
        return `${pos.wallet.slice(0, 4)}...${pos.wallet.slice(-4)}`;
    };

    return (
        <div className="h-full flex flex-col bg-black/40 border border-zinc-800 rounded-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/50">
                <div className="flex items-center gap-2">
                    <span className="text-xl">💎</span>
                    <h3 className="text-sm font-bold text-white uppercase tracking-tight">Active Positions</h3>
                </div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-widest">
                    {positions.length} Open
                </div>
            </div>

            {/* Positions List */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-2">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center space-y-2">
                            <Clock className="w-8 h-8 opacity-20 animate-pulse mx-auto" />
                            <p className="text-xs text-zinc-600 uppercase tracking-widest">Loading positions...</p>
                        </div>
                    </div>
                ) : positions.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center space-y-2">
                            <TrendingUp className="w-8 h-8 opacity-20 mx-auto" />
                            <p className="text-xs text-zinc-600 uppercase tracking-widest">No active positions</p>
                        </div>
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {positions
                            .filter(pos => pos.hold_minutes >= 2)
                            .sort((a, b) => b.hold_minutes - a.hold_minutes)
                            .map((pos) => (
                                <motion.div
                                    key={pos.id}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 hover:border-zinc-600 transition-all group"
                                >
                                    {/* Whale Highlight (Wallet First) */}
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="font-black text-white text-[13px] truncate uppercase tracking-tight">
                                                    {getWalletDisplay(pos)}
                                                </span>
                                                {pos.reputation_score && pos.reputation_score >= 60 && (
                                                    <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Holding</span>
                                                <span className="text-[10px] font-black text-emerald-400/80">${pos.symbol || 'UNKNOWN'}</span>
                                            </div>
                                        </div>
                                        <a
                                            href={`https://pump.fun/coin/${pos.mint}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="p-1.5 hover:bg-white/10 rounded transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                                        >
                                            <ExternalLink className="w-3 h-3 text-zinc-400 hover:text-white" />
                                        </a>
                                    </div>

                                    {/* Metrics */}
                                    <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-white/5">
                                        <div>
                                            <div className="text-zinc-600 uppercase text-[9px] font-black mb-0.5 tracking-tighter">Volume</div>
                                            <div className="font-bold text-zinc-300">{pos.buy_amount_sol.toFixed(2)}◎</div>
                                        </div>
                                        <div>
                                            <div className="text-zinc-600 uppercase text-[9px] font-black mb-0.5 tracking-tighter">Time</div>
                                            <div className={`font-bold flex items-center gap-1 ${getHoldColor(pos.hold_minutes)}`}>
                                                <span>{formatHoldTime(pos.hold_minutes)}</span>
                                            </div>
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
