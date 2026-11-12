// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IGroupSaveFactory {
    function linkUser(address user) external;
}

/// @title GroupSave — one rotating savings circle (Ajo / Esusu)
/// @notice Invite-only. Rounds == members, so everyone collects the pot exactly once.
///         Payout order is a random shuffle at start. Collateral is "held back" from the
///         recipient's pot (Model B) and released as they keep paying. Every member also
///         posts a join stake of one contribution. If a round can't be completed, the
///         circle cancels and funds are shared back out. No pause, no creator custody.
/// @dev    Order randomness uses prevrandao: fine for testnet. Replace _shuffle's seed
///         with Chainlink VRF before real money.
contract GroupSave is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ── Types ──────────────────────────────────────────────

    enum Status { Open, Active, Completed, Cancelled }

    struct Config {
        string  name;
        uint256 contribution;    // per member per round (token base units)
        uint256 memberCount;     // also the number of rounds
        uint256 roundDuration;   // seconds each round lasts before the grace period
        uint256 graceDuration;   // seconds after a round deadline where late payment is allowed
        uint256 joinDeadline;    // unix time: if not full by then, circle can be cancelled
        uint256 collateralBps;   // % of remaining obligations held back from pot (0-10000)
    }

    struct CircleInfo {
        string  name;
        address creator;
        address token;
        uint256 contribution;
        uint256 memberCount;
        uint256 joined;
        uint256 roundDuration;
        uint256 graceDuration;
        uint256 joinDeadline;
        uint256 collateralBps;
        Status  status;
        uint256 currentRound;
        uint256 currentRoundDeadline;
        uint256 paidThisRound;
    }

    struct MemberInfo {
        bool    isMember;
        bool    invited;
        uint256 stake;
        uint256 holdBack;
        uint256 claimable;
        bool    hasReceived;
        bool    defaulted;
        bool    paidThisRound;
        uint256 amountDue;       // 0 if nothing is due right now
        uint256 payoutRound;     // index of the round this member is paid; max uint if unknown
    }

    // ── Constants ──────────────────────────────────────────

    uint256 public constant MIN_MEMBERS    = 3;
    uint256 public constant MAX_MEMBERS    = 20;
    uint256 public constant BPS            = 10000;
    uint256 public constant LATE_FEE_BPS   = 500;    // 5% of the contribution
    uint256 public constant MAX_NAME_BYTES = 64;

    // ── Config (immutable after creation) ──────────────────

    IERC20  public immutable token;
    address public immutable creator;
    address public immutable factory;
    string  public name;
    uint256 public immutable contribution;
    uint256 public immutable memberCount;
    uint256 public immutable roundDuration;
    uint256 public immutable graceDuration;
    uint256 public immutable joinDeadline;
    uint256 public immutable collateralBps;

    // ── State ──────────────────────────────────────────────

    Status public status;
    uint256 public currentRound;                       // 0-indexed

    address[] private members;
    address[] private payoutOrder;                     // set once, at start

    mapping(address => bool)    public invited;
    mapping(address => bool)    public isMember;
    mapping(address => uint256) public stake;          // join stake still held
    mapping(address => uint256) public holdBack;       // collateral held back from pot
    mapping(address => uint256) public holdRoundsLeft; // payments left before hold-back is fully released
    mapping(address => uint256) public claimable;      // tokens the member can withdraw now
    mapping(address => bool)    public hasReceived;    // got the pot already
    mapping(address => bool)    public defaulted;      // a missed payment was covered from collateral

    mapping(uint256 => mapping(address => bool))    public hasPaid;
    mapping(uint256 => mapping(address => uint256)) private roundPaid;   // actual tokens paid (incl. fee)
    mapping(uint256 => uint256) public paidCount;
    mapping(uint256 => uint256) public lateFees;
    mapping(uint256 => uint256) public roundDeadline;

    // ── Events ─────────────────────────────────────────────

    event Invited(address indexed user);
    event Uninvited(address indexed user);
    event Joined(address indexed member, uint256 totalJoined);
    event Left(address indexed member);
    event Started(address[] payoutOrder);
    event Contributed(uint256 indexed round, address indexed member, uint256 amount, uint256 lateFee);
    event HoldBackReleased(address indexed member, uint256 amount);
    event DefaultCovered(uint256 indexed round, address indexed member, uint256 amount);
    event RoundFinalized(uint256 indexed round, address indexed recipient, uint256 claimableAdded, uint256 heldBack);
    event Claimed(address indexed member, uint256 amount);
    event CircleCompleted();
    event CircleCancelled(uint256 indexed atRound);

    // ── Constructor ────────────────────────────────────────

    constructor(address _creator, address _token, Config memory c) {
        require(_creator != address(0), "ZeroCreator");
        require(_token != address(0), "ZeroToken");
        require(bytes(c.name).length > 0 && bytes(c.name).length <= MAX_NAME_BYTES, "BadName");
        require(c.contribution > 0, "ZeroContribution");
        require(c.memberCount >= MIN_MEMBERS && c.memberCount <= MAX_MEMBERS, "BadMemberCount");
        require(c.roundDuration > 0, "ZeroRoundDuration");
        require(c.joinDeadline > block.timestamp, "PastJoinDeadline");
        require(c.collateralBps <= BPS, "BadCollateral");

        token = IERC20(_token);
        creator = _creator;
        factory = msg.sender;
        name = c.name;
        contribution = c.contribution;
        memberCount = c.memberCount;
        roundDuration = c.roundDuration;
        graceDuration = c.graceDuration;
        joinDeadline = c.joinDeadline;
        collateralBps = c.collateralBps;

        invited[_creator] = true;
    }

    modifier onlyCreator() {
        require(msg.sender == creator, "OnlyCreator");
        _;
    }

    // ── Invites ────────────────────────────────────────────

    /// @notice Creator whitelists addresses that may join.
    function invite(address[] calldata users) external onlyCreator {
        require(status == Status.Open, "NotOpen");
        for (uint256 i = 0; i < users.length; i++) {
            address u = users[i];
            require(u != address(0), "ZeroAddress");
            if (!invited[u]) {
                invited[u] = true;
                emit Invited(u);
                _link(u);
            }
        }
    }

    /// @notice Creator removes an invite for someone who hasn't joined.
    function uninvite(address user) external onlyCreator {
        require(status == Status.Open, "NotOpen");
        require(!isMember[user], "AlreadyMember");
        invited[user] = false;
        emit Uninvited(user);
    }

    // ── Join / Leave / Start ───────────────────────

    /// @notice Join the circle. Pulls the join stake (= one contribution). Auto-starts when full.
    function join() external nonReentrant {
        require(status == Status.Open, "NotOpen");
        require(block.timestamp <= joinDeadline, "JoinClosed");
        require(invited[msg.sender], "NotInvited");
        require(!isMember[msg.sender], "AlreadyMember");
        require(members.length < memberCount, "Full");

        isMember[msg.sender] = true;
        members.push(msg.sender);
        stake[msg.sender] = contribution;

        token.safeTransferFrom(msg.sender, address(this), contribution);
        emit Joined(msg.sender, members.length);

        if (members.length == memberCount) _start();
    }

    /// @notice Leave before the circle starts and get the stake back (matching guide interface).
    function leave() external nonReentrant {
        _leave();
    }

    /// @notice Leave before the circle starts and get the stake back.
    function leaveCircle() external nonReentrant {
        _leave();
    }

    function _leave() internal {
        require(status == Status.Open, "NotOpen");
        require(isMember[msg.sender], "NotMember");

        uint256 n = members.length;
        for (uint256 i = 0; i < n; i++) {
            if (members[i] == msg.sender) {
                members[i] = members[n - 1];
                members.pop();
                break;
            }
        }
        isMember[msg.sender] = false;
        uint256 amount = stake[msg.sender];
        stake[msg.sender] = 0;

        token.safeTransfer(msg.sender, amount);
        emit Left(msg.sender);
    }

    /// @notice Cancel a circle that never started. Creator any time; anyone after the join deadline.
    ///         Stakes become claimable.
    function cancelOpen() external {
        require(status == Status.Open, "NotOpen");
        require(msg.sender == creator || block.timestamp > joinDeadline, "TooEarly");

        status = Status.Cancelled;
        for (uint256 i = 0; i < members.length; i++) {
            address m = members[i];
            claimable[m] += stake[m];
            stake[m] = 0;
        }
        emit CircleCancelled(0);
    }

    function _start() internal {
        status = Status.Active;

        address[] memory order = members;
        _shuffle(order);
        payoutOrder = order;

        roundDeadline[0] = block.timestamp + roundDuration;
        emit Started(order);
    }

    /// @dev Fisher-Yates shuffle. Seed is prevrandao-based (testnet quality only).
    function _shuffle(address[] memory arr) internal view {
        uint256 seed = uint256(
            keccak256(abi.encodePacked(blockhash(block.number - 1), block.prevrandao, address(this), arr.length))
        );
        for (uint256 i = arr.length - 1; i > 0; i--) {
            uint256 j = seed % (i + 1);
            seed = uint256(keccak256(abi.encode(seed, i)));
            (arr[i], arr[j]) = (arr[j], arr[i]);
        }
    }

    // ── Contribute ─────────────────────────────────────────

    /// @notice Pay your contribution for the current round. A 5% late fee applies after the
    ///         round deadline (inside the grace period). The last payment auto-finalizes the round.
    /// @dev    Approve at least contribution + 5% fee (or max) before calling.
    function contribute() external nonReentrant {
        require(status == Status.Active, "NotActive");
        require(isMember[msg.sender], "NotMember");
        uint256 r = currentRound;
        require(!hasPaid[r][msg.sender], "AlreadyPaid");
        uint256 dl = roundDeadline[r];
        require(block.timestamp <= dl + graceDuration, "RoundExpired");

        uint256 fee = block.timestamp > dl ? (contribution * LATE_FEE_BPS) / BPS : 0;

        hasPaid[r][msg.sender] = true;
        roundPaid[r][msg.sender] = contribution + fee;
        paidCount[r] += 1;
        if (fee > 0) lateFees[r] += fee;

        // Gradually release this member's hold-back as they keep paying
        if (hasReceived[msg.sender] && !defaulted[msg.sender] && holdRoundsLeft[msg.sender] > 0) {
            uint256 rel = holdBack[msg.sender] / holdRoundsLeft[msg.sender];
            holdRoundsLeft[msg.sender] -= 1;
            if (rel > 0) {
                holdBack[msg.sender] -= rel;
                claimable[msg.sender] += rel;
                emit HoldBackReleased(msg.sender, rel);
            }
        }

        token.safeTransferFrom(msg.sender, address(this), contribution + fee);
        emit Contributed(r, msg.sender, contribution, fee);

        if (paidCount[r] == memberCount) _finalizeRound(r);
    }

    // ── Resolve a round after the grace period ─────────────

    /// @notice Callable by anyone once the grace period of the current round has passed with
    ///         unpaid members. If every unpaid member's stake + hold-back can cover their
    ///         contribution, it is taken and the round finalizes. Otherwise the circle cancels
    ///         and funds are shared back out.
    function resolveRound() external nonReentrant {
        require(status == Status.Active, "NotActive");
        uint256 r = currentRound;
        require(block.timestamp > roundDeadline[r] + graceDuration, "GraceNotExpired");

        uint256 n = members.length;
        for (uint256 i = 0; i < n; i++) {
            address m = members[i];
            if (!hasPaid[r][m] && stake[m] + holdBack[m] < contribution) {
                _cancelActive(r);
                return;
            }
        }

        for (uint256 i = 0; i < n; i++) {
            address m = members[i];
            if (!hasPaid[r][m]) _cover(r, m);
        }
        _finalizeRound(r);
    }

    function _cover(uint256 r, address m) internal {
        uint256 need = contribution;
        uint256 fromStake = stake[m] < need ? stake[m] : need;
        stake[m] -= fromStake;
        need -= fromStake;
        if (need > 0) holdBack[m] -= need;

        defaulted[m] = true;
        hasPaid[r][m] = true;
        paidCount[r] += 1;
        emit DefaultCovered(r, m, contribution);
    }

    // ── Round finalization ─────────────────────────────────

    function _finalizeRound(uint256 r) internal {
        address recipient = payoutOrder[r];
        uint256 pot       = contribution * memberCount;
        uint256 remaining = memberCount - 1 - r;                         // payments the recipient still owes
        uint256 held      = (remaining * contribution * collateralBps) / BPS;
        uint256 fees      = lateFees[r];

        hasReceived[recipient] = true;
        holdBack[recipient] += held;
        holdRoundsLeft[recipient] = remaining;
        claimable[recipient] += (pot - held) + fees;
        emit RoundFinalized(r, recipient, (pot - held) + fees, held);

        currentRound = r + 1;
        if (currentRound == memberCount) {
            _complete();
        } else {
            roundDeadline[currentRound] = block.timestamp + roundDuration;   // next clock starts now
        }
    }

    function _complete() internal {
        status = Status.Completed;
        for (uint256 i = 0; i < members.length; i++) {
            address m = members[i];
            claimable[m] += stake[m] + holdBack[m];
            stake[m] = 0;
            holdBack[m] = 0;
        }
        emit CircleCompleted();
    }

    /// @dev Cancel mid-circle. A member is "at fault" if a missed payment was ever covered from
    ///      their collateral, or they did not pay the current round. At-fault members forfeit
    ///      their stake. Innocent members always get their stake and any current-round payment
    ///      back. The forfeited stakes plus every hold-back form a pool that first makes whole
    ///      the innocent members who have NOT received a pot yet (each paid r * contribution into
    ///      pots that went to others). Whatever is left of the pool returns to the innocent
    ///      members, pro rata to their hold-backs (or equally if none).
    function _cancelActive(uint256 r) internal {
        uint256 n = members.length;
        uint256 forfeited = 0;        // stakes taken from at-fault members
        uint256 holdPool = 0;         // all hold-backs
        uint256 holdOfInnocent = 0;   // hold-backs belonging to innocent members
        uint256 innocentCount = 0;
        uint256 owedCount = 0;        // innocent members who have not been paid yet

        for (uint256 i = 0; i < n; i++) {
            address m = members[i];
            uint256 refund = roundPaid[r][m];
            if (refund > 0) {
                claimable[m] += refund;
                roundPaid[r][m] = 0;
            }
            holdPool += holdBack[m];
            if (defaulted[m] || !hasPaid[r][m]) {
                forfeited += stake[m];
            } else {
                claimable[m] += stake[m];
                innocentCount++;
                holdOfInnocent += holdBack[m];
                if (!hasReceived[m]) owedCount++;
            }
        }

        status = Status.Cancelled;
        uint256 pool = forfeited + holdPool;

        if (innocentCount == 0) {
            // Everyone is at fault: nothing to compensate, so each gets their own money back.
            for (uint256 i = 0; i < n; i++) {
                address m = members[i];
                claimable[m] += stake[m] + holdBack[m];
            }
        } else if (pool > 0) {
            uint256 loss = r * contribution;
            uint256 needed = owedCount * loss;
            uint256 perOwed = 0;
            uint256 leftover = 0;
            if (owedCount == 0) {
                leftover = pool;
            } else if (pool <= needed) {
                perOwed = pool / owedCount;
            } else {
                perOwed = loss;
                leftover = pool - needed;
            }
            for (uint256 i = 0; i < n; i++) {
                address m = members[i];
                if (defaulted[m] || !hasPaid[r][m]) continue;
                uint256 amt = 0;
                if (!hasReceived[m]) amt += perOwed;
                if (leftover > 0) {
                    amt += holdOfInnocent > 0
                        ? (leftover * holdBack[m]) / holdOfInnocent
                        : leftover / innocentCount;
                }
                if (amt > 0) claimable[m] += amt;
            }
        }

        for (uint256 i = 0; i < n; i++) {
            stake[members[i]] = 0;
            holdBack[members[i]] = 0;
        }
        emit CircleCancelled(r);
    }

    // ── Claim ──────────────────────────────────────────────

    /// @notice Withdraw everything owed to you (payouts, releases, refunds).
    function claim() external nonReentrant {
        uint256 amount = claimable[msg.sender];
        require(amount > 0, "NothingToClaim");
        claimable[msg.sender] = 0;                  // CEI: zero first
        token.safeTransfer(msg.sender, amount);     // transfer last
        emit Claimed(msg.sender, amount);
    }

    // ── Views for the frontend ─────────────────────────────

    function getInfo() external view returns (CircleInfo memory i) {
        i.name = name;
        i.creator = creator;
        i.token = address(token);
        i.contribution = contribution;
        i.memberCount = memberCount;
        i.joined = members.length;
        i.roundDuration = roundDuration;
        i.graceDuration = graceDuration;
        i.joinDeadline = joinDeadline;
        i.collateralBps = collateralBps;
        i.status = status;
        i.currentRound = currentRound;
        i.currentRoundDeadline = status == Status.Active ? roundDeadline[currentRound] : 0;
        i.paidThisRound = status == Status.Active ? paidCount[currentRound] : 0;
    }

    function getMembers() external view returns (address[] memory) {
        return members;
    }

    /// @notice Empty until the circle starts. Index = round in which that address is paid.
    function getPayoutOrder() external view returns (address[] memory) {
        return payoutOrder;
    }

    function getMemberInfo(address user) external view returns (MemberInfo memory m) {
        m.isMember = isMember[user];
        m.invited = invited[user];
        m.stake = stake[user];
        m.holdBack = holdBack[user];
        m.claimable = claimable[user];
        m.hasReceived = hasReceived[user];
        m.defaulted = defaulted[user];
        m.paidThisRound = status == Status.Active && hasPaid[currentRound][user];
        m.amountDue = amountDue(user);
        m.payoutRound = payoutRoundOf(user);
    }

    /// @notice Exactly what contribute() would pull right now (includes late fee). 0 if nothing due.
    ///         Approve at least this much (or a larger allowance) first.
    function amountDue(address user) public view returns (uint256) {
        if (status != Status.Active || !isMember[user]) return 0;
        uint256 r = currentRound;
        if (hasPaid[r][user]) return 0;
        uint256 dl = roundDeadline[r];
        if (block.timestamp > dl + graceDuration) return 0;
        return contribution + (block.timestamp > dl ? (contribution * LATE_FEE_BPS) / BPS : 0);
    }

    /// @notice Round in which user gets paid, or max uint if not started / not found.
    function payoutRoundOf(address user) public view returns (uint256) {
        for (uint256 i = 0; i < payoutOrder.length; i++) {
            if (payoutOrder[i] == user) return i;
        }
        return type(uint256).max;
    }

    /// @notice True when anyone may call resolveRound().
    function canResolve() external view returns (bool) {
        return status == Status.Active && block.timestamp > roundDeadline[currentRound] + graceDuration;
    }

    /// @notice Shows what a slot looks like before the order is known: pot, amount held back, amount claimable now.
    function previewSlot(uint256 round) external view returns (uint256 pot, uint256 held, uint256 receivableNow) {
        require(round < memberCount, "BadRound");
        pot = contribution * memberCount;
        held = ((memberCount - 1 - round) * contribution * collateralBps) / BPS;
        receivableNow = pot - held;
    }

    // ── Internal ───────────────────────────────────────────

    function _link(address user) internal {
        if (factory.code.length > 0) {
            try IGroupSaveFactory(factory).linkUser(user) {} catch {}
        }
    }
}

