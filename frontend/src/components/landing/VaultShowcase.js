"use client";
import { motion } from "framer-motion";
import { useReveal } from "@/hooks/useReveal";

export default function VaultShowcase() {
  const [ref, inView] = useReveal(0.2);
  return (
    <section ref={ref} className="px-4 lg:px-8 py-16 bg-[#0c1f19]">
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-5 space-y-3 text-left"
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10231d] text-[#62dd9e] text-[11px] font-semibold tracking-widest uppercase">
            <span className="material-symbols-outlined text-[14px]">
              shield
            </span>{" "}
            Personal discipline
          </span>
          <h2 className="sora text-[28px] font-semibold leading-tight tracking-tight">
            Commitment vaults that resist impulse
          </h2>
          <p className="text-[14px] text-[#bccabf] leading-6">
            Lock funds until a date or target is hit. Cryptographic commitments
            beat willpower.
          </p>
          <ul className="space-y-2 text-[13px] text-[#bccabf] pt-1">
            {[
              "Recurring token approvals",
              "Strict timelock · 5% early-exit fee",
              "Rewards for on-time completion",
            ].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#62dd9e] text-[18px]">
                  check_circle
                </span>{" "}
                {t}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
          whileHover={{ rotateY: 2, rotateX: 1 }}
          style={{ perspective: 800 }}
          className="lg:col-span-7 bg-[#1b2e27] p-6 rounded-2xl shadow-2xl border border-white/[0.06] text-left"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[10px] font-semibold tracking-widest uppercase text-[#e4c279]">
                Active goal
              </div>
              <div className="sora text-[17px] font-semibold">
                Solar microgrid vault
              </div>
            </div>
            <span className="shrink-0 px-3 py-1 rounded-full bg-[#62dd9e]/15 text-[#62dd9e] text-[10px] font-semibold tracking-widest uppercase">
              Strict timelock
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="p-3 bg-[#10231d] rounded-xl">
              <div className="text-[10px] tracking-widest uppercase text-[#bccabf]">
                Balance
              </div>
              <div className="sora text-[15px] font-semibold text-[#62dd9e] mt-1">
                $9,750
              </div>
            </div>
            <div className="p-3 bg-[#10231d] rounded-xl">
              <div className="text-[10px] tracking-widest uppercase text-[#bccabf]">
                Target
              </div>
              <div className="sora text-[15px] font-semibold mt-1">$15,000</div>
            </div>
            <div className="p-3 bg-[#10231d] rounded-xl">
              <div className="text-[10px] tracking-widest uppercase text-[#bccabf]">
                Maturity
              </div>
              <div className="sora text-[14px] font-semibold text-[#e4c279] mt-1">
                Oct 30
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-between text-[11px] font-medium">
            <span>65% complete</span>
            <span className="text-[#62dd9e]">$5,250 remaining</span>
          </div>
          <div className="mt-1.5 w-full h-2 rounded-full bg-[#01110c] overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#62dd9e] to-[#63dca2] rounded-full"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: inView ? 1 : 0 }}
              transition={{
                duration: 0.9,
                ease: [0.22, 1, 0.36, 1],
                delay: 0.3,
              }}
              style={{ width: "65%", transformOrigin: "left" }}
            />
          </div>
          <div className="mt-3 p-3 rounded-xl bg-[#10231d] text-[12px] text-[#bccabf] space-y-1.5">
            <div className="flex justify-between">
              <span>Cadence</span>
              <span className="text-white font-medium">$350 / bi-weekly</span>
            </div>
            <div className="flex justify-between">
              <span>Early exit</span>
              <span className="text-[#ffb4ab] font-medium">
                5% → reward pool
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
