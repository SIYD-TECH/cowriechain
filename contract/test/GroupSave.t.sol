// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/GroupSaveFactory.sol";
import "../src/GroupSave.sol";
import "../src/MockUSDC.sol";

contract GroupSaveTest is Test {
    MockUSDC public token;
    GroupSaveFactory public factory;
    GroupSave public circle;

    address public creator;
    address public alice;
    address public bob;
    address public charlie;
    address public stranger;

    uint256 public constant CONTRIBUTION = 500 * 1e6; // 500 mUSDC
    uint256 public constant MEMBER_COUNT = 3;
    uint256 public constant ROUND_DURATION = 7 days;
    uint256 public constant GRACE_DURATION = 2 days;
    uint256 public constant COLLATERAL_BPS = 2000;    // 20% hold-back

    function setUp() public {
        creator = makeAddr("creator");
        alice = makeAddr("alice");
        bob = makeAddr("bob");
        charlie = makeAddr("charlie");
        stranger = makeAddr("stranger");

        token = new MockUSDC();
        factory = new GroupSaveFactory(address(token));

        token.mint(creator, 50_000 * 1e6);
        token.mint(alice, 50_000 * 1e6);
        token.mint(bob, 50_000 * 1e6);
        token.mint(charlie, 50_000 * 1e6);
        token.mint(stranger, 50_000 * 1e6);

        vm.prank(creator);
        token.approve(address(factory), type(uint256).max);

        vm.startPrank(creator);
        address circleAddr = factory.createCircle(
            "Pan-African Circle",
            CONTRIBUTION,
            MEMBER_COUNT,
            ROUND_DURATION,
            GRACE_DURATION,
            block.timestamp + 3 days,
            COLLATERAL_BPS
        );
        circle = GroupSave(circleAddr);

        // Approve tokens for circle
        token.approve(circleAddr, type(uint256).max);
        vm.stopPrank();

        vm.prank(alice);
        token.approve(address(circle), type(uint256).max);

        vm.prank(bob);
        token.approve(address(circle), type(uint256).max);

        vm.prank(charlie);
        token.approve(address(circle), type(uint256).max);

        vm.prank(stranger);
        token.approve(address(circle), type(uint256).max);
    }

    function test_InitialState() public view {
        GroupSave.CircleInfo memory info = circle.getInfo();
        assertEq(info.name, "Pan-African Circle");
        assertEq(info.creator, creator);
        assertEq(info.contribution, CONTRIBUTION);
        assertEq(info.memberCount, MEMBER_COUNT);
        assertEq(uint8(info.status), uint8(GroupSave.Status.Open));
        assertTrue(circle.invited(creator), "Creator is auto-invited");
        assertFalse(circle.invited(alice));
    }

    function test_InviteAndUninvite() public {
        vm.startPrank(creator);
        address[] memory invitees = new address[](2);
        invitees[0] = alice;
        invitees[1] = bob;

        circle.invite(invitees);
        assertTrue(circle.invited(alice));
        assertTrue(circle.invited(bob));

        circle.uninvite(bob);
        assertFalse(circle.invited(bob));
        vm.stopPrank();

        // Non-creator cannot invite
        vm.prank(stranger);
        address[] memory fakeInvite = new address[](1);
        fakeInvite[0] = stranger;
        vm.expectRevert("OnlyCreator");
        circle.invite(fakeInvite);
    }

    function test_Join_RequiresInviteAndPullsStake() public {
        vm.prank(creator);
        address[] memory invitees = new address[](1);
        invitees[0] = alice;
        circle.invite(invitees);

        // Stranger not invited
        vm.prank(stranger);
        vm.expectRevert("NotInvited");
        circle.join();

        // Alice joins: pulls 1 contribution as stake
        uint256 balanceBefore = token.balanceOf(alice);
        vm.prank(alice);
        circle.join();

        assertEq(balanceBefore - token.balanceOf(alice), CONTRIBUTION);
        assertEq(circle.stake(alice), CONTRIBUTION);
        assertTrue(circle.isMember(alice));

        // Alice cannot join twice
        vm.prank(alice);
        vm.expectRevert("AlreadyMember");
        circle.join();
    }

    function test_LeaveBeforeStart_RefundsStake() public {
        vm.prank(creator);
        address[] memory invitees = new address[](1);
        invitees[0] = alice;
        circle.invite(invitees);

        vm.prank(alice);
        circle.join();
        assertEq(circle.stake(alice), CONTRIBUTION);

        uint256 balanceBefore = token.balanceOf(alice);
        vm.prank(alice);
        circle.leaveCircle();

        assertEq(token.balanceOf(alice) - balanceBefore, CONTRIBUTION, "Stake refunded on leave");
        assertEq(circle.stake(alice), 0);
        assertFalse(circle.isMember(alice));
    }

    function test_AutoStartWhenFull() public {
        vm.startPrank(creator);
        address[] memory invitees = new address[](2);
        invitees[0] = alice;
        invitees[1] = bob;
        circle.invite(invitees);

        circle.join(); // Member 1
        vm.stopPrank();

        vm.prank(alice);
        circle.join(); // Member 2

        assertEq(uint8(circle.status()), uint8(GroupSave.Status.Open));

        vm.prank(bob);
        circle.join(); // Member 3: Quorum reached!

        assertEq(uint8(circle.status()), uint8(GroupSave.Status.Active));
        assertEq(circle.currentRound(), 0);

        address[] memory order = circle.getPayoutOrder();
        assertEq(order.length, 3, "Payout order established");
    }

    function test_CompleteLifecycle_AllMembersPayOnTime() public {
        // Setup circle with creator, alice, bob
        vm.startPrank(creator);
        address[] memory invitees = new address[](2);
        invitees[0] = alice;
        invitees[1] = bob;
        circle.invite(invitees);
        circle.join();
        vm.stopPrank();

        vm.prank(alice);
        circle.join();
        vm.prank(bob);
        circle.join();

        address[] memory order = circle.getPayoutOrder();
        address recipientR0 = order[0];
        address recipientR1 = order[1];
        // recipientR2 is order[2]

        // ── ROUND 0 ──────────────────────────────
        assertEq(circle.currentRound(), 0);
        vm.prank(creator);
        circle.contribute();
        vm.prank(alice);
        circle.contribute();
        vm.prank(bob);
        circle.contribute(); // Auto-finalizes Round 0!

        // Round 0 pot = 3 * 500 = 1500 USDC
        // Remaining rounds recipient owes = 2
        // Held back = (2 * 500 * 2000) / 10000 = 200 USDC
        // Claimable now = 1500 - 200 = 1300 USDC
        assertEq(circle.holdBack(recipientR0), 200 * 1e6);
        assertEq(circle.claimable(recipientR0), 1300 * 1e6);
        assertEq(circle.currentRound(), 1);

        // Recipient claims pot
        uint256 r0BalBefore = token.balanceOf(recipientR0);
        vm.prank(recipientR0);
        circle.claim();
        assertEq(token.balanceOf(recipientR0) - r0BalBefore, 1300 * 1e6);

        // ── ROUND 1 ──────────────────────────────
        // In Round 1, recipientR0 pays contribute().
        // Since recipientR0 has remaining hold rounds, a portion of holdBack is released!
        uint256 holdBefore = circle.holdBack(recipientR0);
        assertEq(holdBefore, 200 * 1e6);

        vm.prank(recipientR0);
        circle.contribute();

        // 1 of 2 rounds remaining: rel = 200 / 2 = 100 released to claimable!
        assertEq(circle.holdBack(recipientR0), 100 * 1e6);
        assertEq(circle.claimable(recipientR0), 100 * 1e6);

        // Other members pay Round 1
        address other1 = recipientR0 == creator ? (recipientR1 == alice ? bob : alice) : (recipientR1 == creator ? (recipientR0 == alice ? bob : alice) : creator);
        vm.prank(recipientR1);
        circle.contribute();
        vm.prank(other1);
        circle.contribute(); // Auto-finalizes Round 1!

        assertEq(circle.currentRound(), 2);

        // ── ROUND 2 (Final Round) ────────────────
        vm.prank(creator);
        circle.contribute();
        vm.prank(alice);
        circle.contribute();
        vm.prank(bob);
        circle.contribute(); // Auto-finalizes Round 2 and completes circle!

        assertEq(uint8(circle.status()), uint8(GroupSave.Status.Completed));

        // Every member gets their initial stake back in claimable!
        assertEq(circle.stake(creator), 0);
        assertEq(circle.stake(alice), 0);
        assertEq(circle.stake(bob), 0);

        // All members can claim their remaining balances
        if (circle.claimable(creator) > 0) {
            vm.prank(creator);
            circle.claim();
        }

        if (circle.claimable(alice) > 0) {
            vm.prank(alice);
            circle.claim();
        }

        if (circle.claimable(bob) > 0) {
            vm.prank(bob);
            circle.claim();
        }

        assertEq(token.balanceOf(address(circle)), 0, "All funds safely withdrawn upon completion");
    }

    function test_LateFee_AppliedDuringGracePeriod() public {
        vm.startPrank(creator);
        address[] memory invitees = new address[](2);
        invitees[0] = alice;
        invitees[1] = bob;
        circle.invite(invitees);
        circle.join();
        vm.stopPrank();

        vm.prank(alice);
        circle.join();
        vm.prank(bob);
        circle.join();

        // Warp past round deadline but inside grace period
        // Round duration is 7 days, grace is 2 days. Warp to 7 days + 1 hour.
        vm.warp(block.timestamp + 7 days + 1 hours);

        // Alice pays in grace period: 5% late fee = 25 USDC
        // Amount due = 500 + 25 = 525 USDC
        assertEq(circle.amountDue(alice), 525 * 1e6);

        uint256 balBefore = token.balanceOf(alice);
        vm.prank(alice);
        circle.contribute();
        uint256 balAfter = token.balanceOf(alice);

        assertEq(balBefore - balAfter, 525 * 1e6, "Contribution plus 5% late fee pulled");
        assertEq(circle.lateFees(0), 25 * 1e6, "Late fee tracked in round");
    }

    function test_Contribute_RevertsAfterGracePeriodExpires() public {
        vm.startPrank(creator);
        address[] memory invitees = new address[](2);
        invitees[0] = alice;
        invitees[1] = bob;
        circle.invite(invitees);
        circle.join();
        vm.stopPrank();

        vm.prank(alice);
        circle.join();
        vm.prank(bob);
        circle.join();

        // Warp past round deadline AND past grace period (7 days + 2 days + 1 second)
        vm.warp(block.timestamp + 9 days + 1);

        assertEq(circle.amountDue(alice), 0, "No contribution accepted directly once grace expired");
        assertTrue(circle.canResolve(), "canResolve is now true");

        vm.prank(alice);
        vm.expectRevert("RoundExpired");
        circle.contribute();
    }

    function test_ResolveRound_CoversDefaultFromStake() public {
        vm.startPrank(creator);
        address[] memory invitees = new address[](2);
        invitees[0] = alice;
        invitees[1] = bob;
        circle.invite(invitees);
        circle.join();
        vm.stopPrank();

        vm.prank(alice);
        circle.join();
        vm.prank(bob);
        circle.join();

        // Creator and Alice pay round 0 on time
        vm.prank(creator);
        circle.contribute();
        vm.prank(alice);
        circle.contribute();

        // Bob defaults! Grace period expires.
        vm.warp(block.timestamp + 9 days + 1);

        // Anyone (e.g. stranger or keeper bot) calls resolveRound()
        vm.prank(stranger);
        circle.resolveRound();

        // Bob defaulted: Bob's stake (500 USDC) covers his contribution
        assertTrue(circle.defaulted(bob));
        assertEq(circle.stake(bob), 0, "Bob's stake consumed to cover round");
        assertEq(circle.currentRound(), 1, "Round 0 finalized and advanced to Round 1");
    }

    function test_ResolveRound_CancelsWhenCollateralInsufficient() public {
        vm.startPrank(creator);
        address[] memory invitees = new address[](2);
        invitees[0] = alice;
        invitees[1] = bob;
        circle.invite(invitees);
        circle.join();
        vm.stopPrank();

        vm.prank(alice);
        circle.join();
        vm.prank(bob);
        circle.join();

        // Round 0: Creator and Alice pay, Bob defaults (covered by stake = 500)
        vm.prank(creator);
        circle.contribute();
        vm.prank(alice);
        circle.contribute();

        vm.warp(block.timestamp + 9 days + 1);
        circle.resolveRound(); // Round 0 finalized, Bob has 0 stake left!

        // Round 1: Creator and Alice pay
        vm.prank(creator);
        circle.contribute();
        vm.prank(alice);
        circle.contribute();

        // Bob defaults again in Round 1! Bob has 0 stake and 0 holdBack!
        vm.warp(block.timestamp + 9 days + 1);

        // When resolveRound is called, Bob cannot cover 500 contribution -> Circle cancels!
        circle.resolveRound();

        assertEq(uint8(circle.status()), uint8(GroupSave.Status.Cancelled));
    }

    function test_CancelOpen_CreatorCanCancelAnytime() public {
        vm.prank(creator);
        circle.cancelOpen();

        assertEq(uint8(circle.status()), uint8(GroupSave.Status.Cancelled));
    }

    function test_ResolveRound_RevertsBeforeGraceExpires() public {
        vm.startPrank(creator);
        address[] memory invitees = new address[](2);
        invitees[0] = alice;
        invitees[1] = bob;
        circle.invite(invitees);
        circle.join();
        vm.stopPrank();

        vm.prank(alice);
        circle.join();
        vm.prank(bob);
        circle.join();

        // Round duration is 7 days, grace is 2 days. At 5 days, grace has not expired.
        vm.warp(block.timestamp + 5 days);
        vm.expectRevert("GraceNotExpired");
        circle.resolveRound();
    }

    function test_Claim_RevertsWhenNothingToClaim() public {
        vm.prank(alice);
        vm.expectRevert("NothingToClaim");
        circle.claim();
    }

    function test_Constructor_ValidationReverts() public {
        // Zero Token
        vm.expectRevert("ZeroToken");
        new GroupSave(
            creator,
            address(0),
            GroupSave.Config("Circle", 100 * 1e6, 3, 1 days, 1 days, block.timestamp + 1 days, 1000)
        );

        // Zero Creator
        vm.expectRevert("ZeroCreator");
        new GroupSave(
            address(0),
            address(token),
            GroupSave.Config("Circle", 100 * 1e6, 3, 1 days, 1 days, block.timestamp + 1 days, 1000)
        );

        // Member count < 3
        vm.expectRevert("BadMemberCount");
        new GroupSave(
            creator,
            address(token),
            GroupSave.Config("Circle", 100 * 1e6, 2, 1 days, 1 days, block.timestamp + 1 days, 1000)
        );

        // Past deadline
        vm.expectRevert("PastJoinDeadline");
        new GroupSave(
            creator,
            address(token),
            GroupSave.Config("Circle", 100 * 1e6, 3, 1 days, 1 days, block.timestamp, 1000)
        );

        // Collateral > 100% (10000 bps)
        vm.expectRevert("BadCollateral");
        new GroupSave(
            creator,
            address(token),
            GroupSave.Config("Circle", 100 * 1e6, 3, 1 days, 1 days, block.timestamp + 1 days, 10001)
        );
    }
}
