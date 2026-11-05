# CowrieChain Smart Contracts

This directory contains the core smart contracts for the CowrieChain protocol, developed using Foundry.

## Deployed Sepolia Contracts

| Contract | Address | Verification | Explorer |
| :--- | :--- | :--- | :--- |
| **`MockUSDC`** | `0x5368a612Ec647dd85d63351dca7CB6C36100103B` | **Verified** | [Etherscan](https://sepolia.etherscan.io/address/0x5368a612Ec647dd85d63351dca7CB6C36100103B#code) |
| **`SavingsVault`** | `0xFa2982961244C4652a30A3144D11D09400234987` | **Verified** | [Etherscan](https://sepolia.etherscan.io/address/0xFa2982961244C4652a30A3144D11D09400234987#code) |
| **`GroupSaveFactory`** | `0x2d1bBE433d2571559c1f13e918d05Dbe11b3A275` | **Verified** | [Etherscan](https://sepolia.etherscan.io/address/0x2d1bBE433d2571559c1f13e918d05Dbe11b3A275#code) |

- **Network**: Ethereum Sepolia (`Chain ID: 11155111`)
- **Deployer & Treasury**: `0x97184EBAEB9FDCe449d5FbaF1311601005F8E811`
- **Sample Verified Circle**: `0x318ddca988eA36bC27A82e4CB9057a22D608e1f6`

## Structure

```text
contract/
├── src/                      # Smart contract source files
│   ├── GroupSave.sol             # Rotating savings circle (Ajo / Esusu / ROSCA)
│   ├── GroupSaveFactory.sol      # Factory & registry for circle creation and discovery
│   ├── SavingsGoal.sol           # Multi-user, multi-goal commitment vault (SavingsVault)
│   └── MockUSDC.sol              # 6-decimal testnet asset with minting
├── test/                     # Automated Foundry test suites
│   ├── GroupSave.t.sol           # Multi-user lifecycle, grace, late fee & resolution tests
│   ├── GroupSaveFactory.t.sol    # Factory deployment, linking & pagination tests
│   ├── SavingsVault.t.sol        # Goals, timelocks, penalties & isolation tests
│   └── MockUSDC.t.sol            # Decimals, minting & allowance tests
├── script/                   # Deployment scripts
│   └── Deploy.s.sol              # Full deployment script for Sepolia / local testnets
├── out/                      # Compiled artifacts
└── README.md
```

## Contracts Overview

| Contract | Purpose | Dependencies | Key Features |
| :--- | :--- | :--- | :--- |
| `MockUSDC.sol` | Testnet-only ERC20 token with 6 decimals | OpenZeppelin `ERC20`, `Ownable` | `mint(to, amount)` for testnet simulations |
| `SavingsGoal.sol` (`SavingsVault`) | Multi-user, multi-goal personal commitment vault | OpenZeppelin `IERC20`, `SafeERC20`, `ReentrancyGuard` | Target amount, timelock maturity, 10% early exit penalty to treasury |
| `GroupSave.sol` | Rotational savings & credit (Ajo / Esusu / ROSCA) | OpenZeppelin `IERC20`, `SafeERC20`, `ReentrancyGuard` | Collateral hold-back (Model B), 1-stake join fee, random payout shuffle, 5% late fee in grace period, automatic / permissionless round resolution |
| `GroupSaveFactory.sol` | Factory & registry for `GroupSave` circles | `GroupSave.sol` | Deploys new circles, registers user memberships/invitations without an external indexer |

## Testing

Run the full automated test suite:
```bash
forge test
```

Run with gas reporting:
```bash
forge test --gas-report
```

## Deployment Order

1. **Deploy `MockUSDC`** (for Sepolia testnet):
   - Constructor requires no parameters.
   - Deployer is `owner`. Call `mint(address, amount)` to fund test accounts.
2. **Deploy `SavingsVault`** (in `SavingsGoal.sol`):
   - Constructor parameters:
     - `_token`: Address of the ERC20 token (`MockUSDC`).
     - `_treasury`: Address designated to collect early-withdrawal penalty fees.
3. **Deploy `GroupSaveFactory`**:
   - Constructor parameters:
     - `_token`: Address of the ERC20 token (`MockUSDC`).
4. **Deploy individual `GroupSave` circles**:
   - Initiated by calling `createCircle(...)` on `GroupSaveFactory`.
