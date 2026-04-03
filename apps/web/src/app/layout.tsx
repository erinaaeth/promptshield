import type { Metadata } from "next";
import "./globals.css";
import { MockWalletProvider } from "@/components/providers/mock-wallet-provider";

export const metadata: Metadata = {
  title: "PromptShield — AI Jailbreak Firewall for OWS Wallets",
  description:
    "PromptShield adds a policy-controlled firewall layer between AI-generated requests and wallet execution. Protect your OWS wallet from dangerous prompt injections.",
  keywords: ["AI safety", "wallet security", "prompt injection", "OWS", "blockchain", "firewall"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="noise-bg">
        <MockWalletProvider>{children}</MockWalletProvider>
      </body>
    </html>
  );
}
