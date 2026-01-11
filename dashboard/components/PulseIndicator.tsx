"use client";

import { motion } from "framer-motion";

export const PulseIndicator = () => {
    return (
        <div className="flex items-center gap-3 bg-zinc-900/50 px-3 py-1.5 rounded border border-zinc-800">
            {/* Radar Ring */}
            <div className="relative flex h-4 w-4 items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute h-full w-full rounded-full border-t border-r border-transparent border-t-green-500 border-r-green-500 opacity-80"
                />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></span>
            </div>
            <span className="text-[10px] font-mono-tech text-green-500 tracking-widest">SYSTEM ONLINE</span>
        </div>
    );
};
