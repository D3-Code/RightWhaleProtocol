import { Connection, PublicKey, Transaction, SystemProgram, sendAndConfirmTransaction, LAMPORTS_PER_SOL, VersionedTransaction } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { broadcastToChannel } from './telegram';
import { loadWallet } from './wallet';
import { addLog, adjustPotBalance } from './db';
import { runAiCycle } from './ai_trader';

// Use env var or fallback for safety
const TOKEN_MINT_ADDRESS = process.env.TOKEN_MINT_ADDRESS || 'RightWhaleMintAddressExamples';

interface Holder {
    address: string;
    balance: number;
}

// Fetch all holders of the token
const getHolders = async (connection: Connection): Promise<Holder[]> => {
    console.log('🔍 Snapshotting holders...');
    if (!TOKEN_MINT_ADDRESS || TOKEN_MINT_ADDRESS.includes('Example')) {
        console.warn('⚠️ Invalid Token Mint Address. Skipping snapshot.');
        return [];
    }

    try {
        const accounts = await connection.getParsedProgramAccounts(
            TOKEN_PROGRAM_ID,
            {
                filters: [
                    {
                        dataSize: 165, // Standard SPL Token Account size
                    },
                    {
                        memcmp: {
                            offset: 0,
                            bytes: TOKEN_MINT_ADDRESS,
                        },
                    },
                ],
            }
        );

        const holders: Holder[] = [];
        for (const { account } of accounts) {
            const parsedData = (account.data as any).parsed.info;
            const amount = parseFloat(parsedData.tokenAmount.uiAmountString);
            const owner = parsedData.owner;

            if (amount > 0) {
                holders.push({ address: owner, balance: amount });
            }
        }

        console.log(`✅ Snapshot Complete: Found ${holders.length} holders.`);
        return holders;

    } catch (e) {
        console.error('❌ Failed to fetch holders:', e);
        return [];
    }
};

const distributeRevShare = async (connection: Connection, keypair: any, amountSOL: number) => {
    console.log(`\n--- Distributing RevShare (${amountSOL.toFixed(4)} SOL) ---`);
    broadcastToChannel(`🛡️ *Starting RevShare Distribution...*\nPot: \`${amountSOL.toFixed(4)} SOL\``);

    if (amountSOL < 0.001) {
        console.log('⚠️ RevShare pot too small to distribute. Skipping.');
        return;
    }

    // 1. Get Real Holders
    const holders = await getHolders(connection);

    if (holders.length === 0) {
        console.log('⚠️ No holders found to distribute to.');
        broadcastToChannel(`⚠️ *RevShare Skipped*: No holders found.`);
        return;
    }

    // 2. Calculate Total Supply being tracked (sum of current holders found)
    const totalSupply = holders.reduce((acc, h) => acc + h.balance, 0);
    const MIN_HOLDING_PCT = 0.0005; // 0.05% Minimum to qualify

    // Filter eligible holders
    const eligibleHolders = holders.filter(h => (h.balance / totalSupply) >= MIN_HOLDING_PCT);

    console.log(`📊 Snapshot Stats: ${holders.length} Total Holders | ${eligibleHolders.length} Qualified (>0.05%) | Circ. Supply: ${totalSupply}`);

    if (eligibleHolders.length === 0) {
        console.log('⚠️ No holders met the 0.05% threshold.');
        broadcastToChannel(`⚠️ *RevShare Skipped*: No holders met the 0.05% threshold.`);
        return;
    }

    broadcastToChannel(`📊 *RevShare Snapshot*\nTotal Holders: ${holders.length}\nQualified (>0.05%): ${eligibleHolders.length}`);

    // 3. Prepare Batch Transactions
    // Batch size of 15 transfers per transaction to stay well under size limits
    const BATCH_SIZE = 15;
    let successfulTransfers = 0;

    // Shuffle holders slightly or just process? Just process.
    // Chunking
    for (let i = 0; i < eligibleHolders.length; i += BATCH_SIZE) {
        const chunk = eligibleHolders.slice(i, i + BATCH_SIZE);
        const transaction = new Transaction();
        let hasAction = false;

        for (const holder of chunk) {
            // Calculate Share
            const sharePercentage = holder.balance / totalSupply;
            const payout = amountSOL * sharePercentage;

            // Dust Filter: Only send if payout > 0.000005 SOL (Standard Network Fee)
            // We only skip if the reward is LESS than the cost to send it.
            if (payout > 0.000005) {
                try {
                    transaction.add(
                        SystemProgram.transfer({
                            fromPubkey: keypair.publicKey,
                            toPubkey: new PublicKey(holder.address),
                            lamports: Math.floor(payout * LAMPORTS_PER_SOL),
                        })
                    );
                    hasAction = true;
                } catch (err) {
                    console.warn(`Skipping invalid address: ${holder.address}`);
                }
            }
        }

        if (hasAction) {
            try {
                // Send Batch
                const signature = await sendAndConfirmTransaction(connection, transaction, [keypair]);
                successfulTransfers += chunk.length;
                console.log(`   Detailed Batch [${i}/${eligibleHolders.length}] Sent: ${signature}`);

                // Only log the FIRST batch to DB to save space, or maybe summary later
                if (i === 0) {
                    await addLog('REVSHARE', amountSOL, signature); // Log the first one as representative
                }
            } catch (e) {
                console.error(`❌ Failed to send batch [${i}]:`, e);
            }
        }
    }

    console.log('--- RevShare Distribution Complete ---\n');
    broadcastToChannel(`✅ *RevShare Complete*\nDistributed to ${successfulTransfers} holders.`);
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

    // --- ACCRUE TO VIRTUAL POTS ---
    await adjustPotBalance('burn_pot', burnAmount);
    await adjustPotBalance('lp_pot', lpAmount);

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

    // --- EXECUTE DYNAMIC STRATEGY (ON-CHAIN) ---

    // Function to perform market buy on Pump.fun via PumpPortal
    const executeMarketBuy = async (amountSOL: number, label: string): Promise<string | null> => {
        try {
            const PUMP_PORTAL_API = 'https://pumpportal.fun/api/trade';
            const response = await fetch(PUMP_PORTAL_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: "buy",
                    mint: TOKEN_MINT_ADDRESS,
                    amount: amountSOL,
                    denominatedInSol: "true",
                    slippage: 10,
                    priorityFee: 0.0001,
                    pool: "pump"
                })
            });

            if (response.status !== 200) {
                const error = await response.text();
                console.error(`❌ PumpPortal Buy Error (${label}): ${error}`);
                return null;
            }

            const buffer = await response.arrayBuffer();
            const txBuffer = Buffer.from(buffer);
            const transaction = VersionedTransaction.deserialize(new Uint8Array(txBuffer));
            transaction.sign([keypair]);

            const signature = await connection.sendTransaction(transaction);
            console.log(`✅ ${label} Success: ${signature}`);
            return signature;
        } catch (e) {
            console.error(`❌ ${label} Exception:`, e);
            return null;
        }
    };

    // ACTION: BUYBACK & BURN
    if (decision.action === 'BUY_BURN') {
        console.log(`🔥 EXECUTING AUTONOMOUS BUYBACK (${burnAmount.toFixed(4)} SOL)`);
        const signature = await executeMarketBuy(burnAmount, 'Buyback & Burn');

        if (signature) {
            broadcastToChannel(`🔥 *Autonomous Buyback & Burn* 🚀\nAllocated: \`${burnAmount.toFixed(4)} SOL\`\n[View Tx](https://solscan.io/tx/${signature})`);
            await addLog('BURN', burnAmount, signature);
            await adjustPotBalance('burn_pot', -burnAmount);
        }
    }

    // ACTION: LP INJECTION (FLOOR DEFENSE)
    else if (decision.action === 'ADD_LP') {
        console.log(`💧 EXECUTING AUTONOMOUS LP INJECTION (${lpAmount.toFixed(4)} SOL)`);
        const signature = await executeMarketBuy(lpAmount, 'LP Injection');

        if (signature) {
            broadcastToChannel(`💧 *Autonomous LP Injection* 🛡️\nAllocated: \`${lpAmount.toFixed(4)} SOL\`\n"Floor Defense Active"\n[View Tx](https://solscan.io/tx/${signature})`);
            await addLog('LP_ZAP', lpAmount, signature);
            await adjustPotBalance('lp_pot', -lpAmount);
        }
    }

    // Default: If WAIT or failed, they stay in virtual pots for the next run.
};
