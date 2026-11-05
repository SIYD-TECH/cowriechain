"use client";
import { useEffect, useState } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { ADDRESSES, SAVINGS_VAULT_ABI, MOCK_USDC_ABI, fmtUSDC, parseUSDC } from "@/lib/contracts";

export default function GoalDetailPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const params = useParams();
  const goalId = params?.id ? parseInt(params.id, 10) : 0;

  const [amount, setAmount] = useState("");
  const [earlyOpen, setEarlyOpen] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const { writeContractAsync, data: txHash, isPending } = useWriteContract();
  const { isLoading: isWaitingTx } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (!isConnected) router.replace("/auth");
  }, [isConnected, router]);

  // Read goal from contract
  const { data: goalData, refetch: refetchGoal } = useReadContract({
    address: ADDRESSES.savingsVault,
    abi: SAVINGS_VAULT_ABI,
    functionName: "getGoal",
    args: address !== undefined && !isNaN(goalId) ? [address, BigInt(goalId)] : undefined,
    query: { enabled: Boolean(address && !isNaN(goalId) && ADDRESSES.savingsVault) },
  });

  const { data: isWithdrawable, refetch: refetchWithdrawable } = useReadContract({
    address: ADDRESSES.savingsVault,
    abi: SAVINGS_VAULT_ABI,
    functionName: "isWithdrawable",
    args: address !== undefined && !isNaN(goalId) ? [address, BigInt(goalId)] : undefined,
    query: { enabled: Boolean(address && !isNaN(goalId) && ADDRESSES.savingsVault) },
  });

  const { data: earlyPreview } = useReadContract({
    address: ADDRESSES.savingsVault,
    abi: SAVINGS_VAULT_ABI,
    functionName: "previewEarlyWithdraw",
    args: address !== undefined && !isNaN(goalId) ? [address, BigInt(goalId)] : undefined,
    query: { enabled: Boolean(address && !isNaN(goalId) && ADDRESSES.savingsVault) },
  });

  // Read user mUSDC balance & allowance
  const { data: usdcBalance, refetch: refetchBalance } = useReadContract({
    address: ADDRESSES.mockUSDC,
    abi: MOCK_USDC_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address && ADDRESSES.mockUSDC) },
  });

  const { data: usdcAllowance, refetch: refetchAllowance } = useReadContract({
    address: ADDRESSES.mockUSDC,
    abi: MOCK_USDC_ABI,
    functionName: "allowance",
    args: address && ADDRESSES.savingsVault ? [address, ADDRESSES.savingsVault] : undefined,
    query: { enabled: Boolean(address && ADDRESSES.mockUSDC && ADDRESSES.savingsVault) },
  });

  if (!isConnected) return null;

  const goalName = goalData?.name || `Vault #${goalId}`;
  const savedUnits = goalData?.saved || 0n;
  const targetUnits = goalData?.target || 0n;
  const isWithdrawn = goalData?.withdrawn || false;
  const deadlineDate = goalData?.deadline ? new Date(Number(goalData.deadline) * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A";

  const targetNum = Number(targetUnits);
  const savedNum = Number(savedUnits);
  const pct = targetNum > 0 ? Math.min(100, Math.round((savedNum / targetNum) * 1000) / 10) : 0;
  const remainingUnits = targetUnits > savedUnits ? targetUnits - savedUnits : 0n;

  const handleDeposit = async () => {
    setStatusMsg("");
    const parsedAmt = parseUSDC(amount);
    if (parsedAmt <= 0n) {
      setStatusMsg("Please enter an amount greater than zero.");
      return;
    }

    try {
      // Step 1: Check allowance
      const currentAllowance = usdcAllowance || 0n;
      if (currentAllowance < parsedAmt) {
        setStatusMsg("Step 1/2: Approving mUSDC transfer...");
        await writeContractAsync({
          address: ADDRESSES.mockUSDC,
          abi: MOCK_USDC_ABI,
          functionName: "approve",
          args: [ADDRESSES.savingsVault, parsedAmt],
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

      setStatusMsg("Deposit successful!");
      setAmount("");
      refetchGoal();
      refetchBalance();
      refetchWithdrawable();
    } catch (err) {
      setStatusMsg(err.shortMessage || err.message || "Transaction failed.");
    }
  };

  const handleWithdraw = async () => {
    setStatusMsg("");
    try {
      setStatusMsg("Withdrawing funds...");
      await writeContractAsync({
        address: ADDRESSES.savingsVault,
        abi: SAVINGS_VAULT_ABI,
        functionName: "withdraw",
        args: [BigInt(goalId)],
      });
      setStatusMsg("Withdrawal complete!");
      refetchGoal();
      refetchBalance();
    } catch (err) {
      setStatusMsg(err.shortMessage || err.message || "Withdrawal failed.");
    }
  };

  const handleEarlyWithdraw = async () => {
    setStatusMsg("");
    try {
      setStatusMsg("Executing early withdrawal (10% penalty)...");
      await writeContractAsync({
        address: ADDRESSES.savingsVault,
        abi: SAVINGS_VAULT_ABI,
        functionName: "withdrawEarly",
        args: [BigInt(goalId)],
      });
      setEarlyOpen(false);
      setStatusMsg("Early withdrawal processed.");
      refetchGoal();
      refetchBalance();
    } catch (err) {
      setStatusMsg(err.shortMessage || err.message || "Early withdrawal failed.");
    }
  };

  const isBusy = isPending || isWaitingTx;

  return (
    <div className="min-h-screen bg-[#041711] flex flex-col lg:flex-row">
      <Sidebar />
      <main className="flex-1 lg:ml-[240px] w-full min-w-0 p-4 lg:p-8 max-w-[800px]">
        <button
          onClick={() => router.back()}
          className="text-[13px] text-[#bccabf] hover:text-white flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[18px]">
            arrow_back
          </span>{" "}
          Goals
        </button>

        {statusMsg && (
          <div className="mt-3 p-3 rounded-xl bg-[#10231d] border border-white/[0.08] text-[13px] text-[#62dd9e]">
            {statusMsg}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mt-4 bg-[#10231d] border border-white/[0.06] rounded-2xl p-6"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="sora text-[20px] font-semibold">{goalName}</div>
              <div className="text-[12px] text-[#bccabf] mt-1">
                Target {fmtUSDC(targetUnits, "$")} · Maturity {deadlineDate} · {pct}%
              </div>
            </div>
            <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-widest uppercase ${
              isWithdrawn ? "bg-white/10 text-[#bccabf]" : isWithdrawable ? "bg-[#e4c279]/20 text-[#e4c279]" : "bg-[#62dd9e]/15 text-[#62dd9e]"
            }`}>
              {isWithdrawn ? "Withdrawn" : isWithdrawable ? "Eligible" : "Active"}
            </span>
          </div>
          <div className="mt-4 h-2 rounded-full bg-[#01110c] overflow-hidden">
            <div
              className="h-full bg-[#62dd9e] rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-[#bccabf]">
            <span>{fmtUSDC(savedUnits, "$")} saved</span>
            <span>{fmtUSDC(remainingUnits, "$")} remaining</span>
          </div>
        </motion.div>

        {!isWithdrawn ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {/* Deposit Box */}
            <div className="bg-[#10231d] border border-white/[0.06] rounded-2xl p-5">
              <div className="text-[11px] font-semibold tracking-widest uppercase text-[#bccabf]">
                Contribute
              </div>
              <div className="mt-3 flex gap-2">
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  type="number"
                  placeholder="mUSDC"
                  disabled={isBusy}
                  className="flex-1 h-11 px-3 rounded-xl bg-[#01110c] border border-white/[0.08] text-[14px] placeholder:text-[#bccabf]/50 focus:outline-none focus:border-[#62dd9e]/50"
                />
                <button
                  onClick={handleDeposit}
                  disabled={isBusy || !amount}
                  className="px-5 h-11 bg-[#1aa56c] hover:bg-[#62dd9e] disabled:opacity-50 text-white hover:text-[#002111] rounded-xl text-[12px] font-semibold transition-colors"
                >
                  Deposit
                </button>
              </div>
              <div className="text-[11px] text-[#bccabf]/60 mt-2">
                Balance: {fmtUSDC(usdcBalance, "$")} mUSDC
              </div>
            </div>

            {/* Withdraw Box */}
            <div className="bg-[#10231d] border border-white/[0.06] rounded-2xl p-5">
              <div className="text-[11px] font-semibold tracking-widest uppercase text-[#bccabf]">
                Withdraw
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={handleWithdraw}
                  disabled={isBusy || !isWithdrawable || savedUnits === 0n}
                  className="flex-1 h-11 bg-[#1aa56c] hover:bg-[#62dd9e] disabled:opacity-30 disabled:cursor-not-allowed text-white hover:text-[#002111] rounded-xl text-[12px] font-semibold transition-colors"
                >
                  Withdraw (0% fee)
                </button>
                <button
                  onClick={() => setEarlyOpen(true)}
                  disabled={isBusy || isWithdrawable || savedUnits === 0n}
                  className="flex-1 h-11 bg-[#4a1a0a]/40 border border-[#e4c279]/20 text-[#e4c279] hover:bg-[#4a1a0a]/60 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl text-[12px] font-semibold transition-colors"
                >
                  Early · 10% fee
                </button>
              </div>
              <div className="text-[11px] text-[#bccabf]/60 mt-2">
                {isWithdrawable
                  ? "Target or maturity reached: Free withdrawal unlocked."
                  : "Withdrawal unlocked once target or date is hit."}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 p-5 rounded-2xl bg-[#10231d] border border-white/[0.06] text-center text-[#bccabf] text-[13px]">
            This savings goal has been completed and withdrawn.
          </div>
        )}

        {/* Early Exit Confirmation Modal */}
        <AnimatePresence>
          {earlyOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-[#10231d] border border-white/[0.1] rounded-2xl p-6 max-w-[420px] w-full"
              >
                <h3 className="sora text-[17px] font-semibold text-[#e4c279]">
                  Confirm early withdrawal
                </h3>
                <p className="text-[13px] text-[#bccabf] mt-2 leading-relaxed">
                  Withdrawing before your deadline incurs a strict <strong>10% protocol penalty</strong> that is sent to the community rewards pool.
                </p>
                <div className="mt-4 p-3 rounded-xl bg-[#01110c] text-[12px] space-y-1">
                  <div className="flex justify-between text-[#bccabf]">
                    <span>Current balance:</span>
                    <span>{fmtUSDC(savedUnits, "$")}</span>
                  </div>
                  <div className="flex justify-between text-red-400">
                    <span>10% Penalty:</span>
                    <span>{earlyPreview ? fmtUSDC(earlyPreview[1], "$") : "10%"}</span>
                  </div>
                  <div className="flex justify-between text-[#62dd9e] font-semibold pt-1 border-t border-white/[0.06]">
                    <span>Net payout:</span>
                    <span>{earlyPreview ? fmtUSDC(earlyPreview[0], "$") : fmtUSDC((savedUnits * 9n) / 10n, "$")}</span>
                  </div>
                </div>
                <div className="mt-5 flex gap-2">
                  <button
                    onClick={() => setEarlyOpen(false)}
                    className="flex-1 py-2.5 bg-white/[0.08] hover:bg-white/[0.12] rounded-xl text-[12px] font-semibold"
                  >
                    Keep saving
                  </button>
                  <button
                    onClick={handleEarlyWithdraw}
                    disabled={isBusy}
                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-[12px] font-semibold"
                  >
                    {isBusy ? "Processing..." : "Confirm exit"}
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
