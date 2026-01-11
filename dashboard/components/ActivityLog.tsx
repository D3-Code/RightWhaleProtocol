"use client";

import { useEffect, useState } from "react";

type Log = {
    id: number;
    type: string;
    amount: number;
    timestamp: string;
    txHash?: string;
};

export const ActivityLog = () => {
    const [logs, setLogs] = useState<Log[]>([]);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        // Mock fetching or real fetching
        const fetchLogs = async () => {
            try {
                // In dev, use mock if API fails
                const apiUrl = process.env.NEXT_PUBLIC_ENGINE_API || "http://localhost:3001";
                const res = await fetch(`${apiUrl}/history`).catch(() => null);
                if (res && res.ok) {
                    const data = await res.json();
                    setLogs(data);
                } else {
                    // Fallback mock
                    setLogs([])
                }
            } catch (e) {
                console.error(e);
            }
        };

        fetchLogs();
        const interval = setInterval(fetchLogs, 5000);
        return () => clearInterval(interval);
    }, []);

    const filteredLogs = logs.filter(log => filter === 'ALL' || log.type === filter);

    return (
        <div className="font-mono-tech text-xs h-full bg-black/80 backdrop-blur-sm flex flex-col overflow-hidden relative">
            {/* Filter Bar */}
            <div className="p-2 border-b border-zinc-800 flex gap-2 overflow-x-auto custom-scrollbar sticky top-0 bg-black/90 z-10 shrink-0">
                {['ALL', 'BURN', 'LP_ZAP', 'REVSHARE'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1 rounded text-[10px] font-bold tracking-wider transition-all border ${filter === f
                            ? 'bg-orange-500 text-white border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]'
                            : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-white hover:border-zinc-600'
                            }`}
                    >
                        {f === 'LP_ZAP' ? 'LP' : f}
                    </button>
                ))}
            </div>

            <div className="p-4 overflow-y-auto custom-scrollbar flex-1">
                {filteredLogs.length === 0 ? (
                    <div className="text-zinc-600 animate-pulse">Waiting for signals...</div>
                ) : (
                    <div className="flex flex-col-reverse gap-1">
                        {filteredLogs.slice().reverse().map((log) => (
                            <div key={log.id} className="flex gap-4 border-l-2 border-zinc-800 pl-2 hover:border-orange-500 hover:bg-white/5 transition-colors p-1 group">
                                <span className="text-zinc-500 opacity-50">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                                <div className="flex items-center gap-2">
                                    <span className={log.type === 'BURN' ? 'text-red-500 font-bold' : log.type === 'LP_ZAP' ? 'text-blue-400 font-bold' : 'text-emerald-500 font-bold'}>
                                        {log.type === 'LP_ZAP' ? 'LP' : log.type}
                                    </span>
                                    <span className="text-zinc-300">
                                        Process Executed {`>>`} Amount: <span className="text-white">{log.amount} SOL</span>
                                    </span>
                                    <a
                                        href={`https://solscan.io/tx/${log.txHash || 'mock-tx'}`}
                                        target="_blank"
                                        className="ml-auto text-[10px] text-zinc-600 hover:text-orange-500 underline decoration-dotted transition-colors"
                                    >
                                        [VIEW TX]
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {/* Blinking Cursor at bottom (or top if reversed) */}
                <div className="mt-2 flex items-center text-orange-500 gap-2 opacity-50">
                    <span>{`>`}</span>
                    <span className="animate-pulse bg-orange-500 h-3 w-1.5 inline-block"></span>
                </div>
            </div>
        </div>
    );
};
