import type { Metadata } from "next";
import { Instrument_Serif, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { MockWalletProvider } from "@/components/providers/mock-wallet-provider";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-satoshi",
  display: "swap",
});

const serif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-instrument",
  weight: "400",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

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
    <html lang="en" className={`${sans.variable} ${serif.variable} ${mono.variable}`}>
      <body className="noise-bg font-sans">
        <MockWalletProvider>{children}</MockWalletProvider>
      </body>
    </html>
  );
}
