"use client";

import { Transaction, RiskLevel } from "@/types";

interface TransactionDetailProps {
  transaction: Transaction;
  processing?: boolean;
  phase?: "prompt" | "ai" | "draft" | "policy" | "trust" | "verdict" | "done";
  analysisSummary?: string[];
  verdictStatus?: "blocked" | "allowed";
  walletConnected?: boolean;
  walletAddress?: string | null;
  walletStatus?: string;
}

const riskConfig: Record<RiskLevel, { label: string; color: string; bg: string; border: string }> = {
  critical: { label: "CRITICAL", color: "text-danger", bg: "bg-danger-subtle", border: "border-danger/20" },
  high: { label: "HIGH", color: "text-danger", bg: "bg-danger-subtle/60", border: "border-danger/15" },
  medium: { label: "MEDIUM", color: "text-warning", bg: "bg-warning-subtle", border: "border-warning/30" },
  low: { label: "LOW", color: "text-accent", bg: "bg-accent-subtle", border: "border-accent/20" },
};

const chainLabels: Record<string, string> = {
  ethereum: "Ethereum",
  polygon: "Polygon",
  arbitrum: "Arbitrum",
  base: "Base",
  optimism: "Optimism",
};

function compactAddress(value: string) {
  if (!value || value.length < 16 || !value.startsWith("0x")) return value;
  return `${value.slice(0, 8)}...${value.slice(-6)}`;
}

function DataRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-border last:border-0">
      <span className="min-w-[110px] text-[13px] font-mono text-text-muted">{label}</span>
      <span
        className={`ml-4 max-w-[180px] break-words text-right text-[14px] font-mono ${
          highlight ? "text-danger font-medium" : "text-text-primary"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export default function TransactionDetail({
  transaction,
  processing = false,
  phase = "done",
  analysisSummary = [],
  verdictStatus = "blocked",
  walletConnected = false,
  walletAddress = null,
  walletStatus: connectionStatus = "Disconnected",
}: TransactionDetailProps) {
  const risk = riskConfig[transaction.riskLevel];
  const isDangerous = transaction.riskLevel === "critical" || transaction.riskLevel === "high";
  const aiReady = phase !== "prompt";
  const draftReady = phase === "draft" || phase === "policy" || phase === "trust" || phase === "verdict" || phase === "done";
  const policyReady = phase === "policy" || phase === "trust" || phase === "verdict" || phase === "done";
  const phaseChip =
    phase === "prompt"
      ? { label: "Parsing", color: "text-warning bg-warning-subtle border-warning/30" }
      : phase === "ai" || phase === "draft"
      ? { label: "Generating", color: "text-warning bg-warning-subtle border-warning/30" }
      : phase === "policy"
      ? { label: "Evaluating", color: "text-warning bg-warning-subtle border-warning/30" }
      : verdictStatus === "allowed"
      ? { label: "Verified", color: "text-accent bg-accent-subtle border-accent/20" }
      : { label: "Flagged", color: "text-danger bg-danger-subtle border-danger/20" };
  const riskScore =
    verdictStatus === "allowed"
      ? transaction.action === "signMessage"
        ? 8
        : transaction.action === "transfer"
        ? 14
        : 18
      : transaction.riskLevel === "critical"
      ? 96
      : transaction.riskLevel === "high"
      ? 88
      : transaction.riskLevel === "medium"
      ? 54
      : 22;
  const walletStatus =
    !walletConnected
      ? "Wallet required for full execution simulation"
      : verdictStatus === "blocked"
      ? "Signing request denied by policy"
      : phase === "verdict" || phase === "done"
      ? "Ready for signature"
      : "Awaiting user signature";

  return (
    <div className={`bg-surface border border-border rounded-2xl shadow-card flex flex-col h-full transition-all duration-300 ${processing ? "opacity-85" : "panel-float-in"}`}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-border">
        <p className="mb-1 text-[13px] font-semibold uppercase tracking-[0.15em] text-text-muted">
          PromptShield AI Security Layer
        </p>
        <h3 className="text-[18px] font-semibold text-text-primary">Generated Transaction</h3>
      </div>

      <div className="flex-1 flex flex-col gap-7 p-6 overflow-y-auto">
        {/* Risk indicator */}
        <div
          className={`rounded-xl border px-4 py-3 transition-all duration-300 ${risk.bg} ${risk.border} ${processing ? "processing-sheen bg-[length:220%_100%]" : ""}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold uppercase tracking-wider text-text-muted">
              {phase === "ai" || phase === "draft" ? "Analysis State" : processing ? "Evaluation" : "Risk Level"}
            </span>
            <span className={`text-[14px] font-bold tracking-wide ${phase === "ai" || phase === "draft" || (processing && !policyReady) ? "text-warning" : risk.color}`}>
              {phase === "ai" || phase === "draft" ? "GENERATING" : processing && !policyReady ? "PENDING" : risk.label}
            </span>
          </div>
          <div className="mt-2 flex gap-1">
            {["critical", "high", "medium", "low"].map((level, i) => {
              const active =
                transaction.riskLevel === "critical"
                  ? i <= 0
                  : transaction.riskLevel === "high"
                  ? i <= 1
                  : transaction.riskLevel === "medium"
                  ? i <= 2
                  : i <= 3;
              return (
                <div
                  key={level}
                  className={`flex-1 h-1 rounded-full transition-colors ${
                    active
                      ? phase === "ai" || phase === "draft" || (processing && !policyReady)
                        ? "bg-warning/50"
                        : transaction.riskLevel === "critical" || transaction.riskLevel === "high"
                        ? "bg-danger/60"
                        : transaction.riskLevel === "medium"
                        ? "bg-warning/60"
                        : "bg-accent-light/60"
                      : "bg-border"
                  }`}
                />
              );
            })}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2.5 gap-3">
            <p className="text-[13px] font-semibold uppercase tracking-wider text-text-muted">
              AI Analysis Summary
            </p>
            <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.12em] ${phaseChip.color}`}>
              {phaseChip.label}
            </span>
          </div>
          <div className="bg-surface-2 border border-border rounded-xl p-3.5 space-y-2.5">
            {analysisSummary.slice(0, 3).map((item, index) => (
              <div
                key={`${item}-${index}`}
                className={`flex items-start gap-2.5 text-[14px] leading-[1.68] transition-all duration-300 ${
                  processing ? "opacity-90" : "rule-reveal"
                }`}
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <span
                  className={`mt-[5px] h-1.5 w-1.5 rounded-full flex-shrink-0 ${
                    verdictStatus === "allowed" ? "bg-accent-light" : "bg-warning"
                  }`}
                />
                <span className="text-text-secondary">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface-2 p-3.5">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[13px] font-semibold uppercase tracking-wider text-text-muted">
              Risk Score
            </p>
            <span className={`text-[16px] font-bold ${riskScore >= 80 ? "text-danger" : riskScore >= 40 ? "text-warning" : "text-accent"}`}>
              {riskScore}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-border">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                riskScore >= 80
                  ? "bg-gradient-to-r from-danger-light to-danger"
                  : riskScore >= 40
                  ? "bg-gradient-to-r from-warning to-[#F3C66B]"
                  : "bg-gradient-to-r from-accent-light to-accent"
              }`}
              style={{ width: `${riskScore}%` }}
            />
          </div>
        </div>

        {/* Transaction fields */}
        <div>
          <p className="mb-2.5 text-[13px] font-semibold uppercase tracking-wider text-text-muted">
            Transaction Details
          </p>
          <div className="bg-surface-2 border border-border rounded-xl px-4 py-1">
            <DataRow label="action" value={draftReady ? transaction.action : "classifying..."} />
            <DataRow label="chain" value={aiReady ? chainLabels[transaction.chain] ?? transaction.chain : "resolving..."} />
            <DataRow label="token" value={draftReady ? transaction.token : "classifying..."} />
            <DataRow label="amount" value={draftReady ? transaction.amount : "synthesizing..."} highlight={policyReady && isDangerous} />
            <DataRow label="recipient" value={draftReady ? compactAddress(transaction.recipient) : "deriving target..."} highlight={policyReady && isDangerous && transaction.recipient !== "N/A (off-chain)"} />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface-2 p-3.5">
          <div className="mb-2.5 flex items-center justify-between gap-3">
            <p className="text-[13px] font-semibold uppercase tracking-wider text-text-muted">
              Wallet Layer
            </p>
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.12em] ${
                !walletConnected
                  ? "border-border bg-surface text-text-muted"
                  : verdictStatus === "blocked"
                  ? "border-danger/20 bg-danger-subtle text-danger"
                  : phase === "verdict" || phase === "done"
                  ? "border-accent/20 bg-accent-subtle text-accent"
                  : "border-warning/25 bg-warning-subtle text-warning"
              }`}
            >
              {!walletConnected
                ? "Offline"
                : verdictStatus === "blocked"
                ? "Denied"
                : phase === "verdict" || phase === "done"
                ? "Ready"
                : "Awaiting"}
            </span>
          </div>
          <div className="mb-3 rounded-xl border border-border bg-surface px-3 py-3">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-text-muted">
                    Connected Wallet
                  </p>
                  <p className="mt-1 font-mono text-[13px] text-text-primary">
                    {walletAddress ? compactAddress(walletAddress) : "Connect wallet to simulate signing layer"}
                  </p>
                </div>
                <span className={`inline-flex items-center gap-1.5 text-[12px] font-medium ${
                  walletConnected ? "text-accent" : "text-text-muted"
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${walletConnected ? "bg-accent-light" : "bg-text-muted"}`} />
                  {connectionStatus}
                </span>
              </div>
              <div className="border-t border-border pt-3">
                <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-text-muted">
                  Signing Status
                </p>
                <p className={`mt-1 text-[14px] font-semibold ${
                  !walletConnected
                    ? "text-text-muted"
                    : verdictStatus === "blocked"
                    ? "text-danger"
                    : phase === "verdict" || phase === "done"
                    ? "text-accent"
                    : "text-warning"
                }`}>
                  {walletStatus}
                </p>
              </div>
            </div>
          </div>
          <p className={`text-[15px] font-semibold ${
            !walletConnected
              ? "text-text-muted"
              : verdictStatus === "blocked"
              ? "text-danger"
              : phase === "verdict" || phase === "done"
              ? "text-accent"
              : "text-warning"
          }`}>
            {walletStatus}
          </p>
          <p className="mt-1.5 text-[13px] leading-[1.65] text-text-muted">
            {!walletConnected
              ? "Connect wallet to simulate signing."
              : verdictStatus === "blocked"
              ? "Transaction blocked before reaching the OWS signing layer."
              : phase === "verdict" || phase === "done"
              ? "Transaction approved and ready for OWS signature."
              : "Policy checks passed. Waiting for wallet confirmation."}
          </p>
        </div>
      </div>
    </div>
  );
}
