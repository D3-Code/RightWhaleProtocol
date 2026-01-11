"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Flame, Droplets, Trophy, BarChart3 } from "lucide-react";

type Stats = {
    totalBurned: number;
    totalLP: number;
    totalRevShare: number;
    distributions: number;
};

export const GlobalStats = () => {
    const [stats, setStats] = useState<Stats | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_ENGINE_API || "http://localhost:3001";
                const res = await fetch(`${apiUrl}/stats`).catch(() => null);
                if (res && res.ok) {
                    const data = await res.json();
                    setStats(data);
                } else {
                    // Fallback for dev if API off
                    setStats({
                        totalBurned: 0,
                        totalLP: 0,
                        totalRevShare: 0,
                        distributions: 0
                    });
                }
            } catch (e) {
                console.error(e);
            }
        };

        fetchStats();
        // Poll every 5s
        const interval = setInterval(fetchStats, 5000);
        return () => clearInterval(interval);
    }, []);

    if (!stats) return <div className="h-24 w-full bg-zinc-900/50 animate-pulse rounded-xl"></div>;

    // Real prices to be fetched in future
    const PRICE_RW = 0;
    const PRICE_SOL = 0;

    const items = [
        {
            label: "MARKET CAP",
            value: 0, // Placeholder until Coingecko/DexScreener integration
            unit: "USD",
            usd: 0,
            icon: BarChart3,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/30",
            glow: "shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]"
        },
        {
            label: "TOTAL BURNED",
            value: stats.totalBurned,
            unit: "$RightWhale",
            usd: stats.totalBurned * PRICE_RW,
            icon: Flame,
            color: "text-red-500",
            bg: "bg-red-500/10",
            border: "border-red-500/30",
            glow: "shadow-[0_0_30px_-5px_rgba(239,68,68,0.3)]"
        },
        {
            label: "TOTAL LP ADDED",
            value: stats.totalLP,
            unit: "SOL",
            usd: stats.totalLP * PRICE_SOL,
            icon: Droplets,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            border: "border-blue-500/30",
            glow: "shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)]"
        },
        {
            label: "REVSHARE DISTRIBUTED",
            value: stats.totalRevShare,
            unit: "SOL",
            usd: stats.totalRevShare * PRICE_SOL,
            icon: Trophy,
            color: "text-orange-500",
            bg: "bg-orange-500/10",
            border: "border-orange-500/30",
            glow: "shadow-[0_0_30px_-5px_rgba(249,115,22,0.3)]"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item, index) => (
                <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`glass-panel p-6 flex flex-col gap-3 ${item.border} border-2 relative overflow-hidden group hover:bg-zinc-900/60 transition-all ${item.glow}`}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`p-3 rounded-xl ${item.bg}`}>
                            <item.icon className={`w-8 h-8 ${item.color}`} />
                        </div>
                        <span className="text-xs text-zinc-400 font-mono-tech uppercase tracking-widest font-bold">{item.label}</span>
                    </div>

                    <div className="flex flex-col">
                        <div className="text-3xl font-black text-white font-mono-tech tracking-tight flex items-baseline gap-2">
                            {item.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            <span className="text-sm text-zinc-500 font-bold">{item.unit}</span>
                        </div>
                        <div className={`text-sm font-mono-tech font-bold ${item.color} mt-1`}>
                            ≈ ${item.usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                    </div>

                    {/* Background decoration */}
                    <div className={`absolute -right-6 -bottom-6 w-24 h-24 ${item.bg} rounded-full blur-2xl opacity-50`}></div>
                </motion.div>
            ))}
        </div>
    );
};
