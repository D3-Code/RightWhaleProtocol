import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import dotenv from 'dotenv';
dotenv.config();

export const loadWallet = (): Keypair | null => {
    const secretKeyString = process.env.KEYPAIR_SECRET_KEY;

    if (!secretKeyString || secretKeyString === '[]') {
        console.error('❌ KEYPAIR_SECRET_KEY is missing or empty in .env');
        return null;
    }

    try {
        let secretKey: Uint8Array;

        // Support both JSON Array format "[1,2,3...]" and Base58 string format
        if (secretKeyString.startsWith('[')) {
            secretKey = Uint8Array.from(JSON.parse(secretKeyString));
        } else {
            secretKey = bs58.decode(secretKeyString);
        }

        const keypair = Keypair.fromSecretKey(secretKey);
        console.log(`✅ Wallet Loaded: ${keypair.publicKey.toBase58()}`);
        return keypair;
    } catch (error) {
        console.error('❌ Failed to load wallet from secret key:', error);
        return null;
    }
};
