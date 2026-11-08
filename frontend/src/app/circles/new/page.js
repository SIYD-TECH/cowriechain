"use client";

import { useEffect, useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { motion } from "framer-motion";
import {
  ADDRESSES,
  GROUP_SAVE_FACTORY_ABI,
  parseUSDC,
  parseContractError,
} from "@/lib/contracts";

export default function NewCirclePage() {
  const { isConnected, status } = useAccount();
  const router = useRouter();
  const [f, setF] = useState({
    name: "",
    contrib: "50",
    members: "3",
    cadence: "demo", // default to demo 3-min for rapid testing
    collateralPct: "100", // default 100% per guide rule 4
    joinDays: "7",
  });
  const [errorMsg, setErrorMsg] = useState("");

  const { data: txHash, writeContract, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess, data: receipt } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Redirect only when truly disconnected
  useEffect(() => {
    if (status === "disconnected") {
      router.replace("/auth");
    }
  }, [status, router]);

  // Navigate to created circle or circles list once confirmed
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        router.push("/circles");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, router]);

  if (status === "disconnected") return null;

  // Cadence mapping in seconds (including 3-minute demo option)
  const cadenceConfig = {
    demo: {
      round: 180n, // 3 minutes
      grace: 120n, // 2 minutes
      label: "3-Min Demo (Fast Test)",
    },
    weekly: {
      round: 7n * 86400n, // 7 days
      grace: 2n * 86400n, // 2 days
      label: "Weekly (7 days)",
    },
    biweekly: {
      round: 14n * 86400n, // 14 days
      grace: 3n * 86400n, // 3 days
      label: "Bi-weekly (14 days)",
    },
    monthly: {
      round: 30n * 86400n, // 30 days
      grace: 5n * 86400n, // 5 days
      label: "Monthly (30 days)",
    },
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      const contrib = parseUSDC(f.contrib);
      if (contrib <= 0n) {
        setErrorMsg("Contribution amount must be greater than zero.");
        return;
      }

      const members = BigInt(parseInt(f.members, 10));
      if (members < 3n || members > 20n) {
        setErrorMsg("Members count must be between 3 and 20.");
        return;
      }

      const cfg = cadenceConfig[f.cadence] || cadenceConfig.demo;
      const roundDuration = cfg.round;
      const graceDuration = cfg.grace;

      // Join deadline in seconds
      const now = BigInt(Math.floor(Date.now() / 1000));
      let joinDeadline;
      if (f.cadence === "demo") {
        joinDeadline = now + 600n; // 10 minutes to join for demo
      } else {
        const joinDays = BigInt(parseInt(f.joinDays || "7", 10));
        joinDeadline = now + joinDays * 86400n;
      }

      const collateralPercent = parseFloat(f.collateralPct || "100");
      if (collateralPercent < 0 || collateralPercent > 100) {
        setErrorMsg("Collateral percentage must be between 0% and 100%.");
        return;
      }
      const collateralBps = BigInt(Math.round(collateralPercent * 100)); // 100% = 10000

      writeContract({
        address: ADDRESSES.groupSaveFactory,
        abi: GROUP_SAVE_FACTORY_ABI,
        functionName: "createCircle",
        args: [
          f.name.trim(),
          contrib,
          members,
          roundDuration,
          graceDuration,
          joinDeadline,
          collateralBps,
        ],
      });
    } catch (err) {
      setErrorMsg(parseContractError(err));
    }
  };

  const potPerRound =
    f.contrib && f.members
      ? (Number(f.contrib) * Number(f.members)).toLocaleString()
      : "—";

  return (
    <div className="min-h-screen bg-[#0E2927] text-[#F6F1E7]">
      <Sidebar />
      <main className="lg:pl-[240px] px-4 sm:px-6 lg:px-8 py-8 max-w-2xl mx-auto">
        <button
          onClick={() => router.back()}
          className="text-xs sm:text-sm text-[#9DB5AF] hover:text-[#F6F1E7] flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Circles
        </button>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mt-4 bg-[#143734] border border-[rgba(246,241,231,0.08)] rounded-2xl p-6 sm:p-8"
        >
          <div className="flex items-center gap-2.5 mb-2">
            <span className="material-symbols-outlined text-[#2BB59A] text-[24px]">
              group_add
            </span>
            <h1 className="sora text-xl sm:text-2xl font-bold text-[#F6F1E7]">
              New Ajo Circle
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#9DB5AF] leading-relaxed">
            Configure contribution amount, group size, and round cadence. Payout order is randomly shuffled
            transparently on-chain once all members join.
          </p>

          {isSuccess && (
            <div className="mt-4 p-3.5 rounded-xl bg-[rgba(43,181,154,0.15)] border border-[rgba(43,181,154,0.3)] text-[#2BB59A] text-xs sm:text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span>Circle created on Sepolia! Redirecting to circle list...</span>
            </div>
          )}

          {(errorMsg || writeError) && (
            <div className="mt-4 p-3.5 rounded-xl bg-[rgba(235,87,87,0.12)] border border-[rgba(235,87,87,0.3)] text-[#EB5757] text-xs sm:text-sm flex items-start gap-2">
              <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
              <span>{errorMsg || parseContractError(writeError)}</span>
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-[11px] font-semibold tracking-wider uppercase text-[#9DB5AF]">
                Circle Name
              </label>
              <input
                value={f.name}
                onChange={(e) => setF({ ...f, name: e.target.value })}
                placeholder="e.g. Lagos Tech Builders or Family Pool"
                className="mt-1.5 w-full h-11 px-3.5 rounded-xl bg-[#0E2927] border border-[rgba(246,241,231,0.08)] text-sm text-[#F6F1E7] placeholder:text-[#9DB5AF]/40 focus:outline-none focus:border-[#2BB59A]"
                maxLength={64}
                required
                disabled={isPending || isConfirming}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-semibold tracking-wider uppercase text-[#9DB5AF]">
                  Contribution (mUSDC)
                </label>
                <input
                  value={f.contrib}
                  onChange={(e) => setF({ ...f, contrib: e.target.value })}
                  type="number"
                  min="0.000001"
                  step="any"
                  placeholder="50"
                  className="mt-1.5 w-full h-11 px-3.5 rounded-xl bg-[#0E2927] border border-[rgba(246,241,231,0.08)] text-sm text-[#F6F1E7] focus:outline-none focus:border-[#2BB59A]"
                  required
                  disabled={isPending || isConfirming}
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold tracking-wider uppercase text-[#9DB5AF]">
                    Members (3–20)
                  </label>
                  <span className="text-[10px] text-[#2BB59A] font-semibold uppercase">
                    Rounds = Members
                  </span>
                </div>
                <input
                  value={f.members}
                  onChange={(e) => setF({ ...f, members: e.target.value })}
                  type="number"
                  min="3"
                  max="20"
                  placeholder="3"
                  className="mt-1.5 w-full h-11 px-3.5 rounded-xl bg-[#0E2927] border border-[rgba(246,241,231,0.08)] text-sm text-[#F6F1E7] focus:outline-none focus:border-[#2BB59A]"
                  required
                  disabled={isPending || isConfirming}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-semibold tracking-wider uppercase text-[#9DB5AF]">
                  Round Cadence
                </label>
                <select
                  value={f.cadence}
                  onChange={(e) => setF({ ...f, cadence: e.target.value })}
                  className="mt-1.5 w-full h-11 px-3.5 rounded-xl bg-[#0E2927] border border-[rgba(246,241,231,0.08)] text-sm text-[#F6F1E7] focus:outline-none focus:border-[#2BB59A]"
                  disabled={isPending || isConfirming}
                >
                  <option value="demo">⚡ 3-Min Demo (Fast Sepolia Test)</option>
                  <option value="weekly">Weekly (7-day rounds, 2-day grace)</option>
                  <option value="biweekly">Bi-weekly (14-day rounds, 3-day grace)</option>
                  <option value="monthly">Monthly (30-day rounds, 5-day grace)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold tracking-wider uppercase text-[#9DB5AF]">
                  Collateral Hold-back (%)
                </label>
                <input
                  value={f.collateralPct}
                  onChange={(e) => setF({ ...f, collateralPct: e.target.value })}
                  type="number"
                  min="0"
                  max="100"
                  placeholder="100"
                  className="mt-1.5 w-full h-11 px-3.5 rounded-xl bg-[#0E2927] border border-[rgba(246,241,231,0.08)] text-sm text-[#F6F1E7] focus:outline-none focus:border-[#2BB59A]"
                  required
                  disabled={isPending || isConfirming}
                />
              </div>
            </div>

            {/* Summary Box */}
            <div className="p-4 rounded-xl bg-[#0E2927] border border-[rgba(246,241,231,0.06)] text-xs text-[#9DB5AF] space-y-1.5">
              <div className="flex justify-between items-center">
                <span>Total Pot Per Round:</span>
                <span className="text-base font-bold text-[#2BB59A]">
                  {potPerRound} mUSDC
                </span>
              </div>
              <div className="text-[11px] text-[#9DB5AF]/80 leading-relaxed pt-1 border-t border-[rgba(246,241,231,0.06)]">
                • <strong>Rounds = Members:</strong> {f.members} rounds total so every member receives the pot exactly once.
                <br />
                • <strong>Collateral Model:</strong> {f.collateralPct}% held back from early recipients and released gradually as they continue paying subsequent rounds.
                <br />
                • <strong>Stake:</strong> 1x contribution ({f.contrib} mUSDC) staked upon joining, fully refunded at circle completion.
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending || isConfirming}
              className="mt-4 w-full py-3.5 bg-[#2BB59A] hover:bg-[#259e87] disabled:opacity-50 text-[#0E2927] rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_16px_rgba(43,181,154,0.25)]"
            >
              {isPending || isConfirming ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#0E2927] border-t-transparent rounded-full animate-spin" />
                  <span>
                    {isPending ? "Confirm in Wallet..." : "Deploying Circle on Sepolia..."}
                  </span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
                  <span>Create Circle On-Chain</span>
                </>
              )}
            </button>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
