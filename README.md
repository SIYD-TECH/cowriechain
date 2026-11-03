# 🐚 CowrieChain

> **Sovereign Non-Custodial Savings & Rotational Credit on EVM**  
> Bringing traditional African community savings (*Ajo*, *Esusu*, *Chama*, *Susu*) and personal commitment vaults on-chain — with zero custodians, automated escrow, and cryptographic discipline.

---

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![Wagmi](https://img.shields.io/badge/Wagmi-2.12-blue?logo=ethereum)](https://wagmi.sh/)
[![RainbowKit](https://img.shields.io/badge/RainbowKit-2.2-7B3FE4)](https://www.rainbowkit.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Network](https://img.shields.io/badge/Network-Ethereum_Sepolia-627EEA?logo=ethereum)](https://sepolia.etherscan.io/)

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Core Smart Contract Architecture](#-core-smart-contract-architecture)
  - [1. GroupSave Contract (Rotational Savings / ROSCA)](#1-groupsave-contract-rotational-savings--rosca)
  - [2. SavingsGoal Contract (Commitment Vaults)](#2-savingsgoal-contract-commitment-vaults)
  - [3. Reward Pool & Consistency Engine](#3-reward-pool--consistency-engine)
  - [4. MockUSDC Contract (ERC-20 Test Asset)](#4-mockusdc-contract-erc-20-test-asset)
- [Smart Contract Interface Reference](#-smart-contract-interface-reference)
- [Application Architecture & Tech Stack](#-application-architecture--tech-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running Locally](#running-locally)
- [Smart Contract Deployment & Integration](#-smart-contract-deployment--integration)
- [Security & Risk Disclosure](#-security--risk-disclosure)
- [Contributing & License](#-contributing--license)

---

## 🌟 Overview

Across Africa and Latin America, centuries-old community lending and savings circles—known variably as **Ajo**, **Esusu**, **Chama**, **Tontines**, or **ROSCAs** (Rotating Savings and Credit Associations)—have formed the financial backbone of local economies. However, traditional circles suffer from key structural vulnerabilities:
- Trusted collectors or treasurers can mismanage or abscond with pooled funds.
- Members can default after collecting their round payout.
- Individual savings are frequently eroded by inflation or impulsive spending.

**CowrieChain** migrates these practices entirely on-chain through deterministic, tamper-proof EVM smart contracts:
- **No Custodians**: Funds are strictly held by auditable smart contract vaults.
- **Collateral-Backed Rotations**: Members stake collateral up-front; if a participant misses their periodic contribution, their collateral is slashed to keep the circle whole.
- **Impulse-Resistant Vaults**: Personal goal vaults enforce strict timelocks or target balances with an automatic early-exit penalty that recycles into community rewards.
- **Zero-KYC Web3 Sign-in**: Users authenticate entirely via self-custodial EVM wallets (MetaMask, Rabby, Rainbow, Coinbase Wallet, WalletConnect).

---

## ⚙️ Core Smart Contract Architecture

```
                          ┌──────────────────────────┐
                          │   CowrieChain Protocol   │
                          └─────────────┬────────────┘
                                        │
             ┌──────────────────────────┼─────────────────────────┐
             │                          │                         │
             ▼                          ▼                         ▼
   ┌───────────────────┐      ┌───────────────────┐     ┌───────────────────┐
   │     GroupSave     │      │    SavingsGoal    │     │    Reward Pool    │
   │  (Rotational/Ajo) │      │(Commitment Vaults)│     │(Recycled & Yield) │
   └─────────┬─────────┘      └─────────┬─────────┘     └─────────┬─────────┘
             │                          │                         │
             │ Collateral Stakes        │ 5% Early-Exit Fee       │ Bonus Payouts
             ▼                          └────────────────────────►│
      [ Circle Payouts ]                                    [ Diligent Savers ]
```

### 1. GroupSave Contract (Rotational Savings / ROSCA)
An automated escrow system executing fixed-cadence round distributions:
- **Membership & Locking**: A predefined number of participants (`maxMembers`) join a circle. Once quorum is reached, the circle is locked (`lock()`).
- **Collateral Staking**: Each participant deposits collateral (`depositCollateral()`) prior to round initiation to prevent default risk.
- **Cyclic Contributions**: During each cycle, each active member deposits a fixed contribution (`contribute()`).
- **Round Finalization & Claiming**: Once all members have contributed or the cycle deadline triggers, the round is finalized (`finalizeRound()`). The scheduled recipient for that cycle claims the entire pot (`claim()`).
- **Collateral Release**: Upon successful completion of all rounds across all cycles, member collateral is released in full (`releaseCollateral()`).
- **Circuit Breaker**: Protocol-level emergency pause (`togglePause()`) prevents state transitions in abnormal market or network conditions.

### 2. SavingsGoal Contract (Commitment Vaults)
A personal locked savings vault designed to cultivate financial discipline:
- **Configuration**: User establishes `targetAmount`, maturity `deadline`, and descriptive metadata (`goalName`).
- **Incremental Deposits**: Direct top-ups via `contribute(amount)` using stable assets (e.g., Mock USDC).
- **Maturity Withdrawal**: When the target amount is hit or the timestamp matures beyond `deadline`, the saver executes `withdraw()` with **0% protocol fees**.
- **Early-Exit Mechanism**: If the saver needs liquidity before maturity, they can trigger `withdrawEarly()`. A strict penalty (e.g., 5%) is charged and routed directly into the protocol's community reward pool.

### 3. Reward Pool & Consistency Engine
- Pre-funded incentives and recycled penalty fees reward consistent saving habits.
- Users accumulate consistency points for paying circle cycles on time and completing vaults without early cancellations.
- Rewards are distributed to disciplined users periodically (quarterly).

### 4. MockUSDC Contract (ERC-20 Test Asset)
- 6-decimal standard ERC-20 token simulating stablecoin functionality for test environments.
- Features a public testnet `mint(to, amount)` function for seamless sandbox testing on Sepolia without real financial risk.

---

## 📑 Smart Contract Interface Reference

The frontend interacts with the EVM contracts using standard ABIs defined in [`src/lib/contracts.js`](file:///c:/Users/hp/Documents/GitHub/cowriechain/src/lib/contracts.js):

### GroupSave ABI (`GROUP_SAVE_ABI`)
| Function | Type | Inputs | Outputs | Description |
| :--- | :--- | :--- | :--- | :--- |
| `members(uint256)` | View | `index` | `address` | Returns member address at index |
| `isMember(address)` | View | `account` | `bool` | Checks circle membership |
| `locked()` | View | — | `bool` | True if member recruitment is closed |
| `currentRound()` | View | — | `uint256` | Current active rotation cycle index |
| `roundTotal(uint256)` | View | `roundId` | `uint256` | Total tokens accumulated in specified round |
| `roundFinalized(uint256)` | View | `roundId` | `bool` | Whether round payouts are locked & verified |
| `claimable(address)` | View | `account` | `uint256` | Amount available for designated recipient to claim |
| `collateral(address)` | View | `account` | `uint256` | Collateral balance staked by account |
| `contributionAmount()` | View | — | `uint256` | Required periodic deposit per member |
| `maxMembers()` | View | — | `uint256` | Capacity limit for circle members |
| `totalRounds()` | View | — | `uint256` | Total rounds in a full circle lifecycle |
| `join()` | Mutating | — | — | Joins the circle before locking |
| `lock()` | Mutating | — | — | Freezes membership and enables round start |
| `depositCollateral(uint256)` | Mutating | `amount` | — | Stakes security deposit |
| `contribute()` | Mutating | — | — | Pays user's share for current cycle |
| `finalizeRound()` | Mutating | — | — | Closes current cycle and sets claimable balance |
| `claim()` | Mutating | — | — | Recipient withdraws the completed cycle pot |
| `releaseCollateral()` | Mutating | — | — | Returns staked collateral once all rounds complete |
| `togglePause()` | Mutating | — | — | Emergency circuit breaker |

### SavingsGoal ABI (`SAVINGS_GOAL_ABI`)
| Function | Type | Inputs | Outputs | Description |
| :--- | :--- | :--- | :--- | :--- |
| `goalName()` | View | — | `string` | Label/title of the vault goal |
| `targetAmount()` | View | — | `uint256` | Target savings amount (in token base units) |
| `deadline()` | View | — | `uint256` | Unix timestamp of timelock maturity |
| `saved()` | View | — | `uint256` | Total deposited balance |
| `withdrawn()` | View | — | `bool` | Whether vault funds have already been claimed |
| `progressBps()` | View | — | `uint256` | Progress represented in basis points (100% = 10,000 bps) |
| `contribute(uint256)` | Mutating | `amount` | — | Deposits tokens into the goal vault |
| `withdraw()` | Mutating | — | — | Full withdrawal upon maturity or target hit (0% fee) |
| `withdrawEarly()` | Mutating | — | — | Early withdrawal with 5% penalty recycled to rewards |

### MockUSDC ABI (`MOCK_USDC_ABI`)
- `decimals()`: Returns `6`
- `balanceOf(address account)`: Returns current balance
- `allowance(address owner, address spender)`: Queries token approval limits
- `approve(address spender, uint256 value)`: Authorizes vault or circle to pull funds
- `transfer(address to, uint256 value)`: Transfers tokens
- `mint(address to, uint256 amount)`: Test faucet minting

---

## 🛠 Application Architecture & Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Client Components, Server-side Metadata)
- **Language**: JavaScript (ES6+), React 18
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with PostCSS
- **Animations**: [Framer Motion](https://www.framer-motion.com/) (Spring dynamics, interactive tilt cards, scroll-triggered reveals)
- **Web3 Integrations**:
  - [Wagmi 2](https://wagmi.sh/): React hooks for contract read/write interactions and transaction lifecycle
  - [Viem 2](https://viem.sh/): EVM client, ABI encoding, and cryptographic utilities
  - [RainbowKit 2](https://www.rainbowkit.com/): Self-custody wallet connection modal
  - [TanStack React Query 5](https://tanstack.com/query): Asynchronous query caching and state orchestration
- **Typography & Icons**: Google Fonts (Sora, Inter, JetBrains Mono) & Google Material Symbols

---

## 📂 Project Directory Structure

```text
cowriechain/
├── public/                 # Static assets and icons
├── src/
│   ├── app/                # Next.js App Router routes
│   │   ├── auth/           # Wallet authentication screen
│   │   ├── circles/        # ROSCA community management
│   │   │   ├── [id]/       # Circle detail view & round tracker
│   │   │   ├── join/       # Circle discovery and joining
│   │   │   └── new/        # Circle creation wizard
│   │   ├── dashboard/      # User metrics overview & portfolio stats
│   │   ├── goals/          # Personal commitment vaults
│   │   │   ├── [id]/       # Vault detail, deposit & early exit modal
│   │   │   └── new/        # Vault setup form
│   │   ├── rewards/        # Protocol reward pool & consistency claims
│   │   ├── globals.css     # Global styles and Tailwind configuration
│   │   ├── layout.js       # App root layout with font imports
│   │   ├── page.js         # Landing page
│   │   └── providers.js    # RainbowKit, Wagmi & React Query setup
│   ├── components/         # Modular UI components
│   │   ├── landing/        # Header, Hero, Steps, ValueProps, FAQ, etc.
│   │   └── Sidebar.js      # Global navigation shell for authenticated pages
│   ├── hooks/              # Custom React hooks (useReveal, etc.)
│   └── lib/
│       └── contracts.js    # Contract addresses, ABIs & currency formatters
├── eslint.config.mjs       # Linting configurations
├── next.config.mjs         # Next.js framework configuration
├── package.json            # Dependencies and scripts
└── pnpm-workspace.yaml     # Workspace build settings
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) `>= 18.18.0`
- [pnpm](https://pnpm.io/) `>= 9.0.0` (or `npm` / `yarn`)
- An EVM-compatible browser wallet (MetaMask, Rabby, Rainbow, etc.)

### Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/your-username/cowriechain.git
cd cowriechain
pnpm install
```

### Environment Variables
Create a `.env.local` file in the root directory:
```env
# Address of the deployed MockUSDC or stablecoin on Sepolia
NEXT_PUBLIC_MOCK_USDC=0x0000000000000000000000000000000000000000

# WalletConnect Cloud Project ID (get one at https://cloud.reown.com)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

### Running Locally
Run the development server:
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

Build for production:
```bash
pnpm build
pnpm start
```

---

## ⛓ Smart Contract Deployment & Integration

1. **Compile & Deploy**:
   - You can compile and deploy the `GroupSave`, `SavingsGoal`, and `MockUSDC` contracts using [Hardhat](https://hardhat.org/), [Foundry](https://book.getfoundry.sh/), or [Remix IDE](https://remix.ethereum.org/).
   - Deploy to **Ethereum Sepolia** (Chain ID: `11155111`).
2. **Update Contract Addresses**:
   - Open [`src/lib/contracts.js`](file:///c:/Users/hp/Documents/GitHub/cowriechain/src/lib/contracts.js) and populate the `ADDRESSES` object with your deployed contract instances:
     ```javascript
     export const ADDRESSES = {
       mockUSDC: process.env.NEXT_PUBLIC_MOCK_USDC || "0xYourMockUSDCAddress",
       groupSave: "0xYourDeployedGroupSaveAddress",
       savingsGoal: "0xYourDeployedSavingsGoalAddress",
     };
     ```
3. **Fund Test Accounts**:
   - Call `mint(userAddress, 10000000000)` (10,000 mUSDC with 6 decimals) to provide test capital on Sepolia.

---

## 🛡 Security & Risk Disclosure

- **Non-Custodial**: Neither CowrieChain developers nor third-party collectors ever possess custody over user funds or private keys. All transfers are dictated by on-chain transactions initiated by wallet signatures.
- **Collateral & Slashing**: Members participating in community circles should ensure they have sufficient liquidity to satisfy round contributions. Defaulting on a round allows the contract to forfeit pledged collateral to prevent loss to other circle members.
- **Penalty Recycling**: Vault early withdrawals strictly incur a 5% penalty designed to disincentivize impulsive withdrawals; this penalty is programmatically redirected to the rewards pool and is non-reversible.
- **Testnet Status**: Contracts are deployed on Sepolia Testnet for demonstration, audit, and pilot evaluation. Do not deploy production funds without a comprehensive smart contract audit.

---

## 📄 Contributing & License

Contributions are welcome! Please open an issue or submit a pull request for improvements, bug fixes, or feature suggestions.

Distributed under the **MIT License**. See `LICENSE` for details.
