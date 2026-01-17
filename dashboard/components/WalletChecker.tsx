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

        // Simulate API delay
        setTimeout(() => {
            setLoading(false);
            setResult({
                status: "ELIGIBLE",
                tier: "EARLY ADOPTER",
                message: "Wallet verified for protocol launch."
            });
        }, 1500);
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
                        <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-emerald-500/80 uppercase tracking-widest font-bold">STATUS</span>
                                <span className="text-xl font-black text-emerald-400">✅ {result.status}</span>
                            </div>
                            <div className="flex flex-col text-right">
                                <span className="text-[10px] text-zinc-500 uppercase tracking-widest">TIER</span>
                                <span className="text-sm font-bold text-white">{result.tier}</span>
                            </div>
                        </div>

                        <div className="text-xs text-zinc-500 font-mono text-center">
                            {result.message}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};
