import { Connection, PublicKey } from '@solana/web3.js';
import { executeStrategy } from './strategy';
import { addLog } from './db';
import { claimFees } from './harvester';

export const startMonitor = async () => {
    const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
    const connection = new Connection(rpcUrl, 'confirmed');

    const feeWalletAddress = process.env.FEE_WALLET_ADDRESS;
    if (!feeWalletAddress) {
        console.warn('FEE_WALLET_ADDRESS not set. Monitor will not start.');
        return;
    }

    console.log(`Monitoring Fee Wallet: ${feeWalletAddress}`);

    // --- HARVESTER LOOP (Every 5 Minutes) ---
    setInterval(async () => {
        await claimFees();
    }, 5 * 60 * 1000); // 5 minutes
    // Initial claim on startup
    claimFees();

    // --- ENGINE LOOP (Status Check Every 60s) ---
    // For this MVP, we'll poll every 60 seconds
    setInterval(async () => {
        try {
            const balance = await connection.getBalance(new PublicKey(feeWalletAddress));

            // Real mode: Logic checks actual balance of the Fee Wallet
            if (balance >= 0.3 * 1e9) {
                console.log('✅ Threshold reached! Triggering Engine...');
                // Execute strategy with 0.3 SOL
                await executeStrategy(0.3);
            } else {
                console.log(`⏳ Waiting for 0.3 SOL... Current: ${(balance / 1e9).toFixed(4)} SOL`);
            }
        } catch (err) {
            console.error('Monitor Error:', err);
        }
    }, 60000); // Poll every 60s in production-like mode
};
