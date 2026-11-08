// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/MockUSDC.sol";

contract MockUSDCTest is Test {
    MockUSDC public token;
    address public user1;
    address public user2;

    function setUp() public {
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        token = new MockUSDC();
    }

    function test_Decimals() public view {
        assertEq(token.decimals(), 6, "MockUSDC must have 6 decimals");
    }

    function test_OpenMint() public {
        uint256 amount = 10_000 * 1e6; // 10,000 USDC
        vm.prank(user1);
        token.mint(user1, amount);
        assertEq(token.balanceOf(user1), amount);
    }

    function test_Faucet_Success() public {
        vm.prank(user1);
        token.faucet();
        assertEq(token.balanceOf(user1), 1_000 * 1e6, "Faucet must grant 1,000 mUSDC");
        assertEq(token.lastFaucetClaim(user1), block.timestamp);

        (bool canClaim, uint256 remaining) = token.canClaimFaucet(user1);
        assertFalse(canClaim, "User should be in cooldown");
        assertEq(remaining, 12 hours);
    }

    function test_Faucet_CooldownRevert() public {
        vm.prank(user1);
        token.faucet();

        // Warp 6 hours forward (still in cooldown)
        vm.warp(block.timestamp + 6 hours);

        vm.prank(user1);
        vm.expectRevert(bytes("FaucetCooldown: Must wait 12 hours between claims"));
        token.faucet();
    }

    function test_Faucet_After12HoursSuccess() public {
        vm.prank(user1);
        token.faucet();

        // Warp exactly 12 hours forward
        vm.warp(block.timestamp + 12 hours);

        (bool canClaim, uint256 remaining) = token.canClaimFaucet(user1);
        assertTrue(canClaim, "User should be able to claim again");
        assertEq(remaining, 0);

        vm.prank(user1);
        token.faucet();
        assertEq(token.balanceOf(user1), 2_000 * 1e6, "Balance should now be 2,000 mUSDC");
    }

    function test_TransferAndAllowance() public {
        token.mint(user1, 500 * 1e6);
        vm.startPrank(user1);
        token.approve(user2, 200 * 1e6);
        assertEq(token.allowance(user1, user2), 200 * 1e6);

        token.transfer(user2, 100 * 1e6);
        assertEq(token.balanceOf(user1), 400 * 1e6);
        assertEq(token.balanceOf(user2), 100 * 1e6);
        vm.stopPrank();

        vm.prank(user2);
        token.transferFrom(user1, user2, 200 * 1e6);
        assertEq(token.balanceOf(user1), 200 * 1e6);
        assertEq(token.balanceOf(user2), 300 * 1e6);
    }
}
