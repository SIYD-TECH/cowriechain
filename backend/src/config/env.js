require("dotenv").config();

const env = {
  PORT: parseInt(process.env.PORT || "5000", 10),
  NODE_ENV: process.env.NODE_ENV || "development",
  CHAIN_ID: parseInt(process.env.CHAIN_ID || "11155111", 10), // Sepolia default
  SEPOLIA_RPC_URL: process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org",

  // Contract Addresses (populated from deployment or environment)
  MOCK_USDC_ADDRESS: process.env.MOCK_USDC_ADDRESS || "",
  SAVINGS_VAULT_ADDRESS: process.env.SAVINGS_VAULT_ADDRESS || "",
  GROUP_SAVE_FACTORY_ADDRESS: process.env.GROUP_SAVE_FACTORY_ADDRESS || "",

  // Relayer credentials (optional server-side signer for keeper functions)
  RELAYER_PRIVATE_KEY: process.env.RELAYER_PRIVATE_KEY || "",
  RELAYER_API_KEY: process.env.RELAYER_API_KEY || "", // Optional bearer token for keeper endpoint
};

module.exports = env;

