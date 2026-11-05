"use client";
import { useEffect, useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { motion } from "framer-motion";
import { ADDRESSES, SAVINGS_VAULT_ABI, parseUSDC } from "@/lib/contracts";

export default function NewGoalPage() {
  const { isConnected } = useAccount();
  const router = useRouter();
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [date, setDate] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const { writeContractAsync, data: txHash, isPending } = useWriteContract();
  const { isLoading: isWaitingTx, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (!isConnected) router.replace("/auth");
  }, [isConnected, router]);

  useEffect(() => {
    if (isSuccess) {
      router.push("/goals");
    }
  }, [isSuccess, router]);

  if (!isConnected) return null;

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const targetUnits = parseUSDC(target);
    if (targetUnits <= 0n) {
      setErrorMsg("Target amount must be greater than zero.");
      return;
    }

    const deadlineTimestamp = Math.floor(new Date(date).getTime() / 1000);
    const now = Math.floor(Date.now() / 1000);
    if (deadlineTimestamp <= now) {
      setErrorMsg("Maturity deadline must be a future date.");
      return;
    }

    try {
      await writeContractAsync({
        address: ADDRESSES.savingsVault,
        abi: SAVINGS_VAULT_ABI,
        functionName: "createGoal",
        args: [name, targetUnits, BigInt(deadlineTimestamp)],
      });
    } catch (err) {
      setErrorMsg(err.shortMessage || err.message || "Failed to create vault.");
    }
  };

  const isSubmitting = isPending || isWaitingTx;

  return (
    <div className="min-h-screen bg-[#041711] flex flex-col lg:flex-row">
      <Sidebar />
      <main className="flex-1 lg:ml-[240px] w-full min-w-0 p-4 lg:p-8 max-w-[640px]">
        <button
          onClick={() => router.back()}
          className="text-[13px] text-[#bccabf] hover:text-white flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[18px]">
            arrow_back
          </span>{" "}
          Back
        </button>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mt-4 bg-[#10231d] border border-white/[0.06] rounded-2xl p-6"
        >
          <h1 className="sora text-[20px] font-semibold">New vault</h1>
          <p className="text-[13px] text-[#bccabf] mt-1">
            Lock mUSDC until your deadline or target is hit. 0% fee on maturity (10% penalty applies if withdrawn early).
          </p>

          {errorMsg && (
            <div className="mt-4 p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-[12px]">
              {errorMsg}
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-[11px] font-semibold tracking-widest uppercase text-[#bccabf]">
                Vault name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Lagos workspace"
                className="mt-1.5 w-full h-11 px-3 rounded-xl bg-[#01110c] border border-white/[0.08] text-[14px] placeholder:text-[#bccabf]/50 focus:outline-none focus:border-[#62dd9e]/50"
                maxLength={64}
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold tracking-widest uppercase text-[#bccabf]">
                Target (mUSDC)
              </label>
              <input
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                type="number"
                step="any"
                min="0.000001"
                placeholder="e.g. 12000"
                className="mt-1.5 w-full h-11 px-3 rounded-xl bg-[#01110c] border border-white/[0.08] text-[14px] placeholder:text-[#bccabf]/50 focus:outline-none focus:border-[#62dd9e]/50"
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold tracking-widest uppercase text-[#bccabf]">
                Maturity date
              </label>
              <input
                value={date}
                onChange={(e) => setDate(e.target.value)}
                type="date"
                className="mt-1.5 w-full h-11 px-3 rounded-xl bg-[#01110c] border border-white/[0.08] text-[14px] focus:outline-none focus:border-[#62dd9e]/50"
                required
                disabled={isSubmitting}
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#1aa56c] hover:bg-[#62dd9e] disabled:opacity-50 text-white hover:text-[#002111] rounded-xl text-[13px] font-semibold tracking-wide transition-colors"
            >
              {isWaitingTx ? "Confirming on Sepolia..." : isPending ? "Check wallet to sign..." : "Create vault"}
            </button>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
