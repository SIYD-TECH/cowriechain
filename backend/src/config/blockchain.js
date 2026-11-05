const { createPublicClient, createWalletClient, http } = require("viem");
const { privateKeyToAccount } = require("viem/accounts");
const { sepolia } = require("viem/chains");
const env = require("./env");

// Public Client for reads and chain inspections
const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(env.SEPOLIA_RPC_URL),
});

// Optional Relayer Wallet Client for keeper execution (e.g. resolveRound)
let relayerAccount = null;
let relayerWalletClient = null;

if (env.RELAYER_PRIVATE_KEY && env.RELAYER_PRIVATE_KEY.startsWith("0x")) {
  try {
    relayerAccount = privateKeyToAccount(env.RELAYER_PRIVATE_KEY);
    relayerWalletClient = createWalletClient({
      account: relayerAccount,
      chain: sepolia,
      transport: http(env.SEPOLIA_RPC_URL),
    });
  } catch (err) {
    console.warn("Failed to initialize relayer account:", err.message);
  }
}

module.exports = {
  chain: sepolia,
  publicClient,
  relayerAccount,
  relayerWalletClient,
};

