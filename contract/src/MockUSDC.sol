// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title MockUSDC — a testnet-only fake USDC for CowrieChain demos
/// @notice Behaves exactly like real USDC (6 decimals) but we control the supply.
///         NEVER deploy this to mainnet — the mint function would let anyone print money.
contract MockUSDC is ERC20, Ownable {
    /// @notice USDC uses 6 decimals (not 18 like most tokens).
    ///         1 USDC = 1,000,000 (six zeros). This matters for all our math.
    uint8 private constant _DECIMALS = 6;

    constructor() ERC20("Mock USDC", "mUSDC") Ownable(msg.sender) {}

    /// @notice Returns 6 decimals to match real USDC.
    function decimals() public pure override returns (uint8) {
        return _DECIMALS;
    }

    /// @notice Creates new tokens and sends them to to.
    /// @dev Only the contract owner (deployer) can call this.
    ///      In the demo, the deployer mints 10,000 mUSDC to each demo wallet.
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}

