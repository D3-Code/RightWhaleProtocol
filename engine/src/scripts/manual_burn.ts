import { Connection, PublicKey, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import { createBurnInstruction, getAssociatedTokenAddress } from '@solana/spl-token';
import { loadWallet } from '../wallet';
import { broadcastToChannel } from '../telegram';
import { addLog } from '../db';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env from engine root (two levels up)
dotenv.config({ path: path.join(__dirname, '../../.env') });

const TOKEN_MINT_ADDRESS = process.env.TOKEN_MINT_ADDRESS;
const BURN_AMOUNT = 1_000_000;
const DECIMALS = 6;

async function run() {
    console.log(`🔥 Initializing Manual Burn of ${BURN_AMOUNT.toLocaleString()} Tokens...`);

    if (!TOKEN_MINT_ADDRESS) {
        console.error('❌ TOKEN_MINT_ADDRESS not set in .env');
        return;
    }

    const keypair = loadWallet();
    if (!keypair) {
        console.error('❌ Failed to load wallet');
        return;
    }

    const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
    const connection = new Connection(rpcUrl, 'confirmed');

    try {
        const mintPubkey = new PublicKey(TOKEN_MINT_ADDRESS);
        const walletPubkey = keypair.publicKey;

        console.log(`Wallet: ${walletPubkey.toBase58()}`);
        console.log(`Mint: ${mintPubkey.toBase58()}`);

        // Get Associated Token Account
        const tokenAccount = await getAssociatedTokenAddress(
            mintPubkey,
            walletPubkey
        );

        console.log(`Checking balance for: ${tokenAccount.toBase58()}`);

        try {
            const balance = await connection.getTokenAccountBalance(tokenAccount);
            console.log(`Current Balance: ${balance.value.uiAmount} Tokens`);

            if (!balance.value.uiAmount || balance.value.uiAmount < BURN_AMOUNT) {
                console.error(`❌ Insufficient balance! Has: ${balance.value.uiAmount}, Needs: ${BURN_AMOUNT}`);
                return;
            }
        } catch (e) {
            console.error('❌ Token account not found or error fetching balance:', e);
            return;
        }

        const burnAmountRaw = BigInt(BURN_AMOUNT) * BigInt(10 ** DECIMALS);

        console.log(`Burning ${BURN_AMOUNT.toLocaleString()} Tokens...`);

        const tx = new Transaction().add(
            createBurnInstruction(
                tokenAccount,
                mintPubkey,
                walletPubkey,
                burnAmountRaw
            )
        );

        const signature = await sendAndConfirmTransaction(connection, tx, [keypair]);
        console.log(`✅ BURN SUCCESSFUL!`);
        console.log(`Tx: https://solscan.io/tx/${signature}`);

        // Broadcast to Telegram
        await broadcastToChannel(`🔥 *MANUAL BURN EXECUTED* 🔥\nUser burned \`1,000,000 $RightWhale\` from Fee Wallet.\n\n[View Tx](https://solscan.io/tx/${signature})`);

        // Log to DB (0 amount SOL, special marker handled by dashboard)
        await addLog('BURN', 0, signature);

    } catch (error) {
        console.error('❌ Burn Failed:', error);
    }
}

run();
