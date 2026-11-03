"use client";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { motion, AnimatePresence } from "framer-motion";

const MOCK_CIRCLE = {
  name: "Lagos crew",
  pot: 1200,
  contrib: 200,
  members: [
    { addr: "0x71e…88b2", name: "You", paid: true, turn: 1 },
    { addr: "0x4a2…91c0", name: "Amaka", paid: true, turn: 2 },
    { addr: "0x9c1…33de", name: "Kwame M.", paid: false, turn: 3, next: true },
    { addr: "0x22b…a410", name: "Tunde O.", paid: false, turn: 4 },
    { addr: "0x8f3…19aa", name: "Chi", paid: true, turn: 5 },
    { addr: "0x1de…4401", name: "Zain", paid: false, turn: 6 },
  ],
  cycle: 3,
  total: 6,
  collateral: 400,
  claimable: 0,
};

export default function CircleDetailPage() {
  const { isConnected } = useAccount();
  const router = useRouter();
  const { id } = useParams();
  const [amount, setAmount] = useState("");
  const [collAmt, setCollAmt] = useState("");
  useEffect(() => {
    if (!isConnected) router.replace("/auth");
  }, [isConnected, router]);
  if (!isConnected) return null;

  const c = MOCK_CIRCLE;
  const paidCount = c.members.filter((m) => m.paid).length;
  const pct = Math.round((paidCount / c.members.length) * 100);
  const nextRecipient = c.members.find((m) => m.next);

  return (
    <div className="min-h-screen bg-[#041711] flex">
      <Sidebar />
      <main className="flex-1 ml-[240px] max-lg:ml-0">
        <div className="sticky top-0 z-30 h-[56px] bg-[#041711]/80 backdrop-blur-xl border-b border-white/[0.06] flex items-center gap-2 px-4 lg:px-8">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 rounded-xl bg-white/[0.06] flex items-center justify-center hover:bg-white/[0.10] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">
              arrow_back
            </span>
          </button>
          <span className="sora text-[14px] font-semibold">{c.name}</span>
          <span className="text-[11px] text-[#bccabf]">
            · Cycle {c.cycle}/{c.total}
          </span>
          <span className="hidden sm:inline-flex ml-auto px-2.5 py-1 rounded-full bg-[#62dd9e]/15 text-[#62dd9e] text-[10px] font-semibold tracking-widest uppercase">
            ID #{id}
          </span>
        </div>

        <div className="p-4 lg:p-8 max-w-[1280px] space-y-4">
          {/* Bento: pot + next payout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="lg:col-span-7 bg-[#10231d] border border-white/[0.06] rounded-2xl p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] tracking-widest uppercase text-[#bccabf]">
                    Pot this cycle
                  </div>
                  <div className="sora text-[28px] font-bold mt-1">
                    ${c.pot.toLocaleString()}
                    <span className="text-[13px] font-normal text-[#bccabf]">
                      .00 cUSD
                    </span>
                  </div>
                </div>
                <div className="w-20 h-20 relative">
                  <svg className="w-20 h-20 -rotate-90" viewBox="0 0 48 48">
                    <circle
                      cx="24"
                      cy="24"
                      r="18"
                      fill="none"
                      stroke="rgba(255,255,255,.08)"
                      strokeWidth="4"
                    />
                    <motion.circle
                      cx="24"
                      cy="24"
                      r="18"
                      fill="none"
                      stroke="#62dd9e"
                      strokeWidth="4"
                      strokeLinecap="round"
                      pathLength={1}
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: pct / 100 }}
                      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="sora text-[13px] font-bold">{pct}%</span>
                    <span className="text-[9px] tracking-widest uppercase text-[#bccabf]">
                      {paidCount}/{c.members.length}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4 h-2 rounded-full bg-[#01110c] overflow-hidden">
                <motion.div
                  className="h-full bg-[#62dd9e] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
              <div className="mt-2 flex justify-between text-[11px] text-[#bccabf]">
                <span>{paidCount} paid</span>
                <span>{c.members.length - paidCount} pending</span>
              </div>
              <div className="mt-4 flex gap-2">
                <div className="flex-1">
                  <input
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    type="number"
                    placeholder={`${c.contrib} mUSDC`}
                    className="w-full h-11 px-3 rounded-xl bg-[#01110c] border border-white/[0.08] text-[14px] placeholder:text-[#bccabf]/50 focus:outline-none focus:border-[#62dd9e]/50"
                  />
                </div>
                <button
                  onClick={() => {
                    /* TODO: approve + contribute */
                  }}
                  className="px-6 h-11 bg-[#1aa56c] hover:bg-[#62dd9e] text-white hover:text-[#002111] rounded-xl text-[12px] font-semibold transition-colors"
                >
                  Contribute
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08 }}
              className="lg:col-span-5 bg-[#1b2e27] border border-white/[0.06] rounded-2xl p-5 relative overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#e4c279]/10 rounded-full blur-2xl pointer-events-none" />
              <div className="relative text-[11px] tracking-widest uppercase text-[#e4c279]">
                Next payout
              </div>
              <div className="relative sora text-[18px] font-semibold mt-1">
                {nextRecipient?.name}{" "}
                <span className="text-[12px] font-normal text-[#bccabf]">
                  · Turn {nextRecipient?.turn}
                </span>
              </div>
              <div className="relative text-[12px] text-[#bccabf] mt-1">
                Pays automatically when all {c.members.length} have contributed.
                No one can trigger early.
              </div>
              <div className="relative mt-4 p-3 rounded-xl bg-[#01110c] border border-white/[0.04]">
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#bccabf]">Amount</span>
                  <span className="sora text-[15px] font-bold">
                    ${c.pot.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] mt-1">
                  <span className="text-[#bccabf]">Recipient</span>
                  <span className="mono text-[11px]">
                    {nextRecipient?.addr}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] mt-1">
                  <span className="text-[#bccabf]">Status</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#e4c279]/15 text-[#e4c279] text-[10px] font-semibold">
                    Awaiting {c.members.length - paidCount} contributions
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  /* TODO: finalizeRound */
                }}
                className="relative mt-4 w-full py-2.5 bg-[#e4c279] hover:bg-[#f0c98a] text-[#002111] rounded-xl text-[11px] font-semibold tracking-widest uppercase transition-colors"
              >
                Finalize round (when funded)
              </button>
            </motion.div>
          </div>

          {/* Members table */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.14 }}
            className="bg-[#10231d] border border-white/[0.06] rounded-2xl overflow-hidden"
          >
            <div className="px-5 py-4 flex items-center justify-between border-b border-white/[0.06]">
              <span className="sora text-[14px] font-semibold">
                Members & payout order
              </span>
              <span className="text-[11px] text-[#bccabf]">
                {c.members.length} members · Deterministic order (locked at
                creation)
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[520px]">
                <thead>
                  <tr className="text-[10px] tracking-widest uppercase text-[#bccabf] border-b border-white/[0.06]">
                    <th className="px-4 py-2.5 font-medium">#</th>
                    <th className="px-4 py-2.5 font-medium">Member</th>
                    <th className="px-4 py-2.5 font-medium">This cycle</th>
                    <th className="px-4 py-2.5 font-medium">Collateral</th>
                    <th className="px-4 py-2.5 font-medium">Claimable</th>
                  </tr>
                </thead>
                <tbody>
                  {c.members.map((m, i) => (
                    <tr
                      key={m.addr}
                      className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors"
                    >
                      <td className="px-4 py-3 text-[12px] text-[#bccabf]">
                        {i + 1}
                        {m.next ? " ↗" : ""}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[13px] font-medium">
                          {m.name}
                        </span>{" "}
                        <span className="mono text-[11px] text-[#bccabf] ml-1">
                          {m.addr}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {m.paid ? (
                          <span className="px-2 py-1 rounded-full bg-[#62dd9e]/15 text-[#62dd9e] text-[11px] font-medium">
                            Paid
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full bg-white/[0.06] text-[#bccabf] text-[11px]">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[12px] tabular-nums">
                        {i === 0 ? `$${c.collateral}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-[12px] tabular-nums">
                        {m.next && paidCount === c.members.length
                          ? `$${c.pot.toLocaleString()}`
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Collateral + claim */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-[#10231d] border border-white/[0.06] rounded-2xl p-5">
              <div className="text-[11px] font-semibold tracking-widest uppercase text-[#bccabf]">
                Collateral (Option A)
              </div>
              <p className="text-[12px] text-[#bccabf] mt-1 leading-5">
                Early recipients lock remaining contributions before payout.
                Released only after all future rounds complete.
              </p>
              <div className="mt-3 flex gap-2">
                <input
                  value={collAmt}
                  onChange={(e) => setCollAmt(e.target.value)}
                  type="number"
                  placeholder="mUSDC"
                  className="flex-1 h-11 px-3 rounded-xl bg-[#01110c] border border-white/[0.08] text-[14px] placeholder:text-[#bccabf]/50 focus:outline-none focus:border-[#62dd9e]/50"
                />
                <button
                  onClick={() => {
                    /* TODO: depositCollateral */
                  }}
                  className="px-5 h-11 bg-[#1aa56c] hover:bg-[#62dd9e] text-white hover:text-[#002111] rounded-xl text-[12px] font-semibold transition-colors"
                >
                  Lock
                </button>
              </div>
              <button
                onClick={() => {
                  /* TODO: releaseCollateral */
                }}
                className="mt-2 w-full h-11 bg-[#1b2e27] hover:bg-[#263932] rounded-xl text-[12px] font-semibold transition-colors"
              >
                Release collateral (after completion)
              </button>
            </div>
            <div className="bg-[#10231d] border border-white/[0.06] rounded-2xl p-5">
              <div className="text-[11px] font-semibold tracking-widest uppercase text-[#bccabf]">
                Round actions
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    /* TODO: claim */
                  }}
                  className="h-11 bg-[#e4c279] hover:bg-[#f0c98a] text-[#002111] rounded-xl text-[12px] font-semibold transition-colors"
                >
                  Claim payout
                </button>
                <button
                  onClick={() => {
                    /* TODO: auto-save trigger */
                  }}
                  className="h-11 bg-[#1b2e27] hover:bg-[#263932] border border-white/[0.06] rounded-xl text-[12px] font-semibold transition-colors"
                >
                  Trigger auto-save
                </button>
              </div>
              <div className="mt-2 text-[11px] text-[#bccabf]/60">
                Claim is pull-pattern — one failure doesn't freeze others.
                Auto-save is simulated via trigger button in MVP.
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => {
                    /* TODO: togglePause */
                  }}
                  className="flex-1 h-10 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-xl text-[11px] font-semibold transition-colors"
                >
                  Pause / Unpause
                </button>
                <span className="flex-1 h-10 flex items-center justify-center text-[11px] text-[#bccabf]">
                  Creator only
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
