import { broadcastToChannel } from '../telegram';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const launchMessage = `
🚀 **RIGHTWHALE PROTOCOL IS LIVE ON PUMP.FUN!** 🚀

The Whale has surfaced. The Autonomous Liquidity Engine is now monitoring the charts.

🔥 **Contract Address**: \`AdwrMB45dAVuSfDT7YRVshK4QJtzaJyAKVKimJDrpump\`
💎 **Buy on Pump.fun**: [Link](https://pump.fun/coin/AdwrMB45dAVuSfDT7YRVshK4QJtzaJyAKVKimJDrpump)

**Protocol Operations**:
- 📈 Real-time Market Analysis: **ACTIVE**
- 🛡️ Floor Defense: **ARMED**
- 🔥 Momentum Squeeze: **INITIALIZED**

Let's make some waves. 🐋💨
`;

async function main() {
    console.log('Sending launch broadcast...');
    await broadcastToChannel(launchMessage);
    console.log('Broadcast complete.');
    process.exit(0);
}

main();
