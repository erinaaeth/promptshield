"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useMockWallet } from "@/components/providers/mock-wallet-provider";

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [walletMenuOpen, setWalletMenuOpen] = useState(false);
  const walletMenuRef = useRef<HTMLDivElement>(null);
  const stableContainer = "mx-auto w-full max-w-[1280px] px-6";
  const { connected, connecting, shortAddress, address, network, status, connect, disconnect } =
    useMockWallet();

  const navLinks = [
    { href: "/demo", label: "Demo" },
    { href: "/architecture", label: "Architecture" },
    { href: "https://github.com", label: "GitHub", external: true },
  ];

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!walletMenuRef.current?.contains(event.target as Node)) {
        setWalletMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/92 backdrop-blur-md">
      <div className={`${stableContainer} h-[74px] flex items-center justify-between`}>
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-ink flex items-center justify-center shadow-card">
            <ShieldIcon className="w-[18px] h-[18px] text-background" />
          </div>
          <span className="font-semibold text-text-primary tracking-tight text-[17px]">
            PromptShield
          </span>
          <span className="hidden lg:inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent-subtle px-3.5 py-1.5 text-[12px] font-semibold tracking-[0.08em] text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-light" />
            OWS Secured
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1.5">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              className={`px-4 py-2.5 rounded-lg text-[15px] font-medium transition-colors ${
                pathname === link.href
                  ? "text-text-primary bg-surface shadow-card"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-2"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <div className="relative" ref={walletMenuRef}>
            {!connected ? (
              <button
                type="button"
                onClick={connect}
                disabled={connecting}
                className={`inline-flex items-center gap-2 rounded-lg border px-5 py-2.5 text-[15px] font-semibold transition-all shadow-card ${
                  connecting
                    ? "cursor-wait border-border bg-surface text-text-muted"
                    : "border-accent/20 bg-accent text-background hover:bg-accent/92"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${connecting ? "bg-text-muted animate-pulse" : "bg-background/80"}`}
                />
                {connecting ? "Connecting..." : "Connect Wallet"}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setWalletMenuOpen((value) => !value)}
                  className="inline-flex items-center gap-2 rounded-lg border border-accent/20 bg-accent-subtle px-4 py-2.5 text-[15px] font-semibold text-accent transition-all shadow-card hover:shadow-card-hover hover:scale-[1.01]"
                >
                  <span className="h-2 w-2 rounded-full bg-accent-light" />
                  {shortAddress}
                  <span className="text-[13px] font-medium text-accent/80">Connected</span>
                </button>
                {walletMenuOpen && (
                  <div className="absolute right-0 top-[calc(100%+10px)] w-[280px] rounded-2xl border border-border bg-surface p-4 shadow-card-strong">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-text-muted">
                          OpenWallet Session
                        </p>
                        <p className="mt-1 font-mono text-[13px] leading-[1.6] text-text-primary">
                          {address}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent-subtle px-2.5 py-1 text-[11px] font-semibold text-accent">
                        <span className="h-1.5 w-1.5 rounded-full bg-accent-light" />
                        {status}
                      </span>
                    </div>
                    <div className="mt-4 space-y-2 rounded-xl border border-border bg-surface-2 p-3.5">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-text-muted">
                          Network
                        </span>
                        <span className="text-[13px] font-medium text-text-primary">{network}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-text-muted">
                          Status
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-accent">
                          <span className="h-1.5 w-1.5 rounded-full bg-accent-light" />
                          Connected
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        disconnect();
                        setWalletMenuOpen(false);
                      }}
                      className="mt-4 w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-[14px] font-medium text-text-primary transition-all hover:border-border-strong hover:bg-background"
                    >
                      Disconnect
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-surface transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <CloseIcon className="w-5 h-5 text-text-primary" />
          ) : (
            <MenuIcon className="w-5 h-5 text-text-primary" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="px-6 py-4 flex flex-col gap-1">
            {!connected ? (
              <button
                type="button"
                onClick={connect}
                disabled={connecting}
                className={`mb-3 rounded-lg px-3 py-2.5 text-sm font-medium text-center shadow-card transition-all ${
                  connecting
                    ? "cursor-wait border border-border bg-surface text-text-muted"
                    : "bg-accent text-background"
                }`}
              >
                {connecting ? "Connecting..." : "Connect Wallet"}
              </button>
            ) : (
              <div className="mb-3 rounded-xl border border-accent/20 bg-accent-subtle p-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-accent">{shortAddress}</span>
                  <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-accent">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent-light" />
                    Connected
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    disconnect();
                    setMenuOpen(false);
                  }}
                  className="mt-3 w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm font-medium text-text-primary"
                >
                  Disconnect
                </button>
              </div>
            )}
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                className="px-3 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/demo"
              className="mt-2 px-3 py-2.5 rounded-lg bg-accent text-background text-sm font-medium text-center shadow-card"
              onClick={() => setMenuOpen(false)}
            >
              Launch App
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8 1L13 3.5V7.5C13 10.5 10.5 13 8 14.5C5.5 13 3 10.5 3 7.5V3.5L8 1Z"
        fill="currentColor"
        fillOpacity="0.3"
      />
      <path
        d="M8 1L13 3.5V7.5C13 10.5 10.5 13 8 14.5C5.5 13 3 10.5 3 7.5V3.5L8 1Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M5.5 8L7 9.5L10.5 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 5H17M3 10H17M3 15H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
