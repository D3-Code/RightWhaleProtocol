import { Connection, PublicKey, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import { createBurnCheckedInstruction, TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { loadWallet } from '../wallet';
import { broadcastToChannel } from '../telegram';
import { addLog } from '../db';
import * as dotenv from 'dotenv';
import * as path from 'path';

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

    const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    const connection = new Connection(rpcUrl, 'confirmed');

    try {
        const mintPubkey = new PublicKey(TOKEN_MINT_ADDRESS);
        const walletPubkey = keypair.publicKey;

        console.log(`Wallet: ${walletPubkey.toBase58()}`);
        console.log(`Mint: ${mintPubkey.toBase58()}`);

        let tokenAccount = null;
        let tokenProgramId = TOKEN_PROGRAM_ID;
        let foundBalance = 0;

        // 1. Check Standard Token Program
        console.log("Checking Standard Token Program...");
        let accounts = await connection.getParsedTokenAccountsByOwner(walletPubkey, {
            programId: TOKEN_PROGRAM_ID
        });

        // Filter for mint
        let match = accounts.value.find(a => a.account.data.parsed.info.mint === TOKEN_MINT_ADDRESS);

        if (match) {
            foundBalance = match.account.data.parsed.info.tokenAmount.uiAmount || 0;
            if (foundBalance >= BURN_AMOUNT) {
                tokenAccount = match.pubkey;
                tokenProgramId = TOKEN_PROGRAM_ID;
                console.log(`✅ Found in Standard Program. Balance: ${foundBalance}`);
            }
        }

        // 2. Check Token-2022 Program (If not found or insufficient)
        if (!tokenAccount) {
            console.log("Checking Token-2022 Program...");
            accounts = await connection.getParsedTokenAccountsByOwner(walletPubkey, {
                programId: TOKEN_2022_PROGRAM_ID
            });

            match = accounts.value.find(a => a.account.data.parsed.info.mint === TOKEN_MINT_ADDRESS);

            if (match) {
                const bal = match.account.data.parsed.info.tokenAmount.uiAmount || 0;
                console.log(`✅ Found in Token-2022. Balance: ${bal}`);
                if (bal >= BURN_AMOUNT) {
                    tokenAccount = match.pubkey;
                    tokenProgramId = TOKEN_2022_PROGRAM_ID;
                    foundBalance = bal;
                } else {
                    foundBalance += bal; // Accumulate if split? (Usually only one ATA matters)
                }
            }
        }

        if (!tokenAccount) {
            console.error(`❌ Insufficient Balance. Found: ${foundBalance}, Need: ${BURN_AMOUNT}`);
            return;
        }

        // Proceed to Burn
        const burnAmountRaw = BigInt(BURN_AMOUNT) * BigInt(10 ** DECIMALS);
        console.log(`🔥 Burning ${BURN_AMOUNT.toLocaleString()} Tokens from ${tokenAccount.toBase58()} using Program ${tokenProgramId.toBase58()}...`);

        const tx = new Transaction().add(
            createBurnCheckedInstruction(
                tokenAccount,
                mintPubkey,
                walletPubkey,
                burnAmountRaw,
                DECIMALS,
                [],
                tokenProgramId
            )
        );

        const signature = await sendAndConfirmTransaction(connection, tx, [keypair]);
        console.log(`✅ BURN SUCCESSFUL!`);
        console.log(`Tx: https://solscan.io/tx/${signature}`);

        // Broadcast to Telegram
        await broadcastToChannel(`🔥 *MANUAL BURN EXECUTED* 🔥\nUser burned \`1,000,000 $RightWhale\` from Fee Wallet.\n\n[View Tx](https://solscan.io/tx/${signature})`);

        // Log to DB
        await addLog('BURN', 0, signature);

    } catch (error) {
        console.error('❌ Burn Failed:', error);
    }
}

run();
