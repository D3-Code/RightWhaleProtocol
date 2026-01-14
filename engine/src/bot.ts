import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import { claimFees } from './harvester';
import { getLogs } from './db';
import { runAiCycle } from './ai_trader';

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;

export const bot = token ? new Telegraf(token) : null;

export const broadcastToChannel = async (message: string) => {
    if (!bot || !CHANNEL_ID) {
        if (!CHANNEL_ID) console.log('⚠️ Broadcast skipped: No Channel ID.');
        return;
    }
    try {
        await bot.telegram.sendMessage(CHANNEL_ID, message, { parse_mode: 'Markdown', link_preview_options: { is_disabled: true } });
    } catch (e) {
        console.error('Failed to broadcast message:', e);
    }
};

export const setupBot = () => {
    if (!bot) {
        console.warn('TELEGRAM_BOT_TOKEN not set. Bot will not start.');
        return;
    }

    const welcomeMessage = (ctx: any) => {
        ctx.reply(
            '🐋 *Welcome to RightWhale Bot* 🐋\n\n' +
            'I manage the deployed strategy for the $RightWhale ecosystem.\n\n' +
            '*Available Commands:*\n' +
            'ℹ️ /info - Protocol Strategy breakdown\n' +
            '📢 /channel - Official Updates\n' +
            '🧠 /analyze - Run Market Algorithmic Analysis\n' +
            '🔄 /flywheel - Verify the Flywheel Logic\n' +
            '📊 /status - System Status\n' +
            '🌾 /harvest - Trigger Fee Harvester\n' +
            '📜 /history - Recent Actions (Menu)\n' +
            '   ├ 🔥 /burns\n' +
            '   ├ 💧 /lps\n' +
            '   └ 🛡️ /payouts\n',
            { parse_mode: 'Markdown' }
        );
    };

    // 🔒 Security: Middleware to restrict to specific channel/group
    bot.use(async (ctx, next) => {
        const allowedChannel = 'RightWhaleBotChannel';
        const chat = await ctx.getChat();

        // Simple username check
        const isAllowed =
            ctx.chat?.type === 'channel' && (ctx.chat as any).username === allowedChannel ||
            ctx.chat?.type === 'supergroup' && (ctx.chat as any).username === allowedChannel;

        // We aren't actively blocking DMs, just ensuring context awareness if needed.
        return next();
    });

    bot.start(welcomeMessage);
    bot.help(welcomeMessage);

    bot.command('channel', (ctx) => {
        ctx.reply(
            '📢 *Official Channel* 📢\n\n' +
            'Join for updates and automated engine logs:\n' +
            'https://t.me/RightWhaleBotChannel',
            { parse_mode: 'Markdown' }
        );
    });

    bot.command('status', (ctx) => {
        const timestamp = new Date().toISOString();
        ctx.reply(`RightWhale System: ONLINE 🟢\n\nMonitor: Active\nStrategy: 30/30/30/10\nTime: ${timestamp}`);
    });

    bot.command('analyze', async (ctx) => {
        ctx.reply('🧠 *Running Algorithmic Market Analysis...*', { parse_mode: 'Markdown' });

        try {
            const decision = await runAiCycle();
            const emoji = decision.action === 'BUY_BURN' ? '🔥' : decision.action === 'ADD_LP' ? '💧' : '😴';

            ctx.reply(
                `*Analysis Complete* ${emoji}\n\n` +
                `**Recommendation**: \`${decision.action}\`\n` +
                `**Confidence**: ${decision.confidence * 100}%\n\n` +
                `**Reasoning**:\n${decision.reason}`,
                { parse_mode: 'Markdown' }
            );
        } catch (error) {
            console.error('Analyze Error:', error);
            ctx.reply('❌ Error running analysis logic.');
        }
    });

    bot.command('harvest', async (ctx) => {
        ctx.reply('🌾 *Harvesting Fees...* \nAttempting to withdraw from Pump.fun...', { parse_mode: 'Markdown' });
        await claimFees();
        // claimFees handles the broadcast and logging.
    });

    bot.command('history', async (ctx) => {
        const wallet = process.env.FEE_WALLET_ADDRESS || '...';
        const logs = await getLogs(5);

        let logText = '';
        if (logs.length > 0) {
            logText = logs.map((l: any) => {
                const link = l.txHash && l.txHash.length > 10 ? `[Tx](${'https://solscan.io/tx/' + l.txHash})` : 'Simulated';
                return `• ${l.type}: ${l.amount ? l.amount.toFixed(4) : '0'} SOL - ${link}`;
            }).join('\n');
        } else {
            logText = '_No recent actions recorded._';
        }

        ctx.reply(
            '📜 *Protocol History* 📜\n\n' +
            '**Recent Executions**:\n' + logText + '\n\n' +
            'Select a category to view more:\n' +
            '🔥 /burns - Buy & Burn Log\n' +
            '💧 /lps - Auto-LP Log\n' +
            '🛡️ /payouts - RevShare Log\n\n' +
            '🔍 *Global View*: [Solscan Fee Wallet](https://solscan.io/account/' + wallet + ')',
            { parse_mode: 'Markdown', link_preview_options: { is_disabled: true } }
        );
    });

    bot.command('burns', async (ctx) => {
        const logs = await getLogs(5, 'BURN');
        let lines = '_No burns recorded yet._';
        if (logs.length > 0) {
            lines = logs.map((l: any) => {
                const link = l.txHash && l.txHash.length > 10 ? `[Tx](${'https://solscan.io/tx/' + l.txHash})` : 'Simulated';
                return `🔥 ${l.amount.toFixed(4)} SOL - ${link}`;
            }).join('\n');
        }

        ctx.reply(
            '🔥 *Recent Burns* 🔥\n\n' + lines + '\n\n' +
            '_Deflation reduces supply and increases scarcity._',
            { parse_mode: 'Markdown', link_preview_options: { is_disabled: true } }
        );
    });

    bot.command('lps', async (ctx) => {
        const logs = await getLogs(5, 'LP_ZAP');
        let lines = '_No LP Injections recorded yet._';
        if (logs.length > 0) {
            lines = logs.map((l: any) => {
                const link = l.txHash && l.txHash.length > 10 ? `[Tx](${'https://solscan.io/tx/' + l.txHash})` : 'Simulated';
                return `💧 ${l.amount.toFixed(4)} SOL - ${link}`;
            }).join('\n');
        }

        ctx.reply(
            '💧 *Liquidity Injections* 💧\n\n' + lines + '\n\n' +
            '_LP Injections raise the price floor permanently._',
            { parse_mode: 'Markdown', link_preview_options: { is_disabled: true } }
        );
    });

    bot.command('payouts', async (ctx) => {
        const logs = await getLogs(5, 'REVSHARE');
        let lines = '_No RevShare payouts recorded yet._';
        if (logs.length > 0) {
            lines = logs.map((l: any) => {
                const link = l.txHash && l.txHash.length > 10 ? `[Tx](${'https://solscan.io/tx/' + l.txHash})` : 'Simulated';
                return `🛡️ ${l.amount.toFixed(4)} SOL - ${link}`;
            }).join('\n');
        }

        ctx.reply(
            '🛡️ *RevShare Payouts* 🛡️\n\n' + lines + '\n\n' +
            '_Rewards are distributed proportionally to holdings._',
            { parse_mode: 'Markdown', link_preview_options: { is_disabled: true } }
        );
    });

    bot.command('info', (ctx) => {
        ctx.reply(
            '*RightWhale Protocol Strategy* 🐋\n\n' +
            'The Engine triggers when Fee Wallet hits *0.3 SOL*.\n\n' +
            '🔥 *30% Burn*: Auto Market Buy & Burn.\n' +
            '💧 *30% Auto-LP*: Swap 50% -> Pair -> Inject Liquidity.\n' +
            '🛡️ *30% RevShare*: Rewards distributed to holders.\n' +
            '📢 *10% Dev Ops*: Operations & Development wallet.',
            { parse_mode: 'Markdown' }
        );
    });

    bot.command('flywheel', (ctx) => {
        ctx.reply(
            '🔄 *The RightWhale Infinite Flywheel* 🔄\n\n' +
            '1. **Volume** generates Fees (0.3 SOL Trigger).\n' +
            '2. **Engine Wakes Up**:\n' +
            '   🔥 **Burn (30%)**: Scarcity goes UP.\n' +
            '   💧 **LP (30%)**: Floor Price goes UP.\n' +
            '   🛡️ **RevShare (30%)**: Holders earn SOL.\n' +
            '3. **Result**: Higher Price + Rewards = More FOMO.\n' +
            '4. **More FOMO** = More Volume.\n' +
            '5. **Repeat** ♾️\n\n' +
            '*Execution Sequence* ⚡\n' +
            'When triggered, the Engine executes in this exact order:\n' +
            '1️⃣ **Burn** (Instant Impact)\n' +
            '2️⃣ **LP Injection** (Instant Impact)\n' +
            '3️⃣ **Dev Ops** (Instant)\n' +
            '4️⃣ **RevShare** (Batched Distribution)\n\n' +
            '💡 *Why this order?*\n' +
            'We execute the **Burn** and **LP** first so that the chart affects the price immediately. Then, while the green candle is printing, the **RevShare** starts hitting people\'s wallets.\n\n' +
            'It feels basically simultaneous to the user, effectively "**Simultaneous execution**."',
            { parse_mode: 'Markdown' }
        );
    });

    bot.launch().then(() => {
        console.log('Telegram Bot started');
    }).catch((err) => {
        console.error('Failed to start Telegram Bot:', err);
    });

    // Enable graceful stop
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
};
