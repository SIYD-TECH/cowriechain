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
  "bg-[#62dd9e]/15 text-[#62dd9e] border-[#62dd9e]/30",
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
    query: { enabled: !!address },
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
      className="bg-[#10231d] border border-white/[0.06] hover:border-white/[0.12] rounded-2xl p-5 flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="sora text-[15px] font-semibold text-white truncate">
            {isLoading ? "Loading..." : name}
          </span>
          <span
            className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold tracking-wider uppercase shrink-0 ${
              STATUS_COLORS[status] || ""
            }`}
          >
            {STATUS_NAMES[status] || "Unknown"}
          </span>
        </div>

        <div className="text-[11px] text-[#bccabf] mt-1 font-mono">
          {address.slice(0, 6)}...{address.slice(-4)}
        </div>

        <div className="mt-4 pt-3 border-t border-white/[0.06] space-y-1.5 text-[12px]">
          <div className="flex justify-between">
            <span className="text-[#bccabf]">Contribution:</span>
            <span className="font-semibold text-white">${fmtUSDC(contribution)} mUSDC</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#bccabf]">Members:</span>
            <span className="font-semibold text-white">
              {joined} / {memberCount} joined
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#bccabf]">Cycle:</span>
            <span className="font-semibold text-[#62dd9e]">
              {status === 0 ? "Awaiting start" : `Round ${currentRound + 1} of ${memberCount}`}
            </span>
          </div>
        </div>
      </div>

      <Link
        href={`/circles/${address}`}
        className="mt-5 w-full text-center py-2.5 bg-[#1b2e27] hover:bg-[#263932] rounded-xl text-[11px] font-semibold tracking-widest uppercase transition-colors"
      >
        View circle
      </Link>
    </motion.div>
  );
}

export default function CirclesPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [ref, inView] = useReveal(0.12);
  const [tab, setTab] = useState("my"); // "my" or "explore"

  useEffect(() => {
    if (!isConnected) router.replace("/auth");
  }, [isConnected, router]);

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
      enabled: Boolean(
        address &&
          ADDRESSES.groupSaveFactory &&
          ADDRESSES.groupSaveFactory !== "0x0000000000000000000000000000000000000000"
      ),
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
      enabled: Boolean(
        ADDRESSES.groupSaveFactory &&
          ADDRESSES.groupSaveFactory !== "0x0000000000000000000000000000000000000000"
      ),
    },
  });

  const handleRefresh = () => {
    refetchUser();
    refetchAll();
  };

  if (!isConnected) return null;

  const currentCircles = tab === "my" ? userCircles || [] : allCircles || [];
  const isLoading = tab === "my" ? isUserLoading : isAllLoading;

  return (
    <div className="min-h-screen bg-[#041711] flex flex-col lg:flex-row">
      <Sidebar />
      <main className="flex-1 lg:ml-[240px] w-full min-w-0">
        <div className="sticky top-[56px] lg:top-0 z-30 min-h-[56px] py-2 sm:py-0 bg-[#041711]/90 backdrop-blur-xl border-b border-white/[0.06] flex flex-wrap items-center justify-between gap-2 px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="sora text-[15px] font-semibold">Circles</span>
            <div className="flex rounded-lg bg-[#10231d] p-0.5 border border-white/[0.06]">
              <button
                onClick={() => setTab("my")}
                className={`px-3 py-1 rounded-md text-[11px] font-semibold tracking-wider transition-colors ${
                  tab === "my"
                    ? "bg-[#1aa56c] text-white"
                    : "text-[#bccabf] hover:text-white"
                }`}
              >
                My Circles ({userCircles?.length || 0})
              </button>
              <button
                onClick={() => setTab("explore")}
                className={`px-3 py-1 rounded-md text-[11px] font-semibold tracking-wider transition-colors ${
                  tab === "explore"
                    ? "bg-[#1aa56c] text-white"
                    : "text-[#bccabf] hover:text-white"
                }`}
              >
                Explore All ({allCircles?.length || 0})
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="text-[#bccabf] hover:text-white text-[12px] p-2"
              title="Refresh circles"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
            </button>
            <Link
              href="/circles/join"
              className="hidden sm:inline-flex px-4 py-2 bg-[#10231d] border border-white/[0.08] hover:bg-[#1b2e27] rounded-xl text-[11px] font-semibold tracking-widest uppercase transition-colors"
            >
              Join circle
            </Link>
            <Link
              href="/circles/new"
              className="px-4 py-2 bg-[#1aa56c] hover:bg-[#62dd9e] text-white hover:text-[#002111] rounded-xl text-[11px] font-semibold tracking-widest uppercase transition-colors"
            >
              New circle
            </Link>
          </div>
        </div>

        <div ref={ref} className="p-4 lg:p-8 max-w-[1280px]">
          {isLoading && (
            <div className="py-12 text-center text-[#bccabf] text-[13px]">
              Querying circles from GroupSaveFactory on Sepolia...
            </div>
          )}

          {!isLoading && currentCircles.length === 0 && (
            <div className="py-12 text-center">
              <span className="material-symbols-outlined text-[36px] text-[#bccabf]/40">
                group_off
              </span>
              <p className="sora text-[15px] font-semibold text-white mt-2">
                {tab === "my"
                  ? "No circles joined yet"
                  : "No public circles registered yet"}
              </p>
              <p className="text-[12px] text-[#bccabf] mt-1 max-w-[360px] mx-auto">
                {tab === "my"
                  ? "Create a new rotating savings circle or join an existing pool with its contract address."
                  : "Create the first circle on Sepolia and invite your peers."}
              </p>
              <div className="mt-4 flex justify-center gap-2">
                <Link
                  href="/circles/new"
                  className="px-4 py-2 bg-[#1aa56c] hover:bg-[#62dd9e] text-white hover:text-[#002111] rounded-xl text-[11px] font-semibold"
                >
                  Create Circle
                </Link>
                <Link
                  href="/circles/join"
                  className="px-4 py-2 bg-[#10231d] border border-white/[0.1] text-white rounded-xl text-[11px] font-semibold"
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
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
          >
            {currentCircles.map((circleAddr) => (
              <CircleCard key={circleAddr} address={circleAddr} />
            ))}

            <motion.div
              variants={item}
              className="border-2 border-dashed border-white/[0.08] rounded-2xl p-5 flex flex-col items-center justify-center text-center min-h-[180px] hover:border-[#62dd9e]/30 transition-colors"
            >
              <span className="material-symbols-outlined text-[#bccabf] text-[24px]">
                group_add
              </span>
              <div className="sora text-[13px] font-semibold mt-2">
                Start or join a pool
              </div>
              <div className="text-[11px] text-[#bccabf] mt-1">
                Decentralized Ajo / Esusu rotational savings on Ethereum.
              </div>
              <div className="mt-3 flex gap-2">
                <Link
                  href="/circles/new"
                  className="px-3.5 py-1.5 bg-[#1aa56c] text-white rounded-xl text-[11px] font-semibold"
                >
                  Create
                </Link>
                <Link
                  href="/circles/join"
                  className="px-3.5 py-1.5 bg-[#10231d] border border-white/[0.1] text-white rounded-xl text-[11px] font-semibold"
                >
                  Join
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
