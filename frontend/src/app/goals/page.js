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
  const { address, isConnected, status } = useAccount();
  const router = useRouter();
  const [ref, inView] = useReveal(0.12);

  // Wagmi connection guard: bounce only when truly disconnected
  useEffect(() => {
    if (status === "disconnected") {
      router.replace("/auth");
    }
  }, [status, router]);

  // Read goals for connected user from SavingsVault
  const {
    data: onChainGoals,
    isLoading,
    refetch,
  } = useReadContract({
    address: ADDRESSES.savingsVault,
    abi: SAVINGS_VAULT_ABI,
    functionName: "getGoals",
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address && ADDRESSES.savingsVault),
      refetchInterval: 10000,
    },
  });

  if (status === "disconnected") return null;

  const goals = (onChainGoals || []).map((g, idx) => {
    const targetNum = Number(g.target || 0n);
    const savedNum = Number(g.saved || 0n);
    const pct =
      targetNum > 0
        ? Math.min(100, Math.round((savedNum / targetNum) * 1000) / 10)
        : 0;
    const deadlineDate = g.deadline
      ? new Date(Number(g.deadline) * 1000).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "N/A";
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
    <div className="min-h-screen bg-[#0E2927] text-[#F6F1E7]">
      <Sidebar />
      <main className="lg:pl-[240px] px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[rgba(246,241,231,0.06)]">
          <div>
            <h1 className="sora text-2xl sm:text-3xl font-bold text-[#F6F1E7]">
              Personal Goals
            </h1>
            <p className="text-sm text-[#9DB5AF] mt-1">
              Automated lock vaults: save towards your goals with 0% fees on maturity.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => refetch()}
              className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-[#9DB5AF] hover:text-white transition-colors"
              title="Refresh goals"
            >
              <span className="material-symbols-outlined text-[18px]">
                refresh
              </span>
            </button>
            <Link
              href="/goals/new"
              className="px-4 py-2.5 bg-[#2BB59A] hover:bg-[#259e87] text-[#0E2927] rounded-xl text-xs sm:text-sm font-semibold tracking-wide transition-colors flex items-center gap-1.5 shadow-[0_2px_10px_rgba(43,181,154,0.3)]"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              New Vault
            </Link>
          </div>
        </div>

        {/* Goals Grid */}
        <div ref={ref}>
          {isLoading && (
            <div className="py-16 text-center text-[#9DB5AF] text-sm">
              <span className="w-5 h-5 border-2 border-[#2BB59A] border-t-transparent rounded-full animate-spin inline-block mr-2" />
              Loading your savings goals from blockchain...
            </div>
          )}

          {!isLoading && goals.length === 0 && (
            <div className="py-16 text-center rounded-2xl bg-[#143734] border border-[rgba(246,241,231,0.08)] p-8 max-w-md mx-auto">
              <span className="material-symbols-outlined text-[48px] text-[#2BB59A]/60 mb-2">
                savings
              </span>
              <h3 className="sora text-lg font-bold text-[#F6F1E7]">
                No Savings Vaults Yet
              </h3>
              <p className="text-xs sm:text-sm text-[#9DB5AF] mt-1">
                Create a personal goal to lock mUSDC until your target is met or deadline arrives.
              </p>
              <Link
                href="/goals/new"
                className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 bg-[#2BB59A] text-[#0E2927] font-semibold rounded-xl text-xs sm:text-sm"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                Create Your First Goal
              </Link>
            </div>
          )}

          <motion.div
            variants={container}
            initial="hidden"
            animate={inView ? "show" : "hidden"}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
          >
            {goals.map((g) => (
              <motion.div
                key={g.id}
                variants={item}
                whileHover={{ y: -3 }}
                className="bg-[#143734] border border-[rgba(246,241,231,0.08)] hover:border-[rgba(43,181,154,0.3)] rounded-2xl p-5 flex flex-col justify-between transition-colors shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="sora text-base font-semibold text-[#F6F1E7] line-clamp-1">
                      {g.name}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                        g.withdrawn
                          ? "bg-white/10 text-[#9DB5AF]"
                          : "bg-[rgba(43,181,154,0.15)] text-[#2BB59A] border border-[rgba(43,181,154,0.25)]"
                      }`}
                    >
                      {g.withdrawn ? "Withdrawn" : `${g.pct}%`}
                    </span>
                  </div>
                  <div className="text-xs text-[#9DB5AF] mt-1.5">
                    {fmtUSDC(g.saved, "")} / {fmtUSDC(g.target, "")} mUSDC · Maturity: {g.deadline}
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-[#0E2927] overflow-hidden">
                    <div
                      className="h-full bg-[#2BB59A] rounded-full transition-all duration-300"
                      style={{ width: `${g.pct}%` }}
                    />
                  </div>
                </div>

                <Link
                  href={`/goals/${g.id}`}
                  className="mt-5 w-full text-center py-2.5 bg-[#0E2927] hover:bg-[#1a3f3a] border border-[rgba(246,241,231,0.06)] hover:border-[rgba(43,181,154,0.3)] text-[#F6F1E7] rounded-xl text-xs font-semibold tracking-wider uppercase transition-colors"
                >
                  Open Vault
                </Link>
              </motion.div>
            ))}

            {goals.length > 0 && (
              <motion.div
                variants={item}
                className="border-2 border-dashed border-[rgba(246,241,231,0.12)] rounded-2xl p-5 flex flex-col items-center justify-center text-center min-h-[160px] hover:border-[#2BB59A]/40 transition-colors bg-[#143734]/30"
              >
                <span className="material-symbols-outlined text-[#2BB59A] text-[28px]">
                  add_circle
                </span>
                <div className="sora text-sm font-semibold text-[#F6F1E7] mt-2">
                  Create Another Goal
                </div>
                <div className="text-xs text-[#9DB5AF] mt-1">
                  Lock mUSDC until a date or target. 0% fee on maturity.
                </div>
                <Link
                  href="/goals/new"
                  className="mt-3 px-4 py-2 bg-[#2BB59A] hover:bg-[#259e87] text-[#0E2927] rounded-xl text-xs font-semibold transition-colors"
                >
                  New Vault
                </Link>
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
