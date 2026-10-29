"use client";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "@/components/Sidebar"; // or AppShell if you have it
import { motion } from "framer-motion";
import Link from "next/link";

export default function DashboardPage() {
  const { isConnected } = useAccount();
  const router = useRouter();
  useEffect(() => {
    if (!isConnected) router.replace("/auth");
  }, [isConnected, router]);
  if (!isConnected) return null;

  return (
    <div className="min-h-screen bg-[#041711] flex">
      <Sidebar />
      <main className="flex-1 ml-[240px] max-lg:ml-0 p-4 lg:p-8 space-y-6">
        {/* balances row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#10231d] border border-white/[0.06] rounded-2xl p-5">
            <div className="text-[11px] tracking-widest uppercase text-[#bccabf]">
              Total saved
            </div>
            <div className="sora text-[26px] font-bold mt-1">
              $12,450
              <span className="text-[13px] font-normal text-[#bccabf]">
                .00 cUSD
              </span>
            </div>
            <div className="text-[11px] text-[#62dd9e] mt-1">
              +12% this month
            </div>
          </div>
          <div className="bg-[#10231d] border border-white/[0.06] rounded-2xl p-5">
            <div className="text-[11px] tracking-widest uppercase text-[#bccabf]">
              Active goals
            </div>
            <div className="sora text-[26px] font-bold mt-1">2</div>
            <div className="text-[11px] text-[#bccabf] mt-1">
              1 vault maturing soon
            </div>
          </div>
          <div className="bg-[#10231d] border border-white/[0.06] rounded-2xl p-5">
            <div className="text-[11px] tracking-widest uppercase text-[#bccabf]">
              Circles
            </div>
            <div className="sora text-[26px] font-bold mt-1">
              1{" "}
              <span className="text-[13px] font-normal text-[#bccabf]">
                active
              </span>
            </div>
            <div className="text-[11px] text-[#bccabf] mt-1">Cycle 3 of 6</div>
          </div>
        </div>
        {/* goals + circles previews + activity — wire to lib/contracts reads next */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-[#10231d] border border-white/[0.06] rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <span className="sora text-[14px] font-semibold">Goals</span>
              <Link
                href="/goals"
                className="text-[11px] text-[#62dd9e] hover:underline"
              >
                View all →
              </Link>
            </div>
            <div className="mt-4 text-[13px] text-[#bccabf]">
              No goals yet — create your first vault.
            </div>
          </div>
          <div className="bg-[#10231d] border border-white/[0.06] rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <span className="sora text-[14px] font-semibold">Circles</span>
              <Link
                href="/circles"
                className="text-[11px] text-[#62dd9e] hover:underline"
              >
                View all →
              </Link>
            </div>
            <div className="mt-4 text-[13px] text-[#bccabf]">
              No active circles.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
