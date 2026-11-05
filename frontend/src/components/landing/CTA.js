"use client";
import Link from "next/link";
import { motion } from "framer-motion";

export default function CTA() {
  return (
    <section className="px-4 lg:px-8 py-14 bg-[#041711]">
      <div className="max-w-[1440px] mx-auto">
        <div className="relative rounded-2xl bg-[#1b2e27] p-8 lg:p-14 text-center overflow-hidden border border-white/[0.06]">
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-[480px] h-[240px] bg-[#62dd9e]/10 rounded-full blur-[80px]" />
          </motion.div>
          <div className="relative">
            <div className="text-[11px] font-semibold tracking-[0.14em] uppercase text-[#e4c279]">
              Sovereign wealth, accelerated
            </div>
            <h2 className="sora text-[28px] lg:text-[36px] font-bold tracking-tight mt-2">
              Ready to save with your community?
            </h2>
            <p className="text-[14px] text-[#bccabf] mt-2 max-w-[520px] mx-auto">
              Create a vault or join a circle in under two minutes.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#1aa56c] hover:bg-[#62dd9e] text-white hover:text-[#002111] sora text-[14px] font-semibold rounded-xl shadow-lg transition-colors"
                >
                  Launch app{" "}
                  <span className="material-symbols-outlined text-[18px]">
                    rocket_launch
                  </span>
                </Link>
              </motion.div>
              <a
                href="#"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#10231d] hover:bg-[#263932] text-white sora text-[14px] font-semibold rounded-xl transition-colors"
              >
                <span className="material-symbols-outlined text-[#62dd9e] text-[18px]">
                  menu_book
                </span>{" "}
                Read docs
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
