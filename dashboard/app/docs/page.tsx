"use client";

import Link from "next/link";
import { ArrowLeft, Book, Cpu, Layers, Milestone, Activity, Brain, Heart, Hand, Zap, Terminal, RotateCw } from "lucide-react";
import { motion } from "framer-motion";

export default function DocumentationPage() {
    return (
        <main className="min-h-screen bg-black p-4 md:p-8 text-white font-mono-tech selection:bg-orange-500/30 relative">
            {/* Background Elements */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[100px] opacity-30"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] opacity-30"></div>
            </div>

            <div className="max-w-4xl mx-auto relative z-10">
                {/* Navigation */}
                <div className="mb-8">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-zinc-500 hover:text-orange-500 transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm uppercase tracking-widest font-bold">Return to Dashboard</span>
                    </Link>
                </div>

                {/* Header */}
                <header className="mb-12 border-b border-zinc-800 pb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                            <Book className="w-8 h-8 text-orange-500" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-1">
                                SYSTEM DOCUMENTATION
                            </h1>
                            <p className="text-zinc-400 font-mono">
                                RightWhale Protocol /// Technical Reference v1.1
                            </p>
                        </div>
                    </div>
                </header>

                {/* Content Modules */}
                <div className="space-y-8">

                    {/* Module 1: Overview */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass-panel p-8 rounded-xl border border-white/5"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <Cpu className="w-6 h-6 text-blue-500" />
                            <h2 className="text-xl font-bold uppercase tracking-wider">Protocol Overview</h2>
                        </div>
                        <div className="space-y-4 text-zinc-400 leading-relaxed">
                            <p>
                                RightWhale is an autonomous liquidity engine launched on <span className="text-white font-bold">pump.fun</span> (Solana).
                                Unlike traditional bots, it actively manages its own economy by harvesting creator fees and redistributing them based on real-time market analysis.
                            </p>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                <li className="flex items-start gap-3 bg-white/5 p-4 rounded-lg">
                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2"></div>
                                    <div>
                                        <span className="block text-white font-bold mb-1">Pump.fun Native</span>
                                        <span className="text-sm text-zinc-500">Leverages the bonding curve mechanics for initial liquidity.</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3 bg-white/5 p-4 rounded-lg">
                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2"></div>
                                    <div>
                                        <span className="block text-white font-bold mb-1">Deflationary Core</span>
                                        <span className="text-sm text-zinc-500">Systematic buy-back and burns reduce supply over time.</span>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </motion.section>

                    {/* Module 1.5: System Architecture */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="glass-panel p-8 rounded-xl border border-white/5"
                    >
                        <div className="flex items-center gap-3 mb-8">
                            <Cpu className="w-6 h-6 text-orange-500" />
                            <h2 className="text-xl font-bold uppercase tracking-wider">System Architecture</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-zinc-900/40 p-6 rounded-xl border border-white/5 flex flex-col items-center text-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Brain className="w-6 h-6 text-blue-500" />
                                </div>
                                <h3 className="text-white font-bold mb-2">The Brain</h3>
                                <div className="text-xs text-blue-500 font-mono mb-3">AI_TRADER.TS</div>
                                <p className="text-sm text-zinc-400">Algorithmic Market Maker that decides to 'Attack' (Burn) or 'Defend' (LP) based on volatility.</p>
                            </div>

                            <div className="bg-zinc-900/40 p-6 rounded-xl border border-white/5 flex flex-col items-center text-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Heart className="w-6 h-6 text-orange-500" />
                                </div>
                                <h3 className="text-white font-bold mb-2">The Heart</h3>
                                <div className="text-xs text-orange-500 font-mono mb-3">STRATEGY.TS</div>
                                <p className="text-sm text-zinc-400">Infinite Flywheel engine that routes fees into virtual pots, saving unused capital for the next cycle.</p>
                            </div>

                            <div className="bg-zinc-900/40 p-6 rounded-xl border border-white/5 flex flex-col items-center text-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Hand className="w-6 h-6 text-emerald-500" />
                                </div>
                                <h3 className="text-white font-bold mb-2">The Hands</h3>
                                <div className="text-xs text-emerald-500 font-mono mb-3">HARVESTER.TS</div>
                                <p className="text-sm text-zinc-400">Autonomous interaction layer that claims pump.fun dividends and executes on-chain swaps.</p>
                            </div>
                        </div>
                    </motion.section>

                    {/* Module 2: operational Cycle */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass-panel p-8 rounded-xl border border-white/5"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <Activity className="w-6 h-6 text-orange-500" />
                            <h2 className="text-xl font-bold uppercase tracking-wider">Autonomous Cycle</h2>
                        </div>

                        <div className="relative border-l-2 border-zinc-800 ml-3 pl-8 space-y-8">

                            <div className="relative">
                                <div className="absolute -left-[39px] top-0 w-5 h-5 rounded-full bg-zinc-900 border-2 border-orange-500 flex items-center justify-center">
                                    <span className="text-[10px] font-bold text-orange-500">1</span>
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">Harvest</h3>
                                <p className="text-zinc-400 text-sm">
                                    The engine monitors trading activity to collect accumulated Creator Fees. These SOL dividends form the basis of the protocol's buying power.
                                </p>
                            </div>

                            <div className="relative">
                                <div className="absolute -left-[39px] top-0 w-5 h-5 rounded-full bg-zinc-900 border-2 border-blue-500 flex items-center justify-center">
                                    <span className="text-[10px] font-bold text-blue-500">2</span>
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">Analysis</h3>
                                <p className="text-zinc-400 text-sm">
                                    The Decision Core analyzes market depth, volatility and volume. It decides the optimal timing and size for the next action to maximize impact and sustain the chart.
                                </p>
                            </div>

                            <div className="relative">
                                <div className="absolute -left-[39px] top-0 w-5 h-5 rounded-full bg-zinc-900 border-2 border-emerald-500 flex items-center justify-center">
                                    <span className="text-[10px] font-bold text-emerald-500">3</span>
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">Distro</h3>
                                <p className="text-zinc-400 text-sm">
                                    The Bot claims creator fees into its own Engine Wallet first. Then, during the Distribution cycle, the <strong>10% Dev Fee</strong> is sent to DEV OPS Wallet, while the rest is executed by the protocol.
                                </p>
                            </div>

                        </div>
                    </motion.section>

                    {/* Module 2.5: The Infinite Flywheel */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="glass-panel p-8 rounded-xl border border-white/5"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <RotateCw className="w-6 h-6 text-purple-500" />
                            <h2 className="text-xl font-bold uppercase tracking-wider">The Infinite Flywheel</h2>
                        </div>
                        <div className="space-y-4 text-zinc-400 leading-relaxed">
                            <p>
                                Unlike static splitters, RightWhale uses a <span className="text-white font-bold">Dynamic Savings Mechanism</span>.
                                Unused capital is not wasted; it is stored in "Virtual Pots" for future high-impact deployment.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
                                    <h4 className="text-white font-bold flex items-center gap-2 mb-2"><Zap className="w-4 h-4 text-emerald-500" /> Bullish Scenario</h4>
                                    <p className="text-xs text-zinc-500">
                                        Bot executes <strong className="text-emerald-400">Buy & Burn</strong> to chase momentum.
                                        The LP allocation (30%) is <strong className="text-white">SAVED</strong> into the Liquidity Pot.
                                    </p>
                                </div>
                                <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-lg">
                                    <h4 className="text-white font-bold flex items-center gap-2 mb-2"><Activity className="w-4 h-4 text-red-500" /> Bearish Scenario</h4>
                                    <p className="text-xs text-zinc-500">
                                        Bot executes <strong className="text-red-400">Auto-LP</strong> to harden the floor.
                                        The Burn allocation (30%) is <strong className="text-white">SAVED</strong> into the Buyback Pot.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.section>

                    {/* Module 3: Tokenomics */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="glass-panel p-8 rounded-xl border border-white/5"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <Layers className="w-6 h-6 text-emerald-500" />
                            <h2 className="text-xl font-bold uppercase tracking-wider">Fee Allocation</h2>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800 text-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="text-3xl font-black text-white mb-1 group-hover:scale-110 transition-transform">30%</div>
                                <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Burn</div>
                                <p className="text-[10px] text-zinc-600 mt-2">Bubacked & burned to reduce supply.</p>
                            </div>
                            <div className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800 text-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="text-3xl font-black text-white mb-1 group-hover:scale-110 transition-transform">30%</div>
                                <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Liquidity</div>
                                <p className="text-[10px] text-zinc-600 mt-2">Added to LP to deepen market depth.</p>
                            </div>
                            <div className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800 text-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="text-3xl font-black text-white mb-1 group-hover:scale-110 transition-transform">30%</div>
                                <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">RevShare</div>
                                <p className="text-[10px] text-zinc-600 mt-2">Revenue sharing for holders.</p>
                            </div>
                            <div className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800 text-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="text-3xl font-black text-white mb-1 group-hover:scale-110 transition-transform">10%</div>
                                <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Dev Ops</div>
                                <p className="text-[10px] text-zinc-600 mt-2">10% sent to DEV OPS Wallet for Ops.</p>
                            </div>
                        </div>
                    </motion.section>

                    {/* Module 3.5: RevShare Program Architecture */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.32 }}
                        className="glass-panel p-8 rounded-xl border border-white/5"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <Activity className="w-6 h-6 text-purple-500" />
                            <h2 className="text-xl font-bold uppercase tracking-wider">RevShare Program Architecture</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="text-white font-bold border-b border-zinc-800 pb-2">Operational Mechanics</h3>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-3">
                                        <div className="p-1 rounded bg-zinc-800 text-purple-500 mt-1">
                                            <Zap className="w-3 h-3" />
                                        </div>
                                        <div>
                                            <strong className="text-white block text-sm">Automated Distribution</strong>
                                            <span className="text-xs text-zinc-500">No claiming required. Rewards are airdropped directly to wallets every cycle.</span>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="p-1 rounded bg-zinc-800 text-purple-500 mt-1">
                                            <Activity className="w-3 h-3" />
                                        </div>
                                        <div>
                                            <strong className="text-white block text-sm">Real-Time Snapshots</strong>
                                            <span className="text-xs text-zinc-500">The engine scans the blockchain for all holders instantly before every payout.</span>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-white font-bold border-b border-zinc-800 pb-2">Eligibility Criteria</h3>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-3">
                                        <div className="p-1 rounded bg-zinc-800 text-red-500 mt-1">
                                            <Activity className="w-3 h-3" />
                                        </div>
                                        <div>
                                            <strong className="text-white block text-sm">Min-Whale Threshold</strong>
                                            <span className="text-xs text-zinc-500">
                                                Holders must own at least <span className="text-white font-bold">0.05%</span> of the supply to qualify.
                                            </span>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </motion.section>

                    {/* Module 4: Bot Command Ledger */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                        className="glass-panel p-8 rounded-xl border border-white/5"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <Terminal className="w-6 h-6 text-zinc-400" />
                            <h2 className="text-xl font-bold uppercase tracking-wider">Bot Command Ledger</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center justify-between p-3 rounded bg-zinc-900/40 border border-white/5">
                                <code className="text-orange-500 font-bold">/analysis</code>
                                <span className="text-xs text-zinc-500">Real-time AI Market Scans</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded bg-zinc-900/40 border border-white/5">
                                <code className="text-blue-500 font-bold">/reserves</code>
                                <span className="text-xs text-zinc-500">Audit Strategic Pots (War Chest)</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded bg-zinc-900/40 border border-white/5">
                                <code className="text-emerald-500 font-bold">/harvest</code>
                                <span className="text-xs text-zinc-500">Fee Collection Ledger</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded bg-zinc-900/40 border border-white/5">
                                <code className="text-red-500 font-bold">/burns</code>
                                <span className="text-xs text-zinc-500">Buyback & Burn History</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded bg-zinc-900/40 border border-white/5">
                                <code className="text-purple-500 font-bold">/lps</code>
                                <span className="text-xs text-zinc-500">Liquidity Injection Log</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded bg-zinc-900/40 border border-white/5">
                                <code className="text-white font-bold">/status</code>
                                <span className="text-xs text-zinc-500">System Health & Monitor</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded bg-zinc-900/40 border border-white/5">
                                <code className="text-pink-500 font-bold">/flywheel</code>
                                <span className="text-xs text-zinc-500">Explain the Infinite Loop</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded bg-zinc-900/40 border border-white/5">
                                <code className="text-emerald-500 font-bold">/payouts</code>
                                <span className="text-xs text-zinc-500">RevShare Transaction Log</span>
                            </div>
                        </div>
                    </motion.section>

                    {/* Module 3: Roadmap */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="glass-panel p-8 rounded-xl border border-white/5 opacity-80"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <Milestone className="w-6 h-6 text-purple-500" />
                            <h2 className="text-xl font-bold uppercase tracking-wider">System Roadmap</h2>
                        </div>
                        <div className="space-y-6 relative border-l border-zinc-800 ml-3 pl-8">
                            <div className="relative">
                                <div className="absolute -left-[37px] top-1 w-4 h-4 rounded-full bg-emerald-500 border-4 border-black box-content"></div>
                                <h3 className="text-white font-bold">Phase 1: Genesis (Current)</h3>
                                <p className="text-sm text-zinc-500 mt-1">Core engine deployment, dashboard launch, initial LP establishment.</p>
                            </div>
                            <div className="relative">
                                <div className="absolute -left-[37px] top-1 w-4 h-4 rounded-full bg-zinc-800 border-4 border-black box-content"></div>
                                <h3 className="text-zinc-400 font-bold">Phase 2: Expansion</h3>
                                <p className="text-sm text-zinc-600 mt-1">Claude AI implementation, advanced analytics modules, community governance, RightWhaleProtocol Launchpad.</p>
                            </div>
                        </div>
                    </motion.section>

                </div>
            </div>
        </main>
    );
}
