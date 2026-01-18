# RightWhale Protocol 🐋💨

The **RightWhale Protocol** is an autonomous liquidity engine designed to maintain price stability and momentum for the $RightWhale token on Solana. The system uses a real-time AI core to analyze market cycles and execute strategic buybacks, burns, and liquidity injections.

## 🚀 core Features

- **Autonomous Market Maker (AMM) Integration**: Directly connected to Pump.fun for real-time liquidity management.
- **Neural Core Analysis**: High-frequency monitoring of price action and volume to trigger strategic decisions.
- **Dynamic RevShare**: Automatic distribution of protocol fees to eligible holders.
- **Floor Defense System**: Algorithmic liquidity injections during support tests.
- **Momentum Squeeze**: Automated buyback and burn cycles during breakout phases.

## 🛠 Tech Stack

- **Dashboard**: Next.js, Framer Motion, TailwindCSS, Lucide Icons.
- **Engine**: Node.js, TypeScript, SQLite, Telegraf (Telegram Integration).
- **Blockchain**: Solana Web3.js, PumpPortal API.

## 📦 Project Structure

```text
├── dashboard/          # Next.js Frontend (Dashboard & Docs)
├── engine/             # Node.js Backend (AI Core & On-chain Execution)
└── README.md           # This file
```

## 🔧 Setup & Configuration

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation
1. Clone the repository.
2. Install dependencies for both components:
   ```bash
   cd dashboard && npm install
   cd ../engine && npm install
   ```
3. Configure your `.env` in the `engine/` directory (see `.env.example`).

### Running Locally
Run both services in separate terminals:
```bash
# Terminal 1
cd dashboard && npm run dev

# Terminal 2
cd engine && npm run dev
```

## ⛓ Protocols
The protocol currently operates on **Solana Mainnet**.
- **CA**: `AdwrMB45dAVuSfDT7YRVshK4QJtzaJyAKVKimJDrpump`
- **DEX**: [Pump.fun](https://pump.fun/coin/AdwrMB45dAVuSfDT7YRVshK4QJtzaJyAKVKimJDrpump)

## ⚖️ Governance
The Strategy & Governance module is currently in **Standby** (Phase 2). Community voting and parameter adjustment will be enabled post-migration to Raydium.

---
© 2026 RightWhale Protocol. Built for the deep.
