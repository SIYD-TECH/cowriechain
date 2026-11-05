// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./GroupSave.sol";

/// @title GroupSaveFactory — creates ajo circles and keeps a registry for the frontend
/// @notice One factory per token. Each circle is its own contract, so one circle can never
///         affect another. Circles register creators and invitees here, so the app can list
///         "my circles" with a single call and no indexer.
contract GroupSaveFactory {
    address public immutable token;

    address[] private _allCircles;
    mapping(address => bool) public isCircle;
    mapping(address => address[]) private _userCircles;                    // created or invited
    mapping(address => mapping(address => bool)) private _linked;          // user => circle => linked

    event CircleCreated(
        address indexed creator,
        address indexed circle,
        string  name,
        uint256 contribution,
        uint256 memberCount,
        uint256 collateralBps
    );

    constructor(address _token) {
        require(_token != address(0), "ZeroToken");
        token = _token;
    }

    /// @notice Create a new circle. The caller becomes its creator (and is auto-invited).
    ///         The creator still has to approve the token and call join() on the new circle.
    function createCircle(
        string calldata name,
        uint256 contribution,
        uint256 memberCount,
        uint256 roundDuration,
        uint256 graceDuration,
        uint256 joinDeadline,
        uint256 collateralBps
    ) external returns (address circle) {
        GroupSave.Config memory cfg = GroupSave.Config({
            name: name,
            contribution: contribution,
            memberCount: memberCount,
            roundDuration: roundDuration,
            graceDuration: graceDuration,
            joinDeadline: joinDeadline,
            collateralBps: collateralBps
        });

        circle = address(new GroupSave(msg.sender, token, cfg));
        isCircle[circle] = true;
        _allCircles.push(circle);
        _link(msg.sender, circle);

        emit CircleCreated(msg.sender, circle, name, contribution, memberCount, collateralBps);
    }

    /// @notice Called by a circle when its creator invites someone.
    function linkUser(address user) external {
        require(isCircle[msg.sender], "NotCircle");
        _link(user, msg.sender);
    }

    function _link(address user, address circle) internal {
        if (!_linked[user][circle]) {
            _linked[user][circle] = true;
            _userCircles[user].push(circle);
        }
    }

    // ── Views ──────────────────────────────────────────────

    function circleCount() external view returns (uint256) {
        return _allCircles.length;
    }

    /// @notice Paginated list of every circle (newest are at the end).
    function getCircles(uint256 offset, uint256 limit) external view returns (address[] memory page) {
        uint256 total = _allCircles.length;
        if (offset >= total) return new address[](0);
        uint256 end = offset + limit > total ? total : offset + limit;
        page = new address[](end - offset);
        for (uint256 i = offset; i < end; i++) page[i - offset] = _allCircles[i];
    }

    /// @notice Circles a user created or was invited to. Check getMemberInfo() on each for join status.
    function getUserCircles(address user) external view returns (address[] memory) {
        return _userCircles[user];
    }
}

