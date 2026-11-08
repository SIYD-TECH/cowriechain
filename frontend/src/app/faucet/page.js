"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import Sidebar from "@/components/Sidebar";
import {
  ADDRESSES,
  MOCK_USDC_ABI,
  fmtUSDC,
  parseContractError,
  FAUCET_AMOUNT_NUMBER,
} from "@/lib/contracts";

export default function FaucetPage() {
  const router = useRouter();
  const { address, isConnected, status } = useAccount();

  // Wagmi connection guard: bounce only when truly disconnected, not while reconnecting
  useEffect(() => {
    if (status === "disconnected") {
      router.push("/auth");
    }
  }, [status, router]);

  const [timeLeft, setTimeLeft] = useState(0);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [addedToWallet, setAddedToWallet] = useState(false);

  // 1. Read user balance
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: ADDRESSES.mockUSDC,
    abi: MOCK_USDC_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 5000,
    },
  });

  // 2. Read faucet status: canClaimFaucet(user)
  const { data: faucetStatus, refetch: refetchFaucetStatus } = useReadContract({
    address: ADDRESSES.mockUSDC,
    abi: MOCK_USDC_ABI,
    functionName: "canClaimFaucet",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 5000,
    },
  });

  const canClaim = faucetStatus ? Boolean(faucetStatus[0]) : true;
  const initialCooldown = faucetStatus ? Number(faucetStatus[1]) : 0;

  // Local tick-down timer
  useEffect(() => {
    setTimeLeft(initialCooldown);
  }, [initialCooldown]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          refetchFaucetStatus();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft, refetchFaucetStatus]);

  // Format seconds to HH:MM:SS
  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, "0")}h : ${m
      .toString()
      .padStart(2, "0")}m : ${s.toString().padStart(2, "0")}s`;
  };

  // 3. Faucet claim write contract
  const {
    writeContract,
    data: txHash,
    isPending: isWritePending,
    error: writeError,
    reset: resetWrite,
  } = useWriteContract();

  const {
    isLoading: isTxConfirming,
    isSuccess: isTxSuccess,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  useEffect(() => {
    if (isTxSuccess) {
      setSuccessMsg(
        `Success! 1,000 mUSDC claimed and deposited into your wallet.`
      );
      setErrorMsg("");
      refetchBalance();
      refetchFaucetStatus();
    }
  }, [isTxSuccess, refetchBalance, refetchFaucetStatus]);

  useEffect(() => {
    if (writeError) {
      setErrorMsg(parseContractError(writeError));
      setSuccessMsg("");
    } else if (receiptError) {
      setErrorMsg(parseContractError(receiptError));
      setSuccessMsg("");
    }
  }, [writeError, receiptError]);

  const handleClaim = () => {
    setErrorMsg("");
    setSuccessMsg("");
    resetWrite();

    if (!address) {
      setErrorMsg("Please connect your wallet first.");
      return;
    }

    try {
      writeContract({
        address: ADDRESSES.mockUSDC,
        abi: MOCK_USDC_ABI,
        functionName: "faucet",
      });
    } catch (err) {
      setErrorMsg(parseContractError(err));
    }
  };

  // Add mUSDC to MetaMask
  const handleAddToMetaMask = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        await window.ethereum.request({
          method: "wallet_watchAsset",
          params: {
            type: "ERC20",
            options: {
              address: ADDRESSES.mockUSDC,
              symbol: "mUSDC",
              decimals: 6,
            },
          },
        });
        setAddedToWallet(true);
      } catch (err) {
        console.error("MetaMask asset error:", err);
      }
    }
  };

  const isClaiming = isWritePending || isTxConfirming;

  return (
    <div className="min-h-screen bg-[#0E2927] text-[#F6F1E7]">
      <Sidebar />

      <main className="lg:pl-[240px] px-4 sm:px-6 lg:px-8 py-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(43,181,154,0.12)] border border-[rgba(43,181,154,0.25)] text-[#2BB59A] text-xs font-semibold uppercase tracking-wider mb-3">
            <span className="material-symbols-outlined text-[16px]">
              water_drop
            </span>
            Sepolia Testnet Faucet
          </div>
          <h1 className="sora text-2xl sm:text-3xl font-bold tracking-tight text-[#F6F1E7]">
            Claim Free Test Tokens
          </h1>
          <p className="text-[#9DB5AF] text-sm sm:text-base mt-1.5 max-w-2xl">
            Claim 1,000 mUSDC every 12 hours to participate in CowrieChain
            savings goals and ajo group circles on Ethereum Sepolia.
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-[rgba(235,87,87,0.12)] border border-[rgba(235,87,87,0.3)] text-[#EB5757] flex items-start gap-3 text-sm">
            <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">
              error
            </span>
            <div>
              <p className="font-semibold">Transaction Failed</p>
              <p className="text-xs sm:text-sm text-[#EB5757]/90 mt-0.5">
                {errorMsg}
              </p>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-[rgba(43,181,154,0.15)] border border-[rgba(43,181,154,0.35)] text-[#2BB59A] flex items-start gap-3 text-sm">
            <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">
              check_circle
            </span>
            <div className="flex-1">
              <p className="font-semibold">{successMsg}</p>
              {txHash && (
                <a
                  href={`https://sepolia.etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-[#2BB59A] underline hover:text-[#52cbb3] mt-1"
                >
                  View transaction on Sepolia Etherscan
                  <span className="material-symbols-outlined text-[14px]">
                    open_in_new
                  </span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Main Faucet Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl bg-[#143734] border border-[rgba(246,241,231,0.08)] p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-[rgba(246,241,231,0.08)]">
                <div>
                  <span className="text-xs uppercase tracking-wider text-[#9DB5AF] font-medium">
                    Dispense Amount
                  </span>
                  <div className="sora text-3xl sm:text-4xl font-extrabold text-[#F6F1E7] mt-1">
                    1,000{" "}
                    <span className="text-[#2BB59A] text-2xl font-semibold">
                      mUSDC
                    </span>
                  </div>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-[rgba(43,181,154,0.12)] border border-[rgba(43,181,154,0.25)] flex items-center justify-center text-[#2BB59A]">
                  <span className="material-symbols-outlined text-[32px]">
                    token
                  </span>
                </div>
              </div>

              {/* Cooldown Section */}
              <div className="mt-6">
                {!canClaim && timeLeft > 0 ? (
                  <div className="p-4 rounded-xl bg-[rgba(227,176,75,0.10)] border border-[rgba(227,176,75,0.25)]">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#E3B04B] uppercase tracking-wider">
                      <span className="material-symbols-outlined text-[16px]">
                        timer
                      </span>
                      12-Hour Cooldown In Progress
                    </div>
                    <p className="text-xs text-[#9DB5AF] mt-1">
                      To prevent congestion and ensure fair distribution,
                      wallets can claim test tokens once every 12 hours.
                    </p>
                    <div className="mt-3 py-2 px-3 rounded-lg bg-[#0E2927] border border-[rgba(227,176,75,0.2)] flex items-center justify-between">
                      <span className="text-xs text-[#9DB5AF]">Next claim available in:</span>
                      <span className="sora text-base sm:text-lg font-bold text-[#E3B04B] tracking-wide">
                        {formatTime(timeLeft)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-[rgba(43,181,154,0.08)] border border-[rgba(43,181,154,0.2)]">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#2BB59A] uppercase tracking-wider">
                      <span className="material-symbols-outlined text-[16px]">
                        check_circle
                      </span>
                      Ready to Claim
                    </div>
                    <p className="text-xs text-[#9DB5AF] mt-1">
                      Your wallet is eligible to claim 1,000 mUSDC. Press the button
                      below to mint tokens to your address.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleClaim}
                disabled={isClaiming || (!canClaim && timeLeft > 0)}
                className={`flex-1 h-12 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all ${
                  isClaiming || (!canClaim && timeLeft > 0)
                    ? "bg-[#1E433F] text-[#698B84] cursor-not-allowed border border-[rgba(246,241,231,0.05)]"
                    : "bg-[#2BB59A] hover:bg-[#259e87] text-[#0E2927] shadow-[0_4px_20px_rgba(43,181,154,0.3)] hover:shadow-[0_6px_24px_rgba(43,181,154,0.4)] active:scale-[0.98] cursor-pointer"
                }`}
              >
                {isClaiming ? (
                  <>
                    <span className="w-4 h-4 border-2 border-[#0E2927] border-t-transparent rounded-full animate-spin" />
                    <span>
                      {isWritePending ? "Confirm in Wallet..." : "Dispensing Tokens..."}
                    </span>
                  </>
                ) : !canClaim && timeLeft > 0 ? (
                  <>
                    <span className="material-symbols-outlined text-[18px]">
                      lock_clock
                    </span>
                    <span>Cooldown Active</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">
                      water_drop
                    </span>
                    <span>Claim 1,000 mUSDC</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleAddToMetaMask}
                className="px-4 h-12 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-xs sm:text-sm font-medium text-[#F6F1E7] transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px] text-[#2BB59A]">
                  account_balance_wallet
                </span>
                <span>{addedToWallet ? "Added to Wallet ✓" : "Add to MetaMask"}</span>
              </button>
            </div>
          </div>

          {/* Wallet Balance & Info Sidebar */}
          <div className="flex flex-col gap-6">
            {/* Balance Card */}
            <div className="rounded-2xl bg-[#143734] border border-[rgba(246,241,231,0.08)] p-6">
              <span className="text-xs uppercase tracking-wider text-[#9DB5AF] font-medium">
                Your mUSDC Balance
              </span>
              <div className="sora text-2xl sm:text-3xl font-bold text-[#F6F1E7] mt-1">
                {fmtUSDC(balance, "")}{" "}
                <span className="text-sm font-normal text-[#2BB59A]">mUSDC</span>
              </div>
              <p className="text-xs text-[#9DB5AF] mt-2">
                Connected:{" "}
                <span className="font-mono text-[#F6F1E7]">
                  {address
                    ? `${address.slice(0, 6)}...${address.slice(-4)}`
                    : "Not connected"}
                </span>
              </p>
            </div>

            {/* Token Info Card */}
            <div className="rounded-2xl bg-[#143734] border border-[rgba(246,241,231,0.08)] p-6 flex flex-col gap-3.5 text-xs">
              <div className="text-[11px] uppercase tracking-wider text-[#9DB5AF] font-semibold">
                Token Specifications
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-[rgba(246,241,231,0.06)]">
                <span className="text-[#9DB5AF]">Token Name</span>
                <span className="font-medium text-[#F6F1E7]">Mock USDC</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-[rgba(246,241,231,0.06)]">
                <span className="text-[#9DB5AF]">Symbol</span>
                <span className="font-medium text-[#2BB59A]">mUSDC</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-[rgba(246,241,231,0.06)]">
                <span className="text-[#9DB5AF]">Decimals</span>
                <span className="font-medium text-[#F6F1E7]">6 (USDC Standard)</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-[rgba(246,241,231,0.06)]">
                <span className="text-[#9DB5AF]">Network</span>
                <span className="font-medium text-[#E3B04B]">Ethereum Sepolia</span>
              </div>
              <div className="flex flex-col gap-1 pt-1">
                <span className="text-[#9DB5AF]">Contract Address</span>
                <a
                  href={`https://sepolia.etherscan.io/address/${ADDRESSES.mockUSDC}#code`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[11px] text-[#2BB59A] hover:underline break-all"
                >
                  {ADDRESSES.mockUSDC}
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
