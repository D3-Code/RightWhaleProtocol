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
        <div className="relative w-full h-full flex flex-col items-center p-4">
            {/* Background Grid Accent */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>

            {/* 3. MODULES ROW (Bottom) */}
            <div className="flex items-center gap-4 mt-2">
                {/* Module A */}
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="border border-white/10 bg-zinc-900/50 backdrop-blur-sm p-4 rounded-lg flex flex-col items-center gap-2 w-[140px] text-center shadow-lg group hover:border-red-500/50 transition-all relative"
                >
                    <Flame className="w-6 h-6 text-red-500 group-hover:animate-pulse" />
                    <div className="flex flex-col">
                        <span className="text-[8px] text-zinc-500 uppercase font-mono-tech">Module A</span>
                        <span className="text-xs font-bold text-white tracking-widest uppercase">BUYBACK+BURN</span>
                        <div className="mt-1 text-[10px] font-bold text-red-400 font-mono-tech">
                            {reserves ? `${reserves.burnPot.toFixed(4)} SOL` : "SYNCING..."}
                        </div>
                    </div>
                </motion.div>

                {/* Module B */}
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="border border-white/10 bg-zinc-900/50 backdrop-blur-sm p-4 rounded-lg flex flex-col items-center gap-2 w-[140px] text-center shadow-lg group hover:border-blue-500/50 transition-all relative"
                >
                    <Droplets className="w-6 h-6 text-blue-500 group-hover:animate-bounce" />
                    <div className="flex flex-col">
                        <span className="text-[8px] text-zinc-500 uppercase font-mono-tech">Module B</span>
                        <span className="text-xs font-bold text-white tracking-widest uppercase">LIQUIDITY</span>
                        <div className="mt-1 text-[10px] font-bold text-blue-400 font-mono-tech">
                            {reserves ? `${reserves.lpPot.toFixed(4)} SOL` : "SYNCING..."}
                        </div>
                    </div>
                </motion.div>

                {/* Module C */}
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="border border-white/10 bg-zinc-900/50 backdrop-blur-sm p-4 rounded-lg flex flex-col items-center gap-2 w-[140px] text-center shadow-lg group hover:border-emerald-500/50 transition-all relative"
                >
                    <ShieldCheck className="w-6 h-6 text-emerald-500 group-hover:rotate-12 transition-transform" />
                    <div className="flex flex-col">
                        <span className="text-[8px] text-zinc-500 uppercase font-mono-tech">Module C</span>
                        <span className="text-xs font-bold text-white tracking-widest uppercase">REVSHARE</span>
                        <div className="mt-1 text-[10px] font-bold text-emerald-400 font-mono-tech">
                            ACTIVE
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Technical Overlay */}
            <div className="absolute top-1/2 right-4 transform -translate-y-1/2 text-[9px] text-zinc-600 font-mono-tech text-right hidden md:block">
                <div className="flex items-center gap-1 justify-end">
                    <Database className="w-2 h-2" />
                    RESERVES: {reserves ? `${reserves.total.toFixed(4)} SOL` : "---"}
                </div>
                <div className="text-emerald-500 uppercase">Status: Automated</div>
            </div>
        </div>
    );
};

