const env = require("./env");
const {
  MockUSDCAbi,
  SavingsVaultAbi,
  GroupSaveFactoryAbi,
  GroupSaveAbi,
} = require("./abis");

module.exports = {
  MOCK_USDC_ABI: MockUSDCAbi,
  SAVINGS_VAULT_ABI: SavingsVaultAbi,
  GROUP_SAVE_FACTORY_ABI: GroupSaveFactoryAbi,
  GROUP_SAVE_ABI: GroupSaveAbi,
  ADDRESSES: {
    mockUSDC: env.MOCK_USDC_ADDRESS,
    mockUsdc: env.MOCK_USDC_ADDRESS,
    savingsVault: env.SAVINGS_VAULT_ADDRESS,
    groupSaveFactory: env.GROUP_SAVE_FACTORY_ADDRESS,
  },
};
