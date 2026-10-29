"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const NAV = ["How it works", "Goals", "Circles", "Rewards", "Security", "FAQ"];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 inset-x-0 z-50 backdrop-blur-xl border-b transition-colors ${scrolled ? "bg-[#041711]/85 border-white/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.25)]" : "bg-[#041711]/60 border-white/[0.04]"}`}
    >
      <div className="h-[68px] max-w-[1440px] mx-auto px-4 lg:px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-[#10231d] flex items-center justify-center text-[#62dd9e] group-hover:bg-[#1b2e27] transition-colors">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 2C7.58 2 4 5.58 4 10c0 4.97 3.5 10.3 7.2 11.75.52.2 1.08.2 1.6 0C16.5 20.3 20 14.97 20 10c0-4.42-3.58-8-8-8zm0 15c-1.66 0-3-2.69-3-6s1.34-6 3-6 3 2.69 3 6-1.34 6-3 6z" />
            </svg>
          </div>
          <span className="sora text-[17px] font-bold tracking-tight">
            Cowrie<span className="text-[#62dd9e]">Chain</span>
          </span>
        </Link>

        <nav className="hidden xl:flex items-center gap-7">
          {NAV.map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase().replace(/\s/g, "-")}`}
              className="text-[13px] text-[#bccabf] hover:text-white transition-colors relative group/link"
            >
              {l}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#62dd9e] group-hover/link:w-full transition-all duration-300" />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="#"
            className="hidden md:inline-flex text-[11px] font-semibold tracking-widest uppercase text-[#bccabf] hover:text-white transition-colors"
          >
            Docs
          </a>
          <Link
            href="/auth"
            className="hidden sm:inline-flex px-5 py-2.5 bg-[#1aa56c] hover:bg-[#62dd9e] text-white hover:text-[#002111] rounded-xl text-[11px] font-semibold tracking-widest uppercase transition-colors shadow-[0_4px_16px_rgba(26,165,108,.22)] active:scale-[0.98]"
          >
            Connect wallet
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            className="xl:hidden w-9 h-9 rounded-xl bg-[#10231d] border border-white/[0.08] flex items-center justify-center text-white"
            aria-label="Menu"
          >
            <span className="material-symbols-outlined text-[20px]">
              {open ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="xl:hidden border-t border-white/[0.06] bg-[#0c1f19] px-4 py-4 flex flex-col gap-1"
          >
            {NAV.map((l) => (
              <a
                key={l}
                href={`#${l.toLowerCase().replace(/\s/g, "-")}`}
                onClick={() => setOpen(false)}
                className="px-3 py-2.5 rounded-xl text-[14px] text-[#bccabf] hover:bg-white/[0.06] hover:text-white transition-colors"
              >
                {l}
              </a>
            ))}
            <Link
              href="/auth"
              onClick={() => setOpen(false)}
              className="mt-2 w-full text-center px-5 py-3 bg-[#1aa56c] text-white rounded-xl text-[13px] font-semibold"
            >
              Connect wallet
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
