// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/SavingsGoal.sol";
import "../src/MockUSDC.sol";

contract SavingsVaultTest is Test {
    SavingsVault public vault;
    MockUSDC public token;
    address public treasury;
    address public alice;
    address public bob;

    uint256 public constant INITIAL_BALANCE = 50_000 * 1e6; // 50,000 mUSDC

    function setUp() public {
        treasury = makeAddr("treasury");
        alice = makeAddr("alice");
        bob = makeAddr("bob");

        token = new MockUSDC();
        vault = new SavingsVault(address(token), treasury);

        token.mint(alice, INITIAL_BALANCE);
        token.mint(bob, INITIAL_BALANCE);

        vm.prank(alice);
        token.approve(address(vault), type(uint256).max);

        vm.prank(bob);
        token.approve(address(vault), type(uint256).max);
    }

    function test_CreateGoal_Success() public {
        vm.startPrank(alice);
        uint256 deadline = block.timestamp + 30 days;
        uint256 goalId = vault.createGoal("Solar Backup", 5_000 * 1e6, deadline);

        assertEq(goalId, 0);
        assertEq(vault.goalCount(alice), 1);

        SavingsVault.Goal memory g = vault.getGoal(alice, 0);
        assertEq(g.name, "Solar Backup");
        assertEq(g.target, 5_000 * 1e6);
        assertEq(g.deadline, deadline);
        assertEq(g.saved, 0);
        assertFalse(g.withdrawn);
        vm.stopPrank();
    }

    function test_CreateMultipleGoalsPerUser() public {
        vm.startPrank(alice);
        uint256 g0 = vault.createGoal("Goal 0", 1_000 * 1e6, block.timestamp + 10 days);
        uint256 g1 = vault.createGoal("Goal 1", 2_000 * 1e6, block.timestamp + 20 days);
        uint256 g2 = vault.createGoal("Goal 2", 3_000 * 1e6, block.timestamp + 30 days);

        assertEq(g0, 0);
        assertEq(g1, 1);
        assertEq(g2, 2);
        assertEq(vault.goalCount(alice), 3);

        SavingsVault.Goal[] memory allGoals = vault.getGoals(alice);
        assertEq(allGoals.length, 3);
        assertEq(allGoals[1].name, "Goal 1");
        vm.stopPrank();
    }

    function test_CreateGoal_RevertOnBadName() public {
        vm.startPrank(alice);
        vm.expectRevert("BadName");
        vault.createGoal("", 1_000 * 1e6, block.timestamp + 1 days);

        string memory longName = "This name is deliberately constructed to exceed the sixty-four bytes limit allowed";
        vm.expectRevert("BadName");
        vault.createGoal(longName, 1_000 * 1e6, block.timestamp + 1 days);
        vm.stopPrank();
    }

    function test_CreateGoal_RevertOnZeroTarget() public {
        vm.startPrank(alice);
        vm.expectRevert("ZeroTarget");
        vault.createGoal("Zero Target Goal", 0, block.timestamp + 1 days);
        vm.stopPrank();
    }

    function test_CreateGoal_RevertOnPastDeadline() public {
        vm.startPrank(alice);
        vm.expectRevert("PastDeadline");
        vault.createGoal("Past Goal", 1_000 * 1e6, block.timestamp);
        vm.stopPrank();
    }

    function test_Contribute_Success() public {
        vm.startPrank(alice);
        uint256 goalId = vault.createGoal("Savings", 10_000 * 1e6, block.timestamp + 30 days);

        vault.contribute(goalId, 2_000 * 1e6);
        assertEq(token.balanceOf(address(vault)), 2_000 * 1e6);

        SavingsVault.Goal memory g = vault.getGoal(alice, goalId);
        assertEq(g.saved, 2_000 * 1e6);
        assertEq(vault.progressBps(alice, goalId), 2000); // 20%
        vm.stopPrank();
    }

    function test_Contribute_RevertOnZeroAmount() public {
        vm.startPrank(alice);
        uint256 goalId = vault.createGoal("Savings", 10_000 * 1e6, block.timestamp + 30 days);

        vm.expectRevert("ZeroAmount");
        vault.contribute(goalId, 0);
        vm.stopPrank();
    }

    function test_Contribute_RevertOnNonExistentGoal() public {
        vm.startPrank(alice);
        vm.expectRevert("NoSuchGoal");
        vault.contribute(999, 100 * 1e6);
        vm.stopPrank();
    }

    function test_NormalWithdraw_WhenTargetReachedBeforeDeadline() public {
        vm.startPrank(alice);
        uint256 target = 5_000 * 1e6;
        uint256 goalId = vault.createGoal("Laptop", target, block.timestamp + 30 days);

        vault.contribute(goalId, target);
        assertTrue(vault.isWithdrawable(alice, goalId));

        uint256 balanceBefore = token.balanceOf(alice);
        vault.withdraw(goalId);
        uint256 balanceAfter = token.balanceOf(alice);

        assertEq(balanceAfter - balanceBefore, target, "Full amount received with 0% penalty");
        assertTrue(vault.getGoal(alice, goalId).withdrawn);
        assertFalse(vault.isWithdrawable(alice, goalId));
        vm.stopPrank();
    }

    function test_NormalWithdraw_WhenDeadlinePassedBeforeTarget() public {
        vm.startPrank(alice);
        uint256 target = 10_000 * 1e6;
        uint256 goalId = vault.createGoal("Emergency", target, block.timestamp + 10 days);

        vault.contribute(goalId, 3_000 * 1e6);
        assertFalse(vault.isWithdrawable(alice, goalId));

        // Advance time past deadline
        vm.warp(block.timestamp + 11 days);
        assertTrue(vault.isWithdrawable(alice, goalId));

        uint256 balanceBefore = token.balanceOf(alice);
        vault.withdraw(goalId);
        uint256 balanceAfter = token.balanceOf(alice);

        assertEq(balanceAfter - balanceBefore, 3_000 * 1e6, "Saved amount returned without penalty");
        assertEq(token.balanceOf(treasury), 0, "No penalty to treasury");
        vm.stopPrank();
    }

    function test_NormalWithdraw_RevertWhenNotEligible() public {
        vm.startPrank(alice);
        uint256 goalId = vault.createGoal("House", 20_000 * 1e6, block.timestamp + 30 days);
        vault.contribute(goalId, 5_000 * 1e6);

        vm.expectRevert("NotEligible");
        vault.withdraw(goalId);
        vm.stopPrank();
    }

    function test_EarlyWithdraw_Applies10PercentPenalty() public {
        vm.startPrank(alice);
        uint256 target = 10_000 * 1e6;
        uint256 goalId = vault.createGoal("Travel", target, block.timestamp + 60 days);
        uint256 deposit = 4_000 * 1e6;
        vault.contribute(goalId, deposit);

        (uint256 expectedPayout, uint256 expectedPenalty) = vault.previewEarlyWithdraw(alice, goalId);
        assertEq(expectedPenalty, 400 * 1e6, "10% of 4,000 is 400");
        assertEq(expectedPayout, 3_600 * 1e6, "90% of 4,000 is 3,600");

        uint256 aliceBefore = token.balanceOf(alice);
        uint256 treasuryBefore = token.balanceOf(treasury);

        vault.withdrawEarly(goalId);

        assertEq(token.balanceOf(alice) - aliceBefore, 3_600 * 1e6);
        assertEq(token.balanceOf(treasury) - treasuryBefore, 400 * 1e6);
        assertTrue(vault.getGoal(alice, goalId).withdrawn);
        vm.stopPrank();
    }

    function test_EarlyWithdraw_RevertWhenEligibleForNormalWithdraw() public {
        vm.startPrank(alice);
        uint256 target = 2_000 * 1e6;
        uint256 goalId = vault.createGoal("Phone", target, block.timestamp + 5 days);
        vault.contribute(goalId, target);

        // Reverts because target is already met
        vm.expectRevert("UseNormalWithdraw");
        vault.withdrawEarly(goalId);

        // Warp past deadline
        vm.warp(block.timestamp + 6 days);
        vm.expectRevert("UseNormalWithdraw");
        vault.withdrawEarly(goalId);
        vm.stopPrank();
    }

    function test_RevertOnAlreadyWithdrawn() public {
        vm.startPrank(alice);
        uint256 goalId = vault.createGoal("Rent", 1_000 * 1e6, block.timestamp + 5 days);
        vault.contribute(goalId, 1_000 * 1e6);
        vault.withdraw(goalId);

        vm.expectRevert("AlreadyWithdrawn");
        vault.withdraw(goalId);

        vm.expectRevert("AlreadyWithdrawn");
        vault.withdrawEarly(goalId);

        vm.expectRevert("AlreadyWithdrawn");
        vault.contribute(goalId, 100 * 1e6);
        vm.stopPrank();
    }

    function test_UserIsolation_BobCannotAccessAliceGoal() public {
        vm.prank(alice);
        vault.createGoal("Alice Goal", 5_000 * 1e6, block.timestamp + 30 days);

        vm.startPrank(bob);
        // Bob has 0 goals, so accessing goalId 0 reverts with NoSuchGoal
        vm.expectRevert("NoSuchGoal");
        vault.withdraw(0);

        vm.expectRevert("NoSuchGoal");
        vault.withdrawEarly(0);

        vm.expectRevert("NoSuchGoal");
        vault.contribute(0, 100 * 1e6);
        vm.stopPrank();
    }
}

