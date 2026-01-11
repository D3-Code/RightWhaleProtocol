"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Flame, Droplets, Zap, ShieldCheck, X, Info } from "lucide-react";

type FeatureKey = "buyback" | "liquidity" | "revshare" | null;

const FEATURE_INFO = {
    buyback: {
        title: "BUYBACK + BURN",
        icon: <Flame className="w-8 h-8 text-red-500" />,
        color: "text-red-500",
        borderColor: "border-red-500",
        bgHover: "hover:border-red-500/50",
        description: "The Protocol automatically buys back tokens from the open market using accumulated fees and permanently burns them. This constant deflationary pressure supports the token price and increases scarcity over time."
    },
    liquidity: {
        title: "LIQUIDITY INJECTION",
        icon: <Droplets className="w-8 h-8 text-blue-500" />,
        color: "text-blue-500",
        borderColor: "border-blue-500",
        bgHover: "hover:border-blue-500/50",
        description: "A portion of the fees is directed towards the Liquidity Pool (LP). This deepens market liquidity, ensuring price stability, reducing slippage for traders, and creating a robust, low-volatility trading environment."
    },
    revshare: {
        title: "REVENUE SHARE",
        icon: <ShieldCheck className="w-8 h-8 text-emerald-500" />,
        color: "text-emerald-500",
        borderColor: "border-emerald-500",
        bgHover: "hover:border-emerald-500/50",
        description: "Revenue Share rewards holders directly. Accumulated fees are distributed proportionally to eligible token holders, creating a sustainable passive income stream and incentivizing long-term investment in the protocol."
    }
};

export const ProtocolInfo = () => {
    const [selectedFeature, setSelectedFeature] = useState<FeatureKey>(null);

    return (
        <div className="relative w-full h-full flex flex-col items-center p-4">
            {/* Background Grid Accent */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>

            {/* 3. MODULES ROW (Bottom) */}
            <div className="flex items-center gap-4 mt-2">
                {/* Module A */}
                <motion.div
                    onClick={() => setSelectedFeature("buyback")}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="cursor-pointer border border-white/10 bg-zinc-900/50 backdrop-blur-sm p-4 rounded-lg flex flex-col items-center gap-2 w-[140px] text-center shadow-lg group hover:border-red-500/50 transition-all relative"
                >
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Info className="w-3 h-3 text-zinc-500" />
                    </div>
                    <Flame className="w-6 h-6 text-red-500 group-hover:animate-pulse" />
                    <div className="flex flex-col">
                        <span className="text-[8px] text-zinc-500 uppercase font-mono-tech">Module A</span>
                        <span className="text-xs font-bold text-white tracking-widest uppercase">BUYBACK+BURN</span>
                    </div>
                </motion.div>

                {/* Module B */}
                <motion.div
                    onClick={() => setSelectedFeature("liquidity")}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="cursor-pointer border border-white/10 bg-zinc-900/50 backdrop-blur-sm p-4 rounded-lg flex flex-col items-center gap-2 w-[140px] text-center shadow-lg group hover:border-blue-500/50 transition-all relative"
                >
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Info className="w-3 h-3 text-zinc-500" />
                    </div>
                    <Droplets className="w-6 h-6 text-blue-500 group-hover:animate-bounce" />
                    <div className="flex flex-col">
                        <span className="text-[8px] text-zinc-500 uppercase font-mono-tech">Module B</span>
                        <span className="text-xs font-bold text-white tracking-widest uppercase">LIQUIDITY</span>
                    </div>
                </motion.div>

                {/* Module C */}
                <motion.div
                    onClick={() => setSelectedFeature("revshare")}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="cursor-pointer border border-white/10 bg-zinc-900/50 backdrop-blur-sm p-4 rounded-lg flex flex-col items-center gap-2 w-[140px] text-center shadow-lg group hover:border-emerald-500/50 transition-all relative"
                >
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Info className="w-3 h-3 text-zinc-500" />
                    </div>
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

            {/* POPUP MODAL */}
            <AnimatePresence>
                {selectedFeature && FEATURE_INFO[selectedFeature] && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setSelectedFeature(null)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />

                        {/* Modal Content */}
                        <motion.div
                            layoutId={`feature-${selectedFeature}`} // Optional: for potential layout animations
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className={`relative w-full max-w-md bg-zinc-900 border ${FEATURE_INFO[selectedFeature].borderColor} p-6 rounded-xl shadow-2xl overflow-hidden`}
                        >
                            {/* Background Glow */}
                            <div className={`absolute -top-20 -right-20 w-40 h-40 bg-${FEATURE_INFO[selectedFeature].color.split('-')[1]}-500/20 rounded-full blur-3xl`}></div>

                            <button
                                onClick={() => setSelectedFeature(null)}
                                className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex flex-col gap-4 relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className={`p-3 rounded-lg bg-zinc-950 border border-white/10 ${FEATURE_INFO[selectedFeature].color}`}>
                                        {FEATURE_INFO[selectedFeature].icon}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white tracking-widest">{FEATURE_INFO[selectedFeature].title}</h3>
                                        <span className="text-[10px] text-zinc-500 uppercase font-mono-tech">ENGINE MODULE DETAILS</span>
                                    </div>
                                </div>

                                <div className="h-px w-full bg-zinc-800" />

                                <p className="text-zinc-300 text-sm leading-relaxed">
                                    {FEATURE_INFO[selectedFeature].description}
                                </p>

                                <div className="mt-2 flex justify-end">
                                    <button
                                        onClick={() => setSelectedFeature(null)}
                                        className="text-xs font-mono-tech text-zinc-500 hover:text-white transition-colors flex items-center gap-1"
                                    >
                                        // CLOSE_PANE
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
