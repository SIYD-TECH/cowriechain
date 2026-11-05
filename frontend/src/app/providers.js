"use client";

if (typeof window === "undefined") {
  globalThis.indexedDB = undefined;
}

import { WagmiProvider, http } from "wagmi";
import { sepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { useState, useEffect } from "react";
import "@rainbow-me/rainbowkit/styles.css";

const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ||
  "b0ed2f41971704df2800043e6799378c";

const rpcUrl = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL;

const config = getDefaultConfig({
  appName: "CowrieChain",
  projectId,
  chains: [sepolia],
  transports: {
    [sepolia.id]: rpcUrl ? http(rpcUrl) : http(),
  },
  ssr: true,
});

export default function Providers({ children }) {
  const [mounted, setMounted] = useState(false);
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 10_000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider initialChain={sepolia}>
          {mounted ? children : null}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
