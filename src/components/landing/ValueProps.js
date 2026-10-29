"use client";
import { motion } from "framer-motion";
import { useReveal } from "@/hooks/useReveal";

const ITEMS = [
  {
    icon: "gavel",
    bg: "bg-[#1aa56c]",
    t: "Goals with transparent rules",
    d: "Lockup periods and targets enforced by code. No early-exit backdoors.",
    cta: "Non-custodial vaults",
    col: "text-[#62dd9e]",
  },
  {
    icon: "all_inclusive",
    bg: "bg-[#1ca46f]",
    t: "Wealth through circles",
    d: "Pooled capital with predictable rotational payouts and collateral.",
    cta: "Peer-to-peer ROSCAs",
    col: "text-[#63dca2]",
  },
  {
    icon: "query_stats",
    bg: "bg-[#ab8d49]",
    t: "One unified ledger",
    d: "On-chain milestones, auditable history, and automated triggers.",
    cta: "Audit-ready",
    col: "text-[#e4c279]",
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

export default function ValueProps() {
  const [ref, inView] = useReveal(0.18);
  return (
    <section
      id="how-it-works"
      ref={ref}
      className="px-4 lg:px-8 py-16 bg-[#01110c]"
    >
      <div className="max-w-[1440px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45 }}
          className="text-center max-w-[640px] mx-auto"
        >
          <div className="text-[11px] font-semibold tracking-[0.14em] uppercase text-[#62dd9e]">
            Built on mathematical discipline
          </div>
          <h2 className="sora text-[30px] lg:text-[36px] font-semibold tracking-tight mt-2">
            Sovereign savings, communal heritage
          </h2>
          <p className="text-[15px] text-[#bccabf] mt-3 leading-6">
            We replaced opaque middlemen with cryptographic guarantees —
            disciplined savings, accountable circles.
          </p>
        </motion.div>
        <motion.div
          variants={container}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-10"
        >
          {ITEMS.map((v) => (
            <motion.div
              key={v.t}
              variants={item}
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="p-6 rounded-2xl bg-[#10231d] border border-white/[0.06] hover:border-white/[0.12] text-left flex flex-col"
            >
              <div
                className={`w-11 h-11 rounded-xl ${v.bg} flex items-center justify-center text-white mb-4`}
              >
                <span className="material-symbols-outlined text-[22px]">
                  {v.icon}
                </span>
              </div>
              <div className="sora text-[17px] font-semibold leading-tight">
                {v.t}
              </div>
              <p className="text-[13px] text-[#bccabf] mt-2 leading-6 flex-1">
                {v.d}
              </p>
              <div
                className={`mt-5 flex items-center gap-1.5 text-[11px] font-semibold tracking-widest uppercase ${v.col}`}
              >
                {v.cta}{" "}
                <span className="material-symbols-outlined text-[14px]">
                  arrow_forward
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
