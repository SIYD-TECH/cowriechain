import MockUSDCAbi from "./abis/MockUSDC.json";
import SavingsVaultAbi from "./abis/SavingsVault.json";
import GroupSaveFactoryAbi from "./abis/GroupSaveFactory.json";
import GroupSaveAbi from "./abis/GroupSave.json";

export const SEPOLIA_CHAIN_ID = 11155111;

// Verified deployments on Sepolia (Chain ID: 11155111)
export const DEPLOYED_ADDRESSES = {
  [SEPOLIA_CHAIN_ID]: {
    mockUsdc: "0x639aB79330a2504e84E5a8D4846a6333bB4BC8d3",
    mockUSDC: "0x639aB79330a2504e84E5a8D4846a6333bB4BC8d3",
    savingsVault: "0xfE4C229364Aba1478f0bE39c61778209f001561d",
    groupSaveFactory: "0xac6eb56fbbca66bf7d9a80c861ca6c90b114f8d1",
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

export const FAUCET_AMOUNT_NUMBER = 1000;
export const FAUCET_AMOUNT = 1000000000n; // 1,000 * 10^6
export const FAUCET_COOLDOWN_SECONDS = 12 * 3600; // 12 hours

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

// Human-friendly contract revert & Web3 error parser
export function parseContractError(err) {
  if (!err) return "An unexpected error occurred.";

  const msg = err.shortMessage || err.message || String(err);
  const msgLower = msg.toLowerCase();

  if (
    msgLower.includes("user rejected") ||
    msgLower.includes("userrejectedrequesterror") ||
    err.name === "UserRejectedRequestError"
  ) {
    return "Transaction was cancelled in your wallet.";
  }

  // Exact 4-byte ERC20 error selectors and human-readable names
  if (
    msgLower.includes("0xfb8f41b2") ||
    msgLower.includes("erc20insufficientallowance")
  ) {
    return "Token allowance insufficient (0xfb8f41b2). Please ensure the token approval transaction has confirmed on Sepolia before submitting the join or contribution transaction.";
  }

  if (
    msgLower.includes("0xf4d678b8") ||
    msgLower.includes("erc20insufficientbalance")
  ) {
    return "Insufficient mUSDC balance in your wallet (0xf4d678b8). Please claim free test tokens from the Faucet first!";
  }

  const errorMap = {
    FaucetCooldown: "Faucet cooldown is active: you can claim 1,000 mUSDC once every 12 hours. Please check the countdown timer.",
    NotInvited: "You have not been invited to join this circle yet. The circle creator must whitelist your wallet address first.",
    JoinClosed: "The joining deadline for this circle has already passed.",
    Full: "This circle is already full (maximum member count reached).",
    AlreadyMember: "Your wallet is already a member of this circle.",
    AlreadyPaid: "You have already paid your contribution for this round.",
    RoundExpired: "This round has expired and entered the grace period. Late fees may apply.",
    GraceNotExpired: "The round grace period has not expired yet. Members can still make regular payments.",
    NothingToClaim: "You have no claimable payout or collateral holdback at this time.",
    NotActive: "This circle is not currently active.",
    NotOpen: "This circle is not currently accepting new members or actions in this state.",
    TooEarly: "Cannot cancel yet. Cancellation is only possible after the join deadline has passed.",
    NotMember: "Your wallet is not a registered member of this circle.",
    OnlyCreator: "Only the circle creator can perform this action.",
    BadCollateral: "Collateral percentage must be between 0% and 100%.",
    BadMemberCount: "A circle requires between 3 and 20 members.",
    ZeroContribution: "Contribution amount must be greater than zero.",
    ZeroTarget: "Goal target amount must be greater than zero.",
    PastDeadline: "Goal deadline must be set in the future.",
    AlreadyWithdrawn: "This savings goal has already been withdrawn.",
    NotEligible: "Goal has not matured yet (target or deadline not reached). Please use Early Withdrawal if you wish to exit early with a 10% penalty.",
    UseNormalWithdraw: "This goal has already matured or reached its target! Use standard withdrawal with 0% penalty instead of early withdrawal.",
    NoSuchGoal: "The requested savings goal was not found.",
    ZeroAmount: "Amount must be greater than zero.",
  };

  for (const [key, text] of Object.entries(errorMap)) {
    if (msgLower.includes(key.toLowerCase())) {
      return text;
    }
  }

  if (err.shortMessage) return err.shortMessage;
  return msg.length > 140 ? msg.slice(0, 140) + "..." : msg;
}
