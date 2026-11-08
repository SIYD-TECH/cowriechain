"use client";

import { useEffect, useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import { useReveal } from "@/hooks/useReveal";
import {
  ADDRESSES,
  GROUP_SAVE_FACTORY_ABI,
  GROUP_SAVE_ABI,
  fmtUSDC,
} from "@/lib/contracts";

const STATUS_NAMES = ["Open", "Active", "Completed", "Cancelled"];
const STATUS_COLORS = [
  "bg-blue-500/15 text-blue-400 border-blue-500/30",
  "bg-[#2BB59A]/15 text-[#2BB59A] border-[#2BB59A]/30",
  "bg-purple-500/15 text-purple-400 border-purple-500/30",
  "bg-red-500/15 text-red-400 border-red-500/30",
];

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

function CircleCard({ address }) {
  const { data: info, isLoading } = useReadContract({
    address,
    abi: GROUP_SAVE_ABI,
    functionName: "getInfo",
    query: {
      enabled: !!address,
      refetchInterval: 10000,
    },
  });

  const name = info?.name || "Savings Circle";
  const status = info?.status !== undefined ? Number(info.status) : 0;
  const contribution = info?.contribution ?? 0n;
  const memberCount = info?.memberCount ? Number(info.memberCount) : 0;
  const joined = info?.joined ? Number(info.joined) : 0;
  const currentRound = info?.currentRound !== undefined ? Number(info.currentRound) : 0;

  return (
    <motion.div
      variants={item}
      whileHover={{ y: -3 }}
      className="bg-[#143734] border border-[rgba(246,241,231,0.08)] hover:border-[rgba(43,181,154,0.3)] rounded-2xl p-5 flex flex-col justify-between transition-colors shadow-sm"
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="sora text-[15px] font-semibold text-[#F6F1E7] truncate">
            {isLoading ? "Loading..." : name}
          </span>
          <span
            className={`px-2 py-0.5 rounded-full border text-[10px] font-bold tracking-wider uppercase shrink-0 ${
              STATUS_COLORS[status] || ""
            }`}
          >
            {STATUS_NAMES[status] || "Unknown"}
          </span>
        </div>

        <div className="text-[11px] text-[#9DB5AF] mt-1 font-mono">
          {address.slice(0, 8)}...{address.slice(-6)}
        </div>

        <div className="mt-4 pt-3 border-t border-[rgba(246,241,231,0.06)] space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-[#9DB5AF]">Contribution:</span>
            <span className="font-semibold text-[#F6F1E7]">
              {fmtUSDC(contribution, "")} mUSDC
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#9DB5AF]">Members:</span>
            <span className="font-semibold text-[#F6F1E7]">
              {joined} / {memberCount} joined
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#9DB5AF]">Round:</span>
            <span className="font-semibold text-[#2BB59A]">
              {status === 0
                ? "Awaiting start"
                : `Round ${currentRound + 1} of ${memberCount}`}
            </span>
          </div>
        </div>
      </div>

      <Link
        href={`/circles/${address}`}
        className="mt-5 w-full text-center py-2.5 bg-[#0E2927] hover:bg-[#1a3f3a] border border-[rgba(246,241,231,0.06)] hover:border-[rgba(43,181,154,0.3)] text-[#F6F1E7] rounded-xl text-xs font-semibold tracking-wider uppercase transition-colors"
      >
        View Circle
      </Link>
    </motion.div>
  );
}

export default function CirclesPage() {
  const { address, isConnected, status } = useAccount();
  const router = useRouter();
  const [ref, inView] = useReveal(0.12);
  const [tab, setTab] = useState("my"); // "my" or "explore"

  // Redirect only when truly disconnected
  useEffect(() => {
    if (status === "disconnected") {
      router.replace("/auth");
    }
  }, [status, router]);

  // Read user's joined/created circles from factory
  const {
    data: userCircles,
    isLoading: isUserLoading,
    refetch: refetchUser,
  } = useReadContract({
    address: ADDRESSES.groupSaveFactory,
    abi: GROUP_SAVE_FACTORY_ABI,
    functionName: "getUserCircles",
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address && ADDRESSES.groupSaveFactory),
      refetchInterval: 10000,
    },
  });

  // Read all public circles from factory (up to 20)
  const {
    data: allCircles,
    isLoading: isAllLoading,
    refetch: refetchAll,
  } = useReadContract({
    address: ADDRESSES.groupSaveFactory,
    abi: GROUP_SAVE_FACTORY_ABI,
    functionName: "getCircles",
    args: [0n, 20n],
    query: {
      enabled: Boolean(ADDRESSES.groupSaveFactory),
      refetchInterval: 10000,
    },
  });

  const handleRefresh = () => {
    refetchUser();
    refetchAll();
  };

  if (status === "disconnected") return null;

  const currentCircles = tab === "my" ? userCircles || [] : allCircles || [];
  const isLoading = tab === "my" ? isUserLoading : isAllLoading;

  return (
    <div className="min-h-screen bg-[#0E2927] text-[#F6F1E7]">
      <Sidebar />
      <main className="lg:pl-[240px] px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[rgba(246,241,231,0.06)]">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="sora text-2xl sm:text-3xl font-bold text-[#F6F1E7]">
              Ajo Circles
            </h1>
            <div className="flex rounded-xl bg-[#143734] p-1 border border-[rgba(246,241,231,0.08)]">
              <button
                onClick={() => setTab("my")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold tracking-wider transition-colors ${
                  tab === "my"
                    ? "bg-[#2BB59A] text-[#0E2927]"
                    : "text-[#9DB5AF] hover:text-[#F6F1E7]"
                }`}
              >
                My Circles ({userCircles?.length || 0})
              </button>
              <button
                onClick={() => setTab("explore")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold tracking-wider transition-colors ${
                  tab === "explore"
                    ? "bg-[#2BB59A] text-[#0E2927]"
                    : "text-[#9DB5AF] hover:text-[#F6F1E7]"
                }`}
              >
                Explore All ({allCircles?.length || 0})
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleRefresh}
              className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-[#9DB5AF] hover:text-white transition-colors"
              title="Refresh circles"
            >
              <span className="material-symbols-outlined text-[18px]">
                refresh
              </span>
            </button>
            <Link
              href="/circles/join"
              className="px-3.5 py-2 bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5"
            >
              Join by Address
            </Link>
            <Link
              href="/circles/new"
              className="px-4 py-2 bg-[#2BB59A] hover:bg-[#259e87] text-[#0E2927] rounded-xl text-xs sm:text-sm font-semibold tracking-wide transition-colors flex items-center gap-1.5 shadow-[0_2px_10px_rgba(43,181,154,0.3)]"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              New Circle
            </Link>
          </div>
        </div>

        <div ref={ref}>
          {isLoading && (
            <div className="py-16 text-center text-[#9DB5AF] text-sm">
              <span className="w-5 h-5 border-2 border-[#2BB59A] border-t-transparent rounded-full animate-spin inline-block mr-2" />
              Querying circles from GroupSaveFactory on Sepolia...
            </div>
          )}

          {!isLoading && currentCircles.length === 0 && (
            <div className="py-16 text-center rounded-2xl bg-[#143734] border border-[rgba(246,241,231,0.08)] p-8 max-w-md mx-auto">
              <span className="material-symbols-outlined text-[48px] text-[#2BB59A]/60 mb-2">
                groups
              </span>
              <h3 className="sora text-lg font-bold text-[#F6F1E7]">
                {tab === "my"
                  ? "No Circles Linked Yet"
                  : "No Circles Registered Yet"}
              </h3>
              <p className="text-xs sm:text-sm text-[#9DB5AF] mt-1">
                {tab === "my"
                  ? "Create a new rotating savings circle or join an existing pool with its contract address once invited."
                  : "Deploy the first ajo circle on Sepolia and invite your peers to save together."}
              </p>
              <div className="mt-5 flex justify-center gap-3">
                <Link
                  href="/circles/new"
                  className="px-4 py-2 bg-[#2BB59A] text-[#0E2927] font-semibold rounded-xl text-xs sm:text-sm"
                >
                  Create Circle
                </Link>
                <Link
                  href="/circles/join"
                  className="px-4 py-2 bg-white/[0.08] hover:bg-white/[0.12] text-white font-semibold rounded-xl text-xs sm:text-sm"
                >
                  Join by Address
                </Link>
              </div>
            </div>
          )}

          <motion.div
            variants={container}
            initial="hidden"
            animate={inView ? "show" : "hidden"}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
          >
            {currentCircles.map((circleAddr) => (
              <CircleCard key={circleAddr} address={circleAddr} />
            ))}

            {currentCircles.length > 0 && (
              <motion.div
                variants={item}
                className="border-2 border-dashed border-[rgba(246,241,231,0.12)] rounded-2xl p-5 flex flex-col items-center justify-center text-center min-h-[180px] hover:border-[#2BB59A]/40 transition-colors bg-[#143734]/30"
              >
                <span className="material-symbols-outlined text-[#2BB59A] text-[28px]">
                  group_add
                </span>
                <div className="sora text-sm font-semibold text-[#F6F1E7] mt-2">
                  Start or Join Another Circle
                </div>
                <div className="text-xs text-[#9DB5AF] mt-1">
                  Decentralized Ajo / Esusu rotational savings on Ethereum Sepolia.
                </div>
                <div className="mt-4 flex gap-2">
                  <Link
                    href="/circles/new"
                    className="px-3.5 py-1.5 bg-[#2BB59A] hover:bg-[#259e87] text-[#0E2927] rounded-xl text-xs font-semibold transition-colors"
                  >
                    Create
                  </Link>
                  <Link
                    href="/circles/join"
                    className="px-3.5 py-1.5 bg-white/[0.08] hover:bg-white/[0.12] text-white rounded-xl text-xs font-semibold transition-colors"
                  >
                    Join
                  </Link>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
