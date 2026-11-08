"use client";

import { useEffect } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { motion } from "framer-motion";
import Link from "next/link";

export default function RewardsPage() {
  const { isConnected, status } = useAccount();
  const router = useRouter();

  // Redirect only when truly disconnected
  useEffect(() => {
    if (status === "disconnected") {
      router.replace("/auth");
    }
  }, [status, router]);

  if (status === "disconnected") return null;

  return (
    <div className="min-h-screen bg-[#0E2927] text-[#F6F1E7]">
      <Sidebar />
      <main className="lg:pl-[240px] px-4 sm:px-6 lg:px-8 py-8 max-w-4xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[rgba(246,241,231,0.06)]">
          <div className="flex items-center gap-3">
            <h1 className="sora text-2xl sm:text-3xl font-bold text-[#F6F1E7]">
              Community Rewards
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[rgba(227,176,75,0.15)] text-[#E3B04B] border border-[rgba(227,176,75,0.3)] text-xs font-semibold tracking-wider uppercase">
              Coming Soon
            </span>
          </div>

          <Link
            href="/faucet"
            className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-[rgba(43,181,154,0.12)] border border-[rgba(43,181,154,0.25)] text-[#2BB59A] hover:bg-[rgba(43,181,154,0.2)] text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">water_drop</span>
            Claim Faucet Tokens
          </Link>
        </div>

        {/* Feature Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-[#143734] border border-[rgba(246,241,231,0.08)] rounded-2xl p-6 sm:p-8 relative overflow-hidden text-center sm:text-left flex flex-col sm:flex-row items-center gap-6"
        >
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[rgba(227,176,75,0.12)] border border-[rgba(227,176,75,0.25)] flex items-center justify-center text-[#E3B04B] shrink-0">
            <span className="material-symbols-outlined text-[44px]">toll</span>
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[rgba(43,181,154,0.12)] text-[#2BB59A] text-[11px] font-semibold uppercase tracking-wider mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2BB59A]" />
              Phase 2 Roadmap Feature
            </div>
            <h2 className="sora text-xl sm:text-2xl font-bold text-[#F6F1E7]">
              Protocol Yield & Consistency Rewards
            </h2>
            <p className="text-xs sm:text-sm text-[#9DB5AF] mt-2 leading-relaxed">
              CowrieChain smart contracts currently operate on Ethereum Sepolia in pure trust-minimized mode.
              Future versions will introduce on-chain reward distributions for disciplined savers, perfect-turn ajo completions, and treasury-backed staking incentives.
            </p>
          </div>
        </motion.div>

        {/* Roadmap Preview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-[#143734] border border-[rgba(246,241,231,0.08)] rounded-2xl p-5">
            <div className="w-10 h-10 rounded-xl bg-[rgba(43,181,154,0.12)] text-[#2BB59A] flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-[20px]">verified</span>
            </div>
            <h3 className="sora text-base font-semibold text-[#F6F1E7]">
              Consistency Multipliers
            </h3>
            <p className="text-xs text-[#9DB5AF] mt-1.5 leading-relaxed">
              Earn reputational score and bonus yield for funding savings vaults and paying ajo rounds without entering grace periods.
            </p>
          </div>

          <div className="bg-[#143734] border border-[rgba(246,241,231,0.08)] rounded-2xl p-5">
            <div className="w-10 h-10 rounded-xl bg-[rgba(227,176,75,0.12)] text-[#E3B04B] flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-[20px]">account_balance</span>
            </div>
            <h3 className="sora text-base font-semibold text-[#F6F1E7]">
              Treasury Yield Pool
            </h3>
            <p className="text-xs text-[#9DB5AF] mt-1.5 leading-relaxed">
              Protocol fees and early withdrawal penalties collected by the treasury contract will subsidize the communal yield pool.
            </p>
          </div>

          <div className="bg-[#143734] border border-[rgba(246,241,231,0.08)] rounded-2xl p-5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-[20px]">military_tech</span>
            </div>
            <h3 className="sora text-base font-semibold text-[#F6F1E7]">
              Community Badges
            </h3>
            <p className="text-xs text-[#9DB5AF] mt-1.5 leading-relaxed">
              Non-transferable on-chain proof of savings history to qualify for larger, lower-collateral ajo circles across the ecosystem.
            </p>
          </div>
        </div>

        {/* Call to Action Card */}
        <div className="p-6 rounded-2xl bg-[#0E2927] border border-[rgba(246,241,231,0.08)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="sora text-sm font-semibold text-[#F6F1E7]">
              Ready to start saving on Sepolia?
            </h4>
            <p className="text-xs text-[#9DB5AF] mt-0.5">
              Set up your personal goals or join an ajo circle with zero platform fees today.
            </p>
          </div>
          <div className="flex gap-2.5">
            <Link
              href="/goals/new"
              className="px-4 py-2 bg-white/[0.08] hover:bg-white/[0.12] text-[#F6F1E7] text-xs font-semibold rounded-xl transition-colors"
            >
              Create Goal
            </Link>
            <Link
              href="/circles/new"
              className="px-4 py-2 bg-[#2BB59A] hover:bg-[#259e87] text-[#0E2927] text-xs font-semibold rounded-xl transition-colors shadow-sm"
            >
              Start Circle
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
