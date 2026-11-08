// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/MockUSDC.sol";
import "../src/SavingsGoal.sol";
import "../src/GroupSaveFactory.sol";

contract DeployScript is Script {
    function run() external {
        // Validate chain ID: Sepolia (11155111) or local testing (31337)
        uint256 chainId = block.chainid;
        require(
            chainId == 11155111 || chainId == 31337,
            "InvalidChainId: Expected Sepolia (11155111) or local Anvil (31337)"
        );

        uint256 deployerPrivateKey = vm.envOr("DEPLOYER_PRIVATE_KEY", uint256(0));
        if (deployerPrivateKey == 0) {
            deployerPrivateKey = vm.envOr("PRIVATE_KEY", uint256(0));
        }

        address envTreasury = vm.envOr("TREASURY_ADDRESS", address(0));

        // Start broadcasting transactions
        if (deployerPrivateKey != 0) {
            vm.startBroadcast(deployerPrivateKey);
        } else {
            // Uses --account <name> or active forge wallet
            vm.startBroadcast();
        }

        address deployer = msg.sender;
        address treasury = envTreasury != address(0) ? envTreasury : deployer;

        console.log("==================================================");
        console.log("       COWRIECHAIN SEPOLIA DEPLOYMENT");
        console.log("==================================================");
        console.log("Chain ID:         ", chainId);
        console.log("Deployer:         ", deployer);
        console.log("Treasury Address: ", treasury);
        console.log("--------------------------------------------------");

        // 1. Deploy Mock USDC (6 decimals)
        MockUSDC mockUSDC = new MockUSDC();
        console.log("1. MockUSDC:         ", address(mockUSDC));

        // 2. Deploy Savings Vault (multi-goal commitment vault)
        SavingsVault savingsVault = new SavingsVault(address(mockUSDC), treasury);
        console.log("2. SavingsVault:     ", address(savingsVault));

        // 3. Deploy GroupSaveFactory (registry and circle deployer)
        GroupSaveFactory factory = new GroupSaveFactory(address(mockUSDC));
        console.log("3. GroupSaveFactory: ", address(factory));

        // 4. Mint initial test tokens to deployer
        mockUSDC.mint(deployer, 100_000 * 1e6);
        console.log("Minted 100,000 mUSDC to deployer: ", deployer);

        vm.stopBroadcast();

        console.log("==================================================");
        console.log("Deployment transactions queued/broadcast successfully.");
        console.log("==================================================");
    }
}
