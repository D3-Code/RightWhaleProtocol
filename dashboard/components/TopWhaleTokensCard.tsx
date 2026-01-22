"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, ExternalLink, Flame } from "lucide-react";

type TopToken = {
    mint: string;
    symbol: string;
    image_uri?: string;
    whale_count: number;
    total_volume_sol: number;
    last_buy: string;
    market_cap: number;
    holders_count: number;
};

export const TopWhaleTokensCard = () => {
    const [tokens, setTokens] = useState<TopToken[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const ENGINE_API = process.env.NEXT_PUBLIC_ENGINE_API || "http://localhost:3001";

    const fetchTopTokens = async () => {
        try {
            const res = await fetch(`${ENGINE_API}/radar/top-tokens?limit=10&hours=24&verifiedOnly=false&t=${Date.now()}`);
            if (res.ok) {
                const data = await res.json();
                setTokens(data);
            }
        } catch (e) {
            console.error("Failed to fetch top tokens");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setIsLoading(true);
        fetchTopTokens();
        const interval = setInterval(fetchTopTokens, 10000); // Update every 10 seconds
        return () => clearInterval(interval);
    }, []);



    return (
        <div className="bg-black/40 border border-zinc-800 rounded-lg overflow-hidden flex flex-col h-full">
            {/* Header */}
            <div className="flex flex-col gap-2 px-4 py-3 border-b border-zinc-800 bg-zinc-900/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Flame className="w-4 h-4 text-orange-500" />
                        <h3 className="text-sm font-bold text-white uppercase tracking-tight">Top Whale Tokens</h3>
                        <div className="flex items-center gap-1.5">
                            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                                <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></span>
                                <span className="text-[8px] font-black text-emerald-500 uppercase tracking-tighter">Elite Consensus</span>
                            </div>
                            <div className="px-1.5 py-0.5 bg-orange-500/10 border border-orange-500/20 rounded-md">
                                <span className="text-[8px] font-black text-orange-500 uppercase tracking-tighter">24H</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tokens List */}
            <div className="p-3 space-y-2 overflow-y-auto no-scrollbar flex-1">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="flex flex-col items-center gap-2">
                            <TrendingUp className="w-8 h-8 text-zinc-800 animate-pulse" />
                            <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Scanning Chain...</span>
                        </div>
                    </div>
                ) : tokens.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] animate-pulse">Scanning Chains</div>
                        <div className="text-[8px] text-zinc-600 mt-2 uppercase tracking-widest">Awaiting Whale Consensus</div>
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
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className={`text-xs font-bold w-6 text-center ${index === 0 ? 'text-yellow-400' :
                                        index === 1 ? 'text-zinc-400' :
                                            index === 2 ? 'text-orange-600' :
                                                'text-zinc-600'
                                        }`}>
                                        #{index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <div className="font-bold text-white text-sm truncate">${token.symbol}</div>
                                            {token.market_cap > 0 && (
                                                <div className="text-[9px] font-bold px-1.5 py-0.5 bg-zinc-800 text-zinc-400 rounded shrink-0">
                                                    MC: {Math.round(token.market_cap).toLocaleString()} S
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <div className="text-[10px] text-zinc-500 shrink-0">
                                                {token.whale_count} sighted
                                            </div>
                                            <div className="w-1 h-1 bg-zinc-800 rounded-full shrink-0"></div>
                                            <div className="text-[10px] font-black text-emerald-500/80 truncate">
                                                {token.holders_count} {token.holders_count === 1 ? 'Whale' : 'Whales'} Holding
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Volume */}
                                <div className="text-right mr-2 shrink-0">
                                    <div className="text-xs font-black text-emerald-400 flex flex-col items-end">
                                        <span>{token.total_volume_sol.toFixed(1)} SOL</span>
                                        <span className="text-[8px] text-zinc-600 uppercase">Volume</span>
                                    </div>
                                </div>

                                {/* Link */}
                                <a
                                    href={`https://pump.fun/coin/${token.mint}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1.5 hover:bg-white/10 rounded transition-colors opacity-0 group-hover:opacity-100 shrink-0"
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
