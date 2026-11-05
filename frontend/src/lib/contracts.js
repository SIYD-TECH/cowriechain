import MockUSDCAbi from "./abis/MockUSDC.json";
import SavingsVaultAbi from "./abis/SavingsVault.json";
import GroupSaveFactoryAbi from "./abis/GroupSaveFactory.json";
import GroupSaveAbi from "./abis/GroupSave.json";

export const SEPOLIA_CHAIN_ID = 11155111;

// Verified deployments on Sepolia (Chain ID: 11155111) from contract/deployments/sepolia.json
export const DEPLOYED_ADDRESSES = {
  [SEPOLIA_CHAIN_ID]: {
    mockUsdc: "0x5368a612Ec647dd85d63351dca7CB6C36100103B",
    mockUSDC: "0x5368a612Ec647dd85d63351dca7CB6C36100103B",
    savingsVault: "0xFa2982961244C4652a30A3144D11D09400234987",
    groupSaveFactory: "0x2d1bBE433d2571559c1f13e918d05Dbe11b3A275",
  },
};

export const ADDRESSES = {
  mockUsdc:
    process.env.NEXT_PUBLIC_MOCK_USDC_ADDRESS ||
    process.env.NEXT_PUBLIC_MOCK_USDC ||
    DEPLOYED_ADDRESSES[SEPOLIA_CHAIN_ID].mockUsdc,
  mockUSDC:
    process.env.NEXT_PUBLIC_MOCK_USDC_ADDRESS ||
    process.env.NEXT_PUBLIC_MOCK_USDC ||
    DEPLOYED_ADDRESSES[SEPOLIA_CHAIN_ID].mockUSDC,
  savingsVault:
    process.env.NEXT_PUBLIC_SAVINGS_VAULT_ADDRESS ||
    process.env.NEXT_PUBLIC_SAVINGS_VAULT ||
    DEPLOYED_ADDRESSES[SEPOLIA_CHAIN_ID].savingsVault,
  groupSaveFactory:
    process.env.NEXT_PUBLIC_GROUP_SAVE_FACTORY_ADDRESS ||
    process.env.NEXT_PUBLIC_GROUP_SAVE_FACTORY ||
    DEPLOYED_ADDRESSES[SEPOLIA_CHAIN_ID].groupSaveFactory,
};

export const CONTRACT_ADDRESSES = ADDRESSES;

export const MOCK_USDC_ABI = MockUSDCAbi;
export const SAVINGS_VAULT_ABI = SavingsVaultAbi;
export const GROUP_SAVE_FACTORY_ABI = GroupSaveFactoryAbi;
export const GROUP_SAVE_ABI = GroupSaveAbi;

// Helper: check if chain is Sepolia
export function isSupportedChain(chainId) {
  return Number(chainId) === SEPOLIA_CHAIN_ID;
}

// Helper: get contract addresses by chain ID
export function getContractAddresses(chainId = SEPOLIA_CHAIN_ID) {
  return DEPLOYED_ADDRESSES[Number(chainId)] || ADDRESSES;
}

// Helper: format 6-decimal mUSDC to "$1,234.00" or raw number string
export function fmtUSDC(raw, currency = "") {
  if (raw === undefined || raw === null) return currency ? `${currency}0.00` : "0.00";
  const n = Number(raw) / 1e6;
  const formatted = n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return currency ? `${currency}${formatted}` : formatted;
}

// Convert user decimal input (e.g. "500.50") to 6-decimal base units BigInt
export function parseUSDC(input) {
  if (!input) return 0n;
  const cleaned = String(input).trim();
  const num = parseFloat(cleaned);
  if (isNaN(num) || num <= 0) return 0n;
  return BigInt(Math.round(num * 1e6));
}
