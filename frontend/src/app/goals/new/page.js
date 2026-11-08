"use client";

import { useEffect, useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { motion } from "framer-motion";
import {
  ADDRESSES,
  SAVINGS_VAULT_ABI,
  parseUSDC,
  parseContractError,
} from "@/lib/contracts";

export default function NewGoalPage() {
  const { isConnected, status } = useAccount();
  const router = useRouter();
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [date, setDate] = useState("");
  const [demoDurationMinutes, setDemoDurationMinutes] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  const { writeContractAsync, data: txHash, isPending } = useWriteContract();
  const { isLoading: isWaitingTx, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Redirect only when truly disconnected
  useEffect(() => {
    if (status === "disconnected") {
      router.replace("/auth");
    }
  }, [status, router]);

  useEffect(() => {
    if (isSuccess) {
      router.push("/goals");
    }
  }, [isSuccess, router]);

  if (status === "disconnected") return null;

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const targetUnits = parseUSDC(target);
    if (targetUnits <= 0n) {
      setErrorMsg("Target amount must be greater than zero.");
      return;
    }

    const now = Math.floor(Date.now() / 1000);
    let deadlineTimestamp;

    if (demoDurationMinutes > 0) {
      deadlineTimestamp = now + demoDurationMinutes * 60;
    } else {
      if (!date) {
        setErrorMsg("Please select a maturity deadline date or choose a demo timing.");
        return;
      }
      deadlineTimestamp = Math.floor(new Date(date).getTime() / 1000);
      if (deadlineTimestamp <= now) {
        setErrorMsg("Maturity deadline must be a future date.");
        return;
      }
    }

    try {
      await writeContractAsync({
        address: ADDRESSES.savingsVault,
        abi: SAVINGS_VAULT_ABI,
        functionName: "createGoal",
        args: [name.trim(), targetUnits, BigInt(deadlineTimestamp)],
      });
    } catch (err) {
      setErrorMsg(parseContractError(err));
    }
  };

  const isSubmitting = isPending || isWaitingTx;

  return (
    <div className="min-h-screen bg-[#0E2927] text-[#F6F1E7]">
      <Sidebar />
      <main className="lg:pl-[240px] px-4 sm:px-6 lg:px-8 py-8 max-w-2xl mx-auto">
        <button
          onClick={() => router.back()}
          className="text-xs sm:text-sm text-[#9DB5AF] hover:text-[#F6F1E7] flex items-center gap-1 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Goals
        </button>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mt-4 bg-[#143734] border border-[rgba(246,241,231,0.08)] rounded-2xl p-6 sm:p-8"
        >
          <div className="flex items-center gap-2.5 mb-2">
            <span className="material-symbols-outlined text-[#2BB59A] text-[24px]">
              savings
            </span>
            <h1 className="sora text-xl sm:text-2xl font-bold text-[#F6F1E7]">
              New Savings Vault
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#9DB5AF] leading-relaxed">
            Lock mUSDC until your deadline or target is reached. 0% protocol fee applies on full maturity
            (a 10% penalty goes to the treasury address if withdrawn before maturity).
          </p>

          {errorMsg && (
            <div className="mt-4 p-3.5 rounded-xl bg-[rgba(235,87,87,0.12)] border border-[rgba(235,87,87,0.3)] text-[#EB5757] text-xs sm:text-sm flex items-start gap-2">
              <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-[11px] font-semibold tracking-wider uppercase text-[#9DB5AF]">
                Vault Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Lagos workspace or Emergency fund"
                className="mt-1.5 w-full h-11 px-3.5 rounded-xl bg-[#0E2927] border border-[rgba(246,241,231,0.08)] text-sm text-[#F6F1E7] placeholder:text-[#9DB5AF]/40 focus:outline-none focus:border-[#2BB59A]"
                maxLength={64}
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold tracking-wider uppercase text-[#9DB5AF]">
                Target Amount (mUSDC)
              </label>
              <input
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                type="number"
                step="any"
                min="0.000001"
                placeholder="e.g. 500"
                className="mt-1.5 w-full h-11 px-3.5 rounded-xl bg-[#0E2927] border border-[rgba(246,241,231,0.08)] text-sm text-[#F6F1E7] placeholder:text-[#9DB5AF]/40 focus:outline-none focus:border-[#2BB59A]"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold tracking-wider uppercase text-[#9DB5AF]">
                Maturity Timeline
              </label>
              {/* Quick Demo Option */}
              <div className="mt-1.5 grid grid-cols-2 gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => {
                    setDemoDurationMinutes(3);
                    setDate("");
                  }}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    demoDurationMinutes === 3
                      ? "bg-[rgba(43,181,154,0.18)] border-[#2BB59A] text-[#2BB59A]"
                      : "bg-[#0E2927] border-[rgba(246,241,231,0.08)] text-[#9DB5AF] hover:text-[#F6F1E7]"
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">timer</span>
                  3-Min Demo Test
                </button>
                <button
                  type="button"
                  onClick={() => setDemoDurationMinutes(0)}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    demoDurationMinutes === 0
                      ? "bg-[rgba(43,181,154,0.18)] border-[#2BB59A] text-[#2BB59A]"
                      : "bg-[#0E2927] border-[rgba(246,241,231,0.08)] text-[#9DB5AF] hover:text-[#F6F1E7]"
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                  Custom Date
                </button>
              </div>

              {demoDurationMinutes === 0 && (
                <input
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  type="date"
                  className="w-full h-11 px-3.5 rounded-xl bg-[#0E2927] border border-[rgba(246,241,231,0.08)] text-sm text-[#F6F1E7] focus:outline-none focus:border-[#2BB59A]"
                  required={demoDurationMinutes === 0}
                  disabled={isSubmitting}
                />
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 w-full py-3 bg-[#2BB59A] hover:bg-[#259e87] disabled:opacity-50 text-[#0E2927] rounded-xl text-sm font-semibold tracking-wide transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_16px_rgba(43,181,154,0.25)]"
            >
              {isWaitingTx ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#0E2927] border-t-transparent rounded-full animate-spin" />
                  <span>Confirming on Sepolia...</span>
                </>
              ) : isPending ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#0E2927] border-t-transparent rounded-full animate-spin" />
                  <span>Check wallet to sign...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">add_task</span>
                  <span>Create Vault</span>
                </>
              )}
            </button>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
