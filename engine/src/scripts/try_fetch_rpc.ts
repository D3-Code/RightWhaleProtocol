import { Connection, PublicKey } from '@solana/web3.js';
import * as dotenv from 'dotenv';
dotenv.config({ path: 'engine/.env' });

const METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

async function getMetadata(mintAddress: string) {
    const rpc = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    const connection = new Connection(rpc);

    console.log(`Connecting to ${rpc}...`);

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

        console.log(`Metadata PDA: ${metadataPDA.toBase58()}`);

        const accountInfo = await connection.getAccountInfo(metadataPDA);
        if (!accountInfo) {
            console.log("No metadata account found.");
            return;
        }

        const data = accountInfo.data;
        console.log(`Got data: ${data.length} bytes`);

        // Skip Key (1) + UpdateAuth (32) + Mint (32) = 65 bytes
        let offset = 1 + 32 + 32;

        const readString = () => {
            const len = data.readUInt32LE(offset);
            offset += 4;
            const str = data.subarray(offset, offset + len).toString('utf8');
            offset += len;
            // Remove null bytes padding if any (older tokens used fixed 32 bytes with padding)
            return str.replace(/\0/g, '');
        };

        const name = readString();
        const symbol = readString();
        const uri = readString();

        console.log("--- Result ---");
        console.log(`Name: ${name}`);
        console.log(`Symbol: ${symbol}`);
        console.log(`URI: ${uri}`);

    } catch (e) {
        console.error("Error:", e);
    }
}

const mint = process.argv[2] || "7tPj7H4a6e2e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e"; // Example
getMetadata(mint);
