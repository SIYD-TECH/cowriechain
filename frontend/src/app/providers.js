"use client";

// SSR compatibility polyfill for WalletConnect / idb-keyval when executing on Node.js
if (typeof window === "undefined" && typeof globalThis.indexedDB === "undefined") {
  const memoryStore = new Map();
  const createMockRequest = (result, tx) => {
    const req = {
      result,
      transaction: tx,
      onsuccess: null,
      onerror: null,
      oncomplete: null,
      continue: () => {},
    };
    queueMicrotask(() => {
      if (typeof req.onsuccess === "function") req.onsuccess.call(req, { target: req });
      if (typeof req.oncomplete === "function") req.oncomplete.call(req, { target: req });
    });
    return req;
  };

  const createMockTx = () => {
    const tx = {
      oncomplete: null,
      onsuccess: null,
      onerror: null,
      onabort: null,
    };
    const store = {
      transaction: tx,
      get: (key) => createMockRequest(memoryStore.get(key), tx),
      put: (val, key) => {
        memoryStore.set(key, val);
        return createMockRequest(undefined, tx);
      },
      delete: (key) => {
        memoryStore.delete(key);
        return createMockRequest(undefined, tx);
      },
      clear: () => {
        memoryStore.clear();
        return createMockRequest(undefined, tx);
      },
      getAllKeys: () => createMockRequest([...memoryStore.keys()], tx),
      openCursor: () => createMockRequest(null, tx),
    };
    tx.objectStore = () => store;
    queueMicrotask(() => {
      if (typeof tx.oncomplete === "function") tx.oncomplete.call(tx, { target: tx });
      if (typeof tx.onsuccess === "function") tx.onsuccess.call(tx, { target: tx });
    });
    return tx;
  };

  globalThis.indexedDB = {
    open: () => {
      const db = {
        createObjectStore: () => createMockTx().objectStore(),
        transaction: createMockTx,
      };

      const req = {
        result: db,
        onsuccess: null,
        onerror: null,
        onupgradeneeded: null,
      };

      queueMicrotask(() => {
        if (typeof req.onupgradeneeded === "function") req.onupgradeneeded.call(req, { target: req });
        if (typeof req.onsuccess === "function") req.onsuccess.call(req, { target: req });
      });

      return req;
    },
  };
}

import { WagmiProvider, http, createStorage, cookieStorage } from "wagmi";
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
  storage: createStorage({
    storage: cookieStorage,
  }),
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
