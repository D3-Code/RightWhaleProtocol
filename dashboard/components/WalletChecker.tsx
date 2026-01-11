"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, Wallet, Coins, History } from "lucide-react";

export const WalletChecker = () => {
    const [address, setAddress] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleCheck = async () => {
        if (!address) return;
        setLoading(true);
        setResult(null);

        // Real API integration pending
        setLoading(false);
        setResult(null);
    };

    return (
        <div className="flex flex-col gap-4 p-6">
            <h2 className="text-sm text-zinc-500 uppercase tracking-widest border-b border-zinc-800 pb-2 flex justify-between items-center">
                <span className="flex items-center gap-2"><Wallet className="w-4 h-4 text-emerald-500" /> PROTOCOL REWARDS SCANNER</span>

            </h2>

            <div className="flex gap-2">
                <input
                    type="text"
                    placeholder="Enter Wallet Address..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="flex-1 bg-zinc-900/50 border border-zinc-700 rounded px-3 py-2 text-xs font-mono-tech text-white focus:outline-none focus:border-orange-500 transition-colors"
                />
                <button
                    onClick={handleCheck}
                    disabled={loading}
                    className="bg-orange-500/10 border border-orange-500/50 text-orange-500 px-4 py-2 rounded text-xs hover:bg-orange-500 hover:text-white transition-colors disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </button>
            </div>

            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col gap-4"
                    >
                        {/* Key Metrics Row */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* RightWhale Balance */}
                            <div className="bg-zinc-900/40 p-4 rounded border border-zinc-800/50 flex flex-col gap-1 group hover:border-orange-500/30 transition-colors">
                                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono-tech">Holds $RightWhale</span>
                                <div className="text-2xl font-bold text-white flex items-baseline gap-1">
                                    {result.balance}
                                    <span className="text-xs text-orange-500 font-normal">$RW</span>
                                </div>
                                <span className="text-[10px] text-zinc-600">≈ $20,250.00 USD</span>
                            </div>

                            {/* Total RevShare */}
                            <div className="bg-zinc-900/40 p-4 rounded border border-zinc-800/50 flex flex-col gap-1 group hover:border-emerald-500/30 transition-colors">
                                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono-tech">Total RevShare</span>
                                <div className="text-2xl font-bold text-white flex items-baseline gap-1">
                                    {result.rewards}
                                    <span className="text-xs text-emerald-500 font-normal">SOL</span>
                                </div>
                                <span className="text-[10px] text-zinc-600">≈ $1,826.02 USD</span>
                            </div>
                        </div>

                        {/* RevShare History List */}
                        <div className="bg-zinc-900/20 rounded border border-zinc-800/50 overflow-hidden">
                            <div className="px-3 py-2 bg-zinc-900/50 border-b border-zinc-800/50 flex justify-between items-center">
                                <span className="text-[10px] text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                                    <History className="w-3 h-3" /> RevShare History
                                </span>
                                <span className="text-[9px] text-zinc-600 font-mono-tech">LATEST PAYOUTS</span>
                            </div>
                            <div className="flex flex-col">
                                {result.history.map((item: any, i: number) => (
                                    <div key={i} className="flex justify-between items-center px-3 py-2 border-b border-zinc-800/30 last:border-0 hover:bg-white/5 transition-colors text-xs font-mono-tech">
                                        <span className="text-zinc-500">{item.date}</span>
                                        <div className="flex items-center gap-3">
                                            <span className="text-emerald-500">{item.amount}</span>
                                            <a href="#" className="text-zinc-600 hover:text-white underline decoration-dotted">[TX]</a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};
