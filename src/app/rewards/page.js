"use client";
import { useEffect } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { motion } from "framer-motion";
import { useReveal } from "@/hooks/useReveal";

export default function RewardsPage() {
  const { isConnected } = useAccount();
  const router = useRouter();
  const [ref, inView] = useReveal(0.15);
  useEffect(() => {
    if (!isConnected) router.replace("/auth");
  }, [isConnected, router]);
  if (!isConnected) return null;

  const poolCap = 50000,
    poolBal = 18400,
    poolPct = Math.round((poolBal / poolCap) * 100);

  return (
    <div className="min-h-screen bg-[#041711] flex">
      <Sidebar />
      <main className="flex-1 ml-[240px] max-lg:ml-0">
        <div className="sticky top-0 z-30 h-[56px] bg-[#041711]/80 backdrop-blur-xl border-b border-white/[0.06] flex items-center px-4 lg:px-8">
          <span className="sora text-[15px] font-semibold">Rewards</span>
          <span className="ml-3 px-2.5 py-1 rounded-full bg-[#e4c279]/15 text-[#e4c279] text-[10px] font-semibold tracking-widest uppercase">
            Pre-funded pool
          </span>
        </div>

        <div ref={ref} className="p-4 lg:p-8 max-w-[960px] space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="bg-[#10231d] border border-white/[0.06] rounded-2xl p-6 relative overflow-hidden"
          >
            <motion.div
              aria-hidden
              className="absolute -top-12 -right-12 w-40 h-40 bg-[#e4c279]/10 rounded-full blur-2xl"
              animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.7, 0.5] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="relative text-[11px] tracking-widest uppercase text-[#bccabf]">
              Reward pool
            </div>
            <div className="relative sora text-[36px] font-bold mt-1 tabular-nums">
              ${poolBal.toLocaleString()}
              <span className="text-[13px] font-normal text-[#bccabf]">
                .00
              </span>{" "}
              <span className="text-[11px] font-medium text-[#bccabf]">
                / ${poolCap.toLocaleString()} cap
              </span>
            </div>
            <div className="relative mt-3 h-2 rounded-full bg-[#01110c] overflow-hidden">
              <motion.div
                className="h-full bg-[#e4c279] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: inView ? `${poolPct}%` : 0 }}
                transition={{
                  duration: 0.9,
                  ease: [0.22, 1, 0.36, 1],
                  delay: 0.2,
                }}
              />
            </div>
            <div className="relative mt-2 flex justify-between text-[11px] text-[#bccabf]">
              <span>{poolPct}% of cap</span>
              <span>
                Claims capped to pool balance — fails gracefully if empty
              </span>
            </div>
            <div className="relative mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-[#01110c] border border-white/[0.04]">
                <div className="text-[11px] tracking-widest uppercase text-[#bccabf]">
                  Your consistency points
                </div>
                <div className="sora text-[20px] font-bold mt-1">
                  1,240{" "}
                  <span className="text-[11px] font-normal text-[#bccabf]">
                    pts
                  </span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#01110c] border border-white/[0.04]">
                <div className="text-[11px] tracking-widest uppercase text-[#bccabf]">
                  Next distribution
                </div>
                <div className="sora text-[14px] font-semibold mt-1">
                  Quarterly · ~18 days
                </div>
              </div>
            </div>
            <button
              onClick={() => {}}
              className="relative mt-4 w-full py-3 bg-[#e4c279] hover:bg-[#f0c98a] text-[#002111] rounded-xl text-[12px] font-semibold tracking-wide transition-colors"
            >
              Claim rewards (when eligible)
            </button>
            <div className="relative text-[11px] text-[#bccabf]/60 mt-2 text-center">
              Reward balance shown transparently — never a silent failure.
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.12 }}
              className="bg-[#10231d] border border-white/[0.06] rounded-2xl p-5"
            >
              <div className="w-9 h-9 rounded-xl bg-[#1b2e27] flex items-center justify-center text-[#62dd9e]">
                <span className="material-symbols-outlined text-[20px]">
                  verified
                </span>
              </div>
              <div className="sora text-[14px] font-semibold mt-3">
                Consistency points
              </div>
              <p className="text-[12px] text-[#bccabf] mt-2 leading-5">
                Hit milestones on time to earn weight in quarterly
                distributions. Funded by treasury grants + penalty recycling.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="bg-[#10231d] border border-white/[0.06] rounded-2xl p-5"
            >
              <div className="w-9 h-9 rounded-xl bg-[#1b2e27] flex items-center justify-center text-[#e4c279]">
                <span className="material-symbols-outlined text-[20px]">
                  savings
                </span>
              </div>
              <div className="sora text-[14px] font-semibold mt-3">
                Recycled penalties
              </div>
              <p className="text-[12px] text-[#bccabf] mt-2 leading-5">
                Early-exit fees are redirected into the pool to reward
                disciplined savers — not burned.
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.28 }}
            className="bg-[#10231d] border border-white/[0.06] rounded-2xl p-5"
          >
            <div className="flex gap-2.5">
              <span className="material-symbols-outlined text-[#e4c279] text-[18px] shrink-0 mt-0.5">
                info
              </span>
              <div>
                <div className="sora text-[13px] font-semibold">
                  Protocol notice
                </div>
                <p className="text-[12px] text-[#bccabf] mt-1 leading-5">
                  Rewards depend on pool distributions and governance. No APY
                  promises, no speculative yield. Capped to{" "}
                  <span className="text-white font-medium">
                    ${poolCap.toLocaleString()}
                  </span>{" "}
                  — claims beyond the cap revert with a clear error.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}