// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title SavingsVault — multi-user, multi-goal savings
/// @notice One shared contract. Any address can create as many named goals as it
///         wants. Each goal has a target and a deadline. Full withdrawal is allowed
///         once the target is reached or the deadline has passed. Withdrawing early
///         costs a 10% penalty, which is sent to the treasury.
/// @dev    A user's goals are only reachable through msg.sender, so one user can
///         never read-write or withdraw another user's goal.
contract SavingsVault is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ── Types ──────────────────────────────────────────────

    struct Goal {
        string  name;        // e.g. "New laptop"
        uint256 target;      // amount the user wants to save (token base units)
        uint256 deadline;    // unix timestamp: free withdrawal after this
        uint256 saved;       // amount contributed so far
        bool    withdrawn;   // true once the goal has been closed out
    }

    // ── State ──────────────────────────────────────────────

    IERC20  public immutable token;       // the ERC-20 we save in (e.g. mUSDC)
    address public immutable treasury;    // receives early-withdrawal penalties

    uint256 public constant PENALTY_BPS    = 1000;   // 10%
    uint256 public constant BPS            = 10000;
    uint256 public constant MAX_NAME_BYTES = 64;

    mapping(address => Goal[]) private _goals;   // user => their goals (goalId = index)

    // ── Events ─────────────────────────────────────────────

    event GoalCreated(address indexed user, uint256 indexed goalId, string name, uint256 target, uint256 deadline);
    event Contributed(address indexed user, uint256 indexed goalId, uint256 amount, uint256 newTotal);
    event Withdrawn(address indexed user, uint256 indexed goalId, uint256 amount);
    event EarlyWithdrawn(address indexed user, uint256 indexed goalId, uint256 payout, uint256 penalty);

    // ── Constructor ────────────────────────────────────────

    constructor(address _token, address _treasury) {
        require(_token != address(0), "ZeroToken");
        require(_treasury != address(0), "ZeroTreasury");
        token = IERC20(_token);
        treasury = _treasury;
    }

    // ── Create ─────────────────────────────────────────────

    /// @notice Create a new savings goal for the caller.
    /// @return goalId the index of the new goal in the caller's list.
    function createGoal(string calldata name, uint256 target, uint256 deadline)
        external
        returns (uint256 goalId)
    {
        require(bytes(name).length > 0 && bytes(name).length <= MAX_NAME_BYTES, "BadName");
        require(target > 0, "ZeroTarget");
        require(deadline > block.timestamp, "PastDeadline");

        _goals[msg.sender].push(Goal(name, target, deadline, 0, false));
        goalId = _goals[msg.sender].length - 1;

        emit GoalCreated(msg.sender, goalId, name, target, deadline);
    }

    // ── Contribute ─────────────────────────────────────────

    /// @notice Add tokens to one of your goals.
    /// @dev Caller must first approve this contract to spend amount (or a larger allowance).
    function contribute(uint256 goalId, uint256 amount) external nonReentrant {
        Goal storage g = _getGoal(msg.sender, goalId);
        require(amount > 0, "ZeroAmount");
        require(!g.withdrawn, "AlreadyWithdrawn");

        g.saved += amount;                                            // state first
        token.safeTransferFrom(msg.sender, address(this), amount);    // transfer last

        emit Contributed(msg.sender, goalId, amount, g.saved);
    }

    // ── Withdraw ───────────────────────────────────────────

    /// @notice Withdraw a goal in full once the target is reached or the deadline has passed.
    function withdraw(uint256 goalId) external nonReentrant {
        Goal storage g = _getGoal(msg.sender, goalId);
        require(!g.withdrawn, "AlreadyWithdrawn");
        require(g.saved >= g.target || block.timestamp >= g.deadline, "NotEligible");

        g.withdrawn = true;                          // CEI: state first
        uint256 amount = g.saved;
        if (amount > 0) token.safeTransfer(msg.sender, amount);

        emit Withdrawn(msg.sender, goalId, amount);
    }

    /// @notice Withdraw before the target is reached and before the deadline. 10% penalty to treasury.
    function withdrawEarly(uint256 goalId) external nonReentrant {
        Goal storage g = _getGoal(msg.sender, goalId);
        require(!g.withdrawn, "AlreadyWithdrawn");
        require(g.saved < g.target && block.timestamp < g.deadline, "UseNormalWithdraw");

        g.withdrawn = true;                          // CEI: state first
        uint256 penalty = (g.saved * PENALTY_BPS) / BPS;
        uint256 payout  = g.saved - penalty;

        if (payout > 0)  token.safeTransfer(msg.sender, payout);
        if (penalty > 0) token.safeTransfer(treasury, penalty);

        emit EarlyWithdrawn(msg.sender, goalId, payout, penalty);
    }

    // ── Views ──────────────────────────────────────────────

    /// @notice All goals for a user (use for the dashboard).
    function getGoals(address user) external view returns (Goal[] memory) {
        return _goals[user];
    }

    /// @notice A single goal.
    function getGoal(address user, uint256 goalId) external view returns (Goal memory) {
        return _getGoal(user, goalId);
    }

    /// @notice How many goals a user has created (goalIds run 0 .. count-1).
    function goalCount(address user) external view returns (uint256) {
        return _goals[user].length;
    }

    /// @notice Progress in basis points (10000 = 100%). May exceed 10000 if over-saved.
    function progressBps(address user, uint256 goalId) external view returns (uint256) {
        Goal storage g = _getGoal(user, goalId);
        return (g.saved * BPS) / g.target;
    }

    /// @notice True if the goal can be withdrawn without penalty.
    function isWithdrawable(address user, uint256 goalId) external view returns (bool) {
        Goal storage g = _getGoal(user, goalId);
        return !g.withdrawn && (g.saved >= g.target || block.timestamp >= g.deadline);
    }

    /// @notice What the user would receive and lose if they withdrew early right now.
    function previewEarlyWithdraw(address user, uint256 goalId)
        external
        view
        returns (uint256 payout, uint256 penalty)
    {
        Goal storage g = _getGoal(user, goalId);
        penalty = (g.saved * PENALTY_BPS) / BPS;
        payout  = g.saved - penalty;
    }

    // ── Internal ───────────────────────────────────────────

    function _getGoal(address user, uint256 goalId) internal view returns (Goal storage) {
        require(goalId < _goals[user].length, "NoSuchGoal");
        return _goals[user][goalId];
    }
}

/// @notice Alias for backward-compatibility with interfaces expecting SavingsGoal
contract SavingsGoal is SavingsVault {
    constructor(address _token, address _treasury) SavingsVault(_token, _treasury) {}
}

