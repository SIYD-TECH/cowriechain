"use client";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { motion } from "framer-motion";

export default function NewGoalPage() {
  const { isConnected } = useAccount();
  const router = useRouter();
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [date, setDate] = useState("");
  useEffect(() => {
    if (!isConnected) router.replace("/auth");
  }, [isConnected, router]);
  if (!isConnected) return null;

  const onSubmit = (e) => {
    e.preventDefault();
    // TODO: wire to lib/contracts.js — create vault tx, then router.push('/goals')
    router.push("/goals");
  };

  return (
    <div className="min-h-screen bg-[#041711] flex">
      <Sidebar />
      <main className="flex-1 ml-[240px] max-lg:ml-0 p-4 lg:p-8 max-w-[640px]">
        <button
          onClick={() => router.back()}
          className="text-[13px] text-[#bccabf] hover:text-white flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[18px]">
            arrow_back
          </span>{" "}
          Back
        </button>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mt-4 bg-[#10231d] border border-white/[0.06] rounded-2xl p-6"
        >
          <h1 className="sora text-[20px] font-semibold">New vault</h1>
          <p className="text-[13px] text-[#bccabf] mt-1">
            Lock mUSDC until a date or until the target is hit. Early exit costs
            5%.
          </p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-[11px] font-semibold tracking-widest uppercase text-[#bccabf]">
                Vault name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Lagos workspace"
                className="mt-1.5 w-full h-11 px-3 rounded-xl bg-[#01110c] border border-white/[0.08] text-[14px] placeholder:text-[#bccabf]/50 focus:outline-none focus:border-[#62dd9e]/50"
                required
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold tracking-widest uppercase text-[#bccabf]">
                Target (mUSDC)
              </label>
              <input
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                type="number"
                placeholder="e.g. 12000"
                className="mt-1.5 w-full h-11 px-3 rounded-xl bg-[#01110c] border border-white/[0.08] text-[14px] placeholder:text-[#bccabf]/50 focus:outline-none focus:border-[#62dd9e]/50"
                required
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold tracking-widest uppercase text-[#bccabf]">
                Maturity date
              </label>
              <input
                value={date}
                onChange={(e) => setDate(e.target.value)}
                type="date"
                className="mt-1.5 w-full h-11 px-3 rounded-xl bg-[#01110c] border border-white/[0.08] text-[14px] focus:outline-none focus:border-[#62dd9e]/50"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-[#1aa56c] hover:bg-[#62dd9e] text-white hover:text-[#002111] rounded-xl text-[13px] font-semibold tracking-wide transition-colors"
            >
              Create vault
            </button>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
