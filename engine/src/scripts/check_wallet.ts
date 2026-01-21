import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { loadWallet } from '../wallet';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function check() {
    console.log("🔍 Scanning Wallet Holdings...");

    const keypair = loadWallet();
    if (!keypair) return;

    console.log(`Wallet Address: ${keypair.publicKey.toBase58()}`);

    const rpc = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    const connection = new Connection(rpc, 'confirmed');

    // Get SOL Balance
    const solBalance = await connection.getBalance(keypair.publicKey);
    console.log(`SOL Balance: ${(solBalance / 1e9).toFixed(4)} SOL`);

    // Get All Tokens
    const accounts = await connection.getParsedTokenAccountsByOwner(keypair.publicKey, {
        programId: TOKEN_PROGRAM_ID
    });

    console.log(`\nFound ${accounts.value.length} Token Accounts:`);

    if (accounts.value.length === 0) {
        console.log("⚠️ No Token Accounts found. This wallet holds NO tokens.");
        return;
    }

    let foundTarget = false;
    const targetMint = process.env.TOKEN_MINT_ADDRESS;

    accounts.value.forEach((account) => {
        const info = account.account.data.parsed.info;
        const mint = info.mint;
        const amount = info.tokenAmount.uiAmount;
        const decimals = info.tokenAmount.decimals;

        console.log(`- Mint: ${mint}`);
        console.log(`  Balance: ${amount}`);
        console.log(`  Decimals: ${decimals}`);

        if (mint === targetMint) {
            foundTarget = true;
            console.log(`  ✅ THIS IS THE TARGET TOKEN ($RightWhale)`);
        }
        console.log('---');
    });

    if (!foundTarget) {
        console.log(`\n❌ WARNING: Target Mint ${targetMint} was NOT found in this wallet.`);
        console.log("Double check that you have sent the tokens to this wallet address.");
    }
}

check();
