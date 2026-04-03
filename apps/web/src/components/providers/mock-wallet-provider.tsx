"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface MockWalletContextValue {
  connected: boolean;
  connecting: boolean;
  address: string | null;
  shortAddress: string | null;
  network: string;
  status: "Connected" | "Disconnected";
  connect: () => Promise<void>;
  disconnect: () => void;
}

const MOCK_ADDRESS = "0xA3F9B72C14D81F5A9B3E44218F5D92A11D779C21";
const STORAGE_KEY = "promptshield.mock-wallet.connected";

const MockWalletContext = createContext<MockWalletContextValue | null>(null);

function shortenAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function MockWalletProvider({ children }: { children: React.ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "true") {
      setConnected(true);
    }
  }, []);

  const connect = useCallback(async () => {
    if (connected || connecting) return;
    setConnecting(true);
    await new Promise((resolve) => window.setTimeout(resolve, 500));
    setConnected(true);
    setConnecting(false);
    window.localStorage.setItem(STORAGE_KEY, "true");
  }, [connected, connecting]);

  const disconnect = useCallback(() => {
    setConnecting(false);
    setConnected(false);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, "false");
    }
  }, []);

  const value = useMemo<MockWalletContextValue>(
    () => ({
      connected,
      connecting,
      address: connected ? MOCK_ADDRESS : null,
      shortAddress: connected ? shortenAddress(MOCK_ADDRESS) : null,
      network: "Ethereum Mainnet",
      status: connected ? "Connected" : "Disconnected",
      connect,
      disconnect,
    }),
    [connect, connected, connecting, disconnect],
  );

  return <MockWalletContext.Provider value={value}>{children}</MockWalletContext.Provider>;
}

export function useMockWallet() {
  const context = useContext(MockWalletContext);
  if (!context) {
    throw new Error("useMockWallet must be used within MockWalletProvider");
  }
  return context;
}
