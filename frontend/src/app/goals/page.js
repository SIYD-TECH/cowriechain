"use client";
import { useEffect } from "react";
import { useAccount, useReadContract } from "wagmi";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import { useReveal } from "@/hooks/useReveal";
import { ADDRESSES, SAVINGS_VAULT_ABI, fmtUSDC } from "@/lib/contracts";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function GoalsPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [ref, inView] = useReveal(0.12);

  useEffect(() => {
    if (!isConnected) router.replace("/auth");
  }, [isConnected, router]);

  // Read goals for connected user from SavingsVault
  const { data: onChainGoals, isLoading, refetch } = useReadContract({
    address: ADDRESSES.savingsVault,
    abi: SAVINGS_VAULT_ABI,
    functionName: "getGoals",
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address && ADDRESSES.savingsVault && ADDRESSES.savingsVault !== "0x0000000000000000000000000000000000000000"),
    },
  });

  if (!isConnected) return null;

  const goals = (onChainGoals || []).map((g, idx) => {
    const targetNum = Number(g.target || 0n);
    const savedNum = Number(g.saved || 0n);
    const pct = targetNum > 0 ? Math.min(100, Math.round((savedNum / targetNum) * 1000) / 10) : 0;
    const deadlineDate = g.deadline ? new Date(Number(g.deadline) * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A";
    return {
      id: idx.toString(),
      name: g.name,
      saved: g.saved,
      target: g.target,
      deadline: deadlineDate,
      withdrawn: g.withdrawn,
      pct,
    };
  });

  return (
    <div className="min-h-screen bg-[#041711] flex flex-col lg:flex-row">
      <Sidebar />
      <main className="flex-1 lg:ml-[240px] w-full min-w-0">
        <div className="sticky top-[56px] lg:top-0 z-30 min-h-[56px] py-2 sm:py-0 bg-[#041711]/90 backdrop-blur-xl border-b border-white/[0.06] flex items-center justify-between px-4 lg:px-8">
          <span className="sora text-[15px] font-semibold">Goals</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => refetch()}
              className="text-[#bccabf] hover:text-white text-[12px] flex items-center gap-1"
              title="Refresh goals"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
            </button>
            <Link
              href="/goals/new"
              className="px-4 py-2 bg-[#1aa56c] hover:bg-[#62dd9e] text-white hover:text-[#002111] rounded-xl text-[11px] font-semibold tracking-widest uppercase transition-colors"
            >
              New vault
            </Link>
          </div>
        </div>

        <div ref={ref} className="p-4 lg:p-8 max-w-[1280px]">
          {isLoading && (
            <div className="py-12 text-center text-[#bccabf] text-[13px]">
              Loading your savings goals from blockchain...
            </div>
          )}

          <motion.div
            variants={container}
            initial="hidden"
            animate={inView ? "show" : "hidden"}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
          >
            {goals.map((g) => (
              <motion.div
                key={g.id}
                variants={item}
                whileHover={{ y: -3 }}
                className="bg-[#10231d] border border-white/[0.06] hover:border-white/[0.10] rounded-2xl p-5 flex flex-col"
              >
                <div className="flex items-center justify-between">
                  <span className="sora text-[15px] font-semibold">
                    {g.name}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-[10px] font-semibold tracking-widest uppercase ${
                    g.withdrawn ? "bg-white/10 text-[#bccabf]" : "bg-[#62dd9e]/15 text-[#62dd9e]"
                  }`}>
                    {g.withdrawn ? "Withdrawn" : `${g.pct}%`}
                  </span>
                </div>
                <div className="text-[11px] text-[#bccabf] mt-1">
                  {fmtUSDC(g.saved, "$")} / {fmtUSDC(g.target, "$")} · {g.deadline}
                </div>
                <div className="mt-3 h-1.5 rounded-full bg-[#01110c] overflow-hidden">
                  <div
                    className="h-full bg-[#62dd9e] rounded-full"
                    style={{ width: `${g.pct}%` }}
                  />
                </div>
                <Link
                  href={`/goals/${g.id}`}
                  className="mt-4 w-full text-center py-2.5 bg-[#1b2e27] hover:bg-[#263932] rounded-xl text-[11px] font-semibold tracking-widest uppercase transition-colors"
                >
                  Open vault
                </Link>
              </motion.div>
            ))}

            <motion.div
              variants={item}
              className="border-2 border-dashed border-white/[0.08] rounded-2xl p-5 flex flex-col items-center justify-center text-center min-h-[160px] hover:border-[#62dd9e]/30 transition-colors"
            >
              <span className="material-symbols-outlined text-[#bccabf] text-[24px]">
                add_circle
              </span>
              <div className="sora text-[13px] font-semibold mt-2">
                Create a goal
              </div>
              <div className="text-[11px] text-[#bccabf] mt-1">
                Lock mUSDC until a date or target. 0% fee on maturity.
              </div>
              <Link
                href="/goals/new"
                className="mt-3 px-4 py-2 bg-[#1aa56c] text-white rounded-xl text-[11px] font-semibold"
              >
                New vault
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
