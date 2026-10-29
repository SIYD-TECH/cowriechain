"use client";
import { useReveal } from "@/hooks/useReveal";
import { motion } from "framer-motion";

const CIRCLES = [
  {
    title: "Pan-African dev ecosystem",
    sub: "Workstation fund",
    pot: "$12,000",
    contrib: "$2,000 / mo",
    next: "Tunde O. · 11d",
  },
  {
    title: "Agritech equipment collective",
    sub: "Solar irrigation kits",
    pot: "$24,000",
    contrib: "$3,000 / bi-mo",
    next: "Fatima K. · 4d",
  },
  {
    title: "Young pros emergency buffer",
    sub: "Liquidity rotations",
    pot: "$5,000",
    contrib: "$500 / mo",
    next: "David N. · 19d",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Circles() {
  const [ref, inView] = useReveal(0.15);
  return (
    <section id="circles" ref={ref} className="px-4 lg:px-8 py-16 bg-[#041711]">
      <div className="max-w-[1440px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4"
        >
          <div>
            <div className="text-[11px] font-semibold tracking-[0.14em] uppercase text-[#e4c279]">
              Rotational credit
            </div>
            <h2 className="sora text-[28px] font-semibold tracking-tight mt-1">
              Active community circles
            </h2>
            <p className="text-[14px] text-[#bccabf] mt-1 max-w-[560px]">
              Join vetted peer-to-peer pools. Equal contributions each cycle —
              one member collects the pot each round.
            </p>
          </div>
          <button className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#10231d] hover:bg-[#1b2e27] rounded-xl text-[11px] font-semibold tracking-widest uppercase transition-colors">
            Filter by cadence{" "}
            <span className="material-symbols-outlined text-[16px]">
              keyboard_arrow_down
            </span>
          </button>
        </motion.div>
        <motion.div
          variants={container}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8"
        >
          {CIRCLES.map((c) => (
            <motion.div
              key={c.title}
              variants={item}
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 320, damping: 20 }}
              className="bg-[#10231d] p-5 rounded-2xl border border-white/[0.06] hover:border-white/[0.10] hover:shadow-xl flex flex-col"
            >
              <div className="sora text-[15px] font-semibold leading-tight">
                {c.title}
              </div>
              <div className="text-[12px] text-[#bccabf] mt-1">{c.sub}</div>
              <div className="mt-4 p-3 rounded-xl bg-[#01110c] space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-[#bccabf]">Pot / cycle</span>
                  <span className="font-semibold text-[#62dd9e]">{c.pot}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#bccabf]">Contribution</span>
                  <span className="font-medium">{c.contrib}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#bccabf]">Collateral</span>
                  <span className="text-[#e4c279] font-medium">
                    100% escrow
                  </span>
                </div>
              </div>
              <div className="mt-3 text-[11px] flex justify-between">
                <span className="text-[#bccabf]">Next:</span>
                <span className="text-[#e4c279] font-semibold">{c.next}</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-4 w-full py-2.5 bg-[#1b2e27] hover:bg-[#263932] rounded-xl text-[11px] font-semibold tracking-widest uppercase transition-colors"
              >
                Inspect ledger
              </motion.button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
