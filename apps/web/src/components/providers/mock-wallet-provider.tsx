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

const STORAGE_KEY = "promptshield.mock-wallet.connected";
const ADDRESS_STORAGE_KEY = "promptshield.mock-wallet.address";

const MockWalletContext = createContext<MockWalletContextValue | null>(null);

function shortenAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function generateMockAddress() {
  const bytes = new Uint8Array(20);
  window.crypto.getRandomValues(bytes);
  return `0x${Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")}`;
}

export function MockWalletProvider({ children }: { children: React.ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const savedAddress = window.localStorage.getItem(ADDRESS_STORAGE_KEY);
    if (saved === "true" && savedAddress) {
      setConnected(true);
      setAddress(savedAddress);
    }
  }, []);

  const connect = useCallback(async () => {
    if (connected || connecting) return;
    setConnecting(true);
    await new Promise((resolve) => window.setTimeout(resolve, 500));
    const nextAddress = generateMockAddress();
    setAddress(nextAddress);
    setConnected(true);
    setConnecting(false);
    window.localStorage.setItem(STORAGE_KEY, "true");
    window.localStorage.setItem(ADDRESS_STORAGE_KEY, nextAddress);
  }, [connected, connecting]);

  const disconnect = useCallback(() => {
    setConnecting(false);
    setConnected(false);
    setAddress(null);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, "false");
      window.localStorage.removeItem(ADDRESS_STORAGE_KEY);
    }
  }, []);

  const value = useMemo<MockWalletContextValue>(
    () => ({
      connected,
      connecting,
      address: connected ? address : null,
      shortAddress: connected && address ? shortenAddress(address) : null,
      network: "Ethereum Mainnet",
      status: connected ? "Connected" : "Disconnected",
      connect,
      disconnect,
    }),
    [address, connect, connected, connecting, disconnect],
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
