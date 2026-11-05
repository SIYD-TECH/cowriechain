"use client";
import { useEffect, useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { motion } from "framer-motion";
import { CONTRACT_ADDRESSES, GROUP_SAVE_FACTORY_ABI, parseUSDC } from "@/lib/contracts";

export default function NewCirclePage() {
  const { isConnected } = useAccount();
  const router = useRouter();
  const [f, setF] = useState({
    name: "",
    contrib: "50",
    members: "4",
    cadence: "weekly",
    collateralPct: "20",
    joinDays: "7",
  });
  const [errorMsg, setErrorMsg] = useState("");

  const { data: txHash, writeContract, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  useEffect(() => {
    if (!isConnected) router.replace("/auth");
  }, [isConnected, router]);

  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => {
        router.push("/circles");
      }, 1500);
    }
  }, [isSuccess, router]);

  if (!isConnected) return null;

  const cadenceSeconds = {
    daily: 86400n,
    weekly: 7n * 86400n,
    biweekly: 14n * 86400n,
    monthly: 30n * 86400n,
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      const contrib = parseUSDC(f.contrib);
      const members = BigInt(f.members);
      if (members < 3n || members > 20n) {
        setErrorMsg("Members count must be between 3 and 20.");
        return;
      }

      const roundDuration = cadenceSeconds[f.cadence] || cadenceSeconds.weekly;
      const graceDuration = 2n * 86400n; // 2 days grace period
      const joinDays = BigInt(parseInt(f.joinDays || "7", 10));
      const joinDeadline = BigInt(Math.floor(Date.now() / 1000)) + (joinDays * 86400n);
      const collateralBps = BigInt(Math.round(parseFloat(f.collateralPct || "20") * 100));

      writeContract({
        address: CONTRACT_ADDRESSES.groupSaveFactory,
        abi: GROUP_SAVE_FACTORY_ABI,
        functionName: "createCircle",
        args: [
          f.name,
          contrib,
          members,
          roundDuration,
          graceDuration,
          joinDeadline,
          collateralBps,
        ],
      });
    } catch (err) {
      setErrorMsg(err.message || "Failed to initiate circle creation");
    }
  };

  const potPerCycle =
    f.contrib && f.members
      ? (Number(f.contrib) * Number(f.members)).toLocaleString()
      : "—";

  return (
    <div className="min-h-screen bg-[#041711] flex flex-col lg:flex-row">
      <Sidebar />
      <main className="flex-1 lg:ml-[240px] w-full min-w-0 p-4 lg:p-8 max-w-[640px]">
        <button
          onClick={() => router.back()}
          className="text-[13px] text-[#bccabf] hover:text-white flex items-center gap-1 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span> Back
        </button>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mt-4 bg-[#10231d] border border-white/[0.06] rounded-2xl p-6"
        >
          <h1 className="sora text-[20px] font-semibold">New Circle</h1>
          <p className="text-[13px] text-[#bccabf] mt-1">
            Configure contribution amount, group size, and round cadence. Payout order will be randomized on start.
          </p>

          {isSuccess && (
            <div className="mt-4 p-3 rounded-xl bg-[#62dd9e]/10 border border-[#62dd9e]/30 text-[#62dd9e] text-[13px] flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              Circle created on Sepolia! Redirecting to circles...
            </div>
          )}

          {(errorMsg || writeError) && (
            <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-[13px]">
              {errorMsg || writeError?.shortMessage || writeError?.message}
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-[11px] font-semibold tracking-widest uppercase text-[#bccabf]">
                Circle Name
              </label>
              <input
                value={f.name}
                onChange={(e) => setF({ ...f, name: e.target.value })}
                placeholder="e.g. Lagos Tech Builders"
                className="mt-1.5 w-full h-11 px-3 rounded-xl bg-[#01110c] border border-white/[0.08] text-[14px] placeholder:text-[#bccabf]/50 focus:outline-none focus:border-[#62dd9e]/50"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold tracking-widest uppercase text-[#bccabf]">
                  Contribution (mUSDC)
                </label>
                <input
                  value={f.contrib}
                  onChange={(e) => setF({ ...f, contrib: e.target.value })}
                  type="number"
                  min="1"
                  step="any"
                  placeholder="50"
                  className="mt-1.5 w-full h-11 px-3 rounded-xl bg-[#01110c] border border-white/[0.08] text-[14px] focus:outline-none focus:border-[#62dd9e]/50"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold tracking-widest uppercase text-[#bccabf]">
                  Members (3–20)
                </label>
                <input
                  value={f.members}
                  onChange={(e) => setF({ ...f, members: e.target.value })}
                  type="number"
                  min="3"
                  max="20"
                  placeholder="4"
                  className="mt-1.5 w-full h-11 px-3 rounded-xl bg-[#01110c] border border-white/[0.08] text-[14px] focus:outline-none focus:border-[#62dd9e]/50"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold tracking-widest uppercase text-[#bccabf]">
                  Cadence
                </label>
                <select
                  value={f.cadence}
                  onChange={(e) => setF({ ...f, cadence: e.target.value })}
                  className="mt-1.5 w-full h-11 px-3 rounded-xl bg-[#01110c] border border-white/[0.08] text-[14px] focus:outline-none focus:border-[#62dd9e]/50 text-white"
                >
                  <option value="weekly" className="bg-[#10231d]">Weekly (7 days)</option>
                  <option value="biweekly" className="bg-[#10231d]">Bi-weekly (14 days)</option>
                  <option value="monthly" className="bg-[#10231d]">Monthly (30 days)</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold tracking-widest uppercase text-[#bccabf]">
                  Collateral Hold-back (%)
                </label>
                <input
                  value={f.collateralPct}
                  onChange={(e) => setF({ ...f, collateralPct: e.target.value })}
                  type="number"
                  min="0"
                  max="100"
                  placeholder="20"
                  className="mt-1.5 w-full h-11 px-3 rounded-xl bg-[#01110c] border border-white/[0.08] text-[14px] focus:outline-none focus:border-[#62dd9e]/50"
                  required
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#01110c] border border-white/[0.04] text-[12px] text-[#bccabf] space-y-1">
              <div>
                Total pot per round:{" "}
                <span className="text-[#62dd9e] font-semibold">${potPerCycle} mUSDC</span>
              </div>
              <div className="text-[11px] text-[#8ca394]">
                Model B Collateral: {f.collateralPct}% held back from early recipients and released each subsequent round paid.
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending || isConfirming}
              className="w-full py-3.5 bg-[#1aa56c] hover:bg-[#62dd9e] disabled:opacity-50 text-white hover:text-[#002111] rounded-xl text-[14px] font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {(isPending || isConfirming) ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                  {isPending ? "Confirm in Wallet..." : "Deploying Circle on Sepolia..."}
                </>
              ) : (
                "Create Circle on-chain"
              )}
            </button>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
