"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAccount, useReadContract } from "wagmi";
import { ADDRESSES, MOCK_USDC_ABI, fmtUSDC } from "@/lib/contracts";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/goals", label: "Goals", icon: "savings" },
  { href: "/circles", label: "Circles", icon: "groups" },
  { href: "/faucet", label: "Faucet", icon: "water_drop", badge: "Free" },
  { href: "/rewards", label: "Rewards", icon: "toll", badge: "Soon" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { address, isConnected } = useAccount();

  // Read mUSDC balance
  const { data: balance } = useReadContract({
    address: ADDRESSES.mockUSDC,
    abi: MOCK_USDC_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 10000,
    },
  });

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileOpen]);

  return (
    <>
      {/* ── Desktop Fixed Sidebar (lg: 1024px and wider) ────────────── */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-[240px] bg-[#0E2927] border-r border-[rgba(246,241,231,0.08)] z-50 flex-col justify-between p-4">
        <div>
          <Link href="/dashboard" className="flex items-center gap-2.5 px-1 py-2 group">
            <div className="w-8 h-8 rounded-[10px] bg-[#1a2d2c] border border-[rgba(246,241,231,0.10)] flex items-center justify-center text-[#2BB59A] group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[20px]">token</span>
            </div>
            <span className="sora text-[17px] font-semibold tracking-tight text-[#F6F1E7]">
              CowrieChain
            </span>
          </Link>

          <nav className="mt-6 flex flex-col gap-1">
            {NAV.map(({ href, label, icon, badge }) => {
              const active = pathname === href || (href !== "/" && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`h-11 px-3 rounded-[10px] flex items-center justify-between text-[13px] font-medium transition-colors ${
                    active
                      ? "bg-[rgba(43,181,154,0.12)] text-[#2BB59A] font-semibold"
                      : "text-[#9DB5AF] hover:bg-[rgba(246,241,231,0.05)] hover:text-[#F6F1E7]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[20px]">{icon}</span>
                    {label}
                  </div>
                  {badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        badge === "Free"
                          ? "bg-[rgba(43,181,154,0.18)] text-[#2BB59A] border border-[rgba(43,181,154,0.3)]"
                          : "bg-[rgba(246,241,231,0.08)] text-[#9DB5AF]"
                      }`}
                    >
                      {badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-[rgba(246,241,231,0.08)] flex flex-col gap-2.5">
          {isConnected && (
            <div className="px-3 py-2.5 rounded-xl bg-[rgba(246,241,231,0.04)] border border-[rgba(246,241,231,0.08)]">
              <div className="flex items-center justify-between text-[11px] text-[#9DB5AF]">
                <span>mUSDC Balance</span>
                <Link
                  href="/faucet"
                  className="text-[#2BB59A] hover:underline font-semibold flex items-center gap-0.5 text-[10px]"
                >
                  Faucet <span className="material-symbols-outlined text-[10px]">arrow_forward</span>
                </Link>
              </div>
              <div className="sora text-[14px] font-bold text-[#F6F1E7] mt-0.5 truncate">
                {fmtUSDC(balance, "")} <span className="text-[11px] text-[#2BB59A] font-normal">mUSDC</span>
              </div>
            </div>
          )}

          <ConnectButton accountStatus="address" chainStatus="icon" showBalance={false} />
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] text-[#9DB5AF]">Network</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[rgba(227,176,75,0.12)] border border-[rgba(227,176,75,0.30)] text-[#E3B04B] text-[10px] font-semibold tracking-wide">
              Sepolia <span className="w-1.5 h-1.5 rounded-full bg-[#E3B04B]" />
            </span>
          </div>
        </div>
      </aside>

      {/* ── Mobile & Tablet Header (< lg: under 1024px) ────────────── */}
      <div className="lg:hidden sticky top-0 z-40 w-full h-[56px] bg-[#0E2927]/95 backdrop-blur-xl border-b border-white/[0.08] px-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="w-9 h-9 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-white transition-colors cursor-pointer"
            aria-label="Toggle mobile menu"
          >
            <span className="material-symbols-outlined text-[20px]">
              {mobileOpen ? "close" : "menu"}
            </span>
          </button>

          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-[8px] bg-[#1a2d2c] border border-white/[0.1] flex items-center justify-center text-[#2BB59A]">
              <span className="material-symbols-outlined text-[16px]">token</span>
            </div>
            <span className="sora text-[15px] font-semibold text-white tracking-tight">
              CowrieChain
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2 scale-90 sm:scale-100 origin-right">
          <ConnectButton accountStatus="avatar" chainStatus="none" showBalance={false} />
        </div>
      </div>

      {/* ── Mobile Slide-Over Drawer Navigation ───────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
              aria-hidden="true"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="lg:hidden fixed left-0 top-[56px] bottom-0 w-[270px] max-w-[80vw] bg-[#0E2927] border-r border-white/[0.08] z-50 flex flex-col justify-between p-4 shadow-2xl"
            >
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-widest text-[#9DB5AF] px-2 mb-2">
                  Navigation
                </div>
                <nav className="flex flex-col gap-1.5">
                  {NAV.map(({ href, label, icon, badge }) => {
                    const active = pathname === href || (href !== "/" && pathname.startsWith(href));
                    return (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setMobileOpen(false)}
                        className={`h-11 px-3 rounded-[10px] flex items-center justify-between text-[14px] font-medium transition-colors ${
                          active
                            ? "bg-[rgba(43,181,154,0.15)] text-[#2BB59A] font-semibold"
                            : "text-[#9DB5AF] hover:bg-white/[0.05] hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-[22px]">{icon}</span>
                          {label}
                        </div>
                        {badge && (
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                              badge === "Free"
                                ? "bg-[rgba(43,181,154,0.18)] text-[#2BB59A] border border-[rgba(43,181,154,0.3)]"
                                : "bg-[rgba(246,241,231,0.08)] text-[#9DB5AF]"
                            }`}
                          >
                            {badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 border-t border-[rgba(246,241,231,0.08)] flex flex-col gap-3">
                {isConnected && (
                  <div className="px-3 py-2.5 rounded-xl bg-[rgba(246,241,231,0.04)] border border-[rgba(246,241,231,0.08)]">
                    <div className="flex items-center justify-between text-[11px] text-[#9DB5AF]">
                      <span>mUSDC Balance</span>
                      <Link
                        href="/faucet"
                        onClick={() => setMobileOpen(false)}
                        className="text-[#2BB59A] hover:underline font-semibold flex items-center gap-0.5 text-[10px]"
                      >
                        Faucet <span className="material-symbols-outlined text-[10px]">arrow_forward</span>
                      </Link>
                    </div>
                    <div className="sora text-[14px] font-bold text-[#F6F1E7] mt-0.5 truncate">
                      {fmtUSDC(balance, "")} <span className="text-[11px] text-[#2BB59A] font-normal">mUSDC</span>
                    </div>
                  </div>
                )}

                <ConnectButton accountStatus="address" chainStatus="icon" showBalance={false} />
                <div className="flex items-center justify-between px-1 text-[11px] text-[#9DB5AF]">
                  <span>Active Network</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[rgba(227,176,75,0.12)] border border-[rgba(227,176,75,0.30)] text-[#E3B04B] font-semibold">
                    Sepolia <span className="w-1.5 h-1.5 rounded-full bg-[#E3B04B]" />
                  </span>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
