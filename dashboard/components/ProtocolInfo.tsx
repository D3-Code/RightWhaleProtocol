"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Flame, Droplets, Zap, ShieldCheck, Database, Wallet, Terminal, Github } from "lucide-react";

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
                // const apiUrl = process.env.NEXT_PUBLIC_ENGINE_API || "http://localhost:3001";
                const apiUrl = "https://da14aa08cf9bd5.lhr.life";
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2 w-full px-1">
                {/* Module A */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="border border-white/10 bg-zinc-900/50 backdrop-blur-sm p-2 rounded-lg flex flex-col items-center gap-1.5 w-full text-center shadow-lg group hover:border-red-500/50 transition-all relative overflow-hidden"
                >
                    {reserves?.burnPot ? <div className="absolute inset-x-0 bottom-0 h-[2px] bg-red-500/50 animate-pulse" /> : null}
                    <Flame className={`w-5 h-5 text-red-500 ${reserves?.burnPot ? "animate-pulse" : "opacity-50"}`} />
                    <div className="flex flex-col">
                        <span className="text-[7px] text-zinc-500 uppercase font-mono-tech">Module A</span>
                        <span className="text-[9px] font-bold text-white tracking-widest uppercase truncate w-full">BUYBACK+BURN</span>
                        <div className={`mt-0.5 text-[9px] font-bold font-mono-tech ${reserves ? "text-red-400" : "text-zinc-600 animate-pulse"}`}>
                            {reserves ? `${reserves.burnPot.toFixed(4)}` : "SYNCING"}
                        </div>
                    </div>
                </motion.div>

                {/* Module B */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="border border-white/10 bg-zinc-900/50 backdrop-blur-sm p-2 rounded-lg flex flex-col items-center gap-1.5 w-full text-center shadow-lg group hover:border-blue-500/50 transition-all relative overflow-hidden"
                >
                    {reserves?.lpPot ? <div className="absolute inset-x-0 bottom-0 h-[2px] bg-blue-500/50 animate-pulse" /> : null}
                    <Droplets className={`w-5 h-5 text-blue-500 ${reserves?.lpPot ? "animate-bounce" : "opacity-50"}`} />
                    <div className="flex flex-col">
                        <span className="text-[7px] text-zinc-500 uppercase font-mono-tech">Module B</span>
                        <span className="text-[9px] font-bold text-white tracking-widest uppercase truncate w-full">LIQUIDITY</span>
                        <div className={`mt-0.5 text-[9px] font-bold font-mono-tech ${reserves ? "text-blue-400" : "text-zinc-600 animate-pulse"}`}>
                            {reserves ? `${reserves.lpPot.toFixed(4)}` : "SYNCING"}
                        </div>
                    </div>
                </motion.div>

                {/* Module C */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-sm p-2 rounded-lg flex flex-col items-center gap-1.5 w-full text-center shadow-lg group hover:border-emerald-500/50 transition-all relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-emerald-500/10 animate-pulse-glow pointer-events-none" />
                    <div className="absolute inset-x-0 bottom-0 h-[2px] bg-emerald-500/50 animate-pulse" />
                    <ShieldCheck className="w-5 h-5 text-emerald-500 group-hover:rotate-12 transition-transform" />
                    <div className="flex flex-col">
                        <span className="text-[7px] text-zinc-500 uppercase font-mono-tech text-emerald-500/50">Module C</span>
                        <span className="text-[9px] font-bold text-white tracking-widest uppercase truncate w-full">REVSHARE</span>
                        <div className="mt-0.5 text-[9px] font-bold text-emerald-400 font-mono-tech flex items-center justify-center gap-1">
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
            <div className="w-full mt-6 pt-4 border-t border-white/5 flex flex-col gap-4 text-[9px] text-zinc-400 font-mono-tech">
                <div className="flex flex-row justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Database className="w-2 h-2 text-orange-500" />
                        <span className="text-zinc-300">SYSTEM RESERVES:</span>
                        <span className="text-white font-bold">{reserves ? `${reserves.total.toFixed(4)} SOL` : "---"}</span>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                        <div className="text-emerald-500 uppercase tracking-tighter flex items-center gap-1">
                            <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></span>
                            Fully Automated
                        </div>
                        <div className="text-[7px] opacity-30 uppercase">
                            RW-V1.1-ALPHA
                        </div>
                    </div>
                </div>

                {/* Secondary Modules Grid */}
                <div className="grid grid-cols-2 gap-2 w-full">
                    <motion.a
                        href="https://solscan.io/account/EdkQbGwHarKF7PeHdCsbEPmYA56yEG884aRqg4f7ndYZ"
                        target="_blank"
                        rel="noreferrer"
                        whileHover={{ scale: 1.02 }}
                        className="border border-white/10 bg-zinc-900/40 backdrop-blur-sm p-3 rounded-lg flex flex-col items-center gap-2 text-center group hover:border-purple-500/50 transition-all relative overflow-hidden"
                    >
                        <div className="absolute inset-x-0 bottom-0 h-[1px] bg-purple-500/20 group-hover:bg-purple-500/50 transition-colors" />
                        <Wallet className="w-4 h-4 text-purple-500 group-hover:scale-110 transition-transform" />
                        <div className="flex flex-col">
                            <span className="text-[6px] text-zinc-500 uppercase font-mono-tech group-hover:text-purple-500/50 transition-colors">Module D</span>
                            <span className="text-[8px] font-bold text-white tracking-widest uppercase">FEE WALLET</span>
                        </div>
                    </motion.a>

                    <motion.a
                        href="https://solscan.io/account/BGEpiN5RmSmbu6j6ioE9KbHuJzaX6TFiH4QvDEgT3Yhu"
                        target="_blank"
                        rel="noreferrer"
                        whileHover={{ scale: 1.02 }}
                        className="border border-white/10 bg-zinc-900/40 backdrop-blur-sm p-3 rounded-lg flex flex-col items-center gap-2 text-center group hover:border-cyan-500/50 transition-all relative overflow-hidden"
                    >
                        <div className="absolute inset-x-0 bottom-0 h-[1px] bg-cyan-500/20 group-hover:bg-cyan-500/50 transition-colors" />
                        <Terminal className="w-4 h-4 text-cyan-500 group-hover:scale-110 transition-transform" />
                        <div className="flex flex-col">
                            <span className="text-[6px] text-zinc-500 uppercase font-mono-tech group-hover:text-cyan-500/50 transition-colors">Module E</span>
                            <span className="text-[8px] font-bold text-white tracking-widest uppercase">DEV OPS</span>
                        </div>
                    </motion.a>

                    <motion.a
                        href="https://github.com/D3-Code/RightWhaleProtocol"
                        target="_blank"
                        rel="noreferrer"
                        whileHover={{ scale: 1.02 }}
                        className="col-span-2 border border-white/10 bg-zinc-900/40 backdrop-blur-sm p-3 rounded-lg flex flex-row items-center justify-center gap-3 text-center group hover:border-zinc-500/50 transition-all relative overflow-hidden"
                    >
                        <div className="absolute inset-x-0 bottom-0 h-[1px] bg-zinc-500/20 group-hover:bg-zinc-500/50 transition-colors" />
                        <Github className="w-4 h-4 text-zinc-500 group-hover:scale-110 group-hover:text-white transition-all" />
                        <div className="flex flex-col items-start">
                            <span className="text-[6px] text-zinc-500 uppercase font-mono-tech group-hover:text-white/50 transition-colors">Open Source</span>
                            <span className="text-[8px] font-bold text-white tracking-widest uppercase">VIEW CODEBASE</span>
                        </div>
                    </motion.a>
                </div>
            </div>
        </div>
    );
};
