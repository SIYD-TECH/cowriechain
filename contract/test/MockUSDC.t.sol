// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/MockUSDC.sol";

contract MockUSDCTest is Test {
    MockUSDC public token;
    address public owner;
    address public user1;
    address public user2;

    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        token = new MockUSDC();
    }

    function test_Decimals() public view {
        assertEq(token.decimals(), 6, "MockUSDC must have 6 decimals");
    }

    function test_OwnerCanMint() public {
        uint256 amount = 10_000 * 1e6; // 10,000 USDC
        token.mint(user1, amount);
        assertEq(token.balanceOf(user1), amount);
    }

    function test_NonOwnerCannotMint() public {
        vm.prank(user1);
        vm.expectRevert();
        token.mint(user1, 1000 * 1e6);
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

