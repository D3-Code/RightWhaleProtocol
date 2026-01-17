"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, AlertCircle, TrendingUp, ShieldAlert, BookOpen } from "lucide-react";
import { useState } from "react";

export default function GovernancePage() {
    const [activeTab, setActiveTab] = useState('active');

    const proposals = [
        {
            id: 1,
            title: "SCP-001: Aggressive Burn Sequence (EXAMPLE DATA)",
            status: "active",
            type: "STRATEGY",
            votes_for: 65,
            votes_against: 35,
            ends_in: "12h 30m",
            description: "Proposal to temporarily increase the Buy & Burn allocation to 45% for the next 72 hours to counter recent volatility."
        },
        {
            id: 2,
            title: "SCP-002: Liquidity Anchor Adjustment (EXAMPLE DATA)",
            status: "passed",
            type: "PARAMETER",
            votes_for: 92,
            votes_against: 8,
            ends_in: "Ended",
            description: "Adjust the minimum LP depth requirement before triggering auto-injections."
        }
    ];

    return (
        <main className="min-h-screen bg-black text-white selection:bg-purple-500/30">
            <div className="max-w-4xl mx-auto p-4 md:p-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/" className="p-2 rounded-full bg-zinc-900 border border-zinc-800 hover:border-purple-500 transition-colors">
                        <ArrowLeft className="w-5 h-5 text-zinc-400" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600 flex flex-wrap items-center gap-2 md:gap-3">
                            Strategy & Governance
                            <span className="text-[10px] bg-red-500/20 text-red-500 border border-red-500/50 px-2 py-1 rounded-full tracking-normal font-bold whitespace-nowrap">NOT LIVE</span>
                        </h1>
                        <p className="text-xs text-zinc-500 font-mono mt-1">THE COUNCIL OF WHALES // RESTRICTED ACCESS (SIMULATED)</p>
                    </div>
                </div>

                {/* Whale Status Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-xl bg-gradient-to-br from-purple-900/10 to-indigo-900/10 border border-purple-500/20 mb-10 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-3 opacity-20">
                        <ShieldAlert className="w-24 h-24 text-purple-500" />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center">
                        <div className="flex-1">
                            <h2 className="text-lg font-bold text-white mb-2">Voting Power: <span className="text-purple-400">0.00%</span></h2>
                            <p className="text-sm text-zinc-400 max-w-lg mb-4 md:mb-0">
                                Governance is restricted to holders with &gt;0.5% supply. Connecting wallet is currently disabled.
                                <br />
                                <a href="https://t.me/RightWhaleBotChannel" target="_blank" className="inline-flex items-center gap-2 text-purple-400 hover:text-white mt-2 font-bold underline decoration-dotted transition-colors">
                                    <TrendingUp className="w-3 h-3" />
                                    Join the Strategy Discussion on Telegram
                                </a>
                            </p>
                        </div>
                        <button className="px-6 py-3 bg-white/5 border border-purple-500/20 text-zinc-500 cursor-not-allowed rounded font-bold uppercase tracking-wider text-xs transition-all opacity-50">
                            Connect Wallet (Disabled)
                        </button>
                    </div>
                </motion.div>

                {/* Proposals List */}
                <div className="space-y-6">
                    <div className="flex items-center gap-4 border-b border-zinc-900 pb-4">
                        <button className="text-sm font-bold text-white border-b-2 border-purple-500 pb-4 -mb-4.5">Active Proposals</button>
                        <button className="text-sm font-bold text-zinc-600 hover:text-zinc-400 pb-4">Passed</button>
                        <button className="text-sm font-bold text-zinc-600 hover:text-zinc-400 pb-4">Failed</button>
                    </div>

                    {proposals.map((prop) => (
                        <motion.div
                            key={prop.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="group p-5 rounded-lg bg-zinc-900/40 border border-zinc-800 hover:border-purple-500/50 transition-all hover:bg-zinc-900/60"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${prop.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-zinc-800 text-zinc-500 border-zinc-700'}`}>
                                        {prop.status.toUpperCase()}
                                    </span>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-purple-500/10 text-purple-400 border-purple-500/20">
                                        {prop.type}
                                    </span>
                                </div>
                                <span className="text-[10px] font-mono text-zinc-500">Ends: {prop.ends_in}</span>
                            </div>

                            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">{prop.title}</h3>
                            <p className="text-sm text-zinc-400 mb-6">{prop.description}</p>

                            {/* Vote Bar */}
                            <div className="relative h-2 bg-zinc-800 rounded-full overflow-hidden mb-2">
                                <div className="absolute top-0 left-0 h-full bg-emerald-500" style={{ width: `${prop.votes_for}%` }}></div>
                                <div className="absolute top-0 right-0 h-full bg-red-500" style={{ width: `${prop.votes_against}%` }}></div>
                            </div>
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                                <span className="text-emerald-500">For: {prop.votes_for}%</span>
                                <span className="text-red-500">Against: {prop.votes_against}%</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </main>
    );
}
