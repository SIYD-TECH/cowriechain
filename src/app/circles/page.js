"use client";
import { useEffect } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import { useReveal } from "@/hooks/useReveal";

const MOCK = [
  {
    id: "1",
    name: "Lagos crew",
    pot: 1200,
    contrib: 200,
    members: 6,
    cycle: "3/6",
    next: "Kwame M.",
    status: "Active",
  },
  {
    id: "2",
    name: "Nairobi Builders #4",
    pot: 9000,
    contrib: 1500,
    members: 6,
    cycle: "3/6",
    next: "Kwame M.",
    status: "Active",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function CirclesPage() {
  const { isConnected } = useAccount();
  const router = useRouter();
  const [ref, inView] = useReveal(0.12);
  useEffect(() => {
    if (!isConnected) router.replace("/auth");
  }, [isConnected, router]);
  if (!isConnected) return null;

  return (
    <div className="min-h-screen bg-[#041711] flex">
      <Sidebar />
      <main className="flex-1 ml-[240px] max-lg:ml-0">
        <div className="sticky top-0 z-30 h-[56px] bg-[#041711]/80 backdrop-blur-xl border-b border-white/[0.06] flex items-center justify-between px-4 lg:px-8">
          <span className="sora text-[15px] font-semibold">Circles</span>
          <div className="flex gap-2">
            <Link
              href="/circles/join"
              className="hidden sm:inline-flex px-4 py-2 bg-[#10231d] border border-white/[0.08] hover:bg-[#1b2e27] rounded-xl text-[11px] font-semibold tracking-widest uppercase transition-colors"
            >
              Join circle
            </Link>
            <Link
              href="/circles/new"
              className="px-4 py-2 bg-[#1aa56c] hover:bg-[#62dd9e] text-white hover:text-[#002111] rounded-xl text-[11px] font-semibold tracking-widest uppercase transition-colors"
            >
              New circle
            </Link>
          </div>
        </div>
        <div ref={ref} className="p-4 lg:p-8 max-w-[1280px]">
          <motion.div
            variants={container}
            initial="hidden"
            animate={inView ? "show" : "hidden"}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
          >
            {MOCK.map((c) => (
              <motion.div
                key={c.id}
                variants={item}
                whileHover={{ y: -3 }}
                className="bg-[#10231d] border border-white/[0.06] hover:border-white/[0.10] rounded-2xl p-5 flex flex-col"
              >
                <div className="flex items-center justify-between">
                  <span className="sora text-[15px] font-semibold">
                    {c.name}
                  </span>
                  <span className="px-2 py-1 rounded-full bg-[#62dd9e]/15 text-[#62dd9e] text-[10px] font-semibold tracking-widest uppercase">
                    {c.status} · {c.cycle}
                  </span>
                </div>
                <div className="mt-3 p-3 rounded-xl bg-[#01110c] border border-white/[0.04] space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-[#bccabf]">Pot / cycle</span>
                    <span className="font-semibold text-[#e4c279]">
                      ${c.pot.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#bccabf]">Contribution</span>
                    <span className="font-medium">${c.contrib} / cycle</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#bccabf]">Members</span>
                    <span>
                      {c.members} · {c.next}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#bccabf]">Collateral</span>
                    <span className="text-[#62dd9e] font-medium">
                      100% escrow
                    </span>
                  </div>
                </div>
                <Link
                  href={`/circles/${c.id}`}
                  className="mt-4 w-full text-center py-2.5 bg-[#1b2e27] hover:bg-[#263932] rounded-xl text-[11px] font-semibold tracking-widest uppercase transition-colors"
                >
                  Open circle
                </Link>
              </motion.div>
            ))}
            <motion.div
              variants={item}
              className="border-2 border-dashed border-white/[0.08] rounded-2xl p-5 flex flex-col items-center justify-center text-center min-h-[180px] hover:border-[#62dd9e]/30 transition-colors"
            >
              <span className="material-symbols-outlined text-[#bccabf] text-[24px]">
                group_add
              </span>
              <div className="sora text-[13px] font-semibold mt-2">
                Start or join a circle
              </div>
              <div className="text-[11px] text-[#bccabf] mt-1">
                Pooled savings with rotational payouts.
              </div>
              <div className="mt-3 flex gap-2">
                <Link
                  href="/circles/new"
                  className="px-4 py-2 bg-[#1aa56c] text-white rounded-xl text-[11px] font-semibold"
                >
                  New circle
                </Link>
                <Link
                  href="/circles/join"
                  className="px-4 py-2 bg-[#1b2e27] rounded-xl text-[11px] font-semibold"
                >
                  Join
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
