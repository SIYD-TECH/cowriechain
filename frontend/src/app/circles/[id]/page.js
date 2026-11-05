"use client";
import { useEffect, useState } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { motion } from "framer-motion";
import {
  MOCK_USDC_ABI,
  GROUP_SAVE_ABI,
  CONTRACT_ADDRESSES,
  fmtUSDC,
  parseUSDC,
} from "@/lib/contracts";

const STATUS_NAMES = ["Open", "Active", "Completed", "Cancelled"];
const STATUS_COLORS = [
  "bg-blue-500/15 text-blue-400 border-blue-500/30",
  "bg-[#62dd9e]/15 text-[#62dd9e] border-[#62dd9e]/30",
  "bg-purple-500/15 text-purple-400 border-purple-500/30",
  "bg-red-500/15 text-red-400 border-red-500/30",
];

export default function CircleDetailPage() {
  const { isConnected, address: userAddress } = useAccount();
  const router = useRouter();
  const params = useParams();
  const circleAddress = params?.id;

  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [inviteAddresses, setInviteAddresses] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    if (!isConnected) router.replace("/auth");
  }, [isConnected, router]);

  // Read Circle Creator
  const { data: circleCreator } = useReadContract({
    address: circleAddress,
    abi: GROUP_SAVE_ABI,
    functionName: "creator",
    query: { enabled: !!circleAddress && isConnected },
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
    query: { enabled: !!circleAddress && isConnected },
  });

  // Read Members
  const {
    data: members,
    refetch: refetchMembers,
  } = useReadContract({
    address: circleAddress,
    abi: GROUP_SAVE_ABI,
    functionName: "getMembers",
    query: { enabled: !!circleAddress && isConnected },
  });

  // Read Payout Order
  const {
    data: payoutOrder,
  } = useReadContract({
    address: circleAddress,
    abi: GROUP_SAVE_ABI,
    functionName: "getPayoutOrder",
    query: { enabled: !!circleAddress && isConnected },
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
    query: { enabled: !!circleAddress && !!userAddress },
  });

  // Read canResolve
  const {
    data: canResolve,
    refetch: refetchCanResolve,
  } = useReadContract({
    address: circleAddress,
    abi: GROUP_SAVE_ABI,
    functionName: "canResolve",
    query: { enabled: !!circleAddress },
  });

  // Check token allowance
  const {
    data: allowance,
    refetch: refetchAllowance,
  } = useReadContract({
    address: circleInfo?.token || CONTRACT_ADDRESSES.mockUsdc,
    abi: MOCK_USDC_ABI,
    functionName: "allowance",
    args: userAddress && circleAddress ? [userAddress, circleAddress] : undefined,
    query: { enabled: !!userAddress && !!circleAddress },
  });

  // Write contract hook
  const { data: txHash, writeContract, isPending: isWritePending, error: writeError } = useWriteContract();
  const { isLoading: isTxConfirming, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  useEffect(() => {
    if (isTxSuccess) {
      setFeedbackMsg("Transaction confirmed on Sepolia!");
      refetchInfo();
      refetchMembers();
      refetchMemberInfo();
      refetchCanResolve();
      refetchAllowance();
      const timer = setTimeout(() => setFeedbackMsg(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [isTxSuccess, refetchInfo, refetchMembers, refetchMemberInfo, refetchCanResolve, refetchAllowance]);

  if (!isConnected) return null;

  // Unpack info
  const name = circleInfo?.name || "Savings Circle";
  const status = circleInfo?.status !== undefined ? Number(circleInfo.status) : 0;
  const contribution = circleInfo?.contribution ?? 0n;
  const memberCount = circleInfo?.memberCount ? Number(circleInfo.memberCount) : 0;
  const joined = circleInfo?.joined ? Number(circleInfo.joined) : (members?.length || 0);
  const currentRound = circleInfo?.currentRound !== undefined ? Number(circleInfo.currentRound) : 0;
  const paidThisRound = circleInfo?.paidThisRound ? Number(circleInfo.paidThisRound) : 0;
  const currentRoundDeadline = circleInfo?.currentRoundDeadline ? Number(circleInfo.currentRoundDeadline) : 0;

  const totalPot = contribution * BigInt(memberCount);
  const progressPct = memberCount > 0 ? Math.round((paidThisRound / memberCount) * 100) : 0;

  // Member flags
  const isMember = !!memberInfo?.isMember;
  const isInvited = !!memberInfo?.invited;
  const isCreator = circleCreator && userAddress && circleCreator.toLowerCase() === userAddress.toLowerCase();
  const userClaimable = memberInfo?.claimable ?? 0n;
  const amountDue = memberInfo?.amountDue ?? 0n;
  const userPaidThisRound = !!memberInfo?.paidThisRound;
  const userHoldBack = memberInfo?.holdBack ?? 0n;
  const userStake = memberInfo?.stake ?? 0n;

  // Handlers
  const handleApprove = (requiredAmount) => {
    setErrorMsg("");
    try {
      writeContract({
        address: circleInfo?.token || CONTRACT_ADDRESSES.mockUsdc,
        abi: MOCK_USDC_ABI,
        functionName: "approve",
        args: [circleAddress, requiredAmount * 100n], // approve ample buffer
      });
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleJoin = () => {
    setErrorMsg("");
    try {
      if ((allowance ?? 0n) < contribution) {
        handleApprove(contribution);
        return;
      }
      writeContract({
        address: circleAddress,
        abi: GROUP_SAVE_ABI,
        functionName: "join",
      });
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleContribute = () => {
    setErrorMsg("");
    try {
      if (amountDue === 0n) {
        setErrorMsg("No contribution currently due.");
        return;
      }
      if ((allowance ?? 0n) < amountDue) {
        handleApprove(amountDue);
        return;
      }
      writeContract({
        address: circleAddress,
        abi: GROUP_SAVE_ABI,
        functionName: "contribute",
      });
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleClaim = () => {
    setErrorMsg("");
    try {
      if (userClaimable === 0n) {
        setErrorMsg("Nothing to claim right now.");
        return;
      }
      writeContract({
        address: circleAddress,
        abi: GROUP_SAVE_ABI,
        functionName: "claim",
      });
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleResolve = () => {
    setErrorMsg("");
    try {
      writeContract({
        address: circleAddress,
        abi: GROUP_SAVE_ABI,
        functionName: "resolveRound",
      });
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleLeave = () => {
    setErrorMsg("");
    try {
      writeContract({
        address: circleAddress,
        abi: GROUP_SAVE_ABI,
        functionName: "leaveCircle",
      });
    } catch (err) {
      try {
        writeContract({
          address: circleAddress,
          abi: GROUP_SAVE_ABI,
          functionName: "leave",
        });
      } catch (e) {
        setErrorMsg(err.message || e.message);
      }
    }
  };

  const handleInviteSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");
    try {
      const addrs = inviteAddresses
        .split(/[,\s]+/)
        .map((a) => a.trim())
        .filter((a) => a.startsWith("0x") && a.length === 42);
      if (addrs.length === 0) {
        setErrorMsg("Please enter at least one valid 42-char EVM address (0x...)");
        return;
      }
      writeContract({
        address: circleAddress,
        abi: GROUP_SAVE_ABI,
        functionName: "invite",
        args: [addrs],
      });
      setShowInviteModal(false);
      setInviteAddresses("");
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleCancelOpen = () => {
    setErrorMsg("");
    try {
      writeContract({
        address: circleAddress,
        abi: GROUP_SAVE_ABI,
        functionName: "cancelOpen",
      });
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#041711] flex flex-col lg:flex-row">
      <Sidebar />
      <main className="flex-1 lg:ml-[240px] w-full min-w-0">
        {/* Top Header */}
        <div className="sticky top-[56px] lg:top-0 z-30 min-h-[56px] py-2 sm:py-0 bg-[#041711]/90 backdrop-blur-xl border-b border-white/[0.06] flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-8 h-8 rounded-xl bg-white/[0.06] flex items-center justify-center hover:bg-white/[0.10] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            </button>
            <span className="sora text-[15px] font-semibold">{name}</span>
            <span className={`px-2 py-0.5 rounded-full border text-[11px] font-medium ${STATUS_COLORS[status] || ""}`}>
              {STATUS_NAMES[status] || "Unknown"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex mono text-[11px] text-[#bccabf]">
              {circleAddress?.slice(0, 6)}...{circleAddress?.slice(-4)}
            </span>
          </div>
        </div>

        <div className="p-4 lg:p-8 max-w-[1280px] space-y-5">
          {/* Status / Transaction alerts */}
          {feedbackMsg && (
            <div className="p-3.5 rounded-xl bg-[#62dd9e]/10 border border-[#62dd9e]/30 text-[#62dd9e] text-[13px] flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              {feedbackMsg}
            </div>
          )}

          {(errorMsg || writeError) && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-[13px]">
              {errorMsg || writeError?.shortMessage || writeError?.message}
            </div>
          )}

          {/* Bento row 1: Pot info & Current round */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-7 bg-[#10231d] border border-white/[0.06] rounded-2xl p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] tracking-widest uppercase text-[#bccabf]">
                    Pot Per Round
                  </div>
                  <div className="sora text-[30px] font-bold mt-1 text-white">
                    {fmtUSDC(totalPot, "$")}
                    <span className="text-[14px] font-normal text-[#bccabf] ml-1">mUSDC</span>
                  </div>
                  <div className="text-[12px] text-[#8ca394] mt-1">
                    Contribution: {fmtUSDC(contribution, "$")} · {joined}/{memberCount} members
                  </div>
                </div>

                <div className="w-20 h-20 relative">
                  <svg className="w-20 h-20 -rotate-90" viewBox="0 0 48 48">
                    <circle cx="24" cy="24" r="18" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="4" />
                    <motion.circle
                      cx="24"
                      cy="24"
                      r="18"
                      fill="none"
                      stroke="#62dd9e"
                      strokeWidth="4"
                      strokeLinecap="round"
                      pathLength={1}
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: progressPct / 100 }}
                      transition={{ duration: 0.8 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="sora text-[13px] font-bold">{progressPct}%</span>
                    <span className="text-[9px] tracking-widest uppercase text-[#bccabf]">
                      {paidThisRound}/{memberCount}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 h-2 rounded-full bg-[#01110c] overflow-hidden">
                <div className="h-full bg-[#62dd9e] rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
              </div>

              <div className="mt-4 pt-4 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-[#bccabf]">Round Status</span>
                  <div className="text-[13px] font-medium text-white">
                    {status === 0 ? "Awaiting full member group to start" : `Round ${currentRound + 1} of ${memberCount}`}
                  </div>
                </div>

                {status === 0 && !isMember && (
                  <button
                    onClick={handleJoin}
                    disabled={isWritePending || isTxConfirming}
                    className="px-5 py-2.5 bg-[#1aa56c] hover:bg-[#62dd9e] text-white hover:text-[#002111] rounded-xl text-[13px] font-semibold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isWritePending || isTxConfirming ? "Processing..." : `Join Circle (Stake: $${fmtUSDC(contribution)})`}
                  </button>
                )}

                {status === 0 && isMember && (
                  <button
                    onClick={handleLeave}
                    disabled={isWritePending || isTxConfirming}
                    className="px-4 py-2 bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 rounded-xl text-[12px] font-semibold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isWritePending || isTxConfirming ? "Processing..." : "Leave Circle (Refund Stake)"}
                  </button>
                )}

                {status === 0 && isCreator && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowInviteModal(true)}
                      className="px-3.5 py-2 bg-white/[0.08] hover:bg-white/[0.12] text-white rounded-xl text-[12px] font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">person_add</span> Invite
                    </button>
                    <button
                      onClick={handleCancelOpen}
                      disabled={isWritePending || isTxConfirming}
                      className="px-3.5 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/25 rounded-xl text-[12px] font-semibold transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Cancel Pool
                    </button>
                  </div>
                )}

                {status === 1 && isMember && !userPaidThisRound && (
                  <button
                    onClick={handleContribute}
                    disabled={isWritePending || isTxConfirming || amountDue === 0n}
                    className="px-5 py-2.5 bg-[#1aa56c] hover:bg-[#62dd9e] text-white hover:text-[#002111] rounded-xl text-[13px] font-semibold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isWritePending || isTxConfirming ? "Confirming..." : `Pay Due: $${fmtUSDC(amountDue || contribution)}`}
                  </button>
                )}

                {status === 1 && isMember && userPaidThisRound && (
                  <span className="px-3 py-1.5 rounded-lg bg-[#62dd9e]/15 text-[#62dd9e] text-[12px] font-medium flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">check</span> Paid for Round {currentRound + 1}
                  </span>
                )}
              </div>
            </motion.div>

            {/* Bento card 2: User Position & Claim */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="lg:col-span-5 bg-[#1b2e27] border border-white/[0.06] rounded-2xl p-6 flex flex-col justify-between"
            >
              <div>
                <div className="text-[11px] tracking-widest uppercase text-[#e4c279] font-medium">
                  Your Circle Position
                </div>
                <div className="sora text-[22px] font-semibold text-white mt-1">
                  {isMember ? "Active Participant" : isInvited ? "Invited (Not Joined)" : "Observer"}
                </div>

                <div className="mt-4 space-y-2.5">
                  <div className="flex justify-between text-[12px] p-2.5 rounded-xl bg-[#01110c]/60 border border-white/[0.04]">
                    <span className="text-[#bccabf]">Claimable Balance</span>
                    <span className="sora font-semibold text-[#62dd9e]">{fmtUSDC(userClaimable, "$")} mUSDC</span>
                  </div>
                  <div className="flex justify-between text-[12px] p-2.5 rounded-xl bg-[#01110c]/60 border border-white/[0.04]">
                    <span className="text-[#bccabf]">Collateral Held (Model B)</span>
                    <span className="sora font-semibold text-white">{fmtUSDC(userHoldBack, "$")} mUSDC</span>
                  </div>
                  <div className="flex justify-between text-[12px] p-2.5 rounded-xl bg-[#01110c]/60 border border-white/[0.04]">
                    <span className="text-[#bccabf]">Join Stake Active</span>
                    <span className="sora font-semibold text-white">{fmtUSDC(userStake, "$")} mUSDC</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.06] flex gap-2">
                <button
                  onClick={handleClaim}
                  disabled={userClaimable === 0n || isWritePending || isTxConfirming}
                  className="flex-1 py-3 bg-[#e4c279] hover:bg-[#f0c98a] disabled:opacity-40 text-[#002111] rounded-xl text-[12px] font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Claim Payout ({fmtUSDC(userClaimable, "$")})
                </button>
                {canResolve && (
                  <button
                    onClick={handleResolve}
                    disabled={isWritePending || isTxConfirming}
                    className="px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 rounded-xl text-[11px] font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Resolve Grace
                  </button>
                )}
              </div>
            </motion.div>
          </div>

          {/* Members Table */}
          <div className="bg-[#10231d] border border-white/[0.06] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between border-b border-white/[0.06]">
              <span className="sora text-[15px] font-semibold text-white">Circle Members</span>
              <span className="text-[12px] text-[#bccabf]">
                {members?.length || 0} of {memberCount} joined
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[11px] tracking-widest uppercase text-[#bccabf] border-b border-white/[0.06] bg-white/[0.01]">
                    <th className="px-5 py-3 font-medium">Turn #</th>
                    <th className="px-5 py-3 font-medium">Address</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] text-[13px]">
                  {(!members || members.length === 0) ? (
                    <tr>
                      <td colSpan={3} className="px-5 py-8 text-center text-[#bccabf]">
                        No members joined yet.
                      </td>
                    </tr>
                  ) : (
                    members.map((addr, idx) => {
                      const isMe = userAddress && addr.toLowerCase() === userAddress.toLowerCase();
                      const payoutTurn = payoutOrder && payoutOrder.length > 0
                        ? payoutOrder.findIndex((p) => p.toLowerCase() === addr.toLowerCase()) + 1
                        : null;

                      return (
                        <tr key={addr} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-5 py-3 text-[#bccabf] tabular-nums">
                            {payoutTurn ? `Turn ${payoutTurn}` : `Slot ${idx + 1}`}
                          </td>
                          <td className="px-5 py-3 font-mono">
                            <span className="text-white">{addr.slice(0, 8)}...{addr.slice(-6)}</span>
                            {isMe && (
                              <span className="ml-2 px-2 py-0.5 rounded-full bg-[#62dd9e]/20 text-[#62dd9e] text-[10px] font-semibold">
                                You
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3">
                            <span className="px-2.5 py-1 rounded-full bg-[#62dd9e]/15 text-[#62dd9e] text-[11px] font-medium">
                              Joined
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
          {showInviteModal && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-[#10231d] border border-white/[0.1] rounded-2xl p-6 max-w-[480px] w-full">
                <div className="flex items-center justify-between">
                  <h3 className="sora text-[17px] font-semibold text-white">Invite Members</h3>
                  <button
                    onClick={() => setShowInviteModal(false)}
                    className="text-[#bccabf] hover:text-white"
                  >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                </div>
                <p className="text-[12px] text-[#bccabf] mt-1.5">
                  Enter EVM addresses (separated by commas or spaces) to whitelist for this circle.
                </p>
                <form onSubmit={handleInviteSubmit} className="mt-4 space-y-3">
                  <textarea
                    rows={3}
                    value={inviteAddresses}
                    onChange={(e) => setInviteAddresses(e.target.value)}
                    placeholder="0x1234...abcd, 0x5678...ef01"
                    className="w-full p-3 rounded-xl bg-[#01110c] border border-white/[0.08] text-[13px] font-mono text-white placeholder:text-[#bccabf]/40 focus:outline-none focus:border-[#62dd9e]/50"
                  />
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowInviteModal(false)}
                      className="px-4 py-2 rounded-xl text-[12px] text-[#bccabf] hover:text-white font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isWritePending || isTxConfirming}
                      className="px-4 py-2 bg-[#1aa56c] hover:bg-[#62dd9e] text-white hover:text-[#002111] rounded-xl text-[12px] font-semibold transition-colors disabled:opacity-50"
                    >
                      Send Invites
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
