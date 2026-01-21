import { Connection, PublicKey, VersionedTransaction } from '@solana/web3.js';
import fetch from 'cross-fetch';
import { loadWallet } from './wallet';
import { broadcastToChannel } from './telegram';
import { addLog } from './db';

const PUMP_PORTAL_API_LOCAL = 'https://pumpportal.fun/api/trade-local';

export const claimFees = async () => {
    // 1. Configuration Check
    const mintAddress = process.env.TOKEN_MINT_ADDRESS;
    if (!mintAddress || mintAddress === 'YOUR_TOKEN_MINT_ADDRESS_HERE') {
        console.log('⚠️ Harvester Skipped: TOKEN_MINT_ADDRESS not set in .env');
        return;
    }

    const keypair = loadWallet();
    if (!keypair) {
        console.error('❌ Harvester Error: Wallet not loaded');
        return;
    }

    console.log('🌾 Harvester Running: Checking for Pump.fun Creator Fees...');

    try {
        const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
        const connection = new Connection(rpcUrl, 'confirmed');

        // 2. Request Transaction from PumpPortal (Local API - No API Key Required)
        // Note: Local API builds the transaction, we sign and send it ourselves
        const response = await fetch(PUMP_PORTAL_API_LOCAL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                publicKey: keypair.publicKey.toBase58(),
                action: 'collectCreatorFee',
                priorityFee: 0.00005, // Standard priority fee
                pool: 'pump'
            })
        });

        if (response.status !== 200) {
            const errorText = await response.text();
            // Silence 400 errors usually meaning "No fees to claim"
            if (response.status === 400 || errorText.includes('No fees')) {
                console.log('   -> No fees to claim right now.');
            } else {
                console.error(`❌ PumpPortal API Error: ${response.status} - ${errorText}`);
            }
            return;
        }

        const buffer = await response.arrayBuffer();
        const txBuffer = Buffer.from(buffer);

        // 3. Deserialize and Sign
        // PumpPortal returns a VersionedTransaction
        const transaction = VersionedTransaction.deserialize(new Uint8Array(txBuffer));

        transaction.sign([keypair]);

        // 4. Send Transaction
        const signature = await connection.sendTransaction(transaction);

        console.log(`✅ FEES CLAIMED! Tx: ${signature}`);
        // broadcastToChannel(`🌾 *Fees Harvested!* 🌾\nCollected from Pump.fun.\n[View Tx](https://solscan.io/tx/${signature})`);

        // Log to DB
        // await addLog('FEE_CLAIM', 0, signature); // Silencing per user request to avoid spamming console/bot with every harvest

    } catch (error) {
        console.error('❌ Harvester Exception:', error);
    }
};
