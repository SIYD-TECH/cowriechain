# 🐚 CowrieChain Monorepo

> **Sovereign Non-Custodial Savings & Rotational Credit on Ethereum Sepolia**  
> Bringing traditional African community savings (*Ajo*, *Esusu*, *Chama*, *Susu*, *Tontine*) and personal commitment vaults on-chain — with zero custodians, automated escrow, and cryptographic discipline.

---

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![Wagmi](https://img.shields.io/badge/Wagmi-2.12-blue?logo=ethereum)](https://wagmi.sh/)
[![RainbowKit](https://img.shields.io/badge/RainbowKit-2.2-7B3FE4)](https://www.rainbowkit.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Solidity](https://img.shields.io/badge/Solidity-^0.8.20-363636?logo=solidity)](https://soliditylang.org/)
[![Foundry](https://img.shields.io/badge/Foundry-Tested-red?logo=ethereum)](https://getfoundry.sh/)
[![Network](https://img.shields.io/badge/Network-Ethereum_Sepolia-627EEA?logo=ethereum)](https://sepolia.etherscan.io/)

---

## 📜 Deployed Sepolia Smart Contracts

The CowrieChain smart contracts are deployed and verified on Ethereum Sepolia (`Chain ID: 11155111`):

| Contract | Address | Verification | Explorer Link |
| :--- | :--- | :--- | :--- |
| **`MockUSDC`** | [`0x5368a612Ec647dd85d63351dca7CB6C36100103B`](https://sepolia.etherscan.io/address/0x5368a612Ec647dd85d63351dca7CB6C36100103B#code) | **Verified** | [Etherscan](https://sepolia.etherscan.io/address/0x5368a612Ec647dd85d63351dca7CB6C36100103B#code) |
| **`SavingsVault`** | [`0xFa2982961244C4652a30A3144D11D09400234987`](https://sepolia.etherscan.io/address/0xFa2982961244C4652a30A3144D11D09400234987#code) | **Verified** | [Etherscan](https://sepolia.etherscan.io/address/0xFa2982961244C4652a30A3144D11D09400234987#code) |
| **`GroupSaveFactory`** | [`0x2d1bBE433d2571559c1f13e918d05Dbe11b3A275`](https://sepolia.etherscan.io/address/0x2d1bBE433d2571559c1f13e918d05Dbe11b3A275#code) | **Verified** | [Etherscan](https://sepolia.etherscan.io/address/0x2d1bBE433d2571559c1f13e918d05Dbe11b3A275#code) |
| **Sample Circle** | [`0x318ddca988eA36bC27A82e4CB9057a22D608e1f6`](https://sepolia.etherscan.io/address/0x318ddca988eA36bC27A82e4CB9057a22D608e1f6#code) | **Verified** | [Etherscan](https://sepolia.etherscan.io/address/0x318ddca988eA36bC27A82e4CB9057a22D608e1f6#code) |

- **Protocol Deployer & Treasury**: `0x97184EBAEB9FDCe449d5FbaF1311601005F8E811`
- **Deployment Manifest**: Recorded in [`contract/deployments/sepolia.json`](contract/deployments/sepolia.json)

---

## 🏗 Repository Structure

The CowrieChain repository is organized into three independently buildable and deployable packages:

```text
cowriechain/
├── contract/             # EVM Smart Contracts & Foundry Suite
│   ├── src/                  # Solidity 0.8.20 sources (GroupSave, GroupSaveFactory, SavingsGoal, MockUSDC)
│   ├── test/                 # Foundry test suites (38 automated unit & integration tests)
│   ├── script/               # Foundry deployment scripts (Deploy.s.sol)
│   ├── deployments/          # Sepolia deployment registry (sepolia.json)
│   ├── foundry.toml          # Foundry profile for contract directory execution
│   └── README.md             # Smart contract specifications
├── backend/              # Node.js / Express API & Keeper Service (Render)
│   ├── src/
│   │   ├── config/           # Environment and contract configuration
│   │   ├── controllers/      # Route controllers (health, circles, vaults, rewards, relayer)
│   │   ├── services/         # Blockchain Viem service, indexer, relayer bot
│   │   ├── middleware/       # Address validation, pagination, errorHandler
│   │   ├── routes/           # Express router endpoints
│   │   └── server.js         # Express app entrypoint with Helmet and dynamic CORS
│   ├── test/                 # Automated Node.js unit tests (node:test)
│   ├── .env.example          # Template for backend environment variables
│   └── package.json          # Express, Viem, Helmet, CORS dependencies
├── frontend/             # Next.js 14 App Router Web3 Application (Vercel)
│   ├── src/
│   │   ├── app/              # Routes: /, /auth, /dashboard, /circles, /goals, /rewards
│   │   ├── components/       # Responsive layouts, Sidebar drawer, Landing sections
│   │   ├── hooks/            # Custom Web3 & UI interaction hooks
│   │   └── lib/contracts.js  # Centralized contract addresses, ABIs, and formatters
│   ├── public/               # Static icons, branding assets, and SVGs
│   ├── vercel.json           # Vercel security headers and routing config
│   ├── .env.example          # Template for frontend environment variables
│   └── package.json          # Next.js 14, React 18, Wagmi, Viem, RainbowKit
├── lib/                  # Foundry Git Submodules
│   ├── forge-std/            # Foundry standard test & script library
│   └── openzeppelin-contracts/ # OpenZeppelin audited ERC-20, Ownable, ReentrancyGuard
├── scripts/              # Shared Monorepo Tooling
│   └── extract-abis.js       # Extracts clean ABIs from Foundry artifacts to frontend & backend
├── .gitmodules           # Submodule tracking for lib/forge-std & lib/openzeppelin-contracts
├── foundry.toml          # Root Foundry profile for root-level test execution
├── remappings.txt        # Solidity import remappings
├── render.yaml           # Declarative Blueprint for Render backend deployment
├── vercel.json           # Monorepo fallback Vercel configuration
├── package.json          # Monorepo root scripts
└── pnpm-workspace.yaml   # pnpm monorepo workspace definition
```

---

## ⚙️ Smart Contract Architecture

1. **`GroupSaveFactory.sol`**:
   - Deploys new `GroupSave` circles with verified parameters.
   - Maintains an on-chain index of circles per user address (`_userCircles`) to eliminate third-party indexing dependency for initial queries.

2. **`GroupSave.sol`**:
   - Rotational savings circle (ROSCA) with Model B collateral hold-back.
   - Enforces a 1-contribution collateral stake upon joining.
   - Conducts a random payout order shuffle via `prevrandao` when the circle starts.
   - Enforces a 5% late fee during the grace period and permissionless automated round resolution (`resolveRound()`).

3. **`SavingsGoal.sol` (`SavingsVault`)**:
   - Multi-goal commitment vault where users create isolated target savings goals.
   - Enforces a 10% penalty fee on early withdrawals, directed to `treasury` to protect savings discipline.
   - Allows penalty-free withdrawal once target amount or deadline is reached.

4. **`MockUSDC.sol`**:
   - Standard 6-decimal ERC-20 replicating live USDC on Sepolia testnet.

---

## 🚀 Local Development

### Prerequisites
- Node.js >= 18.x
- `pnpm` (or `npm`)
- [Foundry](https://getfoundry.sh/) (`forge`, `cast`)
- Git

### Initial Setup
```bash
# 1. Clone the repository with submodules
git clone --recurse-submodules https://github.com/your-username/cowriechain.git
cd cowriechain

# 2. If submodules were not cloned recursively:
git submodule update --init --recursive

# 3. Install dependencies across frontend and backend
pnpm install
```

### Running Applications
```bash
# Start frontend only (http://localhost:3000)
pnpm dev

# Start backend only (http://localhost:5000)
pnpm dev:backend

# Or navigate directly into individual folders:
cd frontend && npm run dev
cd backend && npm run dev
```

### Running Automated Tests
```bash
# Run backend tests (7 unit & integration tests)
pnpm test:backend
# or: cd backend && npm test

# Run Foundry contract tests (38 tests)
pnpm test:contracts
# or: forge test
# or: cd contract && forge test
```

### ABI Synchronization
Whenever smart contracts are recompiled:
```bash
pnpm export:abis
# Copies exact extracted ABIs to frontend/src/lib/abis/ and backend/src/abis/
```

---

## 🌐 Deployment Guide

CowrieChain is architected to allow **independent, zero-friction deployments** for both the backend and frontend.

### 1. Deploying Backend to Render

The backend is completely self-contained in `backend/` and includes an automated health check endpoint at `/api/health`.

#### Option A: Declarative Blueprint (Recommended)
1. Go to [Render Dashboard](https://dashboard.render.com/) -> **Blueprints**.
2. Connect your GitHub repository.
3. Render reads `render.yaml` automatically:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Health Check Path: `/api/health`

#### Option B: Manual Web Service Setup
1. In Render Dashboard, click **New +** -> **Web Service**.
2. Select your repository.
3. Configure settings:
   - **Name**: `cowriechain-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/api/health`
4. Set **Environment Variables** (see `backend/.env.example`):
   ```env
   NODE_ENV=production
   PORT=10000
   CHAIN_ID=11155111
   SEPOLIA_RPC_URL=https://rpc.sepolia.org
   MOCK_USDC_ADDRESS=0x5368a612Ec647dd85d63351dca7CB6C36100103B
   SAVINGS_VAULT_ADDRESS=0xFa2982961244C4652a30A3144D11D09400234987
   GROUP_SAVE_FACTORY_ADDRESS=0x2d1bBE433d2571559c1f13e918d05Dbe11b3A275
   CORS_ORIGIN=https://cowriechain.vercel.app,https://*.vercel.app
   ```
   *(Optional for automated round resolution bot: `RELAYER_PRIVATE_KEY` and `RELAYER_API_KEY`)*

---

### 2. Deploying Frontend to Vercel

The frontend is a standard Next.js 14 App Router application in `frontend/`.

#### Cleanest Monorepo Setup (Recommended)
1. Go to [Vercel Dashboard](https://vercel.com/) -> **Add New Project**.
2. Import your GitHub repository.
3. In **Project Configuration**:
   - **Root Directory**: Click *Edit* and select **`frontend`**.
   - **Framework Preset**: `Next.js` (auto-detected).
   - **Build Command**: Default (`npm run build` or `pnpm build`).
   - **Output Directory**: Default (`.next`).
4. Set **Environment Variables** (see `frontend/.env.example`):
   ```env
   NEXT_PUBLIC_CHAIN_ID=11155111
   NEXT_PUBLIC_SEPOLIA_RPC_URL=https://rpc.sepolia.org
   NEXT_PUBLIC_MOCK_USDC=0x5368a612Ec647dd85d63351dca7CB6C36100103B
   NEXT_PUBLIC_SAVINGS_VAULT=0xFa2982961244C4652a30A3144D11D09400234987
   NEXT_PUBLIC_GROUPSAVE_FACTORY=0x2d1bBE433d2571559c1f13e918d05Dbe11b3A275
   NEXT_PUBLIC_API_URL=https://cowriechain-backend.onrender.com/api
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_reown_project_id
   ```
5. Click **Deploy**.

---

### 3. Connecting Frontend and Backend

1. When your Vercel deployment finishes, copy its production URL (e.g., `https://cowriechain.vercel.app`).
2. In your Render Dashboard, set `CORS_ORIGIN` to:
   ```text
   https://cowriechain.vercel.app,https://*.vercel.app
   ```
3. In your Vercel Dashboard, ensure `NEXT_PUBLIC_API_URL` points to your Render backend:
   ```text
   https://<your-render-app>.onrender.com/api
   ```
4. Re-deploy the frontend on Vercel so the production API URL is baked into the client bundle.

---

## 🔒 Security & Git Staging Safety

### Environment File Safety
- All sensitive configuration (`.env`, `.env.local`, `*.pem`, `*.key`) is strictly ignored in `.gitignore`.
- Public templates (`.env.example`) are checked in to document all required environment keys.
- **Never commit private keys, mnemonic phrases, or RPC provider keys.**

### Git Submodules (`lib/`)
The repository uses Git submodules for Foundry contract dependencies:
- `lib/forge-std` (tracked at `v1.17.0`)
- `lib/openzeppelin-contracts` (tracked at `v5.7.0`)

Both are registered in `.gitmodules`. When staging changes, stage `.gitmodules` and the `lib/` gitlink entries (`git add .gitmodules lib/forge-std lib/openzeppelin-contracts`).

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
