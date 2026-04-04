"use client";

import { useEffect, useMemo, useState } from "react";
import { FirewallVerdict } from "@/types";

interface VerdictCardProps {
  verdict: FirewallVerdict;
  processing?: boolean;
  scenarioId?: string;
  phase?: "prompt" | "ai" | "draft" | "policy" | "trust" | "verdict" | "done";
}

function getDecisionRule(verdict: FirewallVerdict) {
  if (verdict.status === "allowed") {
    return {
      title: "Transaction within safe threshold",
      detail: "Amount, action type, and recipient trust all satisfy the active PromptShield OWS policy.",
    };
  }

  const primaryReason = verdict.reasons[0]?.toLowerCase() ?? "";

  if (primaryReason.includes("amount")) {
    return {
      title: "Amount exceeds allowed policy limit",
      detail: "The requested value is above the safe transfer window configured by the security policy.",
    };
  }

  if (primaryReason.includes("recipient")) {
    return {
      title: "Recipient is not approved",
      detail: "The destination is outside the approved allowlist, so the request is blocked before signing.",
    };
  }

  if (primaryReason.includes("approval")) {
    return {
      title: "Approval request blocked by policy",
      detail: "Unlimited or unsafe approval patterns are blocked by default before they reach the signing layer.",
    };
  }

  return {
    title: "Transaction violates active policy",
    detail: "PromptShield detected a rule conflict and blocked the request before it reached OWS signing.",
  };
}

export default function VerdictCard({
  verdict,
  processing = false,
  scenarioId = "default",
  phase = "done",
}: VerdictCardProps) {
  const isBlocked = verdict.status === "blocked";
  const decisionRule = getDecisionRule(verdict);
  const [revealedReasons, setRevealedReasons] = useState(0);
  const revealKey = useMemo(() => `${scenarioId}-${verdict.status}`, [scenarioId, verdict.status]);
  const policyReady = phase === "policy" || phase === "trust" || phase === "verdict" || phase === "done";
  const verdictReady = phase === "verdict" || phase === "done";

  useEffect(() => {
    if (!verdictReady) {
      setRevealedReasons(0);
      return;
    }

    setRevealedReasons(0);

    const reasonTimer = window.setInterval(() => {
      setRevealedReasons((value) => {
        if (value >= verdict.reasons.length) {
          window.clearInterval(reasonTimer);
          return value;
        }
        return value + 1;
      });
    }, 110);

    return () => {
      window.clearInterval(reasonTimer);
    };
  }, [revealKey, verdict.reasons.length, verdictReady]);

  return (
    <div className={`bg-surface border border-border rounded-2xl shadow-card flex flex-col h-full transition-all duration-300 ${processing ? "opacity-85" : "panel-float-in"}`}>
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-border">
        <p className="mb-1 text-[12px] font-semibold uppercase tracking-[0.15em] text-text-muted">
          Policy Layer
        </p>
        <h3 className="text-[16px] font-semibold text-text-primary">Firewall Verdict</h3>
      </div>

      <div className="flex-1 flex flex-col gap-6 p-5 overflow-y-auto">
        {/* Big verdict badge */}
        <div
          key={revealKey}
          className={`rounded-2xl border-2 p-4 text-center transition-all duration-500 ${
            !verdictReady
              ? "border-warning/20 bg-gradient-to-br from-warning-subtle/70 to-[#FFF3D6]"
              : isBlocked
              ? "border-danger/25 bg-gradient-to-br from-danger-subtle to-[#FDE8E8]"
              : "border-accent/25 bg-gradient-to-br from-accent-subtle to-[#DDFADF]"
          } ${verdictReady && !processing ? "verdict-reveal" : ""} ${verdictReady && !processing && !isBlocked ? "shadow-[0_22px_48px_rgba(34,197,94,0.10),0_0_0_1px_rgba(34,197,94,0.06),0_0_30px_rgba(74,222,128,0.14)]" : ""}`}
        >
          <div className={`w-10 h-10 rounded-2xl mx-auto mb-3 flex items-center justify-center ${
            !verdictReady ? "bg-warning/10" : isBlocked ? "bg-danger/10" : "bg-accent/10"
          }`}>
            {!verdictReady ? (
              <svg className="w-5 h-5 animate-pulse text-warning" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v7l4 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            ) : isBlocked ? (
              <svg className="w-5 h-5 text-danger" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L20 6V11C20 15.5 16.5 19.5 12 21C7.5 19.5 4 15.5 4 11V6L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M9 9L15 15M15 9L9 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-accent" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L20 6V11C20 15.5 16.5 19.5 12 21C7.5 19.5 4 15.5 4 11V6L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M8.5 12L10.5 14L15.5 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <p className={`text-[2.15rem] font-bold tracking-tight ${!verdictReady ? "text-warning" : isBlocked ? "text-danger" : "text-accent"}`}>
            {!verdictReady ? "PENDING" : isBlocked ? "BLOCKED" : "ALLOWED"}
          </p>
          <p className={`mt-2 text-[12px] leading-[1.55] ${!verdictReady ? "text-warning/70" : isBlocked ? "text-danger/70" : "text-accent/70"}`}>
            {!verdictReady
              ? policyReady
                ? "Finalizing policy verdict"
                : "Waiting for structured request analysis"
              : isBlocked
              ? "Blocked before signing"
              : "Ready for wallet signature"}
          </p>
          {verdictReady && isBlocked && (
            <p className="mt-2.5 inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-danger/90">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-danger/10">
                <svg className="h-3 w-3 text-danger" viewBox="0 0 12 12" fill="none">
                  <path d="M3 3L9 9M9 3L3 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </span>
              Unsafe transaction stopped before OWS signing
            </p>
          )}
          {verdictReady && !isBlocked && (
            <p className="mt-2.5 inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-accent/90">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent/10">
                <svg className="h-3 w-3 text-accent" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              Policy checks passed and request can reach the OWS wallet layer
            </p>
          )}
        </div>

        {/* Meta */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-surface-2 border border-border rounded-xl p-3">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Severity</p>
            <p className={`text-[15px] font-bold uppercase tracking-wide ${
              verdict.severity === "critical" || verdict.severity === "high" ? "text-danger" :
              verdict.severity === "medium" ? "text-warning" : "text-accent"
            }`}>{verdict.severity}</p>
          </div>
          <div className="bg-surface-2 border border-border rounded-xl p-3">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Eval Time</p>
            <p className="text-[15px] font-mono font-medium text-text-primary">{verdict.executionTime}ms</p>
          </div>
        </div>

        {verdictReady && (
          <div
            className={`rounded-xl border p-4 ${
              isBlocked
                ? "border-danger/15 bg-danger-subtle/45"
                : "border-accent/15 bg-accent-subtle/45"
            }`}
          >
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted">
              Decision Rule
            </p>
            <p className={`text-[15px] font-semibold leading-[1.35] ${isBlocked ? "text-danger" : "text-accent"}`}>
              {decisionRule.title}
            </p>
            <p className="mt-1.5 text-[12px] leading-[1.65] text-text-secondary">
              {decisionRule.detail}
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-2.5 py-1 text-[11px] font-medium text-text-secondary">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-light" />
            OWS Secured
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-2.5 py-1 text-[11px] font-medium text-text-secondary">
            <span className={`h-1.5 w-1.5 rounded-full ${isBlocked ? "bg-danger-light" : "bg-accent-light"}`} />
            {isBlocked ? "Blocked state verified" : "Verified execution path"}
          </span>
        </div>

        {verdict.reasons.length > 0 && verdictReady && (
          <div>
            <p className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-text-muted">
              {isBlocked ? "Key Reasons" : "Approval Signal"}
            </p>
            <div className="flex flex-col gap-2">
              {verdict.reasons.slice(0, 2).map((reason, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-2.5 p-3 rounded-xl border text-[13px] leading-[1.6] ${
                    isBlocked
                      ? "bg-danger-subtle/50 border-danger/10 text-danger/80"
                      : "bg-accent-subtle/50 border-accent/10 text-accent/80"
                  } ${!verdictReady || i >= revealedReasons ? "opacity-50" : "opacity-100 rule-reveal"}`}
                  style={verdictReady && i < revealedReasons ? { animationDelay: `${i * 70}ms` } : undefined}
                >
                  <span className="mt-0.5 flex-shrink-0">
                    {isBlocked ? "✗" : "✓"}
                  </span>
                  {reason}
                </div>
              ))}
            </div>
          </div>
        )}

        {verdictReady && isBlocked && (
          <div className="mt-1 rounded-[16px] border-2 border-danger/20 bg-danger-subtle px-4 py-4">
            <div className="mb-4 flex items-center gap-2.5">
              <span className="text-[22px] leading-none">🛡️</span>
              <h3 className="m-0 text-[15px] font-bold text-danger">
                PromptShield detected the following risks
              </h3>
            </div>

            <div className="grid gap-3.5">
              <div className="flex items-start gap-3">
                <span className="text-[18px] leading-none text-danger">⚠️</span>
                <div className="text-[12px] leading-[1.65] text-danger/85">
                  <strong>Override / Ignore Instruction Pattern</strong>
                  <br />
                  The AI prompt contains phrases such as "ignore previous instructions" and "emergency".
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[18px] leading-none text-danger">💸</span>
                <div className="text-[12px] leading-[1.65] text-danger/85">
                  <strong>Full Balance Drain</strong>
                  <br />
                  The request attempts a 100% balance transfer (14.82 ETH), which violates policy.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[18px] leading-none text-danger">❌</span>
                <div className="text-[12px] leading-[1.65] text-danger/85">
                  <strong>Untrusted Recipient</strong>
                  <br />
                  The recipient address is outside the approved allowlist.
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-[12px] border-l-[5px] border-danger bg-surface px-4 py-4 text-[12px] leading-[1.65] text-text-secondary">
              <strong className="text-danger">Decision:</strong> This request was <strong>blocked before signing (pre-signing)</strong>.
              <br />
              <span className="text-text-secondary">PromptShield and the OWS Policy Engine successfully protected the wallet.</span>
            </div>

            <div className="mt-4 text-center text-[12px] text-text-muted">
              Evaluation Time: <strong>38ms</strong> | Confidence: <strong>96%</strong>
            </div>
          </div>
        )}

        {/* Policy version */}
        <div className="mt-auto pt-2 border-t border-border flex items-center justify-between">
          <span className="text-[12px] text-text-muted">Policy Version</span>
          <span className="font-mono text-[12px] text-text-secondary">{verdict.policyVersion}</span>
        </div>
      </div>
    </div>
  );
}
