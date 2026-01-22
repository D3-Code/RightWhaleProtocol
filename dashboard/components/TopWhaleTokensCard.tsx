"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, ExternalLink, Flame } from "lucide-react";

type TopToken = {
    mint: string;
    symbol: string;
    whale_count: number;
    total_volume_sol: number;
    last_buy: string;
};

export const TopWhaleTokensCard = () => {
    const [tokens, setTokens] = useState<TopToken[]>([]);
    const [timeframe, setTimeframe] = useState<number>(24); // 24h, 168h (7d), or 0 (all)
    const [isLoading, setIsLoading] = useState(true);

    const ENGINE_API = process.env.NEXT_PUBLIC_ENGINE_API || "http://localhost:3001";

    const fetchTopTokens = async () => {
        try {
            const hours = timeframe === 0 ? 999999 : timeframe; // 0 = all time
            const res = await fetch(`${ENGINE_API}/radar/top-tokens?limit=10&hours=${hours}&t=${Date.now()}`);
            if (res.ok) {
                const data = await res.json();
                setTokens(data);
                setIsLoading(false);
            }
        } catch (e) {
            console.error("Failed to fetch top tokens");
        }
    };

    useEffect(() => {
        fetchTopTokens();
        const interval = setInterval(fetchTopTokens, 10000); // Update every 10 seconds
        return () => clearInterval(interval);
    }, [timeframe]);

    const getTimeframeLabel = () => {
        if (timeframe === 24) return "24H";
        if (timeframe === 168) return "7D";
        return "ALL";
    };

    return (
        <div className="bg-black/40 border border-zinc-800 rounded-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/50">
                <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-tight">Top Whale Tokens</h3>
                </div>
                <div className="flex gap-1">
                    {[24, 168, 0].map((hours) => (
                        <button
                            key={hours}
                            onClick={() => setTimeframe(hours)}
                            className={`px-2 py-1 text-[10px] font-bold rounded transition-all ${timeframe === hours
                                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500'
                                    : 'bg-white/5 text-zinc-500 hover:text-zinc-300 border border-transparent'
                                }`}
                        >
                            {hours === 24 ? '24H' : hours === 168 ? '7D' : 'ALL'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tokens List */}
            <div className="p-3 space-y-2 max-h-[400px] overflow-y-auto no-scrollbar">
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <TrendingUp className="w-6 h-6 opacity-20 animate-pulse" />
                    </div>
                ) : tokens.length === 0 ? (
                    <div className="text-center py-8 text-xs text-zinc-600">
                        No tokens found
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {tokens.map((token, index) => (
                            <motion.div
                                key={token.mint}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center justify-between p-2 bg-zinc-900/50 border border-zinc-800 rounded hover:border-zinc-700 transition-all group"
                            >
                                {/* Rank & Symbol */}
                                <div className="flex items-center gap-3 flex-1">
                                    <div className={`text-xs font-bold w-6 text-center ${index === 0 ? 'text-yellow-400' :
                                            index === 1 ? 'text-zinc-400' :
                                                index === 2 ? 'text-orange-600' :
                                                    'text-zinc-600'
                                        }`}>
                                        #{index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold text-white text-sm">${token.symbol}</div>
                                        <div className="text-[10px] text-zinc-500">
                                            {token.whale_count} whale{token.whale_count !== 1 ? 's' : ''}
                                        </div>
                                    </div>
                                </div>

                                {/* Volume */}
                                <div className="text-right mr-2">
                                    <div className="text-xs font-bold text-emerald-400">
                                        {token.total_volume_sol.toFixed(1)} SOL
                                    </div>
                                </div>

                                {/* Link */}
                                <a
                                    href={`https://pump.fun/coin/${token.mint}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1.5 hover:bg-white/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <ExternalLink className="w-3 h-3 text-zinc-400 hover:text-white" />
                                </a>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
};
