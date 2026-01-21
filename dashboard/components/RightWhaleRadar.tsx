"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radar, ExternalLink, Target, AlertTriangle } from "lucide-react";

type WhaleSighting = {
    id: number;
    mint: string;
    symbol: string;
    image_uri?: string;
    amount: number;
    wallet: string;
    isBuy: boolean; // 1 or 0 from sqlite
    timestamp: string;
};

export const RightWhaleRadar = () => {
    const [sightings, setSightings] = useState<WhaleSighting[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const ENGINE_API = process.env.NEXT_PUBLIC_ENGINE_API || "http://localhost:3001";

    const fetchSightings = async () => {
        try {
            // Add timestamp to prevent caching
            const res = await fetch(`${ENGINE_API}/radar?limit=10&t=${Date.now()}`);
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
        <div className="w-full h-full flex flex-col bg-black/40 relative">
            {/* Header */}
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Radar className="w-4 h-4 text-emerald-500 animate-spin-slow" />
                        <span className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping"></span>
                    </div>
                    <span className="text-xs text-white font-mono-tech uppercase tracking-widest font-bold">
                        WRAS - Whale Report Alert System
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[9px] text-emerald-500 uppercase tracking-widest font-bold hidden md:block">LIVE FEED</span>
                    <a href="/radar" className="px-2 py-0.5 bg-white/10 hover:bg-white/20 rounded border border-white/10 text-[9px] text-white flex items-center gap-1 transition-colors">
                        <ExternalLink className="w-2.5 h-2.5" />
                        EXPAND
                    </a>
                </div>
            </div>

            {/* Matrix Feed */}
            <div className="flex-1 overflow-hidden relative p-2 font-mono-tech text-[10px]">
                {/* Scanline Effect */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 pointer-events-none bg-[length:100%_2px,3px_100%] opacity-20"></div>


                <div className="h-full overflow-y-auto no-scrollbar space-y-1">
                    <AnimatePresence mode="popLayout">
                        {sightings.map((s) => (
                            <motion.div
                                key={`${s.id}-${s.timestamp}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0 }}
                                className={`
                                    grid grid-cols-12 gap-2 items-center p-3 rounded-lg border-l-4
                                    ${s.isBuy
                                        ? 'bg-emerald-500/10 border-emerald-500'
                                        : 'bg-red-500/10 border-red-500'
                                    } group hover:bg-white/10 transition-all
                                `}
                            >
                                {/* BUY/SELL Badge */}
                                <div className="col-span-3 flex items-center gap-2">
                                    <div className={`px-2 py-1 rounded-md font-bold text-xs ${s.isBuy
                                        ? 'bg-emerald-500 text-black'
                                        : 'bg-red-500 text-white'
                                        }`}>
                                        {s.isBuy ? '🟢 BUY' : '🔴 SELL'}
                                    </div>
                                </div>

                                {/* Token Symbol - Larger */}
                                <div className="col-span-5 flex items-center gap-2">
                                    {s.image_uri ? (
                                        <img
                                            src={s.image_uri}
                                            alt={s.symbol}
                                            className="w-6 h-6 rounded-full border border-zinc-700"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                            }}
                                        />
                                    ) : null}
                                    <Target className={`w-4 h-4 text-zinc-400 ${s.image_uri ? 'hidden' : ''}`} />
                                    <span className="font-bold text-white text-base truncate">${s.symbol || 'UNKNOWN'}</span>
                                </div>

                                {/* Amount - Larger */}
                                <div className="col-span-4 flex items-center justify-end gap-2">
                                    <span className={`font-bold text-base ${s.isBuy ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {s.amount.toFixed(1)} SOL
                                    </span>
                                    <a
                                        href={`https://pump.fun/coin/${s.mint}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="p-1.5 hover:bg-white/20 rounded cursor-pointer transition-colors"
                                    >
                                        <ExternalLink className="w-3.5 h-3.5 text-zinc-400 hover:text-white" />
                                    </a>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {sightings.length === 0 && !isLoading && (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-600 gap-2 opacity-50">
                            <Radar className="w-8 h-8 opacity-20" />
                            <span>SCANNING PUMP.FUN...</span>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
};
