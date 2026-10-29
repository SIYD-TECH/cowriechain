"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const NAV = [
  { href: "/", label: "Dashboard", icon: "dashboard" },
  { href: "/goals", label: "Goals", icon: "savings" },
  { href: "/circles", label: "Circles", icon: "groups" },
  { href: "/rewards", label: "Rewards", icon: "toll" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[240px] bg-[#0E2927] border-r border-[rgba(246,241,231,0.08)] z-50 flex flex-col justify-between p-4">
      <div>
        <div className="flex items-center gap-2.5 px-1 py-2">
          <div className="w-8 h-8 rounded-[10px] bg-[#1a2d2c] border border-[rgba(246,241,231,0.10)] flex items-center justify-center text-[#2BB59A]">
            <span className="material-symbols-outlined text-[20px]">token</span>
          </div>
          <span className="sora text-[17px] font-semibold tracking-tight">
            CowrieChain
          </span>
        </div>

        <nav className="mt-6 flex flex-col gap-1">
          {NAV.map(({ href, label, icon }) => {
            const active =
              pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`h-11 px-3 rounded-[10px] flex items-center gap-2.5 text-[13px] font-medium transition-colors ${
                  active
                    ? "bg-[rgba(43,181,154,0.12)] text-[#2BB59A] font-semibold"
                    : "text-[#9DB5AF] hover:bg-[rgba(246,241,231,0.05)] hover:text-[#F6F1E7]"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {icon}
                </span>
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-[rgba(246,241,231,0.08)] flex flex-col gap-2">
        <ConnectButton
          accountStatus="address"
          chainStatus="icon"
          showBalance={false}
        />
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[rgba(227,176,75,0.12)] border border-[rgba(227,176,75,0.30)] text-[#E3B04B] text-[11px] font-semibold tracking-wide w-fit">
          Testnet <span className="w-1.5 h-1.5 rounded-full bg-[#E3B04B]" />
        </span>
      </div>
    </aside>
  );
}
