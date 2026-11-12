"use client";

import { useAccount, useReadContract } from "wagmi";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  MOCK_USDC_ABI,
  SAVINGS_VAULT_ABI,
  GROUP_SAVE_FACTORY_ABI,
  ADDRESSES,
  fmtUSDC,
} from "@/lib/contracts";

export default function DashboardPage() {
  const { isConnected, address: userAddress, status } = useAccount();
  const router = useRouter();

  // Redirect only when truly disconnected (not during reconnecting on page refresh)
  useEffect(() => {
    if (status === "disconnected") {
      router.replace("/auth");
    }
  }, [status, router]);

  // Read wallet mUSDC balance
  const { data: usdcBalance } = useReadContract({
    address: ADDRESSES.mockUSDC,
    abi: MOCK_USDC_ABI,
    functionName: "balanceOf",
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress && isConnected,
      refetchInterval: 10000,
    },
  });

  // Read user goals
  const { data: rawGoals, isLoading: isGoalsLoading } = useReadContract({
    address: ADDRESSES.savingsVault,
    abi: SAVINGS_VAULT_ABI,
    functionName: "getGoals",
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress && isConnected,
      refetchInterval: 10000,
    },
  });

  // Read user circles
  const { data: userCircles, isLoading: isCirclesLoading } = useReadContract({
    address: ADDRESSES.groupSaveFactory,
    abi: GROUP_SAVE_FACTORY_ABI,
    functionName: "getUserCircles",
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress && isConnected,
      refetchInterval: 10000,
    },
  });

  if (status === "disconnected") return null;

  const goals = (rawGoals || []).map((g, idx) => ({
    id: idx,
    name: g.name,
    target: g.target || 0n,
    current: g.saved || 0n,
    deadline: Number(g.deadline),
    withdrawn: g.withdrawn,
  }));

  const activeGoals = goals.filter((g) => !g.withdrawn);
  const totalLockedInVaults = activeGoals.reduce((sum, g) => sum + g.current, 0n);
  const circleAddresses = userCircles || [];

  return (
    <div className="min-h-screen bg-[#0E2927] text-[#F6F1E7]">
      <Sidebar />
      <main className="lg:pl-[240px] px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto space-y-6">
        {/* Welcome row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[rgba(246,241,231,0.06)]">
          <div>
            <h1 className="sora text-2xl sm:text-3xl font-bold text-[#F6F1E7]">Dashboard</h1>
            <p className="text-sm text-[#9DB5AF] mt-1">
              Decentralized rotating savings and automated personal vaults on Ethereum Sepolia.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/faucet"
              className="px-3.5 py-2 bg-[rgba(43,181,154,0.12)] hover:bg-[rgba(43,181,154,0.22)] border border-[rgba(43,181,154,0.3)] text-[#2BB59A] rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">water_drop</span> Faucet
            </Link>
            <Link
              href="/goals/new"
              className="px-3.5 py-2 bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">add</span> New Goal
            </Link>
            <Link
              href="/circles/new"
              className="px-3.5 py-2 bg-[#2BB59A] hover:bg-[#259e87] text-[#0E2927] rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 shadow-[0_2px_10px_rgba(43,181,154,0.3)]"
            >
              <span className="material-symbols-outlined text-[16px]">group_add</span> New Circle
            </Link>
          </div>
        </div>

        {/* Balances row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#143734] border border-[rgba(246,241,231,0.08)] rounded-2xl p-5"
          >
            <div className="text-[11px] font-semibold tracking-wider uppercase text-[#9DB5AF]">
              Locked in Personal Vaults
            </div>
            <div className="sora text-2xl sm:text-3xl font-bold mt-1 text-[#F6F1E7]">
              {fmtUSDC(totalLockedInVaults, "")}
              <span className="text-xs sm:text-sm font-normal text-[#2BB59A] ml-1.5">mUSDC</span>
            </div>
            <div className="text-xs text-[#9DB5AF] mt-2 flex items-center gap-1.5 pt-2 border-t border-[rgba(246,241,231,0.06)]">
              <span className="material-symbols-outlined text-[15px] text-[#2BB59A]">account_balance_wallet</span>
              Wallet: <span className="font-semibold text-[#F6F1E7]">{fmtUSDC(usdcBalance ?? 0n, "")} mUSDC</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-[#143734] border border-[rgba(246,241,231,0.08)] rounded-2xl p-5"
          >
            <div className="text-[11px] font-semibold tracking-wider uppercase text-[#9DB5AF]">
              Personal Goals
            </div>
            <div className="sora text-2xl sm:text-3xl font-bold mt-1 text-[#F6F1E7]">
              {activeGoals.length}
              <span className="text-xs sm:text-sm font-normal text-[#2BB59A] ml-1.5">active</span>
            </div>
            <div className="text-xs text-[#9DB5AF] mt-2 pt-2 border-t border-[rgba(246,241,231,0.06)]">
              {goals.length - activeGoals.length} goals matured / withdrawn
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#143734] border border-[rgba(246,241,231,0.08)] rounded-2xl p-5"
          >
            <div className="text-[11px] font-semibold tracking-wider uppercase text-[#9DB5AF]">
              Savings Circles
            </div>
            <div className="sora text-2xl sm:text-3xl font-bold mt-1 text-[#F6F1E7]">
              {circleAddresses.length}
              <span className="text-xs sm:text-sm font-normal text-[#2BB59A] ml-1.5">linked</span>
            </div>
            <div className="text-xs text-[#9DB5AF] mt-2 pt-2 border-t border-[rgba(246,241,231,0.06)]">
              Ajo / ROSCA rotating smart contracts
            </div>
          </motion.div>
        </div>

        {/* Goals & Circles Previews */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#143734] border border-[rgba(246,241,231,0.08)] rounded-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(246,241,231,0.08)]">
              <span className="sora text-[15px] font-semibold text-[#F6F1E7]">Active Goals</span>
              <Link href="/goals" className="text-xs text-[#2BB59A] hover:underline flex items-center gap-1 font-medium">
                View all →
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {isGoalsLoading ? (
                <div className="text-xs text-[#9DB5AF] py-6 text-center">Loading goals from chain...</div>
              ) : activeGoals.length === 0 ? (
                <div className="text-xs sm:text-sm text-[#9DB5AF] py-8 text-center flex flex-col items-center">
                  <span className="material-symbols-outlined text-[32px] text-[#9DB5AF]/50 mb-1">savings</span>
                  No active goals yet. Create your first automated vault!
                </div>
              ) : (
                activeGoals.slice(0, 3).map((goal) => {
                  const targetNum = Number(goal.target) || 1;
                  const currentNum = Number(goal.current);
                  const pct = Math.min(100, Math.round((currentNum / targetNum) * 100));

                  return (
                    <Link
                      key={goal.id}
                      href={`/goals/${goal.id}`}
                      className="block p-3.5 rounded-xl bg-[#0E2927] border border-[rgba(246,241,231,0.06)] hover:border-[rgba(43,181,154,0.3)] transition-colors"
                    >
                      <div className="flex justify-between items-center text-xs sm:text-sm">
                        <span className="font-semibold text-[#F6F1E7]">{goal.name}</span>
                        <span className="text-[#2BB59A] font-semibold">{fmtUSDC(goal.current, "")} mUSDC</span>
                      </div>
                      <div className="mt-2.5 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <div className="h-full bg-[#2BB59A] rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="mt-2 flex justify-between text-[11px] text-[#9DB5AF]">
                        <span>Target: {fmtUSDC(goal.target, "")} mUSDC</span>
                        <span className="font-semibold text-[#2BB59A]">{pct}% reached</span>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>

          <div className="bg-[#143734] border border-[rgba(246,241,231,0.08)] rounded-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(246,241,231,0.08)]">
              <span className="sora text-[15px] font-semibold text-[#F6F1E7]">Your Circles</span>
              <Link href="/circles" className="text-xs text-[#2BB59A] hover:underline flex items-center gap-1 font-medium">
                View all →
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {isCirclesLoading ? (
                <div className="text-xs text-[#9DB5AF] py-6 text-center">Loading circles from chain...</div>
              ) : circleAddresses.length === 0 ? (
                <div className="text-xs sm:text-sm text-[#9DB5AF] py-8 text-center flex flex-col items-center">
                  <span className="material-symbols-outlined text-[32px] text-[#9DB5AF]/50 mb-1">groups</span>
                  No circles linked to this address yet.
                </div>
              ) : (
                circleAddresses.slice(0, 3).map((addr) => (
                  <Link
                    key={addr}
                    href={`/circles/${addr}`}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-[#0E2927] border border-[rgba(246,241,231,0.06)] hover:border-[rgba(43,181,154,0.3)] transition-colors"
                  >
                    <div>
                      <div className="text-xs sm:text-sm font-semibold text-[#F6F1E7]">Savings Circle</div>
                      <div className="font-mono text-[11px] text-[#9DB5AF] mt-0.5">
                        {addr.slice(0, 10)}...{addr.slice(-8)}
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-[#2BB59A] text-[18px]">
                      arrow_forward
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Dashboard Footer with Network & Verified Main CA Links */}
        <footer className="pt-8 pb-4 mt-8 border-t border-[rgba(246,241,231,0.06)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#9DB5AF]">
          <div className="flex items-center gap-2">
            <span>© 2026 CowrieChain</span>
            <span>•</span>
            <span className="text-[#2BB59A] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2BB59A] inline-block animate-pulse" />
              Live on Testnet
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href="https://sepolia.etherscan.io"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#143734] hover:bg-[#1c4b47] border border-[rgba(246,241,231,0.08)] hover:border-[#2BB59A]/40 text-[#F6F1E7] transition-all group"
              title="Ethereum Sepolia Testnet Explorer"
            >
              <span className="w-2 h-2 rounded-full bg-[#E3B04B]" />
              <span className="text-[11px] text-[#9DB5AF]">Network:</span>
              <strong className="text-[11px] text-[#E3B04B] font-semibold group-hover:underline flex items-center gap-0.5">
                Ethereum Sepolia
                <span className="material-symbols-outlined text-[13px]">open_in_new</span>
              </strong>
            </a>

            <a
              href={`https://sepolia.etherscan.io/address/${ADDRESSES.groupSaveFactory}#code`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#143734] hover:bg-[#1c4b47] border border-[rgba(246,241,231,0.08)] hover:border-[#2BB59A]/40 text-[#F6F1E7] transition-all group"
              title="Verify CowrieChain Factory Contract on Sepolia Etherscan"
            >
              <span className="material-symbols-outlined text-[14px] text-[#2BB59A]">verified</span>
              <span className="text-[11px] text-[#9DB5AF]">Main CA:</span>
              <span className="text-[11px] font-mono text-[#2BB59A] font-semibold group-hover:underline flex items-center gap-0.5">
                {ADDRESSES.groupSaveFactory.slice(0, 6)}...{ADDRESSES.groupSaveFactory.slice(-4)}
                <span className="material-symbols-outlined text-[13px]">open_in_new</span>
              </span>
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}
