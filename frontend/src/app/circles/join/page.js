"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { motion } from "framer-motion";

export default function JoinCirclePage() {
  const { isConnected, status } = useAccount();
  const router = useRouter();
  const [circleAddress, setCircleAddress] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Redirect only when truly disconnected
  useEffect(() => {
    if (status === "disconnected") {
      router.replace("/auth");
    }
  }, [status, router]);

  if (status === "disconnected") return null;

  const handleJoinRedirect = (e) => {
    e.preventDefault();
    setErrorMsg("");

    const addr = circleAddress.trim();
    if (!addr.startsWith("0x") || addr.length !== 42) {
      setErrorMsg("Please enter a valid 42-character Ethereum circle contract address (0x...).");
      return;
    }

    router.push(`/circles/${addr}`);
  };

  return (
    <div className="min-h-screen bg-[#0E2927] text-[#F6F1E7]">
      <Sidebar />
      <main className="lg:pl-[240px] px-4 sm:px-6 lg:px-8 py-8 max-w-xl mx-auto">
        <button
          onClick={() => router.back()}
          className="text-xs sm:text-sm text-[#9DB5AF] hover:text-[#F6F1E7] flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Circles
        </button>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mt-4 bg-[#143734] border border-[rgba(246,241,231,0.08)] rounded-2xl p-6 sm:p-8"
        >
          <div className="flex items-center gap-2.5 mb-2">
            <span className="material-symbols-outlined text-[#2BB59A] text-[24px]">
              group_add
            </span>
            <h1 className="sora text-xl sm:text-2xl font-bold text-[#F6F1E7]">
              Join an Ajo Circle
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#9DB5AF] leading-relaxed">
            Enter the verified contract address of the circle you have been invited to.
            Joining stakes 1x contribution which is refunded at the end of all rounds.
          </p>

          {errorMsg && (
            <div className="mt-4 p-3.5 rounded-xl bg-[rgba(235,87,87,0.12)] border border-[rgba(235,87,87,0.3)] text-[#EB5757] text-xs sm:text-sm flex items-start gap-2">
              <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleJoinRedirect} className="mt-6 space-y-4">
            <div>
              <label className="text-[11px] font-semibold tracking-wider uppercase text-[#9DB5AF]">
                Circle Contract Address
              </label>
              <input
                value={circleAddress}
                onChange={(e) => setCircleAddress(e.target.value.trim())}
                placeholder="0x... (e.g. 0x1234...)"
                className="mt-1.5 w-full h-11 px-3.5 rounded-xl bg-[#0E2927] border border-[rgba(246,241,231,0.08)] text-sm font-mono text-[#F6F1E7] placeholder:text-[#9DB5AF]/40 focus:outline-none focus:border-[#2BB59A]"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#2BB59A] hover:bg-[#259e87] text-[#0E2927] rounded-xl text-sm font-semibold tracking-wide transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_16px_rgba(43,181,154,0.25)]"
            >
              <span className="material-symbols-outlined text-[18px]">login</span>
              Open Circle Hub
            </button>
          </form>

          <div className="mt-5 p-3.5 rounded-xl bg-[#0E2927] border border-[rgba(246,241,231,0.06)] text-xs text-[#9DB5AF] leading-relaxed">
            💡 <strong>Note:</strong> Circles on CowrieChain are invite-only. The circle creator must have whitelisted your wallet address before you can call <code className="text-[#2BB59A]">join()</code> on-chain.
          </div>
        </motion.div>
      </main>
    </div>
  );
}
