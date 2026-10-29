"use client";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { motion, AnimatePresence } from "framer-motion";

export default function GoalDetailPage() {
  const { isConnected } = useAccount();
  const router = useRouter();
  const params = useParams();
  const [amount, setAmount] = useState("");
  const [earlyOpen, setEarlyOpen] = useState(false);
  useEffect(() => {
    if (!isConnected) router.replace("/auth");
  }, [isConnected, router]);
  if (!isConnected) return null;

  const saved = 8500,
    target = 12000,
    pct = 70.8;

  return (
    <div className="min-h-screen bg-[#041711] flex">
      <Sidebar />
      <main className="flex-1 ml-[240px] max-lg:ml-0 p-4 lg:p-8 max-w-[800px]">
        <button
          onClick={() => router.back()}
          className="text-[13px] text-[#bccabf] hover:text-white flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[18px]">
            arrow_back
          </span>{" "}
          Goals
        </button>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mt-4 bg-[#10231d] border border-white/[0.06] rounded-2xl p-6"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="sora text-[20px] font-semibold">
                Lagos workspace
              </div>
              <div className="text-[12px] text-[#bccabf] mt-1">
                Target ${target.toLocaleString()} · Maturity Dec 15 · {pct}%
              </div>
            </div>
            <span className="shrink-0 px-2.5 py-1 rounded-full bg-[#62dd9e]/15 text-[#62dd9e] text-[10px] font-semibold tracking-widest uppercase">
              Active
            </span>
          </div>
          <div className="mt-4 h-2 rounded-full bg-[#01110c] overflow-hidden">
            <div
              className="h-full bg-[#62dd9e] rounded-full"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-[#bccabf]">
            <span>${saved.toLocaleString()} saved</span>
            <span>${(target - saved).toLocaleString()} remaining</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
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
                className="flex-1 h-11 px-3 rounded-xl bg-[#01110c] border border-white/[0.08] text-[14px] placeholder:text-[#bccabf]/50 focus:outline-none focus:border-[#62dd9e]/50"
              />
              <button
                onClick={() => {
                  /* TODO: approve + contribute via lib/contracts */
                }}
                className="px-5 h-11 bg-[#1aa56c] hover:bg-[#62dd9e] text-white hover:text-[#002111] rounded-xl text-[12px] font-semibold transition-colors"
              >
                Deposit
              </button>
            </div>
            <div className="text-[11px] text-[#bccabf]/60 mt-2">
              Requires mUSDC approval first.
            </div>
          </div>
          <div className="bg-[#10231d] border border-white/[0.06] rounded-2xl p-5">
            <div className="text-[11px] font-semibold tracking-widest uppercase text-[#bccabf]">
              Withdraw
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => {
                  /* TODO: withdraw() */
                }}
                className="flex-1 h-11 bg-[#1aa56c] hover:bg-[#62dd9e] text-white hover:text-[#002111] rounded-xl text-[12px] font-semibold transition-colors"
              >
                Withdraw
              </button>
              <button
                onClick={() => setEarlyOpen(true)}
                className="flex-1 h-11 bg-[#4a1a0a]/40 border border-[#e4c279]/20 text-[#e4c279] hover:bg-[#4a1a0a]/60 rounded-xl text-[12px] font-semibold transition-colors"
              >
                Early · 5% fee
              </button>
            </div>
            <div className="text-[11px] text-[#bccabf]/60 mt-2">
              Withdraw enabled at maturity or target. Early exit incurs penalty.
            </div>
          </div>
        </div>

        <AnimatePresence>
          {earlyOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setEarlyOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.96, y: 8 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.96, y: 8 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-[420px] bg-[#10231d] border border-white/[0.08] rounded-2xl p-6"
              >
                <div className="w-10 h-10 rounded-xl bg-[#4a1a0a] flex items-center justify-center text-[#e4c279]">
                  <span className="material-symbols-outlined">warning</span>
                </div>
                <h3 className="sora text-[16px] font-semibold mt-3">
                  Early withdrawal?
                </h3>
                <p className="text-[13px] text-[#bccabf] mt-2 leading-5">
                  You'll receive{" "}
                  <span className="text-white font-semibold">
                    ${Math.round(saved * 0.95).toLocaleString()}
                  </span>{" "}
                  · Penalty{" "}
                  <span className="text-[#e4c279] font-semibold">
                    ${Math.round(saved * 0.05).toLocaleString()}
                  </span>{" "}
                  → reward pool. Deducted in the same tx.
                </p>
                <div className="mt-5 flex gap-2">
                  <button
                    onClick={() => setEarlyOpen(false)}
                    className="flex-1 h-11 bg-[#1b2e27] rounded-xl text-[13px] font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setEarlyOpen(false); /* TODO: withdrawEarly() */
                    }}
                    className="flex-1 h-11 bg-[#e4c279] text-[#002111] rounded-xl text-[13px] font-semibold"
                  >
                    Confirm early exit
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
