"use client";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { motion } from "framer-motion";

export default function JoinCirclePage() {
  const { isConnected } = useAccount();
  const router = useRouter();
  const [id, setId] = useState("");

  useEffect(() => {
    if (!isConnected) router.replace("/auth");
  }, [isConnected, router]);

  if (!isConnected) return null;

  return (
    <div className="min-h-screen bg-[#041711] flex flex-col lg:flex-row">
      <Sidebar />
      <main className="flex-1 lg:ml-[240px] w-full min-w-0 p-4 lg:p-8 max-w-[560px]">
        <button
          onClick={() => router.back()}
          className="text-[13px] text-[#bccabf] hover:text-white flex items-center gap-1 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span> Back
        </button>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mt-4 bg-[#10231d] border border-white/[0.06] rounded-2xl p-5 sm:p-6"
        >
          <h1 className="sora text-[20px] font-semibold text-white">Join a circle</h1>
          <p className="text-[13px] text-[#bccabf] mt-1">
            Enter the circle address (0x...) or registered circle ID. You will stake collateral before the circle starts.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-2">
            <input
              value={id}
              onChange={(e) => setId(e.target.value.trim())}
              placeholder="0x... circle address"
              className="flex-1 h-11 px-3 rounded-xl bg-[#01110c] border border-white/[0.08] text-[14px] font-mono placeholder:text-[#bccabf]/50 focus:outline-none focus:border-[#62dd9e]/50"
            />
            <button
              onClick={() => {
                if (id) router.push(`/circles/${id}`);
              }}
              className="h-11 px-6 bg-[#1aa56c] hover:bg-[#62dd9e] text-white hover:text-[#002111] rounded-xl text-[12px] font-semibold tracking-wider uppercase transition-colors cursor-pointer"
            >
              Join
            </button>
          </div>
          <div className="mt-3 text-[11px] text-[#bccabf]/60">
            Requires wallet approval of 1x contribution for join stake. Payout order is randomized transparently on chain upon reaching group capacity.
          </div>
        </motion.div>
      </main>
    </div>
  );
}
