"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radar, ExternalLink, Target, AlertTriangle, ScanLine } from "lucide-react";

type WhaleSighting = {
    id: number;
    mint: string;
    symbol: string;
    image_uri?: string;
    amount: number;
    wallet: string;
    isBuy: boolean; // 1 or 0 from sqlite
    timestamp: string;
    signal?: {
        grade: string;
    };
    wallet_name?: string;
};

export const RightWhaleRadar = () => {
    const [sightings, setSightings] = useState<WhaleSighting[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const ENGINE_API = process.env.NEXT_PUBLIC_ENGINE_API || "http://localhost:3001";

    const fetchSightings = async () => {
        try {
            // Fetch more items for the dense feed
            const res = await fetch(`${ENGINE_API}/radar?limit=20&t=${Date.now()}`);
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
        const interval = setInterval(fetchSightings, 2000); // Live poll 2s
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full h-full flex flex-col bg-black relative overflow-hidden group">
            {/* Background Radar Sweep Animation */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-20 group-hover:opacity-30 transition-opacity">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_70%)]"></div>
                <div className="absolute top-1/2 left-1/2 w-[200%] h-[200%] -translate-x-1/2 -translate-y-1/2 bg-[conic-gradient(from_0deg,transparent_0deg,rgba(16,185,129,0.1)_60deg,transparent_60deg)] animate-[spin_4s_linear_infinite]"></div>
            </div>

            {/* Grid Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.4)_50%),linear-gradient(90deg,rgba(255,255,255,0.03),rgba(0,0,0,0))] z-1 pointer-events-none bg-[length:100%_3px,20px_100%]"></div>

            {/* Header */}
            <div className="relative z-10 px-4 py-3 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/80 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className="relative flex items-center justify-center w-6 h-6 border border-emerald-500/30 rounded-full bg-emerald-500/5">
                        <ScanLine className="w-3 h-3 text-emerald-500" />
                        <span className="absolute inset-0 rounded-full border border-emerald-500/20 animate-ping"></span>
                    </div>
                    <div>
                        <div className="text-[10px] text-emerald-500 font-black tracking-widest uppercase leading-none mb-0.5">Whale Report Alert System</div>
                        <div className="text-[9px] text-zinc-500 font-mono leading-none">WRAS // ACTIVE</div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <a href="/radar" className="group/btn flex items-center gap-1.5 px-2 py-1 bg-zinc-800 hover:bg-emerald-500/20 border border-zinc-700 hover:border-emerald-500/50 rounded transition-all">
                        <span className="text-[9px] font-bold text-zinc-300 group-hover/btn:text-emerald-500">FULL SCREEN</span>
                        <ExternalLink className="w-2.5 h-2.5 text-zinc-500 group-hover/btn:text-emerald-500" />
                    </a>
                </div>
            </div>

            {/* Dense Feed */}
            <div className="flex-1 overflow-hidden relative z-10">
                <div className="h-full overflow-y-auto no-scrollbar p-1 space-y-0.5">
                    <AnimatePresence mode="popLayout">
                        {sightings.map((s, i) => (
                            <motion.div
                                key={`${s.id}-${s.timestamp}`}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className={`
                                    flex items-center justify-between px-3 py-2 rounded border border-transparent
                                    hover:bg-white/5 hover:border-white/5 transition-colors group/item
                                    ${s.signal?.grade === 'S' ? 'bg-amber-500/10 border-amber-500/20' : ''}
                                `}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className={`w-1 h-8 rounded-full ${s.isBuy ? 'bg-emerald-500' : 'bg-red-500'}`}></div>

                                    <div className="flex flex-col min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-black text-white truncate max-w-[80px]">${s.symbol}</span>
                                            {s.signal?.grade === 'S' && (
                                                <span className="text-[8px] font-bold px-1 rounded bg-amber-500 text-black">S-TIER</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[9px] font-mono text-zinc-500">
                                            <span>{new Date(s.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                                            <span className="w-0.5 h-0.5 bg-zinc-600 rounded-full"></span>
                                            <span className="truncate max-w-[60px]">{s.wallet_name || s.wallet.slice(0, 4)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end shrink-0">
                                    <span className={`text-xs font-bold font-mono ${s.isBuy ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {s.isBuy ? '+' : '-'}{s.amount.toFixed(2)} S
                                    </span>
                                    <a
                                        href={`https://pump.fun/coin/${s.mint}`}
                                        target="_blank"
                                        className="text-[9px] text-zinc-600 hover:text-white transition-colors flex items-center gap-1 opacity-0 group-hover/item:opacity-100"
                                    >
                                        VIEW <ExternalLink className="w-2 h-2" />
                                    </a>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {sightings.length === 0 && !isLoading && (
                        <div className="h-full flex flex-col items-center justify-center text-emerald-500/50 gap-4 mt-8">
                            <div className="relative">
                                <Radar className="w-12 h-12 animate-spin-slow" />
                                <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full animate-pulse"></div>
                            </div>
                            <span className="text-xs font-black tracking-[0.2em] animate-pulse">INITIALIZING FEED...</span>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
};
