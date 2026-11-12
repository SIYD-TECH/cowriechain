# 🐚 CowrieChain

> **Sovereign Non-Custodial Rotating Savings & Credit Association (ROSCA) on Ethereum Sepolia**  
> Bringing traditional African community savings (*Ajo*, *Esusu*, *Chama*, *Susu*, *Tontine*) and personal commitment vaults on-chain — 100% decentralized, non-custodial, and running serverless directly on Ethereum.

---

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![Wagmi](https://img.shields.io/badge/Wagmi-2.12-blue?logo=ethereum)](https://wagmi.sh/)
[![RainbowKit](https://img.shields.io/badge/RainbowKit-2.2-7B3FE4)](https://www.rainbowkit.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Solidity](https://img.shields.io/badge/Solidity-^0.8.20-363636?logo=solidity)](https://soliditylang.org/)
[![Foundry](https://img.shields.io/badge/Foundry-41_Passed-red?logo=ethereum)](https://getfoundry.sh/)
[![Coverage](https://img.shields.io/badge/Coverage-94.6%25-brightgreen)](https://getfoundry.sh/)
[![Network](https://img.shields.io/badge/Network-Ethereum_Sepolia-627EEA?logo=ethereum)](https://sepolia.etherscan.io/)

---

## 📜 Deployed Sepolia Smart Contracts

The CowrieChain smart contracts are deployed and verified on Ethereum Sepolia (`Chain ID: 11155111`):

| Contract | Address | Verification | Explorer Link |
| :--- | :--- | :--- | :--- |
| **`GroupSaveFactory`** *(Main CA)* | [`0xac6eb56fbbca66bf7d9a80c861ca6c90b114f8d1`](https://sepolia.etherscan.io/address/0xac6eb56fbbca66bf7d9a80c861ca6c90b114f8d1#code) | **Verified** | [Etherscan](https://sepolia.etherscan.io/address/0xac6eb56fbbca66bf7d9a80c861ca6c90b114f8d1#code) |
| **`SavingsVault`** *(SavingsGoal)* | [`0xfE4C229364Aba1478f0bE39c61778209f001561d`](https://sepolia.etherscan.io/address/0xfE4C229364Aba1478f0bE39c61778209f001561d#code) | **Verified** | [Etherscan](https://sepolia.etherscan.io/address/0xfE4C229364Aba1478f0bE39c61778209f001561d#code) |
| **`MockUSDC`** *(Test Asset)* | [`0x639aB79330a2504e84E5a8D4846a6333bB4BC8d3`](https://sepolia.etherscan.io/address/0x639aB79330a2504e84E5a8D4846a6333bB4BC8d3#code) | **Verified** | [Etherscan](https://sepolia.etherscan.io/address/0x639aB79330a2504e84E5a8D4846a6333bB4BC8d3#code) |
| **Sample Circle** | [`0x318ddca988eA36bC27A82e4CB9057a22D608e1f6`](https://sepolia.etherscan.io/address/0x318ddca988eA36bC27A82e4CB9057a22D608e1f6#code) | **Verified** | [Etherscan](https://sepolia.etherscan.io/address/0x318ddca988eA36bC27A82e4CB9057a22D608e1f6#code) |

- **Protocol Deployer & Treasury**: `0x97184EBAEB9FDCe449d5FbaF1311601005F8E811`
- **Deployment Manifest**: Recorded in [`contract/deployments/sepolia.json`](contract/deployments/sepolia.json)

---

## ⚡ 100% Serverless & Decentralized Architecture

CowrieChain operates **without any custodial backend server or centralized database**. 

Previous iterations relied on an off-chain keeper and API server that could experience cold starts or sleeping downtime. CowrieChain now runs completely decentralized:
- **Direct Web3 RPC Execution**: The Next.js frontend connects directly to Ethereum Sepolia via Wagmi v2 and Viem.
- **On-Chain Indexing**: The `GroupSaveFactory` contract tracks member circles and invitations on-chain (`_userCircles`, `getUserCirclesPaginated`), removing reliance on third-party indexers.
- **Permissionless Automation**: Any participant or observer can trigger round progression (`resolveRound()`) and default slashing directly on-chain when intervals elapse.
- **Client-Side Currency Conversion**: Seamless real-time Nigerian Naira (₦ / NGN) estimation alongside USD-pegged test stablecoin units (`mUSDC`).

---

## 🏗 Repository Structure

```text
cowriechain/
├── contract/             # EVM Smart Contracts & Foundry Suite
│   ├── src/                  # Solidity 0.8.20 sources
│   │   ├── GroupSave.sol         # Rotational savings circle (Ajo / ROSCA) with Model B Collateral
│   │   ├── GroupSaveFactory.sol  # Factory & registry for circle creation & on-chain discovery
│   │   ├── SavingsGoal.sol       # Multi-goal personal commitment vault (SavingsVault)
│   │   └── MockUSDC.sol          # 6-decimal test token with automated faucet
│   ├── test/                 # Automated Foundry test suites (41 tests, 94.6% coverage)
│   ├── script/               # Foundry deployment scripts (Deploy.s.sol)
│   ├── deployments/          # Sepolia deployment registry (sepolia.json)
│   ├── foundry.toml          # Foundry profile
│   └── README.md             # Detailed contract documentation
├── frontend/             # Next.js 14 App Router Web3 Application (Vercel)
│   ├── src/
│   │   ├── app/              # Routes: /, /dashboard, /circles, /goals, /rewards, /faucet
│   │   ├── components/       # Responsive UI layouts, drawer navigation, landing sections
│   │   ├── hooks/            # Custom Web3 hooks for direct contract calls
│   │   └── lib/              # contracts.js (ABIs, addresses, currency formatters)
│   ├── public/               # Static icons, branding assets, and SVGs
│   ├── .env.example          # Template for frontend environment variables
│   └── package.json          # Next.js 14, React 18, Wagmi, Viem, RainbowKit
├── lib/                  # Foundry Git Submodules
│   ├── forge-std/            # Foundry standard test & script library
│   └── openzeppelin-contracts/ # OpenZeppelin audited ERC-20, Ownable, ReentrancyGuard
├── scripts/              # Developer Tooling
│   └── extract-abis.js       # Extracts clean ABIs from Foundry artifacts to frontend
├── .gitmodules           # Submodule tracking for lib/forge-std & lib/openzeppelin-contracts
├── foundry.toml          # Root Foundry profile for root-level test execution
├── remappings.txt        # Solidity import remappings
├── vercel.json           # Vercel deployment configuration
├── package.json          # Monorepo root scripts
└── pnpm-workspace.yaml   # pnpm workspace definition
```

---

## ⚙️ Core Protocol Mechanisms

### 1. Rotational Savings Circles (`GroupSave.sol`)
- **Ajo / Esusu / ROSCA Mechanism**: Members pool periodic contributions into a communal pot disbursed to one member each round.
- **Model B Collateral Hold-Back**: Each member deposits an upfront collateral stake (equivalent to 1 contribution). If a member defaults in later rounds, their collateral is slashed to compensate the pot.
- **Fair Payout Shuffle**: Upon starting, payout order is pseudorandomly shuffled using Ethereum `prevrandao` for transparent, tamper-resistant order generation.
- **24-Hour Grace Period & 5% Late Fee**: If a member misses the primary contribution window, a 24-hour grace period opens. Late payments incur a 5% penalty paid directly to that round's beneficiary.
- **Insolvency Protection**: If default penalties exceed available collateral, the circle enters safe cancellation, refunding all unslashed collateral and contributions pro-rata to non-defaulting members.
- **Dual Currency Representation**: All amounts display both mUSDC and local Nigerian Naira (₦ at reference rate $1\text{ mUSDC} = ₦1,600$) for accessibility across emerging markets.

### 2. Personal Commitment Vaults (`SavingsGoal.sol`)
- **Target Savings Disciplined Escrow**: Users create isolated savings goals with custom target amounts and optional unlock dates.
- **Commitment Enforcement**: Early withdrawals before reaching the target or deadline incur a 10% penalty fee transferred to the protocol treasury, preventing impulsive break-of-savings.
- **Zero-Fee Completion**: Withdrawals are completely fee-free once target amounts or maturities are attained.

### 3. Rate-Limited In-App Testnet Faucet (`MockUSDC.sol`)
- Integrated faucet route (`/faucet`) allows any connected wallet on Sepolia to mint 1,000 test `mUSDC` every 12 hours.
- Prevents testnet pool congestion while giving new users immediate capital to test savings circles and goal vaults.

---

## 🧪 Smart Contract Testing & Coverage

CowrieChain contracts are verified using [Foundry](https://getfoundry.sh/).

### Test Results: 41 Passed (0 Failed)
```bash
forge test
```
```text
Ran 4 test suites: 41 tests passed, 0 failed, 0 skipped (41 total tests)
[PASS] GroupSaveTest (18 tests)
[PASS] GroupSaveFactoryTest (9 tests)
[PASS] SavingsVaultTest (9 tests)
[PASS] MockUSDCTest (5 tests)
```

### Coverage Report: 94.6% Core Coverage
```bash
forge coverage
```
| File | % Lines | % Statements | % Branches | % Funcs |
| :--- | :--- | :--- | :--- | :--- |
| `src/GroupSave.sol` | 87.82% | 85.81% | 72.84% | 86.67% |
| `src/GroupSaveFactory.sol` | 100.00% | 100.00% | 91.67% | 100.00% |
| `src/MockUSDC.sol` | 100.00% | 100.00% | 100.00% | 100.00% |
| `src/SavingsGoal.sol` | 98.25% | 97.44% | 94.44% | 100.00% |

---

## 🚀 Local Development

### Prerequisites
- Node.js >= 18.x
- `pnpm` (or `npm`)
- [Foundry](https://getfoundry.sh/) (`forge`, `cast`)
- Git

### Initial Setup
```bash
# 1. Clone repository with submodules
git clone --recurse-submodules https://github.com/SIYD-TECH/cowriechain.git
cd cowriechain

# 2. If submodules were not cloned recursively:
git submodule update --init --recursive

# 3. Install frontend dependencies
pnpm install
```

### Running the Frontend
```bash
# Start Next.js dApp at http://localhost:3000
pnpm dev

# Or directly from the frontend directory:
cd frontend && npm run dev
```

### Compiling & Testing Contracts
```bash
# Run Foundry automated test suite
forge test

# Run tests with gas snapshot
forge test --gas-report

# Extract updated ABIs to frontend
pnpm export:abis
```

---

## 🌐 Frontend Deployment (Vercel)

The frontend is a standard Next.js 14 App Router application deployed on Vercel.

1. Import repository into [Vercel](https://vercel.com/).
2. Set **Root Directory** to `frontend`.
3. Configure **Environment Variables** (see `frontend/.env.example`):
   ```env
   NEXT_PUBLIC_CHAIN_ID=11155111
   NEXT_PUBLIC_SEPOLIA_RPC_URL=https://rpc.sepolia.org
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
   NEXT_PUBLIC_MOCK_USDC_ADDRESS=0x639aB79330a2504e84E5a8D4846a6333bB4BC8d3
   NEXT_PUBLIC_SAVINGS_VAULT_ADDRESS=0xfE4C229364Aba1478f0bE39c61778209f001561d
   NEXT_PUBLIC_GROUP_SAVE_FACTORY_ADDRESS=0xac6eb56fbbca66bf7d9a80c861ca6c90b114f8d1
   ```
4. Deploy. No backend, database, or external relayer configuration required.

---

## 🔒 Security & Verifiability

- **Contract Source Code**: All deployed contracts are verified on [Sepolia Etherscan](https://sepolia.etherscan.io/address/0xac6eb56fbbca66bf7d9a80c861ca6c90b114f8d1#code).
- **Non-Custodial**: Funds are locked solely inside smart contract escrow controlled by programmed rules and timelocks.
- **Audit-Ready Code**: Written using OpenZeppelin's battle-tested `SafeERC20`, `ReentrancyGuard`, and `Ownable` modules.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
