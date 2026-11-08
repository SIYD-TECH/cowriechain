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
  ADDRESSES,
  SAVINGS_VAULT_ABI,
  MOCK_USDC_ABI,
  fmtUSDC,
  parseUSDC,
  parseContractError,
} from "@/lib/contracts";

export default function GoalDetailPage() {
  const { address, isConnected, status } = useAccount();
  const router = useRouter();
  const params = useParams();
  const goalId = params?.id !== undefined ? parseInt(params.id, 10) : 0;

  const [amount, setAmount] = useState("");
  const [earlyOpen, setEarlyOpen] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const { writeContractAsync, data: txHash, isPending } = useWriteContract();
  const { isLoading: isWaitingTx } = useWaitForTransactionReceipt({ hash: txHash });

  // Redirect only when truly disconnected
  useEffect(() => {
    if (status === "disconnected") {
      router.replace("/auth");
    }
  }, [status, router]);

  // Read goal from contract
  const { data: goalData, refetch: refetchGoal } = useReadContract({
    address: ADDRESSES.savingsVault,
    abi: SAVINGS_VAULT_ABI,
    functionName: "getGoal",
    args: address !== undefined && !isNaN(goalId) ? [address, BigInt(goalId)] : undefined,
    query: {
      enabled: Boolean(address && !isNaN(goalId) && ADDRESSES.savingsVault),
      refetchInterval: 10000,
    },
  });

  const { data: isWithdrawable, refetch: refetchWithdrawable } = useReadContract({
    address: ADDRESSES.savingsVault,
    abi: SAVINGS_VAULT_ABI,
    functionName: "isWithdrawable",
    args: address !== undefined && !isNaN(goalId) ? [address, BigInt(goalId)] : undefined,
    query: {
      enabled: Boolean(address && !isNaN(goalId) && ADDRESSES.savingsVault),
      refetchInterval: 10000,
    },
  });

  const { data: earlyPreview } = useReadContract({
    address: ADDRESSES.savingsVault,
    abi: SAVINGS_VAULT_ABI,
    functionName: "previewEarlyWithdraw",
    args: address !== undefined && !isNaN(goalId) ? [address, BigInt(goalId)] : undefined,
    query: {
      enabled: Boolean(address && !isNaN(goalId) && ADDRESSES.savingsVault),
      refetchInterval: 10000,
    },
  });

  // Read user mUSDC balance & allowance
  const { data: usdcBalance, refetch: refetchBalance } = useReadContract({
    address: ADDRESSES.mockUSDC,
    abi: MOCK_USDC_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address && ADDRESSES.mockUSDC),
      refetchInterval: 10000,
    },
  });

  const { data: usdcAllowance, refetch: refetchAllowance } = useReadContract({
    address: ADDRESSES.mockUSDC,
    abi: MOCK_USDC_ABI,
    functionName: "allowance",
    args: address && ADDRESSES.savingsVault ? [address, ADDRESSES.savingsVault] : undefined,
    query: {
      enabled: Boolean(address && ADDRESSES.mockUSDC && ADDRESSES.savingsVault),
      refetchInterval: 10000,
    },
  });

  if (status === "disconnected") return null;

  const goalName = goalData?.name || `Vault #${goalId}`;
  const savedUnits = goalData?.saved || 0n;
  const targetUnits = goalData?.target || 0n;
  const isWithdrawn = goalData?.withdrawn || false;
  const deadlineDate = goalData?.deadline
    ? new Date(Number(goalData.deadline) * 1000).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "N/A";

  const targetNum = Number(targetUnits);
  const savedNum = Number(savedUnits);
  const pct = targetNum > 0 ? Math.min(100, Math.round((savedNum / targetNum) * 1000) / 10) : 0;
  const remainingUnits = targetUnits > savedUnits ? targetUnits - savedUnits : 0n;

  const handleDeposit = async () => {
    setStatusMsg("");
    setErrorMsg("");
    const parsedAmt = parseUSDC(amount);
    if (parsedAmt <= 0n) {
      setErrorMsg("Please enter an amount greater than zero.");
      return;
    }

    try {
      // Step 1: Check allowance — approve max if insufficient
      const currentAllowance = usdcAllowance || 0n;
      if (currentAllowance < parsedAmt) {
        setStatusMsg("Step 1/2: Approving mUSDC transfer in wallet...");
        const approveHash = await writeContractAsync({
          address: ADDRESSES.mockUSDC,
          abi: MOCK_USDC_ABI,
          functionName: "approve",
          args: [ADDRESSES.savingsVault, 2n ** 256n - 1n],
        });
        await refetchAllowance();
      }

      // Step 2: Contribute
      setStatusMsg("Step 2/2: Depositing into vault...");
      await writeContractAsync({
        address: ADDRESSES.savingsVault,
        abi: SAVINGS_VAULT_ABI,
        functionName: "contribute",
        args: [BigInt(goalId), parsedAmt],
      });

      setStatusMsg("Deposit successful! Vault balance updated.");
      setAmount("");
      refetchGoal();
      refetchBalance();
      refetchWithdrawable();
    } catch (err) {
      setStatusMsg("");
      setErrorMsg(parseContractError(err));
    }
  };

  const handleWithdraw = async () => {
    setStatusMsg("");
    setErrorMsg("");
    try {
      setStatusMsg("Withdrawing funds with 0% fee...");
      await writeContractAsync({
        address: ADDRESSES.savingsVault,
        abi: SAVINGS_VAULT_ABI,
        functionName: "withdraw",
        args: [BigInt(goalId)],
      });
      setStatusMsg("Standard withdrawal completed successfully! Funds returned to wallet.");
      refetchGoal();
      refetchBalance();
      refetchWithdrawable();
    } catch (err) {
      setStatusMsg("");
      setErrorMsg(parseContractError(err));
    }
  };

  const handleEarlyWithdraw = async () => {
    setStatusMsg("");
    setErrorMsg("");
    try {
      setStatusMsg("Executing early withdrawal (10% penalty to treasury)...");
      await writeContractAsync({
        address: ADDRESSES.savingsVault,
        abi: SAVINGS_VAULT_ABI,
        functionName: "withdrawEarly",
        args: [BigInt(goalId)],
      });
      setEarlyOpen(false);
      setStatusMsg("Early withdrawal processed successfully. Payout delivered.");
      refetchGoal();
      refetchBalance();
      refetchWithdrawable();
    } catch (err) {
      setStatusMsg("");
      setErrorMsg(parseContractError(err));
    }
  };

  const isBusy = isPending || isWaitingTx;

  return (
    <div className="min-h-screen bg-[#0E2927] text-[#F6F1E7]">
      <Sidebar />
      <main className="lg:pl-[240px] px-4 sm:px-6 lg:px-8 py-8 max-w-4xl mx-auto space-y-6">
        <button
          onClick={() => router.back()}
          className="text-xs sm:text-sm text-[#9DB5AF] hover:text-[#F6F1E7] flex items-center gap-1 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Goals
        </button>

        {statusMsg && (
          <div className="p-3.5 rounded-xl bg-[rgba(43,181,154,0.15)] border border-[rgba(43,181,154,0.3)] text-[#2BB59A] text-xs sm:text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>{statusMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-[rgba(235,87,87,0.12)] border border-[rgba(235,87,87,0.3)] text-[#EB5757] text-xs sm:text-sm flex items-start gap-2">
            <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Goal Overview Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-[#143734] border border-[rgba(246,241,231,0.08)] rounded-2xl p-6 sm:p-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h1 className="sora text-2xl sm:text-3xl font-bold text-[#F6F1E7]">
                {goalName}
              </h1>
              <div className="text-xs sm:text-sm text-[#9DB5AF] mt-1.5 flex flex-wrap items-center gap-2">
                <span>Target: <strong className="text-[#F6F1E7]">{fmtUSDC(targetUnits, "")} mUSDC</strong></span>
                <span>•</span>
                <span>Maturity: <strong className="text-[#F6F1E7]">{deadlineDate}</strong></span>
              </div>
            </div>
            <span
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                isWithdrawn
                  ? "bg-white/10 text-[#9DB5AF]"
                  : isWithdrawable
                  ? "bg-[rgba(227,176,75,0.15)] text-[#E3B04B] border border-[rgba(227,176,75,0.3)]"
                  : "bg-[rgba(43,181,154,0.15)] text-[#2BB59A] border border-[rgba(43,181,154,0.25)]"
              }`}
            >
              {isWithdrawn ? "Withdrawn" : isWithdrawable ? "Eligible for 0% Withdraw" : "Active Saving"}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-xs sm:text-sm text-[#9DB5AF] mb-2">
              <span>Savings Progress</span>
              <span className="sora font-bold text-[#2BB59A]">{pct}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-[#0E2927] overflow-hidden">
              <div
                className="h-full bg-[#2BB59A] rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="mt-2.5 flex justify-between text-xs text-[#9DB5AF]">
              <span>Saved: <strong className="text-[#F6F1E7]">{fmtUSDC(savedUnits, "")} mUSDC</strong></span>
              <span>Remaining: <strong className="text-[#F6F1E7]">{fmtUSDC(remainingUnits, "")} mUSDC</strong></span>
            </div>
          </div>
        </motion.div>

        {!isWithdrawn ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Deposit Box */}
            <div className="bg-[#143734] border border-[rgba(246,241,231,0.08)] rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-semibold tracking-wider uppercase text-[#9DB5AF]">
                  Deposit mUSDC
                </div>
                <p className="text-xs text-[#9DB5AF] mt-1">
                  Add funds towards your goal target.
                </p>
                <div className="mt-4 flex gap-2">
                  <input
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    type="number"
                    placeholder="Amount (mUSDC)"
                    disabled={isBusy}
                    className="flex-1 h-11 px-3.5 rounded-xl bg-[#0E2927] border border-[rgba(246,241,231,0.08)] text-sm text-[#F6F1E7] placeholder:text-[#9DB5AF]/40 focus:outline-none focus:border-[#2BB59A]"
                  />
                  <button
                    onClick={handleDeposit}
                    disabled={isBusy || !amount}
                    className="px-5 h-11 bg-[#2BB59A] hover:bg-[#259e87] disabled:opacity-50 text-[#0E2927] rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                  >
                    {isBusy ? "Processing..." : "Deposit"}
                  </button>
                </div>
              </div>
              <div className="text-xs text-[#9DB5AF] mt-3 pt-3 border-t border-[rgba(246,241,231,0.06)] flex items-center justify-between">
                <span>Wallet Balance:</span>
                <span className="font-semibold text-[#F6F1E7]">
                  {fmtUSDC(usdcBalance, "")} mUSDC
                </span>
              </div>
            </div>

            {/* Withdraw Box */}
            <div className="bg-[#143734] border border-[rgba(246,241,231,0.08)] rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-semibold tracking-wider uppercase text-[#9DB5AF]">
                  Withdrawal Options
                </div>
                <p className="text-xs text-[#9DB5AF] mt-1">
                  Withdraw 100% with 0% fee on maturity, or exit early with a 10% penalty.
                </p>
                <div className="mt-4 flex flex-col sm:flex-row gap-2.5">
                  <button
                    onClick={handleWithdraw}
                    disabled={isBusy || !isWithdrawable || savedUnits === 0n}
                    className="flex-1 h-11 bg-[#2BB59A] hover:bg-[#259e87] disabled:opacity-30 disabled:cursor-not-allowed text-[#0E2927] rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">check</span>
                    Withdraw (0% fee)
                  </button>
                  <button
                    onClick={() => setEarlyOpen(true)}
                    disabled={isBusy || isWithdrawable || savedUnits === 0n}
                    className="flex-1 h-11 bg-[rgba(227,176,75,0.12)] border border-[rgba(227,176,75,0.3)] text-[#E3B04B] hover:bg-[rgba(227,176,75,0.2)] disabled:opacity-30 disabled:cursor-not-allowed rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">warning</span>
                    Early Exit (10% fee)
                  </button>
                </div>
              </div>
              <div className="text-xs text-[#9DB5AF] mt-3 pt-3 border-t border-[rgba(246,241,231,0.06)]">
                {isWithdrawable
                  ? "✓ Target or maturity reached: Free 0% withdrawal unlocked!"
                  : "Target or deadline not reached yet. Early withdrawal applies 10% penalty."}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-[#143734] border border-[rgba(246,241,231,0.08)] text-center text-[#9DB5AF] text-sm">
            <span className="material-symbols-outlined text-[32px] text-[#2BB59A] mb-1">
              task_alt
            </span>
            <p className="font-semibold text-[#F6F1E7]">Vault Completed</p>
            <p className="text-xs text-[#9DB5AF] mt-0.5">
              This savings goal has been completed and fully withdrawn to your wallet.
            </p>
          </div>
        )}

        {/* Early Exit Confirmation Modal */}
        <AnimatePresence>
          {earlyOpen && (
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
                className="bg-[#143734] border border-[rgba(246,241,231,0.12)] rounded-2xl p-6 sm:p-7 max-w-md w-full shadow-2xl"
              >
                <div className="flex items-center gap-2 text-[#E3B04B] mb-2">
                  <span className="material-symbols-outlined text-[24px]">warning</span>
                  <h3 className="sora text-lg font-bold">
                    Confirm Early Exit
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-[#9DB5AF] leading-relaxed">
                  Withdrawing before your deadline or target incurs a strict <strong>10% protocol penalty</strong> that is sent directly to the CowrieChain treasury address.
                </p>

                <div className="mt-4 p-4 rounded-xl bg-[#0E2927] border border-[rgba(246,241,231,0.06)] text-xs space-y-2">
                  <div className="flex justify-between text-[#9DB5AF]">
                    <span>Current Saved Balance:</span>
                    <span className="font-semibold text-[#F6F1E7]">{fmtUSDC(savedUnits, "")} mUSDC</span>
                  </div>
                  <div className="flex justify-between text-[#EB5757]">
                    <span>10% Treasury Penalty:</span>
                    <span className="font-semibold">
                      -{earlyPreview ? fmtUSDC(earlyPreview[1], "") : fmtUSDC(savedUnits / 10n, "")} mUSDC
                    </span>
                  </div>
                  <div className="flex justify-between text-[#2BB59A] font-bold pt-2 border-t border-[rgba(246,241,231,0.08)] text-sm">
                    <span>Net Payout to Wallet:</span>
                    <span>
                      {earlyPreview ? fmtUSDC(earlyPreview[0], "") : fmtUSDC((savedUnits * 9n) / 10n, "")} mUSDC
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => setEarlyOpen(false)}
                    className="flex-1 py-2.5 bg-white/[0.06] hover:bg-white/[0.12] rounded-xl text-xs sm:text-sm font-semibold text-[#F6F1E7] transition-colors"
                  >
                    Keep Saving
                  </button>
                  <button
                    onClick={handleEarlyWithdraw}
                    disabled={isBusy}
                    className="flex-1 py-2.5 bg-[#EB5757] hover:bg-[#d64545] disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                  >
                    {isBusy ? "Processing..." : "Confirm Early Exit"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
