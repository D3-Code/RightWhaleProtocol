"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Flame, Droplets, Zap, ShieldCheck, Database } from "lucide-react";

type Reserves = {
    total: number;
    burnPot: number;
    lpPot: number;
    operational: number;
    address: string;
};

export const ProtocolInfo = () => {
    const [reserves, setReserves] = useState<Reserves | null>(null);

    useEffect(() => {
        const fetchReserves = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_ENGINE_API || "http://localhost:3001";
                const res = await fetch(`${apiUrl}/reserves`).catch(() => null);
                if (res && res.ok) {
                    const data = await res.json();
                    setReserves(data);
                }
            } catch (e) {
                console.error(e);
            }
        };

        fetchReserves();
        const interval = setInterval(fetchReserves, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative w-full h-full flex flex-col items-center">
            {/* Background Grid Accent */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>

            {/* 3. MODULES ROW (Bottom) */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 mt-2 w-full md:w-auto px-2">
                {/* Module A */}
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="border border-white/10 bg-zinc-900/50 backdrop-blur-sm p-4 rounded-lg flex flex-col items-center gap-2 w-full md:w-[140px] text-center shadow-lg group hover:border-red-500/50 transition-all relative overflow-hidden"
                >
                    {reserves?.burnPot ? <div className="absolute inset-x-0 bottom-0 h-[2px] bg-red-500/50 animate-pulse" /> : null}
                    <Flame className={`w-6 h-6 text-red-500 ${reserves?.burnPot ? "animate-pulse" : "opacity-50"}`} />
                    <div className="flex flex-col">
                        <span className="text-[8px] text-zinc-500 uppercase font-mono-tech">Module A</span>
                        <span className="text-xs font-bold text-white tracking-widest uppercase">BUYBACK+BURN</span>
                        <div className={`mt-1 text-[10px] font-bold font-mono-tech ${reserves ? "text-red-400" : "text-zinc-600 animate-pulse"}`}>
                            {reserves ? `${reserves.burnPot.toFixed(4)} SOL` : "SYNCING..."}
                        </div>
                    </div>
                </motion.div>

                {/* Module B */}
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="border border-white/10 bg-zinc-900/50 backdrop-blur-sm p-4 rounded-lg flex flex-col items-center gap-2 w-full md:w-[140px] text-center shadow-lg group hover:border-blue-500/50 transition-all relative overflow-hidden"
                >
                    {reserves?.lpPot ? <div className="absolute inset-x-0 bottom-0 h-[2px] bg-blue-500/50 animate-pulse" /> : null}
                    <Droplets className={`w-6 h-6 text-blue-500 ${reserves?.lpPot ? "animate-bounce" : "opacity-50"}`} />
                    <div className="flex flex-col">
                        <span className="text-[8px] text-zinc-500 uppercase font-mono-tech">Module B</span>
                        <span className="text-xs font-bold text-white tracking-widest uppercase">LIQUIDITY</span>
                        <div className={`mt-1 text-[10px] font-bold font-mono-tech ${reserves ? "text-blue-400" : "text-zinc-600 animate-pulse"}`}>
                            {reserves ? `${reserves.lpPot.toFixed(4)} SOL` : "SYNCING..."}
                        </div>
                    </div>
                </motion.div>

                {/* Module C */}
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-sm p-4 rounded-lg flex flex-col items-center gap-2 w-full md:w-[140px] text-center shadow-lg group hover:border-emerald-500/50 transition-all relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-emerald-500/10 animate-pulse-glow pointer-events-none" />
                    <div className="absolute inset-x-0 bottom-0 h-[2px] bg-emerald-500/50 animate-pulse" />
                    <ShieldCheck className="w-6 h-6 text-emerald-500 group-hover:rotate-12 transition-transform" />
                    <div className="flex flex-col">
                        <span className="text-[8px] text-zinc-500 uppercase font-mono-tech text-emerald-500/50">Module C</span>
                        <span className="text-xs font-bold text-white tracking-widest uppercase">REVSHARE</span>
                        <div className="mt-1 text-[10px] font-bold text-emerald-400 font-mono-tech flex items-center justify-center gap-1">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                            </span>
                            ACTIVE
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Technical Footer */}
            <div className="w-full mt-6 pt-4 border-t border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-0 text-[9px] text-zinc-600 font-mono-tech">
                <div className="flex items-center gap-2">
                    <Database className="w-2 h-2 text-orange-500" />
                    <span className="text-zinc-500">RESERVES:</span>
                    <span className="text-white font-bold">{reserves ? `${reserves.total.toFixed(4)} SOL` : "---"}</span>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-emerald-500 uppercase tracking-tighter flex items-center gap-1">
                        <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></span>
                        Fully Automated
                    </div>
                    <div className="text-[7px] opacity-30 uppercase border-l border-white/10 pl-4">
                        RW-V1.1-ALPHA
                    </div>
                </div>
            </div>
        </div>
    );
};

