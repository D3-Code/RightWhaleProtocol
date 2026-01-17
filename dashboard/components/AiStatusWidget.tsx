'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Zap, Shield, Terminal } from 'lucide-react';

interface AiData {
    action: 'BUY_BURN' | 'ADD_LP' | 'WAIT';
    reason: string;
    confidence: number;
    timestamp: string;
}

export default function AiStatusWidget() {
    const [data, setData] = useState<AiData | null>(null);
    const [displayedReason, setDisplayedReason] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const reasonIndexRef = useRef(0);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Fetch Data
    const fetchStatus = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_ENGINE_API || 'http://localhost:3001'}/ai-status`);
            const json = await res.json();

            // Only update if timestamp changed or data is new
            setData(prev => {
                if (!prev || prev.timestamp !== json.timestamp) {
                    return json;
                }
                return prev;
            });
        } catch (e) {
            console.error('Failed to fetch AI status');
        }
    };

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 3000); // Poll every 3s for faster updates
        return () => clearInterval(interval);
    }, []);

    // Typewriter Effect
    useEffect(() => {
        if (!data?.reason) return;

        // If reason changed, reset typing
        if (data.reason !== displayedReason && !isTyping) {
            setDisplayedReason('');
            reasonIndexRef.current = 0;
            setIsTyping(true);
        }
    }, [data, displayedReason, isTyping]);

    useEffect(() => {
        if (!isTyping || !data) return;

        if (reasonIndexRef.current < data.reason.length) {
            const timeout = setTimeout(() => {
                setDisplayedReason(prev => prev + data.reason.charAt(reasonIndexRef.current));
                reasonIndexRef.current += 1;
            }, 20); // Typing Speed
            return () => clearTimeout(timeout);
        } else {
            setIsTyping(false);
        }
    }, [isTyping, data, displayedReason]);

    // Fallback for dev/offline mode
    const displayData = data || {
        action: 'WAIT',
        reason: 'NEURAL LINK OFFLINE. ESTABLISHING CONNECTION...',
        confidence: 0,
        timestamp: new Date().toISOString()
    };

    // Logic Colors
    const isBurn = displayData.action === 'BUY_BURN';
    const isLp = displayData.action === 'ADD_LP';

    const colorClass = isBurn ? 'text-orange-500' : isLp ? 'text-blue-500' : 'text-zinc-400';
    const bgClass = isBurn ? 'bg-orange-500/10 border-orange-500/20' : isLp ? 'bg-blue-500/10 border-blue-500/20' : 'bg-zinc-900 border-zinc-800';
    const glowClass = isBurn ? 'shadow-[0_0_30px_rgba(249,115,22,0.15)]' : isLp ? 'shadow-[0_0_30px_rgba(59,130,246,0.15)]' : '';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`w-full rounded-xl border ${bgClass} backdrop-blur-sm p-0 overflow-hidden ${glowClass} flex flex-col`}
        >
            {/* Header / StatusBar */}
            <div className={`px-4 py-2 border-b ${isBurn ? 'border-orange-500/20 bg-orange-500/5' : isLp ? 'border-blue-500/20 bg-blue-500/5' : 'border-zinc-800 bg-zinc-900/50'} flex justify-between items-center`}>
                <div className="flex items-center gap-2">
                    <Terminal className={`w-4 h-4 ${colorClass}`} />
                    <span className={`text-xs font-bold tracking-widest ${colorClass}`}>NEURAL CORE FEED</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isBurn ? 'bg-orange-400' : isLp ? 'bg-blue-400' : 'bg-zinc-400'}`}></span>
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${isBurn ? 'bg-orange-500' : isLp ? 'bg-blue-500' : 'bg-zinc-500'}`}></span>
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">LIVE LINK</span>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-6 relative">
                {/* Background Grid */}
                <div className={`absolute inset-0 opacity-5 ${isBurn ? 'bg-grid-pattern-orange' : 'bg-grid-pattern-blue'}`} />

                <div className="relative z-10 flex flex-col gap-4">
                    {/* Status Line */}
                    <div className="flex items-center gap-3">
                        <div className={`text-xs px-2 py-0.5 rounded border ${colorClass} bg-black/40 font-mono`}>
                            {(displayData.confidence * 100).toFixed(0)}% PROBABILITY
                        </div>
                        <div className="text-zinc-500 text-xs font-mono">
                            // {mounted ? new Date(displayData.timestamp).toLocaleTimeString() : '--:--:--'}
                        </div>
                    </div>

                    {/* Headline Action */}
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full border ${colorClass} bg-black/20`}>
                            {isBurn ? <Zap className={`w-6 h-6 ${colorClass}`} /> :
                                isLp ? <Shield className={`w-6 h-6 ${colorClass}`} /> :
                                    <Activity className={`w-6 h-6 ${colorClass}`} />}
                        </div>
                        <div>
                            <h3 className={`text-xl font-black tracking-tight ${colorClass}`}>
                                {isBurn ? "MOMENTUM DETECTED" : isLp ? "STABILITY PROTOCOL ACTIVE" : "MARKET SCANNING..."}
                            </h3>
                            <div className="text-xs text-zinc-500 font-mono uppercase tracking-widest">
                                Target Action: {displayData.action}
                            </div>
                        </div>
                    </div>

                    {/* Transcription Console */}
                    <div className="mt-2 p-4 bg-black/60 rounded border border-zinc-800 font-mono text-sm leading-relaxed text-zinc-300 min-h-[100px]">
                        <span className="text-zinc-600 mr-2">$</span>
                        {displayedReason}
                        <span className="animate-pulse inline-block w-2 h-4 bg-orange-500 ml-1 align-middle"></span>
                    </div>

                </div>
            </div>
        </motion.div>
    );
}
