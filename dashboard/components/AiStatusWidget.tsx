'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, Activity, Zap, Shield } from 'lucide-react';

interface AiData {
    action: 'BUY_BURN' | 'ADD_LP' | 'WAIT';
    reason: string;
    confidence: number;
    timestamp: string;
}

export default function AiStatusWidget() {
    const [data, setData] = useState<AiData | null>(null);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_ENGINE_API || 'http://localhost:3001'}/ai-status`);
                const json = await res.json();
                setData(json);
            } catch (e) {
                console.error('Failed to fetch AI status');
            }
        };

        fetchStatus();
        const interval = setInterval(fetchStatus, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    if (!data) return null;

    // Determine Logic Colors & Icons
    const isBurn = data.action === 'BUY_BURN';
    const isLp = data.action === 'ADD_LP';

    const colorClass = isBurn ? 'text-orange-500' : isLp ? 'text-blue-500' : 'text-zinc-500';
    const bgClass = isBurn ? 'bg-orange-500/10 border-orange-500/20' : isLp ? 'bg-blue-500/10 border-blue-500/20' : 'bg-zinc-800/50 border-zinc-700/50';
    const glowClass = isBurn ? 'shadow-[0_0_30px_rgba(249,115,22,0.2)]' : isLp ? 'shadow-[0_0_30px_rgba(59,130,246,0.2)]' : '';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`w-full rounded-2xl border ${bgClass} backdrop-blur-sm p-6 relative overflow-hidden ${glowClass}`}
        >
            {/* Background Neural Pulse */}
            <div className={`absolute inset-0 opacity-10 ${isBurn ? 'bg-grid-pattern-orange' : 'bg-grid-pattern-blue'}`} />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">

                {/* Visual Brain Node */}
                <div className="relative">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 ${colorClass} border-current bg-black/50`}>
                        <BrainCircuit className={`w-8 h-8 ${colorClass}`} />
                    </div>
                    {/* Pulsing Ring */}
                    <motion.div
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className={`absolute inset-0 rounded-full border ${colorClass} border-current`}
                    />
                </div>

                {/* Text Info */}
                <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border border-current ${colorClass} bg-black/50 uppercase tracking-wider`}>
                            AI Neural Core
                        </span>
                        <span className="text-zinc-400 text-xs font-mono flex items-center gap-1">
                            <Activity className="w-3 h-3" /> {data.confidence * 100}% Confidence
                        </span>
                    </div>

                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        {isBurn && <><Zap className="w-5 h-5 text-orange-500" /> MOMENTUM PROTOCOL ACTIVE</>}
                        {isLp && <><Shield className="w-5 h-5 text-blue-500" /> DEFENSE PROTOCOL ACTIVE</>}
                        {!isBurn && !isLp && "SYSTEM IDLE / MONITORING"}
                    </h3>

                    <p className="text-sm text-zinc-400 font-mono max-w-2xl leading-relaxed">
                        &quot;{data.reason}&quot;
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
