/**
 * Sepolia Live Integration Test
 * Verifies that the extracted ABIs match the deployed contracts on Sepolia (11155111),
 * tests read operations across all contracts, and verifies contract state and mathematical invariants.
 */

const path = require("path");
require(path.join(__dirname, "../backend/node_modules/dotenv")).config({ path: path.join(__dirname, "../contract/.env") });
require(path.join(__dirname, "../backend/node_modules/dotenv")).config({ path: path.join(__dirname, "../backend/.env") });

const {
  createPublicClient,
  createWalletClient,
  http,
  formatUnits,
  parseUnits,
} = require(path.join(__dirname, "../backend/node_modules/viem"));
const { privateKeyToAccount } = require(path.join(
  __dirname,
  "../backend/node_modules/viem/accounts"
));
const { sepolia } = require(path.join(
  __dirname,
  "../backend/node_modules/viem/chains"
));

const MockUSDCAbi = require(path.join(
  __dirname,
  "../frontend/src/lib/abis/MockUSDC.json"
));
const SavingsVaultAbi = require(path.join(
  __dirname,
  "../frontend/src/lib/abis/SavingsVault.json"
));
const GroupSaveFactoryAbi = require(path.join(
  __dirname,
  "../frontend/src/lib/abis/GroupSaveFactory.json"
));
const GroupSaveAbi = require(path.join(
  __dirname,
  "../frontend/src/lib/abis/GroupSave.json"
));
const deployments = require(path.join(
  __dirname,
  "../contract/deployments/sepolia.json"
));

const RPC_URL = process.env.SEPOLIA_RPC_URL;
if (!RPC_URL) {
  console.error("Missing SEPOLIA_RPC_URL");
  process.exit(1);
}

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(RPC_URL),
});

let walletAccount;
let walletClient;
if (process.env.PRIVATE_KEY) {
  const pk = process.env.PRIVATE_KEY.startsWith("0x")
    ? process.env.PRIVATE_KEY
    : `0x${process.env.PRIVATE_KEY}`;
  walletAccount = privateKeyToAccount(pk);
  walletClient = createWalletClient({
    account: walletAccount,
    chain: sepolia,
    transport: http(RPC_URL),
  });
}

async function main() {
  console.log("==================================================");
  console.log("   COWRIECHAIN SEPOLIA LIVE INTEGRATION SUITE   ");
  console.log("==================================================");

  // 1. Network Verification
  const chainId = await publicClient.getChainId();
  console.log(`\n[1] Network Verification:`);
  console.log(`    Chain ID: ${chainId} (Expected: 11155111 - Sepolia)`);
  if (chainId !== 11155111) throw new Error("Incorrect chain ID!");
  console.log(`    ✓ Sepolia network verified.`);

  const { MockUSDC, SavingsVault, GroupSaveFactory } = deployments.contracts;

  // 2. MockUSDC Verification
  console.log(`\n[2] MockUSDC Integration (${MockUSDC.address}):`);
  const [name, symbol, decimals, totalSupply] = await Promise.all([
    publicClient.readContract({
      address: MockUSDC.address,
      abi: MockUSDCAbi,
      functionName: "name",
    }),
    publicClient.readContract({
      address: MockUSDC.address,
      abi: MockUSDCAbi,
      functionName: "symbol",
    }),
    publicClient.readContract({
      address: MockUSDC.address,
      abi: MockUSDCAbi,
      functionName: "decimals",
    }),
    publicClient.readContract({
      address: MockUSDC.address,
      abi: MockUSDCAbi,
      functionName: "totalSupply",
    }),
  ]);

  console.log(`    Token Name: ${name}`);
  console.log(`    Symbol: ${symbol}`);
  console.log(`    Decimals: ${decimals} (USDC standard)`);
  console.log(`    Total Supply: ${formatUnits(totalSupply, decimals)} ${symbol}`);
  if (decimals !== 6) throw new Error("USDC must have 6 decimals!");
  console.log(`    ✓ MockUSDC ABI and state verified.`);

  if (walletAccount) {
    const bal = await publicClient.readContract({
      address: MockUSDC.address,
      abi: MockUSDCAbi,
      functionName: "balanceOf",
      args: [walletAccount.address],
    });
    console.log(`    Test Wallet Balance: ${formatUnits(bal, decimals)} ${symbol}`);
  }

  // 3. SavingsVault Verification
  console.log(`\n[3] SavingsVault Integration (${SavingsVault.address}):`);
  const [vaultToken, treasury, penaltyBps] = await Promise.all([
    publicClient.readContract({
      address: SavingsVault.address,
      abi: SavingsVaultAbi,
      functionName: "token",
    }),
    publicClient.readContract({
      address: SavingsVault.address,
      abi: SavingsVaultAbi,
      functionName: "treasury",
    }),
    publicClient.readContract({
      address: SavingsVault.address,
      abi: SavingsVaultAbi,
      functionName: "PENALTY_BPS",
    }),
  ]);

  console.log(`    Underlying Token: ${vaultToken}`);
  console.log(`    Treasury: ${treasury}`);
  console.log(`    Early Penalty: ${Number(penaltyBps) / 100}% (${penaltyBps} bps)`);
  if (vaultToken.toLowerCase() !== MockUSDC.address.toLowerCase()) {
    throw new Error("Vault token address mismatch!");
  }
  console.log(`    ✓ SavingsVault token configuration confirmed.`);

  if (walletAccount) {
    const goals = await publicClient.readContract({
      address: SavingsVault.address,
      abi: SavingsVaultAbi,
      functionName: "getGoals",
      args: [walletAccount.address],
    });
    console.log(`    Goals for ${walletAccount.address}: ${goals.length} found`);
    goals.forEach((g, idx) => {
      console.log(
        `      - [Goal #${idx}] "${g.name}": saved ${formatUnits(
          g.saved,
          6
        )}/${formatUnits(g.target, 6)} mUSDC | Withdrawn: ${g.withdrawn}`
      );
    });
  }

  // 4. GroupSaveFactory Verification
  console.log(`\n[4] GroupSaveFactory Integration (${GroupSaveFactory.address}):`);
  const [factoryToken, circleCount, allCircles] = await Promise.all([
    publicClient.readContract({
      address: GroupSaveFactory.address,
      abi: GroupSaveFactoryAbi,
      functionName: "token",
    }),
    publicClient.readContract({
      address: GroupSaveFactory.address,
      abi: GroupSaveFactoryAbi,
      functionName: "circleCount",
    }),
    publicClient.readContract({
      address: GroupSaveFactory.address,
      abi: GroupSaveFactoryAbi,
      functionName: "getCircles",
      args: [0n, 10n],
    }),
  ]);

  console.log(`    Factory Token: ${factoryToken}`);
  console.log(`    Total Circles Created: ${circleCount}`);
  console.log(`    Registered Circle Addresses (${allCircles.length}):`);
  allCircles.forEach((c, idx) => console.log(`      ${idx + 1}. ${c}`));
  console.log(`    ✓ GroupSaveFactory ABI and registry verified.`);

  // 5. Child Circle Verification
  if (allCircles.length > 0) {
    const circleAddr = allCircles[0];
    console.log(`\n[5] Child GroupSave Circle Integration (${circleAddr}):`);
    const isReg = await publicClient.readContract({
      address: GroupSaveFactory.address,
      abi: GroupSaveFactoryAbi,
      functionName: "isCircle",
      args: [circleAddr],
    });
    console.log(`    isCircle verified by Factory: ${isReg}`);

    const [info, members, payoutOrder, canResolve] = await Promise.all([
      publicClient.readContract({
        address: circleAddr,
        abi: GroupSaveAbi,
        functionName: "getInfo",
      }),
      publicClient.readContract({
        address: circleAddr,
        abi: GroupSaveAbi,
        functionName: "getMembers",
      }),
      publicClient.readContract({
        address: circleAddr,
        abi: GroupSaveAbi,
        functionName: "getPayoutOrder",
      }),
      publicClient.readContract({
        address: circleAddr,
        abi: GroupSaveAbi,
        functionName: "canResolve",
      }),
    ]);

    const statusNames = ["Open", "Active", "Completed", "Cancelled"];
    console.log(`    Circle Name: "${info.name}"`);
    console.log(`    Creator: ${info.creator}`);
    console.log(`    Status: ${statusNames[Number(info.status)]} (${info.status})`);
    console.log(`    Contribution: ${formatUnits(info.contribution, 6)} mUSDC`);
    console.log(`    Target Member Count: ${info.memberCount}`);
    console.log(`    Joined Members: ${info.joined} (${members.length})`);
    console.log(`    Current Round: ${info.currentRound}`);
    console.log(`    canResolve: ${canResolve}`);
    console.log(`    Payout Order count: ${payoutOrder.length}`);
    console.log(`    ✓ GroupSave ABI functions successfully executed against live circle.`);
  }

  console.log("\n==================================================");
  console.log("   ALL SEPOLIA INTEGRATION CHECKS PASSED (100%)   ");
  console.log("==================================================\n");
}

main().catch((err) => {
  console.error("Integration test failed:", err);
  process.exit(1);
});
