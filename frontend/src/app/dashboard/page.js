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
  CONTRACT_ADDRESSES,
  fmtUSDC,
} from "@/lib/contracts";

export default function DashboardPage() {
  const { isConnected, address: userAddress } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (!isConnected) router.replace("/auth");
  }, [isConnected, router]);

  // Read wallet USDC balance
  const { data: usdcBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.mockUsdc,
    abi: MOCK_USDC_ABI,
    functionName: "balanceOf",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: !!userAddress && isConnected },
  });

  // Read user goals
  const { data: rawGoals, isLoading: isGoalsLoading } = useReadContract({
    address: CONTRACT_ADDRESSES.savingsVault,
    abi: SAVINGS_VAULT_ABI,
    functionName: "getGoals",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: !!userAddress && isConnected },
  });

  // Read user circles
  const { data: userCircles, isLoading: isCirclesLoading } = useReadContract({
    address: CONTRACT_ADDRESSES.groupSaveFactory,
    abi: GROUP_SAVE_FACTORY_ABI,
    functionName: "getUserCircles",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: !!userAddress && isConnected },
  });

  if (!isConnected) return null;

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
    <div className="min-h-screen bg-[#041711] flex flex-col lg:flex-row">
      <Sidebar />
      <main className="flex-1 lg:ml-[240px] w-full min-w-0 p-4 lg:p-8 space-y-6">
        {/* Welcome row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="sora text-[22px] font-bold text-white">Dashboard</h1>
            <p className="text-[13px] text-[#bccabf] mt-0.5">
              Decentralized rotating savings and automated personal vaults on Sepolia.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/goals/new"
              className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-white rounded-xl text-[12px] font-semibold transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">add</span> New Goal
            </Link>
            <Link
              href="/circles/new"
              className="px-4 py-2 bg-[#1aa56c] hover:bg-[#62dd9e] text-white hover:text-[#002111] rounded-xl text-[12px] font-semibold transition-colors flex items-center gap-1.5"
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
            className="bg-[#10231d] border border-white/[0.06] rounded-2xl p-5"
          >
            <div className="text-[11px] tracking-widest uppercase text-[#bccabf]">
              Locked in Vaults
            </div>
            <div className="sora text-[26px] font-bold mt-1 text-white">
              ${fmtUSDC(totalLockedInVaults)}
              <span className="text-[13px] font-normal text-[#bccabf] ml-1">mUSDC</span>
            </div>
            <div className="text-[11px] text-[#62dd9e] mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">account_balance_wallet</span>
              Wallet: ${fmtUSDC(usdcBalance ?? 0n)} mUSDC
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-[#10231d] border border-white/[0.06] rounded-2xl p-5"
          >
            <div className="text-[11px] tracking-widest uppercase text-[#bccabf]">
              Personal Goals
            </div>
            <div className="sora text-[26px] font-bold mt-1 text-white">
              {activeGoals.length}
              <span className="text-[13px] font-normal text-[#bccabf] ml-1">active</span>
            </div>
            <div className="text-[11px] text-[#bccabf] mt-1">
              {goals.length - activeGoals.length} goals matured / withdrawn
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#10231d] border border-white/[0.06] rounded-2xl p-5"
          >
            <div className="text-[11px] tracking-widest uppercase text-[#bccabf]">
              Savings Circles
            </div>
            <div className="sora text-[26px] font-bold mt-1 text-white">
              {circleAddresses.length}
              <span className="text-[13px] font-normal text-[#bccabf] ml-1">linked</span>
            </div>
            <div className="text-[11px] text-[#bccabf] mt-1">
              Ajo / ROSCA rotating smart contracts
            </div>
          </motion.div>
        </div>

        {/* Goals & Circles Previews */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-[#10231d] border border-white/[0.06] rounded-2xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <span className="sora text-[15px] font-semibold text-white">Active Goals</span>
              <Link href="/goals" className="text-[12px] text-[#62dd9e] hover:underline flex items-center gap-1">
                View all →
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {isGoalsLoading ? (
                <div className="text-[13px] text-[#bccabf] py-4 text-center">Loading goals...</div>
              ) : activeGoals.length === 0 ? (
                <div className="text-[13px] text-[#bccabf] py-6 text-center">
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
                      className="block p-3 rounded-xl bg-[#01110c] border border-white/[0.04] hover:border-white/[0.12] transition-colors"
                    >
                      <div className="flex justify-between items-center text-[13px]">
                        <span className="font-semibold text-white">{goal.name}</span>
                        <span className="text-[#62dd9e] font-semibold">${fmtUSDC(goal.current)} mUSDC</span>
                      </div>
                      <div className="mt-2 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <div className="h-full bg-[#62dd9e] rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="mt-1.5 flex justify-between text-[11px] text-[#bccabf]">
                        <span>Target: ${fmtUSDC(goal.target)}</span>
                        <span>{pct}% reached</span>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>

          <div className="bg-[#10231d] border border-white/[0.06] rounded-2xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <span className="sora text-[15px] font-semibold text-white">Your Circles</span>
              <Link href="/circles" className="text-[12px] text-[#62dd9e] hover:underline flex items-center gap-1">
                View all →
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {isCirclesLoading ? (
                <div className="text-[13px] text-[#bccabf] py-4 text-center">Loading circles...</div>
              ) : circleAddresses.length === 0 ? (
                <div className="text-[13px] text-[#bccabf] py-6 text-center">
                  No circles linked to this address yet.
                </div>
              ) : (
                circleAddresses.slice(0, 3).map((addr) => (
                  <Link
                    key={addr}
                    href={`/circles/${addr}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#01110c] border border-white/[0.04] hover:border-white/[0.12] transition-colors"
                  >
                    <div>
                      <div className="text-[13px] font-semibold text-white">Savings Circle</div>
                      <div className="mono text-[11px] text-[#bccabf]">{addr.slice(0, 10)}...{addr.slice(-8)}</div>
                    </div>
                    <span className="material-symbols-outlined text-[#62dd9e] text-[18px]">
                      arrow_forward
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
