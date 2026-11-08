// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title MockUSDC — a testnet-only fake USDC for CowrieChain demos
/// @notice Behaves exactly like real USDC (6 decimals).
///         Features an open mint for testnet operations and an on-chain faucet with a 12-hour cooldown.
///         NEVER deploy this to mainnet.
contract MockUSDC is ERC20 {
    /// @notice USDC uses 6 decimals (not 18 like most tokens).
    ///         1 USDC = 1,000,000 (six zeros).
    uint8 private constant _DECIMALS = 6;

    /// @notice Faucet configuration: 1,000 mUSDC every 12 hours
    uint256 public constant FAUCET_AMOUNT = 1000 * 10**6;
    uint256 public constant FAUCET_COOLDOWN = 12 hours;

    /// @notice Tracks the timestamp of the last faucet claim per user
    mapping(address => uint256) public lastFaucetClaim;

    event FaucetClaimed(address indexed recipient, uint256 amount);

    constructor() ERC20("Mock USDC", "mUSDC") {}

    /// @notice Returns 6 decimals to match real USDC.
    function decimals() public pure override returns (uint8) {
        return _DECIMALS;
    }

    /// @notice Creates new tokens and sends them to to without access control (testnet only).
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    /// @notice Claim 1,000 mUSDC once every 12 hours to avoid congestion
    function faucet() external {
        require(
            lastFaucetClaim[msg.sender] == 0 || block.timestamp >= lastFaucetClaim[msg.sender] + FAUCET_COOLDOWN,
            "FaucetCooldown: Must wait 12 hours between claims"
        );
        lastFaucetClaim[msg.sender] = block.timestamp;
        _mint(msg.sender, FAUCET_AMOUNT);
        emit FaucetClaimed(msg.sender, FAUCET_AMOUNT);
    }

    /// @notice Helper view returning whether a user can claim and remaining cooldown in seconds
    function canClaimFaucet(address user) external view returns (bool canClaim, uint256 remainingCooldown) {
        if (lastFaucetClaim[user] == 0 || block.timestamp >= lastFaucetClaim[user] + FAUCET_COOLDOWN) {
            return (true, 0);
        }
        return (false, (lastFaucetClaim[user] + FAUCET_COOLDOWN) - block.timestamp);
    }
}
