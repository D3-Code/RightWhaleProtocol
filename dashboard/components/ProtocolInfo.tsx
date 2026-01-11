"use client";

import { motion } from "framer-motion";
import { ArrowRight, Flame, Droplets, Zap, ShieldCheck } from "lucide-react";

export const ProtocolInfo = () => {
    return (
        <div className="relative w-full h-full flex flex-col items-center p-4">
            {/* Background Grid Accent */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>



            {/* 3. MODULES ROW (Bottom) */}
            <div className="flex items-center gap-4 mt-2">
                {/* Module A */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                    whileHover={{ scale: 1.05 }}
                    className="border border-white/10 bg-zinc-900/50 backdrop-blur-sm p-4 rounded-lg flex flex-col items-center gap-2 w-[140px] text-center shadow-lg group hover:border-red-500/50 transition-all relative"
                >
                    <Flame className="w-6 h-6 text-red-500 group-hover:animate-pulse" />
                    <div className="flex flex-col">
                        <span className="text-[8px] text-zinc-500 uppercase font-mono-tech">Module A</span>
                        <span className="text-xs font-bold text-white tracking-widest uppercase">BUYBACK+BURN</span>

                    </div>
                </motion.div>

                {/* Module B */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                    whileHover={{ scale: 1.05 }}
                    className="border border-white/10 bg-zinc-900/50 backdrop-blur-sm p-4 rounded-lg flex flex-col items-center gap-2 w-[140px] text-center shadow-lg group hover:border-blue-500/50 transition-all relative"
                >
                    <Droplets className="w-6 h-6 text-blue-500 group-hover:animate-bounce" />
                    <div className="flex flex-col">
                        <span className="text-[8px] text-zinc-500 uppercase font-mono-tech">Module B</span>
                        <span className="text-xs font-bold text-white tracking-widest uppercase">LIQUIDITY</span>

                    </div>
                </motion.div>

                {/* Module C */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
                    whileHover={{ scale: 1.05 }}
                    className="border border-white/10 bg-zinc-900/50 backdrop-blur-sm p-4 rounded-lg flex flex-col items-center gap-2 w-[140px] text-center shadow-lg group hover:border-emerald-500/50 transition-all relative"
                >
                    <ShieldCheck className="w-6 h-6 text-emerald-500 group-hover:rotate-12 transition-transform" />
                    <div className="flex flex-col">
                        <span className="text-[8px] text-zinc-500 uppercase font-mono-tech">Module C</span>
                        <span className="text-xs font-bold text-white tracking-widest uppercase">REVSHARE</span>

                    </div>
                </motion.div>
            </div>

            {/* Technical Overlay */}
            <div className="absolute top-1/2 right-4 transform -translate-y-1/2 text-[9px] text-zinc-600 font-mono-tech text-right hidden md:block">
                <div>FLOW_RATE: 0.3 SOL / CYCLE</div>
                <div className="text-emerald-500">STATUS: OPTIMIZED</div>
            </div>
        </div>
    );
};
