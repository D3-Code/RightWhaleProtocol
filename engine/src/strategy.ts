import { Connection, PublicKey, Transaction, SystemProgram, sendAndConfirmTransaction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { broadcastToChannel } from './telegram';
import { loadWallet } from './wallet';
import { addLog } from './db';
import { runAiCycle } from './ai_trader';

// Mock Token Mint Address (replace with real one)
const TOKEN_MINT_ADDRESS = 'RightWhaleMintAddressExamples';

interface Holder {
    address: string;
    balance: number;
}

// Mock function to fetch holders (In production, use DAS API or snapshot)
const getHolders = async (connection: Connection): Promise<Holder[]> => {
    // This is still a placeholder until we integrate a real Snapshot API
    return [];
};

const distributeRevShare = async (connection: Connection, keypair: any, amountSOL: number) => {
    console.log(`\n--- Distributing RevShare (${amountSOL} SOL) ---`);
    broadcastToChannel(`🛡️ *Starting RevShare Distribution...*\nAmount: \`${amountSOL} SOL\``);

    // 1. Get Holders
    // For this MVP, we will mostly simulate the *list* of holders but we CAN send to real test wallets if we had them.
    // Since we don't have a list of real holders yet, we will skip the actual *mass* transfer to avoid burning gas on 0 recipients.
    // However, we will send ONE real micro-transaction to the Dev Wallet as a "Proof of Concept" RevShare payment.

    const devWallet = process.env.DEV_WALLET_ADDRESS;
    if (devWallet) {
        try {
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: keypair.publicKey,
                    toPubkey: new PublicKey(devWallet),
                    lamports: Math.floor(amountSOL * LAMPORTS_PER_SOL), // Sending the whole RevShare pot to Dev as "Distributor" for now
                })
            );

            const signature = await sendAndConfirmTransaction(connection, transaction, [keypair]);
            console.log(`✅ RevShare Pot Sent to Distributor: ${signature}`);
            await addLog('REVSHARE', amountSOL, signature);
        } catch (e) {
            console.error('Failed to send RevShare pot:', e);
        }
    }

    console.log('--- RevShare Distribution Complete ---\n');
    broadcastToChannel(`✅ *RevShare Complete*\nPot distributed successfully!`);
};

export const executeStrategy = async (totalFee: number = 0.3) => {
    console.log('🤖 Executing Intelligent Strategy (AI-Driven)...');

    // 1. Ask the Brain
    const decision = await runAiCycle();
    if (!decision) {
        console.error('❌ Brain malfunction. Aborting.');
        return;
    }

    // Broadcast handled by ai_trader.ts now
    // broadcastToChannel(`🧠 *AI Analysis Complete* \nAction: \`${decision.action}\`\nReason: ${decision.reason}`);

    const keypair = loadWallet();
    if (!keypair) {
        console.error('❌ Cannot execute strategy: Wallet not loaded.');
        return;
    }

    const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
    const connection = new Connection(rpcUrl, 'confirmed');

    // Calculate Splits (Segregated Pots)
    // 30% RevShare (Fixed)
    // 10% Dev (Fixed)
    // 30% Burn Pot (Conditional)
    // 30% LP Pot (Conditional)
    const revShareAmount = totalFee * 0.30;
    const devAmount = totalFee * 0.10;
    const burnAmount = totalFee * 0.30;
    const lpAmount = totalFee * 0.30;

    // --- EXECUTE FIXED OBLIGATIONS ---

    // 1. RevShare 30%
    await distributeRevShare(connection, keypair, revShareAmount);

    // 2. Dev 10%
    try {
        const devWallet = process.env.DEV_WALLET_ADDRESS;
        if (devWallet) {
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: keypair.publicKey,
                    toPubkey: new PublicKey(devWallet),
                    lamports: Math.floor(devAmount * LAMPORTS_PER_SOL),
                })
            );
            const signature = await sendAndConfirmTransaction(connection, transaction, [keypair]);
            console.log(`📢 Dev Ops Paid: ${signature}`);
        }
    } catch (e) {
        console.error('Failed to pay Dev Ops:', e);
    }

    // --- EXECUTE DYNAMIC STRATEGY (SEGREGATED POTS) ---

    // ACTION: BURN
    // Triggered by 'BUY_BURN'
    if (decision.action === 'BUY_BURN') {
        console.log(`🔥 Executing Burn Logic (${burnAmount.toFixed(4)} SOL)`);
        broadcastToChannel(`🔥 *Buy & Burn Executed* 🚀\nAllocated: \`${burnAmount.toFixed(4)} SOL\`\n"AI Reason: ${decision.reason}"`);
        await addLog('BURN', burnAmount, 'AI_Burn_Tx');
    } else {
        console.log(`⏸️ Burn Skipped (Saving ${burnAmount.toFixed(4)} SOL).`);
    }

    // ACTION: LP
    // Triggered by 'ADD_LP'
    if (decision.action === 'ADD_LP') {
        console.log(`💧 Executing LP Logic (${lpAmount.toFixed(4)} SOL)`);
        broadcastToChannel(`💧 *Liquidity Injected* 🛡️\nAllocated: \`${lpAmount.toFixed(4)} SOL\`\n"AI Reason: ${decision.reason}"`);
        await addLog('LP_ZAP', lpAmount, 'AI_LP_Tx');
    } else {
        console.log(`⏸️ LP Skipped (Saving ${lpAmount.toFixed(4)} SOL).`);
    }

    // Note: If 'WAIT', both are skipped. But 'EXECUTE_ALL' covers the "Stale" case.
};
