"use client";

import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function AuthPage() {
  const { isConnected } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (isConnected) {
      router.replace("/dashboard");
    }
  }, [isConnected, router]);

  return (
    <div className="min-h-screen bg-[#0E2927] text-[#F6F1E7] flex flex-col justify-between p-4 sm:p-8">
      {/* Brand Header */}
      <div className="flex items-center justify-between max-w-5xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[10px] bg-[#1a2d2c] border border-[rgba(246,241,231,0.10)] flex items-center justify-center text-[#2BB59A]">
            <span className="material-symbols-outlined text-[20px]">token</span>
          </div>
          <span className="sora text-[17px] font-semibold tracking-tight text-[#F6F1E7]">
            CowrieChain
          </span>
        </Link>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(227,176,75,0.12)] border border-[rgba(227,176,75,0.3)] text-[#E3B04B] text-xs font-semibold">
          Sepolia Testnet <span className="w-1.5 h-1.5 rounded-full bg-[#E3B04B]" />
        </span>
      </div>

      {/* Central Connect Card */}
      <div className="flex items-center justify-center my-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[440px] bg-[#143734] border border-[rgba(246,241,231,0.08)] rounded-2xl p-6 sm:p-8 text-center shadow-2xl"
        >
          <div className="w-14 h-14 rounded-2xl bg-[rgba(43,181,154,0.12)] border border-[rgba(43,181,154,0.25)] flex items-center justify-center text-[#2BB59A] mx-auto">
            <span className="material-symbols-outlined text-[28px]">
              account_balance_wallet
            </span>
          </div>
          <h1 className="sora text-xl sm:text-2xl font-bold text-[#F6F1E7] mt-4">
            Connect Your Wallet
          </h1>
          <p className="text-xs sm:text-sm text-[#9DB5AF] mt-2 leading-relaxed">
            Your wallet is your identity. No centralized accounts, no passwords — connect with MetaMask or WalletConnect to access your vaults and circles.
          </p>

          <div className="mt-6 flex justify-center scale-105">
            <ConnectButton />
          </div>

          <div className="mt-6 pt-5 border-t border-[rgba(246,241,231,0.06)] flex flex-col gap-2 text-xs text-[#9DB5AF]">
            <div className="flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2BB59A]" />
              <span>Smart Contract Verified</span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#E3B04B]" />
              <span>Non-Custodial</span>
            </div>
            <p className="text-[11px] text-[#9DB5AF]/70">
              Ethereum Sepolia (Chain ID 11155111) · mUSDC Test Token
            </p>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-[#9DB5AF]/60">
        CowrieChain · Decentralized Rotational Savings & Automated Lock Vaults
      </div>
    </div>
  );
}
