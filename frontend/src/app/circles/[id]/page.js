"use client";

import { useEffect, useState } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import {
  MOCK_USDC_ABI,
  GROUP_SAVE_ABI,
  ADDRESSES,
  fmtUSDC,
  parseContractError,
} from "@/lib/contracts";

const STATUS_NAMES = ["Open", "Active", "Completed", "Cancelled"];
const STATUS_COLORS = [
  "bg-blue-500/15 text-blue-400 border-blue-500/30",
  "bg-[#2BB59A]/15 text-[#2BB59A] border-[#2BB59A]/30",
  "bg-purple-500/15 text-purple-400 border-purple-500/30",
  "bg-red-500/15 text-red-400 border-red-500/30",
];

export default function CircleDetailPage() {
  const { isConnected, address: userAddress, status: authStatus } = useAccount();
  const router = useRouter();
  const params = useParams();
  const circleAddress = params?.id;

  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [inviteAddresses, setInviteAddresses] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Wagmi connection guard
  useEffect(() => {
    if (authStatus === "disconnected") {
      router.replace("/auth");
    }
  }, [authStatus, router]);

  // Read Circle Creator
  const { data: circleCreator } = useReadContract({
    address: circleAddress,
    abi: GROUP_SAVE_ABI,
    functionName: "creator",
    query: {
      enabled: !!circleAddress && isConnected,
      refetchInterval: 10000,
    },
  });

  // Read Circle Info
  const {
    data: circleInfo,
    isLoading: isInfoLoading,
    refetch: refetchInfo,
  } = useReadContract({
    address: circleAddress,
    abi: GROUP_SAVE_ABI,
    functionName: "getInfo",
    query: {
      enabled: !!circleAddress && isConnected,
      refetchInterval: 10000,
    },
  });

  // Read Members list
  const {
    data: members,
    refetch: refetchMembers,
  } = useReadContract({
    address: circleAddress,
    abi: GROUP_SAVE_ABI,
    functionName: "getMembers",
    query: {
      enabled: !!circleAddress && isConnected,
      refetchInterval: 10000,
    },
  });

  // Read Payout Order
  const {
    data: payoutOrder,
    refetch: refetchPayoutOrder,
  } = useReadContract({
    address: circleAddress,
    abi: GROUP_SAVE_ABI,
    functionName: "getPayoutOrder",
    query: {
      enabled: !!circleAddress && isConnected,
      refetchInterval: 10000,
    },
  });

  // Read User Member Info
  const {
    data: memberInfo,
    refetch: refetchMemberInfo,
  } = useReadContract({
    address: circleAddress,
    abi: GROUP_SAVE_ABI,
    functionName: "getMemberInfo",
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!circleAddress && !!userAddress,
      refetchInterval: 10000,
    },
  });

  // Read canResolve
  const {
    data: canResolve,
    refetch: refetchCanResolve,
  } = useReadContract({
    address: circleAddress,
    abi: GROUP_SAVE_ABI,
    functionName: "canResolve",
    query: {
      enabled: !!circleAddress,
      refetchInterval: 10000,
    },
  });

  // Check token allowance
  const {
    data: allowance,
    refetch: refetchAllowance,
  } = useReadContract({
    address: circleInfo?.token || ADDRESSES.mockUSDC,
    abi: MOCK_USDC_ABI,
    functionName: "allowance",
    args: userAddress && circleAddress ? [userAddress, circleAddress] : undefined,
    query: {
      enabled: !!userAddress && !!circleAddress,
      refetchInterval: 10000,
    },
  });

  // Check user balance
  const {
    data: userBalance,
    refetch: refetchBalance,
  } = useReadContract({
    address: circleInfo?.token || ADDRESSES.mockUSDC,
    abi: MOCK_USDC_ABI,
    functionName: "balanceOf",
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
      refetchInterval: 10000,
    },
  });

  // Write contract hook
  const {
    data: txHash,
    writeContractAsync,
    isPending: isWritePending,
  } = useWriteContract();

  const {
    isLoading: isTxConfirming,
    isSuccess: isTxSuccess,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  useEffect(() => {
    if (isTxSuccess) {
      setFeedbackMsg("Transaction confirmed successfully on Sepolia!");
      refetchInfo();
      refetchMembers();
      refetchPayoutOrder();
      refetchMemberInfo();
      refetchCanResolve();
      refetchAllowance();
      refetchBalance();
      const timer = setTimeout(() => setFeedbackMsg(""), 6000);
      return () => clearTimeout(timer);
    }
  }, [
    isTxSuccess,
    refetchInfo,
    refetchMembers,
    refetchPayoutOrder,
    refetchMemberInfo,
    refetchCanResolve,
    refetchAllowance,
    refetchBalance,
  ]);

  if (authStatus === "disconnected") return null;

  // Unpack circle info
  const name = circleInfo?.name || "Savings Circle";
  const status = circleInfo?.status !== undefined ? Number(circleInfo.status) : 0;
  const contribution = circleInfo?.contribution ?? 0n;
  const memberCount = circleInfo?.memberCount ? Number(circleInfo.memberCount) : 0;
  const joined = circleInfo?.joined ? Number(circleInfo.joined) : (members?.length || 0);
  const currentRound = circleInfo?.currentRound !== undefined ? Number(circleInfo.currentRound) : 0;
  const paidThisRound = circleInfo?.paidThisRound ? Number(circleInfo.paidThisRound) : 0;
  const currentRoundDeadline = circleInfo?.currentRoundDeadline ? Number(circleInfo.currentRoundDeadline) : 0;
  const collateralBps = circleInfo?.collateralBps ? Number(circleInfo.collateralBps) : 10000;

  const totalPot = contribution * BigInt(memberCount);
  const progressPct = memberCount > 0 ? Math.round((paidThisRound / memberCount) * 100) : 0;

  // Member flags
  const isMember = !!memberInfo?.isMember;
  const isInvited = !!memberInfo?.invited;
  const isCreator =
    circleCreator && userAddress && circleCreator.toLowerCase() === userAddress.toLowerCase();
  const userClaimable = memberInfo?.claimable ?? 0n;
  const amountDue = memberInfo?.amountDue ?? 0n;
  const userPaidThisRound = !!memberInfo?.paidThisRound;
  const userHoldBack = memberInfo?.holdBack ?? 0n;
  const userStake = memberInfo?.stake ?? 0n;

  // Round deadline formatting
  const roundDeadlineDate = currentRoundDeadline > 0
    ? new Date(currentRoundDeadline * 1000).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "N/A";

  const isBusy = isWritePending || isTxConfirming;

  // Ensure maximum token allowance helper
  const ensureAllowance = async (requiredAmount) => {
    const currentAllowance = allowance ?? 0n;
    if (currentAllowance < requiredAmount) {
      setFeedbackMsg("Step 1/2: Approving token allowance in your wallet...");
      await writeContractAsync({
        address: circleInfo?.token || ADDRESSES.mockUSDC,
        abi: MOCK_USDC_ABI,
        functionName: "approve",
        args: [circleAddress, 2n ** 256n - 1n], // approve max as per guide
      });
      await refetchAllowance();
    }
  };

  // 1. Join Circle
  const handleJoin = async () => {
    setErrorMsg("");
    setFeedbackMsg("");
    try {
      await ensureAllowance(contribution);
      setFeedbackMsg("Step 2/2: Joining circle and depositing stake...");
      await writeContractAsync({
        address: circleAddress,
        abi: GROUP_SAVE_ABI,
        functionName: "join",
      });
    } catch (err) {
      setFeedbackMsg("");
      setErrorMsg(parseContractError(err));
    }
  };

  // 2. Pay Round Contribution
  const handleContribute = async () => {
    setErrorMsg("");
    setFeedbackMsg("");
    try {
      const due = amountDue > 0n ? amountDue : contribution;
      await ensureAllowance(due);
      setFeedbackMsg("Step 2/2: Paying round contribution...");
      await writeContractAsync({
        address: circleAddress,
        abi: GROUP_SAVE_ABI,
        functionName: "contribute",
      });
    } catch (err) {
      setFeedbackMsg("");
      setErrorMsg(parseContractError(err));
    }
  };

  // 3. Claim Payout / Releases
  const handleClaim = async () => {
    setErrorMsg("");
    setFeedbackMsg("");
    try {
      if (userClaimable === 0n) {
        setErrorMsg("You have no claimable payout or collateral at this time.");
        return;
      }
      setFeedbackMsg("Submitting payout claim to your wallet...");
      await writeContractAsync({
        address: circleAddress,
        abi: GROUP_SAVE_ABI,
        functionName: "claim",
      });
    } catch (err) {
      setFeedbackMsg("");
      setErrorMsg(parseContractError(err));
    }
  };

  // 4. Resolve Round (after grace period)
  const handleResolve = async () => {
    setErrorMsg("");
    setFeedbackMsg("");
    try {
      setFeedbackMsg("Resolving unpaid members using stake/collateral hold-back...");
      await writeContractAsync({
        address: circleAddress,
        abi: GROUP_SAVE_ABI,
        functionName: "resolveRound",
      });
    } catch (err) {
      setFeedbackMsg("");
      setErrorMsg(parseContractError(err));
    }
  };

  // 5. Leave Circle (before start)
  const handleLeave = async () => {
    setErrorMsg("");
    setFeedbackMsg("");
    try {
      setFeedbackMsg("Leaving circle and refunding join stake...");
      try {
        await writeContractAsync({
          address: circleAddress,
          abi: GROUP_SAVE_ABI,
          functionName: "leave",
        });
      } catch (e) {
        await writeContractAsync({
          address: circleAddress,
          abi: GROUP_SAVE_ABI,
          functionName: "leaveCircle",
        });
      }
    } catch (err) {
      setFeedbackMsg("");
      setErrorMsg(parseContractError(err));
    }
  };

  // 6. Invite Peers
  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setFeedbackMsg("");
    try {
      const addrs = inviteAddresses
        .split(/[,\s]+/)
        .map((a) => a.trim())
        .filter((a) => a.startsWith("0x") && a.length === 42);

      if (addrs.length === 0) {
        setErrorMsg("Please enter at least one valid 42-character Ethereum address (0x...).");
        return;
      }

      setFeedbackMsg(`Inviting ${addrs.length} wallet(s)...`);
      await writeContractAsync({
        address: circleAddress,
        abi: GROUP_SAVE_ABI,
        functionName: "invite",
        args: [addrs],
      });
      setShowInviteModal(false);
      setInviteAddresses("");
    } catch (err) {
      setFeedbackMsg("");
      setErrorMsg(parseContractError(err));
    }
  };

  // 7. Cancel Open Pool
  const handleCancelOpen = async () => {
    setErrorMsg("");
    setFeedbackMsg("");
    try {
      setFeedbackMsg("Cancelling circle and releasing all stakes...");
      await writeContractAsync({
        address: circleAddress,
        abi: GROUP_SAVE_ABI,
        functionName: "cancelOpen",
      });
    } catch (err) {
      setFeedbackMsg("");
      setErrorMsg(parseContractError(err));
    }
  };

  return (
    <div className="min-h-screen bg-[#0E2927] text-[#F6F1E7]">
      <Sidebar />
      <main className="lg:pl-[240px] px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[rgba(246,241,231,0.06)]">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-9 h-9 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            </button>
            <h1 className="sora text-xl sm:text-2xl font-bold text-[#F6F1E7]">{name}</h1>
            <span
              className={`px-2.5 py-0.5 rounded-full border text-xs font-semibold tracking-wider uppercase ${
                STATUS_COLORS[status] || ""
              }`}
            >
              {STATUS_NAMES[status] || "Unknown"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#9DB5AF] font-mono">
            <span>Contract:</span>
            <a
              href={`https://sepolia.etherscan.io/address/${circleAddress}#code`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#2BB59A] hover:underline"
            >
              {circleAddress?.slice(0, 8)}...{circleAddress?.slice(-6)}
            </a>
          </div>
        </div>

        {/* Alerts */}
        {feedbackMsg && (
          <div className="p-3.5 rounded-xl bg-[rgba(43,181,154,0.15)] border border-[rgba(43,181,154,0.3)] text-[#2BB59A] text-xs sm:text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>{feedbackMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-[rgba(235,87,87,0.12)] border border-[rgba(235,87,87,0.3)] text-[#EB5757] text-xs sm:text-sm flex items-start gap-2">
            <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Bento Row 1: Pot Info & Position */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Pot Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-7 bg-[#143734] border border-[rgba(246,241,231,0.08)] rounded-2xl p-6 sm:p-7 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[11px] font-semibold tracking-wider uppercase text-[#9DB5AF]">
                    Pot Per Round
                  </div>
                  <div className="sora text-3xl sm:text-4xl font-bold mt-1 text-[#F6F1E7]">
                    {fmtUSDC(totalPot, "")}
                    <span className="text-sm font-normal text-[#2BB59A] ml-2">mUSDC</span>
                  </div>
                  <div className="text-xs text-[#9DB5AF] mt-1.5 flex flex-wrap items-center gap-2">
                    <span>Contribution: <strong className="text-[#F6F1E7]">{fmtUSDC(contribution, "")} mUSDC</strong></span>
                    <span>•</span>
                    <span>Hold-back: <strong className="text-[#F6F1E7]">{collateralBps / 100}%</strong></span>
                    <span>•</span>
                    <span>{joined}/{memberCount} members</span>
                  </div>
                </div>

                {/* Progress Wheel */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 relative shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
                    <circle
                      cx="24"
                      cy="24"
                      r="18"
                      fill="none"
                      stroke="rgba(255,255,255,.08)"
                      strokeWidth="4"
                    />
                    <motion.circle
                      cx="24"
                      cy="24"
                      r="18"
                      fill="none"
                      stroke="#2BB59A"
                      strokeWidth="4"
                      strokeLinecap="round"
                      pathLength={1}
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: progressPct / 100 }}
                      transition={{ duration: 0.8 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="sora text-xs sm:text-sm font-bold text-[#F6F1E7]">
                      {progressPct}%
                    </span>
                    <span className="text-[9px] font-semibold tracking-wider uppercase text-[#9DB5AF]">
                      {paidThisRound}/{memberCount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Line */}
              <div className="mt-5 h-2 rounded-full bg-[#0E2927] overflow-hidden">
                <div
                  className="h-full bg-[#2BB59A] rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>

              <div className="mt-4 pt-3 border-t border-[rgba(246,241,231,0.06)] text-xs text-[#9DB5AF] flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-semibold text-[#F6F1E7]">
                    {status === 0
                      ? "Awaiting all members to join before starting."
                      : `Round ${currentRound + 1} of ${memberCount}`}
                  </span>
                  {status === 1 && currentRoundDeadline > 0 && (
                    <span className="ml-2 text-[11px] text-[#E3B04B]">
                      (Deadline: {roundDeadlineDate})
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="mt-6 pt-4 border-t border-[rgba(246,241,231,0.06)] flex flex-wrap items-center justify-between gap-3">
              {/* Status 0: Open */}
              {status === 0 && !isMember && (
                <button
                  onClick={handleJoin}
                  disabled={isBusy}
                  className="px-5 py-2.5 bg-[#2BB59A] hover:bg-[#259e87] text-[#0E2927] rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50 shadow-[0_2px_10px_rgba(43,181,154,0.3)]"
                >
                  {isBusy ? "Processing..." : `Join Circle (Stake: ${fmtUSDC(contribution, "")} mUSDC)`}
                </button>
              )}

              {status === 0 && isMember && (
                <button
                  onClick={handleLeave}
                  disabled={isBusy}
                  className="px-4 py-2 bg-[rgba(235,87,87,0.15)] hover:bg-[rgba(235,87,87,0.25)] text-[#EB5757] border border-[rgba(235,87,87,0.3)] rounded-xl text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isBusy ? "Processing..." : "Leave Circle (Refund Stake)"}
                </button>
              )}

              {status === 0 && isCreator && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="px-3.5 py-2 bg-white/[0.08] hover:bg-white/[0.12] text-[#F6F1E7] rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">person_add</span> Invite Peers
                  </button>
                  <button
                    onClick={handleCancelOpen}
                    disabled={isBusy}
                    className="px-3.5 py-2 bg-[rgba(235,87,87,0.1)] hover:bg-[rgba(235,87,87,0.2)] text-[#EB5757] border border-[rgba(235,87,87,0.25)] rounded-xl text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Cancel Pool
                  </button>
                </div>
              )}

              {/* Status 1: Active */}
              {status === 1 && isMember && !userPaidThisRound && (
                <button
                  onClick={handleContribute}
                  disabled={isBusy}
                  className="px-5 py-2.5 bg-[#2BB59A] hover:bg-[#259e87] text-[#0E2927] rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50 shadow-[0_2px_10px_rgba(43,181,154,0.3)]"
                >
                  {isBusy ? "Processing..." : `Pay Due: ${fmtUSDC(amountDue || contribution, "")} mUSDC`}
                </button>
              )}

              {status === 1 && isMember && userPaidThisRound && (
                <span className="px-3.5 py-1.5 rounded-xl bg-[rgba(43,181,154,0.15)] text-[#2BB59A] text-xs font-semibold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  Paid for Round {currentRound + 1}
                </span>
              )}
            </div>
          </motion.div>

          {/* User Position Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="lg:col-span-5 bg-[#143734] border border-[rgba(246,241,231,0.08)] rounded-2xl p-6 sm:p-7 flex flex-col justify-between"
          >
            <div>
              <div className="text-[11px] font-semibold tracking-wider uppercase text-[#E3B04B]">
                Your Circle Position
              </div>
              <div className="sora text-xl sm:text-2xl font-bold text-[#F6F1E7] mt-1">
                {isMember ? "Active Member" : isInvited ? "Invited (Not Joined)" : "Observer"}
              </div>

              <div className="mt-4 space-y-2.5 text-xs">
                <div className="flex justify-between items-center p-3 rounded-xl bg-[#0E2927] border border-[rgba(246,241,231,0.06)]">
                  <span className="text-[#9DB5AF]">Claimable Payout</span>
                  <span className="sora font-bold text-[#2BB59A] text-sm">
                    {fmtUSDC(userClaimable, "")} mUSDC
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-[#0E2927] border border-[rgba(246,241,231,0.06)]">
                  <span className="text-[#9DB5AF]">Collateral Hold-back</span>
                  <span className="sora font-semibold text-[#F6F1E7]">
                    {fmtUSDC(userHoldBack, "")} mUSDC
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-[#0E2927] border border-[rgba(246,241,231,0.06)]">
                  <span className="text-[#9DB5AF]">Staked Join Collateral</span>
                  <span className="sora font-semibold text-[#F6F1E7]">
                    {fmtUSDC(userStake, "")} mUSDC
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-[rgba(246,241,231,0.06)] flex gap-2.5">
              <button
                onClick={handleClaim}
                disabled={userClaimable === 0n || isBusy}
                className="flex-1 py-3 bg-[#E3B04B] hover:bg-[#d4a03e] disabled:opacity-30 disabled:cursor-not-allowed text-[#0E2927] rounded-xl text-xs sm:text-sm font-semibold tracking-wider uppercase transition-colors cursor-pointer"
              >
                Claim Payout ({fmtUSDC(userClaimable, "")} mUSDC)
              </button>

              {canResolve && (
                <button
                  onClick={handleResolve}
                  disabled={isBusy}
                  className="px-4 py-3 bg-[rgba(235,87,87,0.18)] hover:bg-[rgba(235,87,87,0.28)] text-[#EB5757] border border-[rgba(235,87,87,0.35)] rounded-xl text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer"
                >
                  Resolve Round
                </button>
              )}
            </div>
          </motion.div>
        </div>

        {/* Members & Payout Order Table */}
        <div className="bg-[#143734] border border-[rgba(246,241,231,0.08)] rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[rgba(246,241,231,0.08)]">
            <div>
              <h2 className="sora text-base font-semibold text-[#F6F1E7]">
                Circle Members & Turn Order
              </h2>
              <p className="text-xs text-[#9DB5AF] mt-0.5">
                {status === 0
                  ? "Members whitelisted to join before start."
                  : "On-chain randomized payout sequence."}
              </p>
            </div>
            <span className="text-xs text-[#2BB59A] font-semibold">
              {members?.length || 0} of {memberCount} joined
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="text-[11px] font-semibold tracking-wider uppercase text-[#9DB5AF] border-b border-[rgba(246,241,231,0.06)] bg-black/10">
                  <th className="px-6 py-3.5">Turn #</th>
                  <th className="px-6 py-3.5">Member Address</th>
                  <th className="px-6 py-3.5">Round Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(246,241,231,0.04)]">
                {!members || members.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-[#9DB5AF]">
                      No members joined yet.
                    </td>
                  </tr>
                ) : (
                  members.map((addr, idx) => {
                    const isMe =
                      userAddress && addr.toLowerCase() === userAddress.toLowerCase();
                    const payoutTurn =
                      payoutOrder && payoutOrder.length > 0
                        ? payoutOrder.findIndex(
                            (p) => p.toLowerCase() === addr.toLowerCase()
                          ) + 1
                        : null;

                    return (
                      <tr
                        key={addr}
                        className="hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-6 py-3.5 text-[#9DB5AF] font-semibold tabular-nums">
                          {payoutTurn ? `Turn ${payoutTurn}` : `Slot ${idx + 1}`}
                        </td>
                        <td className="px-6 py-3.5 font-mono">
                          <span className="text-[#F6F1E7]">
                            {addr.slice(0, 10)}...{addr.slice(-8)}
                          </span>
                          {isMe && (
                            <span className="ml-2.5 px-2 py-0.5 rounded-full bg-[rgba(43,181,154,0.18)] text-[#2BB59A] text-[10px] font-bold uppercase tracking-wider">
                              You
                            </span>
                          )}
                          {circleCreator &&
                            addr.toLowerCase() === circleCreator.toLowerCase() && (
                              <span className="ml-2 px-2 py-0.5 rounded-full bg-[rgba(227,176,75,0.15)] text-[#E3B04B] text-[10px] font-semibold uppercase tracking-wider">
                                Creator
                              </span>
                            )}
                        </td>
                        <td className="px-6 py-3.5">
                          <span className="px-2.5 py-1 rounded-full bg-[rgba(43,181,154,0.12)] text-[#2BB59A] text-xs font-semibold">
                            Joined & Staked
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Invite Peers Modal */}
        <AnimatePresence>
          {showInviteModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-[#143734] border border-[rgba(246,241,231,0.12)] rounded-2xl p-6 sm:p-7 max-w-lg w-full shadow-2xl"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[rgba(246,241,231,0.08)]">
                  <h3 className="sora text-lg font-bold text-[#F6F1E7]">
                    Invite Peers to Circle
                  </h3>
                  <button
                    onClick={() => setShowInviteModal(false)}
                    className="text-[#9DB5AF] hover:text-[#F6F1E7] cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-[#9DB5AF] mt-2.5 leading-relaxed">
                  Enter Ethereum wallet addresses to whitelist. Each address will be able to view and join this circle.
                </p>

                <form onSubmit={handleInviteSubmit} className="mt-4 space-y-4">
                  <textarea
                    rows={4}
                    value={inviteAddresses}
                    onChange={(e) => setInviteAddresses(e.target.value)}
                    placeholder="0x1234...abcd, 0x5678...ef01 (separated by commas or lines)"
                    className="w-full p-3.5 rounded-xl bg-[#0E2927] border border-[rgba(246,241,231,0.08)] text-xs sm:text-sm font-mono text-[#F6F1E7] placeholder:text-[#9DB5AF]/40 focus:outline-none focus:border-[#2BB59A]"
                    required
                  />

                  <div className="flex justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowInviteModal(false)}
                      className="px-4 py-2.5 rounded-xl text-xs sm:text-sm text-[#9DB5AF] hover:text-[#F6F1E7] font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isBusy}
                      className="px-5 py-2.5 bg-[#2BB59A] hover:bg-[#259e87] disabled:opacity-50 text-[#0E2927] rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-[0_2px_10px_rgba(43,181,154,0.3)]"
                    >
                      <span className="material-symbols-outlined text-[16px]">send</span>
                      Send On-Chain Invites
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
