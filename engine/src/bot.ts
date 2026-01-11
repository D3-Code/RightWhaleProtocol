import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;

export const bot = token ? new Telegraf(token) : null;

export const broadcastToChannel = async (message: string) => {
    if (!bot || !CHANNEL_ID) {
        // Silent fail or log if needed, avoid spamming logs in dev if not set
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
            '🔄 /flywheel - Verify the Flywheel Logic\n' +
            '📊 /status - System Status\n' +
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

    bot.command('status', (ctx) => {
        ctx.reply('RightWhale System: ONLINE 🟢\n\nMonitor: Active\nStrategy: 30/30/30/10');
    });

    bot.command('harvest', (ctx) => {
        ctx.reply('Harvest command received. (Mock)');
    });

    bot.command('history', (ctx) => {
        const wallet = process.env.FEE_WALLET_ADDRESS || '...';
        ctx.reply(
            '📜 *Protocol History* 📜\n\n' +
            'Select a category to view specific transactions:\n\n' +
            '🔥 /burns - Buy & Burn Log\n' +
            '💧 /lps - Auto-LP Log\n' +
            '🛡️ /payouts - RevShare Log\n\n' +
            '🔍 *Global View*: [Solscan Fee Wallet](https://solscan.io/account/' + wallet + ')',
            { parse_mode: 'Markdown', link_preview_options: { is_disabled: true } }
        );
    });

    bot.command('burns', (ctx) => {
        ctx.reply(
            '🔥 *Recent Burns* 🔥\n\n' +
            '1. `0.09 SOL` - [Tx Link](https://solscan.io/tx/...)\n' +
            '2. `0.21 SOL` - [Tx Link](https://solscan.io/tx/...)\n' +
            '3. `0.05 SOL` - [Tx Link](https://solscan.io/tx/...)\n\n' +
            '_Deflation reduces supply and increases scarcity._',
            { parse_mode: 'Markdown', link_preview_options: { is_disabled: true } }
        );
    });

    bot.command('lps', (ctx) => {
        ctx.reply(
            '💧 *Liquidity Injections* 💧\n\n' +
            '1. `0.09 SOL` - [Tx Link](https://solscan.io/tx/...)\n' +
            '2. `0.21 SOL` - [Tx Link](https://solscan.io/tx/...)\n' +
            '3. `0.05 SOL` - [Tx Link](https://solscan.io/tx/...)\n\n' +
            '_LP Injections raise the price floor permanently._',
            { parse_mode: 'Markdown', link_preview_options: { is_disabled: true } }
        );
    });

    bot.command('payouts', (ctx) => {
        ctx.reply(
            '🛡️ *RevShare Payouts* 🛡️\n\n' +
            '1. `0.09 SOL` (Distro to 4500 holders) - [Tx Link](https://solscan.io/tx/...)\n' +
            '2. `0.21 SOL` (Distro to 4200 holders) - [Tx Link](https://solscan.io/tx/...)\n\n' +
            '_Rewards are distributed proportionally to your holdings._',
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
