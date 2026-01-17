import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';

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
