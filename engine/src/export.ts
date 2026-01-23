type Trade = {
    id: number;
    mint: string;
    symbol?: string;
    buy_amount_sol: number;
    sell_amount_sol?: number;
    pnl_sol?: number;
    realized_pnl?: number;
    status: 'OPEN' | 'CLOSED';
    buy_timestamp: string;
    sell_timestamp?: string;
    hold_minutes: number;
};

const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${Math.round(minutes)}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
};

export const convertToCSV = (trades: Trade[]): string => {
    const headers = ['Date', 'Token', 'Buy Amount (SOL)', 'Sell Amount (SOL)', 'PnL (SOL)', 'Hold Time', 'Status'];

    const rows = trades.map(t => [
        new Date(t.buy_timestamp).toISOString(),
        t.symbol || 'UNKNOWN',
        t.buy_amount_sol.toFixed(4),
        t.sell_amount_sol?.toFixed(4) || 'N/A',
        t.realized_pnl !== null && t.realized_pnl !== undefined ? t.realized_pnl.toFixed(4) : 'N/A',
        formatDuration(t.hold_minutes),
        t.status
    ]);

    return [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');
};
