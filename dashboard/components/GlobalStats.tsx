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
    // Default to 0s for pre-launch to show "PENDING" text immediately
    const [stats, setStats] = useState<Stats | null>({
        totalBurned: 0,
        totalLP: 0,
        totalRevShare: 0,
        distributions: 0
    });

    // Detect mobile to disable animations
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_ENGINE_API || "http://localhost:3001";
                const res = await fetch(`${apiUrl}/stats`).catch(() => null);
                if (res && res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
                // Removed else block since we have defaults
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

    const items = [
        {
            label: "MARKET CAP",
            value: 0,
            displayValue: "PENDING TGE",
            subtext: "Awaiting Launch",
            icon: BarChart3,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/30",
            glow: "shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]"
        },
        {
            label: "TOTAL BURNED",
            value: stats.totalBurned,
            displayValue: stats.totalBurned > 0 ? stats.totalBurned.toLocaleString() : "SYSTEM STANDBY",
            subtext: "Waiting for Launch",
            icon: Flame,
            color: "text-red-500",
            bg: "bg-red-500/10",
            border: "border-red-500/30",
            glow: "shadow-[0_0_30px_-5px_rgba(239,68,68,0.3)]"
        },
        {
            label: "TOTAL LP ADDED",
            value: stats.totalLP,
            displayValue: stats.totalLP > 0 ? `${stats.totalLP} SOL` : "PENDING INJECTION",
            subtext: "Liquidity Event Soon",
            icon: Droplets,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            border: "border-blue-500/30",
            glow: "shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)]"
        },
        {
            label: "REVSHARE DISTRIBUTED",
            value: stats.totalRevShare,
            displayValue: stats.totalRevShare > 0 ? `${stats.totalRevShare} SOL` : "AWAITING REVENUE",
            subtext: "Holders Reward Pool",
            icon: Trophy,
            color: "text-orange-500",
            bg: "bg-orange-500/10",
            border: "border-orange-500/30",
            glow: "shadow-[0_0_30px_-5px_rgba(249,115,22,0.3)]"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item, index) => {
                const CardWrapper = isMobile ? 'div' : motion.div;
                const motionProps = isMobile ? {} : { whileHover: { scale: 1.01 } };

                return (
                    <CardWrapper
                        key={item.label}
                        {...motionProps}
                        className={`glass-panel p-6 flex flex-col gap-3 ${item.border} border-2 relative overflow-hidden group hover:bg-zinc-900/60 transition-all ${item.glow} ${item.displayValue.includes("PENDING") || item.displayValue.includes("SYSTEM") ? "animate-shimmer" : ""}`}
                    >
                        <div className="flex items-center gap-3 mb-2 relative z-10">
                            <div className={`p-3 rounded-xl ${item.bg} group-hover:scale-110 transition-transform duration-500`}>
                                <item.icon className={`w-8 h-8 ${item.color}`} />
                            </div>
                            <span className="text-[10px] text-zinc-400 font-mono-tech uppercase tracking-[0.2em] font-bold">{item.label}</span>
                        </div>

                        <div className="flex flex-col relative z-10">
                            <div className="text-2xl font-black text-white font-mono-tech tracking-tighter flex items-baseline gap-2">
                                {item.displayValue}
                            </div>
                            <div className={`text-[10px] font-mono-tech font-bold ${item.color} mt-1 opacity-80 uppercase tracking-widest flex items-center gap-2`}>
                                <span className="h-[1px] w-4 bg-current opacity-30"></span>
                                {item.subtext}
                            </div>
                        </div>

                        {/* Background decoration */}
                        <div className={`absolute -right-6 -bottom-6 w-24 h-24 ${item.bg} rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity`}></div>

                        {/* Interactive Corner Scanline */}
                        <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="absolute top-2 right-2 w-2 h-[1px] bg-orange-500"></div>
                            <div className="absolute top-2 right-2 w-[1px] h-2 bg-orange-500"></div>
                        </div>
                    </CardWrapper>
                );
            })}
        </div>
    );
};
