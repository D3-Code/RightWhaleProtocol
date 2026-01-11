"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Flame, Droplets, Zap, ShieldCheck, X } from "lucide-react";

export const ProtocolInfo = () => {
    const [activeModal, setActiveModal] = useState<string | null>(null);

    const modalContent = {
        buyback: {
            title: "BUYBACK + BURN",
            description: "Auto Market Buy & Burn.",
            details: "Deflation reduces supply and increases scarcity. 30% of fees go directly to buying back token from the open market and burning it forever. This mechanism constantly counteracts inflation and rewards long-term holders.",
            icon: Flame,
            color: "text-red-500",
            border: "border-red-500/50"
        },
        liquidity: {
            title: "LIQUIDITY INJECTION",
            description: "Auto-LP Injection.",
            details: "Swap 50% -> Pair -> Inject Liquidity. 30% of fees are used to permanently raise the price floor by adding to the liquidity pool. This deepens market depth and reduces volatility over time.",
            icon: Droplets,
            color: "text-blue-500",
            border: "border-blue-500/50"
        },
        revshare: {
            title: "REVENUE SHARE",
            description: "Holder Rewards.",
            details: "Rewards are distributed to holders. 30% of fees are known as Protocol Dividends and are distributed proportionally to all token holders. The more you hold, the more you earn from every transaction volume spike.",
            icon: ShieldCheck,
            color: "text-emerald-500",
            border: "border-emerald-500/50"
        }
    };

    return (
        <div className="relative w-full h-full flex flex-col items-center p-4">
            {/* Background Grid Accent */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>

            {/* 3. MODULES ROW (Bottom) */}
            <div className="flex items-center gap-4 mt-2">
                {/* Module A */}
                <motion.button
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveModal('buyback')}
                    className="border border-white/10 bg-zinc-900/50 backdrop-blur-sm p-4 rounded-lg flex flex-col items-center gap-2 w-[140px] text-center shadow-lg group hover:border-red-500/50 transition-all relative cursor-pointer"
                >
                    <Flame className="w-6 h-6 text-red-500 group-hover:animate-pulse" />
                    <div className="flex flex-col">
                        <span className="text-[8px] text-zinc-500 uppercase font-mono-tech">Module A</span>
                        <span className="text-xs font-bold text-white tracking-widest uppercase">BUYBACK+BURN</span>
                    </div>
                </motion.button>

                {/* Module B */}
                <motion.button
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveModal('liquidity')}
                    className="border border-white/10 bg-zinc-900/50 backdrop-blur-sm p-4 rounded-lg flex flex-col items-center gap-2 w-[140px] text-center shadow-lg group hover:border-blue-500/50 transition-all relative cursor-pointer"
                >
                    <Droplets className="w-6 h-6 text-blue-500 group-hover:animate-bounce" />
                    <div className="flex flex-col">
                        <span className="text-[8px] text-zinc-500 uppercase font-mono-tech">Module B</span>
                        <span className="text-xs font-bold text-white tracking-widest uppercase">LIQUIDITY</span>

                    </div>
                </motion.button>

                {/* Module C */}
                <motion.button
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveModal('revshare')}
                    className="border border-white/10 bg-zinc-900/50 backdrop-blur-sm p-4 rounded-lg flex flex-col items-center gap-2 w-[140px] text-center shadow-lg group hover:border-emerald-500/50 transition-all relative cursor-pointer"
                >
                    <ShieldCheck className="w-6 h-6 text-emerald-500 group-hover:rotate-12 transition-transform" />
                    <div className="flex flex-col">
                        <span className="text-[8px] text-zinc-500 uppercase font-mono-tech">Module C</span>
                        <span className="text-xs font-bold text-white tracking-widest uppercase">REVSHARE</span>
                    </div>
                </motion.button>
            </div>

            {/* Technical Overlay */}
            <div className="absolute top-1/2 right-4 transform -translate-y-1/2 text-[9px] text-zinc-600 font-mono-tech text-right hidden md:block">
                <div>FLOW_RATE: 0.3 SOL / CYCLE</div>
                <div className="text-emerald-500">STATUS: OPTIMIZED</div>
            </div>

            {/* MODAL OVERLAY */}
            <AnimatePresence>
                {activeModal && (() => {
                    // @ts-ignore - TS might complain about indexing with string, but keys are safe here
                    const content = modalContent[activeModal as keyof typeof modalContent];
                    const Icon = content.icon;

                    return (
                        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
                            {/* Backdrop */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setActiveModal(null)}
                                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            />

                            {/* Modal Card */}
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className={`relative bg-zinc-900 border ${content.border} p-6 rounded-xl max-w-md w-full shadow-2xl overflow-hidden`}
                            >
                                {/* Grid Background inside modal */}
                                <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>

                                <button
                                    onClick={() => setActiveModal(null)}
                                    className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <div className="flex flex-col items-center text-center gap-4 relative z-10">
                                    <div className={`p-4 rounded-full bg-zinc-950/50 border ${content.border} mb-2`}>
                                        <Icon className={`w-10 h-10 ${content.color}`} />
                                    </div>

                                    <div className="space-y-1">
                                        <h3 className={`text-xl font-black tracking-tighter text-white uppercase`}>{content.title}</h3>
                                        <p className={`text-xs font-bold ${content.color} uppercase tracking-widest`}>{content.description}</p>
                                    </div>

                                    <div className="h-px w-full bg-zinc-800 my-2" />

                                    <p className="text-zinc-400 text-sm leading-relaxed">
                                        {content.details}
                                    </p>

                                    <div className="w-full mt-4 p-3 bg-zinc-950/50 rounded border border-zinc-800/50">
                                        <div className="flex justify-between text-[10px] uppercase tracking-widest text-zinc-600 font-mono-tech">
                                            <span>System ID</span>
                                            <span>Active</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    );
                })()}
            </AnimatePresence>
        </div>
    );
};
