// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/GroupSaveFactory.sol";
import "../src/GroupSave.sol";
import "../src/MockUSDC.sol";

contract GroupSaveFactoryTest is Test {
    GroupSaveFactory public factory;
    MockUSDC public token;
    address public creator;
    address public alice;
    address public bob;

    function setUp() public {
        creator = makeAddr("creator");
        alice = makeAddr("alice");
        bob = makeAddr("bob");

        token = new MockUSDC();
        factory = new GroupSaveFactory(address(token));
    }

    function test_FactoryDeployment() public view {
        assertEq(factory.token(), address(token));
        assertEq(factory.circleCount(), 0);
    }

    function test_CreateCircle_Success() public {
        vm.startPrank(creator);
        address circleAddr = factory.createCircle(
            "Lagos Builders",
            100 * 1e6,       // contribution: 100 USDC
            4,               // memberCount: 4
            7 days,          // roundDuration
            2 days,          // graceDuration
            block.timestamp + 5 days, // joinDeadline
            2000             // collateralBps: 20%
        );

        assertTrue(factory.isCircle(circleAddr));
        assertEq(factory.circleCount(), 1);

        // Creator should have this circle in user circles
        address[] memory creatorCircles = factory.getUserCircles(creator);
        assertEq(creatorCircles.length, 1);
        assertEq(creatorCircles[0], circleAddr);

        // Verify circle properties
        GroupSave circle = GroupSave(circleAddr);
        GroupSave.CircleInfo memory info = circle.getInfo();
        assertEq(info.name, "Lagos Builders");
        assertEq(info.creator, creator);
        assertEq(info.token, address(token));
        assertEq(info.contribution, 100 * 1e6);
        assertEq(info.memberCount, 4);
        assertEq(info.joined, 0);
        assertEq(uint8(info.status), uint8(GroupSave.Status.Open));
        vm.stopPrank();
    }

    function test_Pagination_GetCircles() public {
        vm.startPrank(creator);
        address c1 = factory.createCircle("C1", 100 * 1e6, 3, 1 days, 1 days, block.timestamp + 1 days, 1000);
        address c2 = factory.createCircle("C2", 200 * 1e6, 4, 1 days, 1 days, block.timestamp + 1 days, 1000);
        address c3 = factory.createCircle("C3", 300 * 1e6, 5, 1 days, 1 days, block.timestamp + 1 days, 1000);

        assertEq(factory.circleCount(), 3);

        address[] memory page1 = factory.getCircles(0, 2);
        assertEq(page1.length, 2);
        assertEq(page1[0], c1);
        assertEq(page1[1], c2);

        address[] memory page2 = factory.getCircles(2, 2);
        assertEq(page2.length, 1);
        assertEq(page2[0], c3);

        address[] memory outOfBounds = factory.getCircles(10, 5);
        assertEq(outOfBounds.length, 0);
        vm.stopPrank();
    }

    function test_LinkUser_InvitedMembersRegisteredInFactory() public {
        vm.startPrank(creator);
        address circleAddr = factory.createCircle("Circle A", 100 * 1e6, 3, 1 days, 1 days, block.timestamp + 1 days, 1000);
        GroupSave circle = GroupSave(circleAddr);

        address[] memory invitees = new address[](2);
        invitees[0] = alice;
        invitees[1] = bob;

        circle.invite(invitees);
        vm.stopPrank();

        // Alice and Bob should now see Circle A in their user circles
        address[] memory aliceCircles = factory.getUserCircles(alice);
        assertEq(aliceCircles.length, 1);
        assertEq(aliceCircles[0], circleAddr);

        address[] memory bobCircles = factory.getUserCircles(bob);
        assertEq(bobCircles.length, 1);
        assertEq(bobCircles[0], circleAddr);
    }

    function test_LinkUser_RevertWhenNotCalledByCircle() public {
        vm.prank(alice);
        vm.expectRevert("NotCircle");
        factory.linkUser(alice);
    }
}

