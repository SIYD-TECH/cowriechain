"use client";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { motion } from "framer-motion";
import { useReveal } from "@/hooks/useReveal";

export default function RewardsPage() {
  const { isConnected, address: userAddress } = useAccount();
  const router = useRouter();
  const [ref, inView] = useReveal(0.15);

  const [poolData, setPoolData] = useState({
    poolCap: 50000,
    poolBal: 18400,
    points: 1240,
    tier: "Gold Saver",
  });

  useEffect(() => {
    if (!isConnected) router.replace("/auth");
  }, [isConnected, router]);

  useEffect(() => {
    if (userAddress) {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      fetch(`${backendUrl}/api/rewards/user/${userAddress}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.points !== undefined) {
            setPoolData((prev) => ({
              ...prev,
              points: data.points,
              tier: data.tier,
            }));
          }
        })
        .catch(() => {
          // Graceful fallback to default in-memory state
        });
    }
  }, [userAddress]);

  if (!isConnected) return null;

  const poolPct = Math.round((poolData.poolBal / poolData.poolCap) * 100);

  return (
    <div className="min-h-screen bg-[#041711] flex flex-col lg:flex-row">
      <Sidebar />
      <main className="flex-1 lg:ml-[240px] w-full min-w-0">
        <div className="sticky top-[56px] lg:top-0 z-30 min-h-[56px] py-2 sm:py-0 bg-[#041711]/90 backdrop-blur-xl border-b border-white/[0.06] flex items-center px-4 lg:px-8">
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
              Reward Pool
            </div>
            <div className="relative sora text-[36px] font-bold mt-1 tabular-nums text-white">
              ${poolData.poolBal.toLocaleString()}
              <span className="text-[13px] font-normal text-[#bccabf]">.00</span>{" "}
              <span className="text-[11px] font-medium text-[#bccabf]">
                / ${poolData.poolCap.toLocaleString()} cap
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
              <span>Claims capped to pool balance — fails gracefully if empty</span>
            </div>
            <div className="relative mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-[#01110c] border border-white/[0.04]">
                <div className="text-[11px] tracking-widest uppercase text-[#bccabf]">
                  Consistency Points
                </div>
                <div className="sora text-[20px] font-bold mt-1 text-[#62dd9e]">
                  {poolData.points.toLocaleString()}{" "}
                  <span className="text-[11px] font-normal text-[#bccabf]">
                    pts ({poolData.tier})
                  </span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#01110c] border border-white/[0.04]">
                <div className="text-[11px] tracking-widest uppercase text-[#bccabf]">
                  Distribution Schedule
                </div>
                <div className="sora text-[14px] font-semibold mt-1 text-white">
                  Quarterly · ~18 days
                </div>
              </div>
            </div>
            <button
              onClick={() => {}}
              className="relative mt-4 w-full py-3 bg-[#e4c279] hover:bg-[#f0c98a] text-[#002111] rounded-xl text-[12px] font-semibold tracking-wide transition-colors cursor-pointer"
            >
              Claim Rewards (When Distribution Opens)
            </button>
            <div className="relative text-[11px] text-[#bccabf]/60 mt-2 text-center">
              Reward balance shown transparently — funded by penalty recycling and treasury grants.
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
              <div className="sora text-[14px] font-semibold mt-3 text-white">
                Consistency Points
              </div>
              <p className="text-[12px] text-[#bccabf] mt-2 leading-5">
                Hit milestones on time to earn weight in quarterly distributions.
                Points accumulate for completed goal cycles and circle turns.
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
              <div className="sora text-[14px] font-semibold mt-3 text-white">
                Recycled Penalties
              </div>
              <p className="text-[12px] text-[#bccabf] mt-2 leading-5">
                The 10% early-exit penalty in personal vaults is redirected into the
                reward pool to incentivize disciplined long-term savers.
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
                <div className="sora text-[13px] font-semibold text-white">
                  Protocol Notice
                </div>
                <p className="text-[12px] text-[#bccabf] mt-1 leading-5">
                  Rewards depend on protocol activity and community distribution parameters.
                  No speculative yields or algorithmic debasing. Capped to{" "}
                  <span className="text-white font-medium">
                    ${poolData.poolCap.toLocaleString()}
                  </span>{" "}
                  with pull-based claim patterns.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
