"use client";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";

export default function AuthPage() {
  const { isConnected } = useAccount();
  const router = useRouter();
  useEffect(() => {
    if (isConnected) router.replace("/dashboard");
  }, [isConnected, router]);

  return (
    <div className="min-h-screen bg-[#041711] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[420px] bg-[#10231d] border border-white/[0.08] rounded-2xl p-5 sm:p-8 text-center"
      >
        <div className="w-12 h-12 rounded-xl bg-[#1b2e27] flex items-center justify-center text-[#62dd9e] mx-auto">
          <span className="material-symbols-outlined text-[24px]">
            account_balance_wallet
          </span>
        </div>
        <h1 className="sora text-[22px] font-semibold mt-4">
          Connect your wallet
        </h1>
        <p className="text-[13px] text-[#bccabf] mt-2 leading-5">
          Your wallet is your account. No email, no password — connect to
          continue to your vaults and circles.
        </p>
        <div className="mt-6 flex justify-center">
          <ConnectButton />
        </div>
        <p className="text-[11px] text-[#bccabf]/60 mt-4">
          Sepolia testnet · mUSDC (6 decimals) · No real funds
        </p>
        <div className="mt-6 flex items-center gap-2 text-[11px] text-[#bccabf] justify-center">
          <span className="w-1.5 h-1.5 rounded-full bg-[#62dd9e]" />{" "}
          Non-custodial <span className="w-1 h-1 rounded-full bg-white/20" />{" "}
          <span className="w-1.5 h-1.5 rounded-full bg-[#e4c279]" /> Auditable
        </div>
      </motion.div>
    </div>
  );
}