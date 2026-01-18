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
    const [mounted, setMounted] = useState(false);
    const [logs, setLogs] = useState<Log[]>([]);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        setMounted(true);
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
            <div className="p-2 border-b border-zinc-800 flex flex-wrap gap-2 sticky top-0 bg-black/90 z-10 shrink-0">
                {['ALL', 'BURN', 'LP_ZAP', 'REVSHARE', 'HARVEST', 'ANALYSIS'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1.5 md:px-3 md:py-1 rounded text-[10px] md:text-[10px] font-bold tracking-wider transition-all border whitespace-nowrap ${filter === f
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
                        {filteredLogs.slice().reverse().map((log) => {
                            let typeColor = 'text-emerald-500 font-bold';
                            let actionText = `Process Executed >> Amount: <span class="text-white font-bold">${log.amount} SOL</span>`;
                            let prefix = '🛡️';
                            let isTx = true;

                            if (log.type === 'BURN') {
                                typeColor = 'text-red-500 font-bold';
                                prefix = '🔥';
                            }
                            if (log.type === 'LP_ZAP') {
                                typeColor = 'text-blue-400 font-bold';
                                prefix = '💧';
                                actionText = `LP Injected >> Amount: <span class="text-white font-bold">${log.amount} SOL</span>`;
                            }
                            if (log.type === 'HARVEST' || log.type === 'FEE_CLAIM') {
                                typeColor = 'text-yellow-500 font-bold';
                                prefix = '💰';
                                actionText = `Fees Collected >> Amount: <span class="text-white font-bold">${log.amount} SOL</span>`;
                            }
                            if (log.type === 'ANALYSIS') {
                                typeColor = 'text-purple-400 font-bold';
                                prefix = '🧠';
                                isTx = false;
                                actionText = `AI Analysis >> Decision: <span class="text-white font-bold">${log.txHash}</span> (${(log.amount * 100).toFixed(0)}%)`;
                            }
                            if (log.type === 'REVSHARE') {
                                typeColor = 'text-emerald-500 font-bold';
                                prefix = '🛡️';
                                actionText = `RevShare Payout >> Distributed: <span class="text-white font-bold">${log.amount} SOL</span>`;
                            }

                            return (
                                <div key={log.id} className="flex gap-2 md:gap-4 border-l-2 border-zinc-800 pl-2 hover:border-orange-500 hover:bg-white/5 transition-colors p-1 group items-start">
                                    <span className="text-zinc-500 opacity-50 whitespace-nowrap text-[10px] md:text-xs">[{mounted ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--:--'}]</span>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 w-full">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px]">{prefix}</span>
                                            <span className={typeColor}>
                                                {log.type === 'LP_ZAP' ? 'LP' : log.type === 'FEE_CLAIM' ? 'HARVEST' : log.type === 'REVSHARE' ? 'PAYOUTS' : log.type}
                                            </span>
                                        </div>
                                        <span className="text-zinc-300 flex-1 text-[10px] md:text-xs leading-relaxed" dangerouslySetInnerHTML={{ __html: actionText }} />

                                        {isTx && (
                                            log.txHash ? (
                                                <a
                                                    href={`https://solscan.io/tx/${log.txHash}`}
                                                    target="_blank"
                                                    className="ml-auto text-[10px] text-zinc-600 hover:text-orange-500 underline decoration-dotted transition-colors whitespace-nowrap"
                                                >
                                                    [VIEW TX]
                                                </a>
                                            ) : (
                                                <span className="ml-auto text-[10px] text-zinc-800 cursor-not-allowed whitespace-nowrap">
                                                    [PENDING]
                                                </span>
                                            )
                                        )}
                                    </div>
                                </div>
                            );
                        })}
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
