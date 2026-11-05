"use client";
import { motion } from "framer-motion";
import { useReveal } from "@/hooks/useReveal";

const STEPS = [
  {
    n: "01",
    icon: "account_balance_wallet",
    col: "text-[#62dd9e]",
    t: "Connect your wallet",
    d: "MetaMask, Rabby, WalletConnect — you keep your keys.",
    tag: "Zero KYC",
  },
  {
    n: "02",
    icon: "tune",
    col: "text-[#63dca2]",
    t: "Set a goal or join a circle",
    d: "Pick timelock, target, cadence — or join a verified pool.",
    tag: "Personal or circle",
  },
  {
    n: "03",
    icon: "lock_open",
    col: "text-[#e4c279]",
    t: "Track & withdraw by rules",
    d: "Contracts release funds at maturity or on your turn.",
    tag: "Automated escrow",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Steps() {
  const [ref, inView] = useReveal(0.18);
  return (
    <section
      ref={ref}
      className="px-4 lg:px-8 py-16 bg-[#041711] relative overflow-hidden"
    >
      <div className="max-w-[1440px] mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
        >
          <div className="text-[11px] font-semibold tracking-[0.14em] uppercase text-[#e4c279]">
            Protocol execution path
          </div>
          <h2 className="sora text-[28px] font-semibold tracking-tight mt-2">
            Three steps to autonomous wealth
          </h2>
          <p className="text-[14px] text-[#bccabf] mt-2">
            No credit checks. No custody. No hold times.
          </p>
        </motion.div>
        <motion.div
          variants={container}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-10 relative"
        >
          {/* dashed connector (desktop) */}
          <div
            className="hidden md:block absolute top-[44px] left-[16%] right-[16%] h-px border-t border-dashed border-white/10"
            aria-hidden
          />
          {STEPS.map((s) => (
            <motion.div
              key={s.n}
              variants={item}
              whileHover={{ y: -3 }}
              className="p-6 rounded-2xl bg-[#10231d] border border-white/[0.06] text-left relative"
            >
              <div className="flex items-center justify-between mb-4">
                <span className={`sora text-[28px] font-bold ${s.col}`}>
                  {s.n}
                </span>
                <span
                  className={`material-symbols-outlined text-[26px] ${s.col}`}
                >
                  {s.icon}
                </span>
              </div>
              <div className="sora text-[15px] font-semibold">{s.t}</div>
              <p className="text-[13px] text-[#bccabf] mt-2 leading-5">{s.d}</p>
              <div className="mt-4 px-3 py-2 rounded-xl bg-[#01110c] text-[11px] text-[#bccabf]">
                {s.tag}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
