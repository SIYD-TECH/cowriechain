"use client";
import { motion } from "framer-motion";
import { useReveal } from "@/hooks/useReveal";

export default function Rewards() {
  const [ref, inView] = useReveal(0.2);
  return (
    <section ref={ref} className="px-4 lg:px-8 py-14 bg-[#01110c]">
      <div className="max-w-[1440px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="bg-[#10231d] p-7 rounded-2xl border border-white/[0.06] relative overflow-hidden"
        >
          <motion.div
            aria-hidden
            className="absolute -right-12 -top-12 w-40 h-40 bg-[#e4c279]/10 rounded-full blur-2xl"
            animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.7, 0.5] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e4c279]/10 text-[#e4c279] text-[11px] font-semibold tracking-widest uppercase">
            <span className="material-symbols-outlined text-[14px]">stars</span>{" "}
            Incentivized consistency
          </div>
          <h2 className="sora text-[24px] font-semibold mt-3">
            Discipline, not yield guarantees
          </h2>
          <p className="text-[14px] text-[#bccabf] mt-2 leading-6 max-w-[640px]">
            Rewards come from a fixed, pre-funded pool — not inflation or
            leveraged lending.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
            <div className="flex gap-3">
              <span className="material-symbols-outlined text-[#62dd9e] text-[20px] shrink-0 mt-0.5">
                verified
              </span>
              <div>
                <div className="sora text-[14px] font-semibold">
                  Consistency points
                </div>
                <p className="text-[12px] text-[#bccabf] mt-1 leading-5">
                  On-time contributions earn weight in quarterly distributions.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="material-symbols-outlined text-[#e4c279] text-[20px] shrink-0 mt-0.5">
                savings
              </span>
              <div>
                <div className="sora text-[14px] font-semibold">
                  Recycled penalties
                </div>
                <p className="text-[12px] text-[#bccabf] mt-1 leading-5">
                  Early-exit fees flow back to disciplined savers.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-5 p-3 rounded-xl bg-[#01110c] flex gap-2.5 text-[12px] text-[#bccabf]">
            <span className="material-symbols-outlined text-[#e4c279] text-[16px] shrink-0 mt-0.5">
              info
            </span>
            <span>
              <strong className="text-white">Notice:</strong> No APY promises.
              Rewards depend on pool distributions and governance.
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
