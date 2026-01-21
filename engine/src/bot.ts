import { Connection, LAMPORTS_PER_SOL, PublicKey, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import { createBurnInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { loadWallet } from './wallet';
import { bot, broadcastToChannel } from './telegram';
import dotenv from 'dotenv';
import { claimFees } from './harvester';
import { getLogs, getVirtualPots, addLog } from './db';
import { lastAiDecision } from './ai_trader';

dotenv.config();



export const setupBot = () => {
    if (!bot) {
        console.warn('TELEGRAM_BOT_TOKEN not set. Bot will not start.');
        return;
    }
    console.log('Attempting to launch Telegram Bot...');

    const welcomeMessage = (ctx: any) => {
        ctx.reply(
            '🐋 *RightWhale Protocol Engine* 🐋\n' +
            '_System Status: PRE-LAUNCH (STANDBY)_\n\n' +
            'I am the autonomous trading engine for the $RightWhale Protocol.\n' +
            'My analysis modules are active and waiting for the Token Generation Event (TGE).\n\n' +
            '*Available Commands:*\n\n' +
            '*🧠 Intelligence & Status*\n' +
            '/analysis - Real-time AI Market Scans\n' +
            '/status - System Health & Monitor\n' +
            '/flywheel - The Infinite Growth Loop\n\n' +
            '*📜 Protocol Logs*\n' +
            '/harvest - Fee Collection Ledger\n' +
            '/burns - Buyback & Burn History\n' +
            '/lps - Liquidity Injection Log\n' +
            '/reserves - View all Strategic Pots\n' +
            '/burnpot - Buyback Pot Balance\n' +
            '/lppot - Liquidity Pot Balance\n' +
            '/payouts - RevShare Log\n\n' +
            '*ℹ️ Information*\n' +
            '/info - Strategy & Tokenomics\n' +
            '/channel - Official Updates\n',
            { parse_mode: 'Markdown' }
        );
    };

    // 🔒 Security: Middleware to restrict to specific channel/group
    // COMMENTED OUT FOR DEBUGGING
    /*
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
    */

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

    bot.command('analysis', async (ctx) => {
        if (!lastAiDecision) {
            ctx.reply('🧠 *AI Model Initializing...* \nPlease wait for the next cycle.', { parse_mode: 'Markdown' });
            return;
        }

        const decision = lastAiDecision;
        let emoji = '😴';
        if (decision.action === 'BUY_BURN') emoji = '🔥';
        if (decision.action === 'ADD_LP') emoji = '💧';

        ctx.reply(
            `*Latest Market Analysis* ${emoji}\n` +
            `_Automated Cycle Result_\n\n` +
            `**Decision**: \`${decision.action}\`\n` +
            `**Confidence**: ${decision.confidence * 100}%\n\n` +
            `**Reasoning**:\n${decision.reason}\n\n` +
            `_Last Updated: ${decision.timestamp || 'Just now'}_`,
            { parse_mode: 'Markdown' }
        );
    });

    bot.command('harvest', async (ctx) => {
        const logs = await getLogs(5, 'FEE_CLAIM');
        let lines = '_No recent harvests recorded._';

        if (logs.length > 0) {
            lines = logs.map((l: any) => {
                const link = l.txHash && l.txHash.length > 10 ? `[Tx](${'https://solscan.io/tx/' + l.txHash})` : 'Simulated';
                // Timestamp handling
                const time = l.timestamp ? new Date(l.timestamp).toLocaleTimeString() : '';
                return `🌾 *Harvest*: ${link} (${time})`;
            }).join('\n');
        }

        ctx.reply(
            '🌾 *Harvest Log* 🌾\n' +
            '_Displaying recent automated collections_\n\n' +
            lines,
            { parse_mode: 'Markdown', link_preview_options: { is_disabled: true } }
        );
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
            '💰 /reserves - Strategic Reserves\n' +
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
            '_Rewards are distributed proportionally to eligible holders._',
            { parse_mode: 'Markdown', link_preview_options: { is_disabled: true } }
        );
    });

    bot.command('reserves', async (ctx) => {
        const keypair = loadWallet();
        if (!keypair) {
            ctx.reply('❌ Error: Wallet not loaded.');
            return;
        }

        try {
            const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
            const connection = new Connection(rpcUrl, 'confirmed');
            const balance = await connection.getBalance(keypair.publicKey);
            const solBalance = (balance / LAMPORTS_PER_SOL).toFixed(4);

            const pots = await getVirtualPots();
            const burnPot = pots.find(p => p.name === 'burn_pot')?.balance || 0;
            const lpPot = pots.find(p => p.name === 'lp_pot')?.balance || 0;
            const operational = (parseFloat(solBalance) - (burnPot + lpPot)).toFixed(4);

            ctx.reply(
                '💰 *Strategic Reserve Audit* 💰\n\n' +
                `**Total Balance**: \`${solBalance} SOL\`\n\n` +
                '*Breakdown:*\n' +
                `• 🔥 **Buyback Pot**: \`${burnPot.toFixed(4)} SOL\`\n` +
                `• 💧 **Liquidity Pot**: \`${lpPot.toFixed(4)} SOL\`\n` +
                `• ⛽ **Operational**: \`${operational} SOL\`\n\n` +
                `_Address: \`${keypair.publicKey.toBase58()}\`_`,
                { parse_mode: 'Markdown' }
            );
        } catch (error) {
            ctx.reply('⚠️ Failed to fetch reserve balance.');
        }
    });

    bot.command('burnpot', async (ctx) => {
        const pots = await getVirtualPots();
        const burnPot = pots.find(p => p.name === 'burn_pot')?.balance || 0;
        ctx.reply(`🔥 *Buyback Pot Balance*: \`${burnPot.toFixed(4)} SOL\`\n_Saved for future Buyback & Burn deployments._`, { parse_mode: 'Markdown' });
    });

    bot.command('lppot', async (ctx) => {
        const pots = await getVirtualPots();
        const lpPot = pots.find(p => p.name === 'lp_pot')?.balance || 0;
        ctx.reply(`💧 *Liquidity Pot Balance*: \`${lpPot.toFixed(4)} SOL\`\n_Saved for future LP Injection deployments._`, { parse_mode: 'Markdown' });
    });

    bot.command('ping', (ctx) => {
        ctx.reply('🏓 Pong! Engine is Online.');
    });

    bot.command('burn', async (ctx) => {
        // Authenticate (Private Only or Specific Channel usage if needed)
        const chatId = ctx.chat.id.toString();
        // You can uncomment strict check:
        // if (CHANNEL_ID && chatId !== CHANNEL_ID && ctx.chat.type !== 'private') return;

        const args = ctx.message.text.split(' ');
        if (args.length !== 2) {
            return ctx.reply('⚠️ Usage: /burn <amount>');
        }

        const amount = parseFloat(args[1]);
        if (isNaN(amount) || amount <= 0) {
            return ctx.reply('⚠️ Invalid amount.');
        }

        await ctx.reply(`🔥 Initiating Burn of ${amount.toLocaleString()} $RightWhale...`);

        try {
            const { Connection, PublicKey, Transaction, sendAndConfirmTransaction } = require('@solana/web3.js');
            const { createBurnInstruction, TOKEN_PROGRAM_ID } = require('@solana/spl-token');
            const { loadWallet } = require('./wallet');
            const { addLog } = require('./db');

            const keypair = loadWallet();
            const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
            const connection = new Connection(rpcUrl, 'confirmed');
            const mintString = process.env.TOKEN_MINT_ADDRESS;

            if (!mintString || !keypair) {
                return ctx.reply('❌ Configuration Error: Missing mint or wallet.');
            }

            const mintPubkey = new PublicKey(mintString);
            const walletPubkey = keypair.publicKey;

            // Find Token Account
            // Use same method that worked in check_wallet.ts
            const accounts = await connection.getParsedTokenAccountsByOwner(walletPubkey, {
                mint: mintPubkey
            });

            if (accounts.value.length === 0) {
                return ctx.reply('❌ No $RightWhale tokens found in Fee Wallet.');
            }

            // Find account with sufficient balance
            let tokenAccount = null;
            let currentBal = 0;

            for (const acc of accounts.value) {
                const bal = acc.account.data.parsed.info.tokenAmount.uiAmount;
                if (bal >= amount) {
                    tokenAccount = new PublicKey(acc.pubkey);
                    currentBal = bal;
                    break;
                }
            }

            if (!tokenAccount) {
                const total = accounts.value.reduce((acc: any, curr: any) => acc + curr.account.data.parsed.info.tokenAmount.uiAmount, 0);
                return ctx.reply(`❌ Insufficient Balance. Have: ${total}, Need: ${amount}`);
            }

            // Execute Burn
            // Assuming 6 decimals for Pump.fun
            const decimals = 6;
            const burnAmountRaw = BigInt(amount) * BigInt(10 ** decimals); // Use integer math if possible

            // Use Standard Burn Instruction with explicit Program ID if needed, 
            // but standard createBurnInstruction defaults to TOKEN_PROGRAM_ID which is correct for these accounts
            const tx = new Transaction().add(
                createBurnInstruction(
                    tokenAccount,
                    mintPubkey,
                    walletPubkey,
                    burnAmountRaw
                )
            );

            const signature = await sendAndConfirmTransaction(connection, tx, [keypair]);

            await ctx.reply(`✅ *BURN SUCCESSFUL!* 🔥\n\nBurnt: \`${amount.toLocaleString()} $RightWhale\`\n\n[View Tx](https://solscan.io/tx/${signature})`, { parse_mode: 'Markdown', link_preview_options: { is_disabled: true } });

            // Log
            await addLog('BURN', 0, signature); // 0 amount (special display)

        } catch (e: any) {
            console.error(e);
            ctx.reply(`❌ Burn Failed: ${e.message}`);
        }
    });

    bot.command('info', (ctx) => {
        ctx.reply(
            '🐋 *RightWhale Protocol Engine* 🐋\n' +
            '_Automated. Intelligent. Deflationary._\n\n' +
            '*How it Works:*\n' +
            '1. 🌾 *Harvest*: The bot autonomously collects fees from Pump.fun creator rewards.\n' +
            '2. 🧠 *Analyze*: Our AI Engine monitors market structure, volume, and volatility in real-time.\n' +
            '3. ⚡ *Execute*: Based on market conditions, the bot triggers one of three strategies:\n' +
            '   • 🔥 *Buy & Burn*: For momentum and scarcity.\n' +
            '   • 💧 *Auto-LP*: For stability and price floor support.\n' +
            '   • 🐳 *Strategic Reserve*: Capital is saved for future high-impact deployment.\n' +
            '   • 🛡️ *RevShare*: (Always Active) Automated rewards for holders.\n\n' +
            '*RevShare Rules:*\n' +
            '• **Min-Whale**: Must hold **>0.05% supply** to qualify.\n' +
            '• **Automated**: Direct wallet airdrops, no claiming.\n' +
            '• **Frequency**: Executed on every profitable cycle.\n\n' +
            '*Features:*\n' +
            '• *Real-time Analysis*: See what the AI sees with /analysis.\n' +
            '• *Transparent Logs*: Track every fee claim with /harvest.\n' +
            '• *Live Updates*: All actions are broadcast here instantly.\n\n' +
            '*Commands:*\n' +
            '• /analysis - AI Market Status\n' +
            '• /status - System Health\n' +
            '• /harvest - Fee Collection Logs\n' +
            '• /history - Transaction Ledger',
            { parse_mode: 'Markdown' }
        );
    });

    bot.command('flywheel', (ctx) => {
        ctx.reply(
            '🔄 *The RightWhale Infinite Flywheel* 🔄\n\n' +
            '*1. Accumulation* 📥\n' +
            'Trading volume generates fees which accumulate in the Protocol Engine.\n\n' +
            '*2. Fixed Distribution (40%)* 💸\n' +
            'Every cycle, the engine immediately distributes:\n' +
            '• 🛡️ **RevShare (30%)**: Automated airdrops to holders (>0.05% supply).\n' +
            '• 🏗️ **Operations (10%)**: Development & Infrastructure.\n\n' +
            '*3. AI Dynamic Execution (60%)* 🧠\n' +
            'The remaining 60% contains two potential pots: **30% Burn** and **30% LP**.\n' +
            'The AI makes a decision, and the unused portion is **SAVED** to the Strategic Reserve:\n' +
            '• 🔥 **Bullish?** Executes **Buyback & Burn** (30%). The unused LP pot (30%) is saved for future use.\n' +
            '• 💧 **Bearish?** Executes **Auto-LP** (30%). The unused Burn pot (30%) is saved for future use.\n' +
            '• 😴 **Neutral?** No action taken. The **ENTIRE 60%** is saved to the Strategic Reserve for high-impact opportunities.\n\n' +
            '💡 *The Result:* \n' +
            'A self-optimizing system that builds a "War Chest" during quiet times and deploys it heavily during volatility.',
            { parse_mode: 'Markdown' }
        );
    });

    bot.launch({ dropPendingUpdates: true }).then(() => {
        console.log('Telegram Bot started');
    }).catch((err) => {
        console.error('Failed to start Telegram Bot:', err);
    });

    // Enable graceful stop
    process.once('SIGINT', () => bot?.stop('SIGINT'));
    process.once('SIGTERM', () => bot?.stop('SIGTERM'));
};
