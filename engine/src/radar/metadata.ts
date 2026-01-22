import { Connection, PublicKey } from '@solana/web3.js';
import * as dotenv from 'dotenv';
dotenv.config();

const PUMP_API = 'https://frontend-api.pump.fun/coins';
const METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

type TokenMetadata = {
    mint: string;
    name: string;
    symbol: string;
    image_uri?: string;
};

const cache = new Map<string, TokenMetadata>();

async function getMetadataFromRPC(mintAddress: string): Promise<TokenMetadata | null> {
    const rpc = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    const connection = new Connection(rpc);

    try {
        const mint = new PublicKey(mintAddress);
        const [metadataPDA] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("metadata"),
                METADATA_PROGRAM_ID.toBuffer(),
                mint.toBuffer(),
            ],
            METADATA_PROGRAM_ID
        );

        const accountInfo = await connection.getAccountInfo(metadataPDA);
        if (!accountInfo) return null;

        const data = accountInfo.data;

        // Skip Key (1) + UpdateAuth (32) + Mint (32) = 65 bytes
        let offset = 65;

        const readString = () => {
            const len = data.readUInt32LE(offset);
            offset += 4;
            const str = data.subarray(offset, offset + len).toString('utf8');
            offset += len;
            return str.replace(/\0/g, '');
        };

        const name = readString();
        const symbol = readString();
        const uri = readString();

        return {
            mint: mintAddress,
            name,
            symbol,
            image_uri: uri // Use the URI as image_uri for now (frontend handles if it points to JSON)
        };

    } catch (e) {
        console.error(`[Metadata] RPC Fetch Failed for ${mintAddress}:`, e);
        return null;
    }
}

export const fetchTokenMetadata = async (mint: string): Promise<TokenMetadata | null> => {
    // Check cache first
    if (cache.has(mint)) {
        return cache.get(mint)!;
    }

    // 1. Try API (Fastest for images)
    try {
        const response = await fetch(`${PUMP_API}/${mint}`, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        if (response.ok) {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const data = await response.json() as any;
                const metadata: TokenMetadata = {
                    mint,
                    name: data.name || '',
                    symbol: data.symbol || '',
                    image_uri: data.image_uri || data.image || ''
                };
                cache.set(mint, metadata);
                return metadata;
            }
        }
    } catch (e) {
        // Ignore API failure, fallthrough to RPC
    }

    // 2. Fallback to RPC (Robust for Name/Symbol)
    console.log(`[Metadata] API failed, switching to RPC for ${mint}...`);
    const rpcData = await getMetadataFromRPC(mint);
    if (rpcData) {
        // Log it
        console.log(`[Metadata] RPC Resolved: ${rpcData.symbol}`);

        // If URI is IPFS, we might want to fetch it to get the real image...
        // But for now, returning the Name/Symbol is enough to fix the UI "UNKNOWN" bug.
        // And often the URI *is* the image or leads to it.

        cache.set(mint, rpcData);
        return rpcData;
    }

    return null;
};

// Clear cache periodically (every hour) to avoid memory bloat
setInterval(() => {
    cache.clear();
    console.log('🧹 Token metadata cache cleared');
}, 60 * 60 * 1000);
