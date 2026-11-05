"use client";
import { motion } from "framer-motion";
import { useReveal } from "@/hooks/useReveal";

const ITEMS = [
  {
    icon: "terminal",
    col: "text-[#62dd9e]",
    t: "Programmatic enforcement",
    d: "Lockups and payouts run autonomously — no discretionary interference.",
  },
  {
    icon: "visibility",
    col: "text-[#63dca2]",
    t: "Public ledgers",
    d: "Every deposit and rotation is cataloged on block explorers, 24/7 verifiable.",
  },
  {
    icon: "verified",
    col: "text-[#e4c279]",
    t: "Honest disclosure",
    d: "No “100% risk-free” claims. Gas, bugs, and network mechanics apply.",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Security() {
  const [ref, inView] = useReveal(0.15);
  return (
    <section ref={ref} className="px-4 lg:px-8 py-14 bg-[#041711]">
      <div className="max-w-[1440px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="text-center max-w-[600px] mx-auto"
        >
          <div className="text-[11px] font-semibold tracking-[0.14em] uppercase text-[#62dd9e]">
            Decentralized resilience
          </div>
          <h2 className="sora text-[28px] font-semibold tracking-tight mt-2">
            Open source, auditable, non-custodial
          </h2>
          <p className="text-[14px] text-[#bccabf] mt-2">
            No backdoors. No managers who can freeze your pot. Verifiable EVM
            code.
          </p>
        </motion.div>
        <motion.div
          variants={container}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8"
        >
          {ITEMS.map((s) => (
            <motion.div
              key={s.t}
              variants={item}
              whileHover={{ y: -3 }}
              className="p-5 rounded-2xl bg-[#10231d] border border-white/[0.06] hover:border-white/[0.10] transition-colors"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={inView ? { scale: 1 } : {}}
                transition={{ duration: 0.35, delay: 0.2 }}
                className="w-10 h-10 rounded-xl bg-[#1b2e27] flex items-center justify-center mb-3"
              >
                <span
                  className={`material-symbols-outlined text-[22px] ${s.col}`}
                >
                  {s.icon}
                </span>
              </motion.div>
              <div className="sora text-[15px] font-semibold">{s.t}</div>
              <p className="text-[12px] text-[#bccabf] mt-2 leading-5">{s.d}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
