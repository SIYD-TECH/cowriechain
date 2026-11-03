"use client";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { motion } from "framer-motion";

export default function NewCirclePage() {
  const { isConnected } = useAccount();
  const router = useRouter();
  const [f, setF] = useState({
    name: "",
    contrib: "",
    members: "",
    cycles: "",
    cadence: "monthly",
  });
  useEffect(() => {
    if (!isConnected) router.replace("/auth");
  }, [isConnected, router]);
  if (!isConnected) return null;

  const onSubmit = (e) => {
    e.preventDefault();
    router.push("/circles"); /* TODO: createCircle tx */
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
          <h1 className="sora text-[20px] font-semibold">New circle</h1>
          <p className="text-[13px] text-[#bccabf] mt-1">
            Set contribution, size, and cadence. Payout order is locked on
            creation.
          </p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-[11px] font-semibold tracking-widest uppercase text-[#bccabf]">
                Circle name
              </label>
              <input
                value={f.name}
                onChange={(e) => setF({ ...f, name: e.target.value })}
                placeholder="e.g. Lagos crew"
                className="mt-1.5 w-full h-11 px-3 rounded-xl bg-[#01110c] border border-white/[0.08] text-[14px] placeholder:text-[#bccabf]/50 focus:outline-none focus:border-[#62dd9e]/50"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold tracking-widest uppercase text-[#bccabf]">
                  Contribution (mUSDC)
                </label>
                <input
                  value={f.contrib}
                  onChange={(e) => setF({ ...f, contrib: e.target.value })}
                  type="number"
                  placeholder="200"
                  className="mt-1.5 w-full h-11 px-3 rounded-xl bg-[#01110c] border border-white/[0.08] text-[14px] focus:outline-none focus:border-[#62dd9e]/50"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold tracking-widest uppercase text-[#bccabf]">
                  Members
                </label>
                <input
                  value={f.members}
                  onChange={(e) => setF({ ...f, members: e.target.value })}
                  type="number"
                  placeholder="6"
                  className="mt-1.5 w-full h-11 px-3 rounded-xl bg-[#01110c] border border-white/[0.08] text-[14px] focus:outline-none focus:border-[#62dd9e]/50"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold tracking-widest uppercase text-[#bccabf]">
                  Cycles
                </label>
                <input
                  value={f.cycles}
                  onChange={(e) => setF({ ...f, cycles: e.target.value })}
                  type="number"
                  placeholder="6"
                  className="mt-1.5 w-full h-11 px-3 rounded-xl bg-[#01110c] border border-white/[0.08] text-[14px] focus:outline-none focus:border-[#62dd9e]/50"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold tracking-widest uppercase text-[#bccabf]">
                  Cadence
                </label>
                <select
                  value={f.cadence}
                  onChange={(e) => setF({ ...f, cadence: e.target.value })}
                  className="mt-1.5 w-full h-11 px-3 rounded-xl bg-[#01110c] border border-white/[0.08] text-[14px] focus:outline-none focus:border-[#62dd9e]/50"
                >
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#01110c] border border-white/[0.04] text-[11px] text-[#bccabf]">
              Pot per cycle:{" "}
              <span className="text-white font-semibold">
                $
                {f.contrib && f.members
                  ? (Number(f.contrib) * Number(f.members)).toLocaleString()
                  : "—"}
              </span>{" "}
              · Collateral required for early recipients: 100% of remaining
              contributions.
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-[#1aa56c] hover:bg-[#62dd9e] text-white hover:text-[#002111] rounded-xl text-[13px] font-semibold transition-colors"
            >
              Create circle
            </button>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
