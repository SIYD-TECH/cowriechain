"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FAQS = [
  {
    q: "Which wallets work?",
    a: "Any EVM wallet — MetaMask, Coinbase Wallet, Rabby, Rainbow, or WalletConnect hardware wallets. We never ask for seed phrases.",
  },
  {
    q: "What are the fees?",
    a: "0.25% protocol fee on completion only. Plus standard network gas (ETH/MATIC). No hidden charges.",
  },
  {
    q: "When can I withdraw?",
    a: "Once your vault hits its target or maturity date, it unlocks for a full, fee-free withdrawal.",
  },
  {
    q: "What if I withdraw early?",
    a: "A small early-exit fee (typically 5%) applies — it flows back into the community reward pool.",
  },
  {
    q: "How do circles enforce contributions?",
    a: "Members stake collateral before the cycle starts. Miss a round and collateral is slashed to keep the pot whole.",
  },
  {
    q: "How are rewards funded?",
    a: "A fixed, pre-funded pool plus recycled penalty fees. Hit your milestones on time to earn quarterly allocations.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState(null);
  return (
    <section className="px-4 lg:px-8 py-14 bg-[#0c1f19]">
      <div className="max-w-[880px] mx-auto">
        <div className="text-center">
          <div className="text-[11px] font-semibold tracking-[0.14em] uppercase text-[#e4c279]">
            Clarifications
          </div>
          <h2 className="sora text-[28px] font-semibold tracking-tight mt-2">
            FAQ
          </h2>
        </div>
        <div className="mt-8 space-y-2">
          {FAQS.map((f, i) => (
            <div
              key={i}
              className="rounded-2xl bg-[#10231d] border border-white/[0.06] overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-white/[0.03] transition-colors"
              >
                <span className="sora text-[14px] font-semibold pr-4">
                  {f.q}
                </span>
                <motion.span
                  animate={{ rotate: open === i ? 180 : 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="material-symbols-outlined text-[20px] text-[#bccabf] shrink-0"
                >
                  expand_more
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-4 text-[13px] text-[#bccabf] leading-6">
                      {f.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
