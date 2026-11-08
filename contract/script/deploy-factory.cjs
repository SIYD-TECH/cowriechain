// Deploy GroupSaveFactory on Sepolia with 29M gas limit
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const rpc = envContent.match(/SEPOLIA_RPC_URL=(.*)/)[1].trim();
let pk = envContent.match(/PRIVATE_KEY=(.*)/)[1].trim();
if (!pk.startsWith('0x')) pk = '0x' + pk;

const { createPublicClient, createWalletClient, http } = require('../../frontend/node_modules/viem');
const { privateKeyToAccount } = require('../../frontend/node_modules/viem/accounts');
const { sepolia } = require('../../frontend/node_modules/viem/chains');

const mockUSDCAddress = '0x639aB79330a2504e84E5a8D4846a6333bB4BC8d3';
const savingsVaultAddress = '0xfE4C229364Aba1478f0bE39c61778209f001561d';

const account = privateKeyToAccount(pk);
const deployer = account.address;
const treasury = deployer;

console.log('==================================================');
console.log('       DEPLOYING GROUPSAVEFACTORY TO SEPOLIA');
console.log('==================================================');
console.log('Deployer Address: ', deployer);
console.log('MockUSDC Address: ', mockUSDCAddress);
console.log('SavingsVault Address: ', savingsVaultAddress);

const publicClient = createPublicClient({ chain: sepolia, transport: http(rpc) });
const walletClient = createWalletClient({ account, chain: sepolia, transport: http(rpc) });

async function main() {
  const artPath = path.join(__dirname, '../out/GroupSaveFactory.sol/GroupSaveFactory.json');
  const art = JSON.parse(fs.readFileSync(artPath, 'utf-8'));

  console.log('\nSubmitting deployment transaction with 29,000,000 gas limit...');
  const hash = await walletClient.deployContract({
    abi: art.abi,
    bytecode: art.bytecode.object,
    args: [mockUSDCAddress],
    gas: 29000000n,
  });

  console.log(`Transaction submitted! Hash: ${hash}`);
  console.log('Waiting for transaction confirmation on Sepolia...');

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log(`Transaction included in block ${receipt.blockNumber}! Status: ${receipt.status}`);

  if (receipt.status !== 'success') {
    throw new Error(`Deployment transaction reverted: ${hash}`);
  }

  const factoryAddress = receipt.contractAddress;
  console.log(`>>> GroupSaveFactory successfully deployed to: ${factoryAddress}`);

  // Mint 100,000 mUSDC to deployer
  console.log('\nMinting 100,000 mUSDC to deployer wallet...');
  const mockUSDCArt = JSON.parse(fs.readFileSync(path.join(__dirname, '../out/MockUSDC.sol/MockUSDC.json'), 'utf-8'));
  const mintHash = await walletClient.writeContract({
    address: mockUSDCAddress,
    abi: mockUSDCArt.abi,
    functionName: 'mint',
    args: [deployer, 100000000000n], // 100,000 * 10^6
  });
  console.log(`Mint tx submitted: ${mintHash}`);
  await publicClient.waitForTransactionReceipt({ hash: mintHash });
  console.log('Deployer received 100,000 mUSDC!');

  // Update contract/deployments/sepolia.json
  const deploymentRecord = {
    network: "sepolia",
    chainId: 11155111,
    deployer,
    treasury,
    deployedAt: new Date().toISOString(),
    contracts: {
      MockUSDC: {
        address: mockUSDCAddress,
        transactionHash: "0x366f639d38f4f8a5b6e08f6ff43a467cdd7392ad08b3c3e2c752c22e0b2ac49f",
        constructorArgs: [],
        verified: false,
        etherscanUrl: `https://sepolia.etherscan.io/address/${mockUSDCAddress}#code`
      },
      SavingsVault: {
        address: savingsVaultAddress,
        transactionHash: "0x4473b9effc07b197fb7cb58c7df27f5032cd3ac6d5a73303edb90d5f9c7ce56d",
        constructorArgs: [mockUSDCAddress, treasury],
        verified: false,
        etherscanUrl: `https://sepolia.etherscan.io/address/${savingsVaultAddress}#code`
      },
      GroupSaveFactory: {
        address: factoryAddress,
        transactionHash: hash,
        blockNumber: Number(receipt.blockNumber),
        constructorArgs: [mockUSDCAddress],
        verified: false,
        etherscanUrl: `https://sepolia.etherscan.io/address/${factoryAddress}#code`
      }
    }
  };

  const recordPath = path.join(__dirname, '../deployments/sepolia.json');
  fs.writeFileSync(recordPath, JSON.stringify(deploymentRecord, null, 2), 'utf-8');
  console.log(`\nUpdated ${recordPath}`);

  // Update frontend/.env.local
  const frontendEnvPath = path.join(__dirname, '../../frontend/.env.local');
  const frontendEnv = `NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_SEPOLIA_RPC_URL=${rpc}
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=b0ed2f41971704df2800043e6799378c

NEXT_PUBLIC_MOCK_USDC_ADDRESS=${mockUSDCAddress}
NEXT_PUBLIC_SAVINGS_VAULT_ADDRESS=${savingsVaultAddress}
NEXT_PUBLIC_GROUP_SAVE_FACTORY_ADDRESS=${factoryAddress}
`;
  fs.writeFileSync(frontendEnvPath, frontendEnv, 'utf-8');
  console.log(`Updated ${frontendEnvPath}`);

  console.log('\n=== ALL 3 CONTRACTS DEPLOYED & CONFIGURED SUCCESSFULLY ===');
}

main().catch(err => {
  console.error('Deployment failed:', err);
  process.exit(1);
});
