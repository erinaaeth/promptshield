"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PromptConsole from "@/components/demo/PromptConsole";
import TransactionDetail from "@/components/demo/TransactionDetail";
import VerdictCard from "@/components/demo/VerdictCard";
import AuditLog from "@/components/demo/AuditLog";
import ExplorerModal from "@/components/demo/ExplorerModal";
import Badge from "@/components/ui/Badge";
import { useMockWallet } from "@/components/providers/mock-wallet-provider";
import { demoScenarios, defaultScenario } from "@/lib/mockData";
import { AuditEvent, CustomSimulationInput, DemoScenario, FirewallVerdict, Transaction } from "@/types";

type DemoPhase = "prompt" | "ai" | "draft" | "policy" | "trust" | "verdict" | "done";

const pipelineSteps = [
  "Analyzing prompt...",
  "Evaluating policy...",
  "Checking transaction...",
  "Returning result",
] as const;

const stepDurations = [320, 320, 360, 320, 280, 220] as const;
function formatActionLabel(action: string) {
  if (action === "signMessage") return "message signing";
  if (action === "approve") return "token approval";
  return action;
}

function buildAnalysisSummary(scenario: DemoScenario) {
  const prompt = scenario.prompt.toLowerCase();
  const amount = scenario.transaction.amount.toLowerCase();
  const isSafe = scenario.verdict.status === "allowed";

  if (isSafe) {
    return [
      scenario.transaction.action === "signMessage"
        ? "Request classified as benign off-chain signing intent"
        : "Prompt classified as a legitimate OWS wallet action within policy scope",
      scenario.transaction.recipient.includes("N/A")
        ? "No on-chain recipient risk detected for this request"
        : "Recipient matches the approved allowlist and trusted wallet context",
      amount.includes("100%") || amount.includes("unlimited")
        ? "Requested amount still falls within explicitly approved safe policy context"
        : "Transaction remains within the configured safe transfer threshold",
      "OWS pre-signing firewall found no override patterns, drain attempts, or approval abuse",
    ];
  }

  return [
    /ignore|bypass|override/.test(prompt)
      ? "Detected override / ignore-instruction pattern"
      : "Detected adversarial phrasing that conflicts with wallet policy",
    amount.includes("100%") || amount.includes("unlimited")
      ? "Transaction intent classified as full-balance drain or unlimited authorization"
      : `Transaction intent classified as elevated-risk ${formatActionLabel(scenario.transaction.action)}`,
    scenario.transaction.recipient.includes("N/A")
      ? "Off-chain request still triggers elevated policy scrutiny"
      : "Recipient marked as untrusted or outside the approved allowlist",
    "PromptShield blocks the request before it can reach the OWS signing layer",
  ];
}

function buildLiveAuditEvents(scenario: DemoScenario, runStartedAt: number): AuditEvent[] {
  const analysisSummary = buildAnalysisSummary(scenario);
  const isAllowed = scenario.verdict.status === "allowed";

  return [
    {
      id: `${scenario.id}-live-1`,
      timestamp: new Date(runStartedAt).toISOString(),
      step: 1,
      type: "prompt_received",
      label: "Prompt received",
      detail: `Scenario "${scenario.label}" submitted to the AI wallet layer.`,
      status: "info",
    },
    {
      id: `${scenario.id}-live-2`,
      timestamp: new Date(runStartedAt + stepDurations[0]).toISOString(),
      step: 2,
      type: "ai_interpreted",
      label: "Intent parsed",
      detail: analysisSummary[0],
      status: isAllowed ? "info" : "warning",
    },
    {
      id: `${scenario.id}-live-3`,
      timestamp: new Date(runStartedAt + stepDurations[0] + stepDurations[1]).toISOString(),
      step: 3,
      type: "ai_interpreted",
      label: "Transaction draft generated",
      detail: `${scenario.transaction.token} ${scenario.transaction.amount} → ${scenario.transaction.recipient}`,
      status: isAllowed ? "info" : "warning",
    },
    {
      id: `${scenario.id}-live-4`,
      timestamp: new Date(runStartedAt + stepDurations[0] + stepDurations[1] + stepDurations[2]).toISOString(),
      step: 4,
      type: "policy_evaluated",
      label: "Policy engine evaluating",
      detail: isAllowed
        ? "All required policy checks passed for this request."
        : `${scenario.verdict.violatedRules.length} policy rules violated during evaluation.`,
      status: isAllowed ? "allowed" : "blocked",
    },
    {
      id: `${scenario.id}-live-5`,
      timestamp: new Date(runStartedAt + stepDurations[0] + stepDurations[1] + stepDurations[2] + stepDurations[3]).toISOString(),
      step: 5,
      type: "policy_evaluated",
      label: isAllowed ? "Recipient verified as trusted" : "Recipient flagged untrusted",
      detail: isAllowed ? analysisSummary[1] : analysisSummary[2],
      status: isAllowed ? "allowed" : "blocked",
    },
    {
      id: `${scenario.id}-live-6`,
      timestamp: new Date(runStartedAt + stepDurations[0] + stepDurations[1] + stepDurations[2] + stepDurations[3] + stepDurations[4]).toISOString(),
      step: 6,
      type: "execution_decision",
      label: isAllowed ? "Returning verdict: ALLOWED" : "Returning verdict: BLOCKED",
      detail: isAllowed
        ? "Transaction approved and ready for signing."
        : "Execution blocked before signing.",
      status: isAllowed ? "allowed" : "blocked",
    },
  ];
}

function createFakeHash(seed: string) {
  const raw = seed.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().padEnd(18, "A");
  return `0x${raw.slice(0, 6)}...${raw.slice(-4)}`;
}

function formatClock(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function deriveGasFee(gasEstimate?: string) {
  const numeric = Number((gasEstimate ?? "21000").replace(/[^0-9]/g, ""));
  if (!numeric) return "0.0021 ETH";
  return `${(numeric / 10000000).toFixed(4)} ETH`;
}

function parseAmount(amount: string) {
  const normalized = amount.toLowerCase().replace(/,/g, ".").trim();
  const numeric = Number(normalized.replace(/[^0-9.]/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
}

function createCustomScenario(input: CustomSimulationInput): DemoScenario {
  const recipientApproved = input.recipient.toLowerCase().includes("approved");
  const parsedAmount = parseAmount(input.amount);
  const unsafeApproval = input.action === "approve";
  const ethHighAmount = input.token === "ETH" && parsedAmount > 25;
  const amountTooHigh = parsedAmount > 100 || ethHighAmount;
  const safeTransfer =
    input.action === "transfer" &&
    parsedAmount < 50 &&
    recipientApproved &&
    input.token === "USDC";
  const blocked = unsafeApproval || amountTooHigh || !recipientApproved || !safeTransfer;
  const mediumRiskBlocked = blocked && !unsafeApproval && !amountTooHigh && recipientApproved;

  const reasons = blocked
    ? [
        amountTooHigh ? "Amount exceeds allowed policy limit" : null,
        !recipientApproved ? "Recipient is not in approved allowlist" : null,
        unsafeApproval ? "Unlimited or unsafe approval blocked by default" : null,
        ethHighAmount ? "High-value ETH transfer flagged as critical risk" : null,
        mediumRiskBlocked ? "Transaction exceeds safe threshold and is not explicitly whitelisted" : null,
      ].filter(Boolean) as string[]
    : [
        "Recipient verified as trusted",
        "Transaction remains within safe policy limits",
        "Request cleared by the PromptShield security layer",
      ];

  const transaction: Transaction = {
    action: input.action,
    chain: input.network,
    token: input.token,
    amount: input.amount,
    recipient: input.recipient,
    contractType: "ERC-20",
    riskLevel: blocked
      ? unsafeApproval || ethHighAmount || parsedAmount > 100
        ? "critical"
        : mediumRiskBlocked
        ? "medium"
        : "high"
      : input.token === "USDC"
      ? "low"
      : "medium",
    gasEstimate:
      input.action === "approve"
        ? "46,000"
        : input.network === "arbitrum"
        ? "18,500"
        : input.network === "polygon"
        ? "19,200"
        : "21,000",
    nonce: blocked ? 63 : 64,
  };

  const verdict: FirewallVerdict = {
    status: blocked ? "blocked" : "allowed",
    severity: blocked
      ? unsafeApproval || ethHighAmount || parsedAmount > 100
        ? "critical"
        : mediumRiskBlocked
        ? "medium"
        : "high"
      : input.token === "USDC"
      ? "low"
      : "medium",
    reasons,
    violatedRules: blocked
      ? [
          ...(amountTooHigh
            ? [{
                id: "RULE-001",
                name: "Amount Threshold",
                description:
                  ethHighAmount
                    ? "High-value ETH transfers are restricted by the active simulation policy"
                    : "Transaction amount exceeds the permitted simulation policy limit",
                severity: "critical" as const,
              }]
            : []),
          ...(!recipientApproved
            ? [{
                id: "RULE-012",
                name: "Approved Recipient Policy",
                description: "Recipient is outside the approved execution allowlist",
                severity: "high" as const,
              }]
            : []),
          ...(unsafeApproval
            ? [{
                id: "RULE-003",
                name: "Approval Type Guard",
                description: "Approval requests are blocked in this simulation",
                severity: "critical" as const,
              }]
            : []),
          ...(mediumRiskBlocked
            ? [{
                id: "RULE-009",
                name: "Safe Transfer Window",
                description: "Transfer exceeds the safe simulation window and requires manual review",
                severity: "medium" as const,
              }]
            : []),
        ]
      : [],
    executionTime: blocked ? 42 : 24,
    policyVersion: "v2.4.1",
  };

  return {
    id: `custom-${Date.now()}`,
    label: "Custom simulation",
    category: blocked ? "attack" : "safe",
    prompt: `${input.action} ${input.amount} ${input.token} on ${input.network} to ${input.recipient}`,
    transaction,
    verdict,
    auditLog: [
      {
        id: "custom-1",
        timestamp: "2025-01-14T12:00:00.001Z",
        step: 1,
        type: "prompt_received",
        label: "Prompt received",
        detail: "Custom transaction submitted to simulation layer.",
        status: "info",
      },
      {
        id: "custom-2",
        timestamp: "2025-01-14T12:00:00.051Z",
        step: 2,
        type: "ai_interpreted",
        label: "Intent parsed",
        detail: blocked
          ? "Simulation flagged elevated transaction risk."
          : "Simulation classified request as policy-safe.",
        status: blocked ? "warning" : "info",
      },
      {
        id: "custom-3",
        timestamp: "2025-01-14T12:00:00.102Z",
        step: 3,
        type: "policy_evaluated",
        label: "Transaction draft generated",
        detail: `${transaction.action} ${transaction.amount} ${transaction.token} on ${transaction.chain} -> ${transaction.recipient}`,
        status: blocked ? "warning" : "info",
      },
      {
        id: "custom-4",
        timestamp: "2025-01-14T12:00:00.148Z",
        step: 4,
        type: "policy_evaluated",
        label: "Policy engine evaluating",
        detail: blocked ? `${reasons[0]}.` : "Policy checks passed.",
        status: blocked ? "blocked" : "allowed",
      },
      {
        id: "custom-5",
        timestamp: "2025-01-14T12:00:00.192Z",
        step: 5,
        type: "policy_evaluated",
        label: "Checking recipient trust",
        detail: recipientApproved ? "Recipient classified as trusted." : "Recipient classified as untrusted.",
        status: recipientApproved ? "allowed" : "blocked",
      },
      {
        id: "custom-6",
        timestamp: "2025-01-14T12:00:00.236Z",
        step: 6,
        type: "execution_decision",
        label: blocked ? "Returning verdict: BLOCKED" : "Returning verdict: ALLOWED",
        detail: blocked
          ? "Simulation stopped before wallet signing."
          : "Transaction approved and ready for signing.",
        status: blocked ? "blocked" : "allowed",
      },
    ],
  };
}

export default function DemoPage() {
  const { connected, address, shortAddress, status } = useMockWallet();
  const [activeScenario, setActiveScenario] = useState<DemoScenario>(defaultScenario);
  const [transitioning, setTransitioning] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [statusTick, setStatusTick] = useState(0);
  const [phase, setPhase] = useState<DemoPhase>("done");
  const [activeStep, setActiveStep] = useState<number>(pipelineSteps.length);
  const [runStartedAt, setRunStartedAt] = useState<number>(Date.now());
  const [elapsedMs, setElapsedMs] = useState(0);
  const [simulatedHash, setSimulatedHash] = useState(createFakeHash(`${defaultScenario.id}-${Date.now()}`));
  const [showExplorer, setShowExplorer] = useState(false);

  const runScenario = (scenario: DemoScenario, force = false) => {
    if (!connected) return;
    if (scenario.id === activeScenario.id && !force) return;
    const runAt = Date.now();
    setTransitioning(true);
    setProcessing(true);
    setRunStartedAt(runAt);
    setElapsedMs(0);
    setShowExplorer(false);
    setSimulatedHash(createFakeHash(`${scenario.id}-${runAt}`));
    setPhase("prompt");
    setActiveStep(0);
    setTimeout(() => {
      setActiveScenario(scenario);
    }, 140);
    setTimeout(() => {
      setTransitioning(false);
    }, 220);
    setTimeout(() => {
      setPhase("ai");
      setActiveStep(1);
    }, stepDurations[0]);
    setTimeout(() => {
      setPhase("draft");
      setActiveStep(2);
    }, stepDurations[0] + stepDurations[1]);
    setTimeout(() => {
      setPhase("policy");
      setActiveStep(3);
    }, stepDurations[0] + stepDurations[1] + stepDurations[2]);
    setTimeout(() => {
      setPhase("trust");
      setActiveStep(4);
    }, stepDurations[0] + stepDurations[1] + stepDurations[2] + stepDurations[3]);
    setTimeout(() => {
      setPhase("verdict");
      setActiveStep(5);
    }, stepDurations[0] + stepDurations[1] + stepDurations[2] + stepDurations[3] + stepDurations[4]);
    setTimeout(() => {
      setPhase("done");
      setProcessing(false);
      setActiveStep(pipelineSteps.length);
    }, stepDurations[0] + stepDurations[1] + stepDurations[2] + stepDurations[3] + stepDurations[4] + stepDurations[5]);
  };

  const handleSelect = (scenario: DemoScenario, force = false) => {
    runScenario(scenario, force);
  };

  const handleRunCustom = (input: CustomSimulationInput) => {
    runScenario(createCustomScenario(input), true);
  };

  useEffect(() => {
    if (!processing) {
      setStatusTick(0);
      return;
    }

    const interval = setInterval(() => {
      setStatusTick((value) => (value + 1) % 3);
    }, 380);

    return () => clearInterval(interval);
  }, [processing]);

  useEffect(() => {
    if (!processing) {
      return;
    }

    const interval = window.setInterval(() => {
      setElapsedMs(Date.now() - runStartedAt);
    }, 80);

    return () => window.clearInterval(interval);
  }, [processing, runStartedAt]);

  const isBlocked = activeScenario.verdict.status === "blocked";
  const totalBlocked = demoScenarios.filter((s) => s.verdict.status === "blocked").length;
  const totalAllowed = demoScenarios.filter((s) => s.verdict.status === "allowed").length;
  const processingLabel =
    phase === "prompt" || phase === "ai"
      ? `Analyzing prompt${".".repeat(statusTick + 1)}`
      : phase === "draft" || phase === "policy"
      ? `Evaluating policy${".".repeat(statusTick + 1)}`
      : phase === "trust"
      ? `Checking transaction${".".repeat(statusTick + 1)}`
      : `Returning result${".".repeat(statusTick + 1)}`;
  const phaseLabel =
    phase === "prompt"
      ? "Prompt received"
      : phase === "ai"
      ? "Analyzing prompt"
      : phase === "draft"
      ? "Evaluating policy"
      : phase === "policy"
      ? "Evaluating policy"
      : phase === "trust"
      ? "Checking transaction"
      : phase === "verdict"
      ? "Returning result"
      : "Simulation complete";
  const liveEvents = buildLiveAuditEvents(activeScenario, runStartedAt);
  const visibleEventCount =
    phase === "prompt"
      ? 1
      : phase === "ai"
      ? 2
      : phase === "draft"
      ? 3
      : phase === "policy"
      ? 4
      : phase === "trust"
      ? 5
      : 6;
  const visibleEvents = processing ? liveEvents.slice(0, visibleEventCount) : activeScenario.auditLog;
  const analysisSummary = buildAnalysisSummary(activeScenario);
  const visibleAnalysisCount =
    phase === "prompt"
      ? 1
      : phase === "ai"
      ? 2
      : phase === "draft" || phase === "policy"
      ? 3
      : 4;
  const visibleAnalysis = processing
    ? analysisSummary.slice(0, visibleAnalysisCount)
    : analysisSummary;
  const explorerStatus =
    phase === "prompt" || phase === "ai" || phase === "draft" || phase === "policy" || phase === "trust"
      ? "Pending simulation"
      : activeScenario.verdict.status === "blocked"
      ? "Rejected before signing"
      : phase === "verdict" || phase === "done"
      ? "Ready for broadcast"
      : "Pending";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-16">
        {/* Page header */}
        <div className="border-b border-border bg-surface">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge variant="accent" dot>
                    Live Demo
                  </Badge>
                  <Badge variant="accent" dot>
                    Live
                  </Badge>
                  <Badge variant="default">
                    OWS Secured
                  </Badge>
                  <span className="inline-flex items-center rounded-full bg-[#10b981] px-3 py-1.5 text-[13px] font-semibold text-white shadow-sm">
                    Pre-signing Protection Active
                  </span>
                  <span className="inline-flex items-center rounded-full bg-[#3b82f6] px-3 py-1.5 text-[13px] font-semibold text-white shadow-sm">
                    OWS beforeSign Hook
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-3 py-1.5 text-[13px] font-medium text-text-secondary">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent-light" />
                    Policy Engine Active
                  </span>
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-medium ${
                    connected
                      ? "border-accent/20 bg-accent-subtle text-accent"
                      : "border-border bg-surface-2 text-text-muted"
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-accent-light" : "bg-text-muted"}`} />
                    {connected ? `Wallet connected: ${shortAddress}` : "Connect wallet to run simulation"}
                  </span>
                </div>
                <h1 className="text-[32px] font-semibold text-text-primary tracking-tight leading-[1.08]">
                  Live Demo Sandbox
                </h1>
                <p className="mt-2 text-[16px] leading-[1.6] text-text-muted">
                  Run attack and safe scenarios to see how PromptShield evaluates AI-generated wallet actions in real time.
                </p>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 bg-surface-2 border border-border rounded-xl px-4 py-2.5">
                  <div className="w-2 h-2 rounded-full bg-danger-light" />
                  <span className="text-[14px] font-medium text-text-secondary">
                    {totalBlocked} attack scenarios
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-surface-2 border border-border rounded-xl px-4 py-2.5">
                  <div className="w-2 h-2 rounded-full bg-accent-light" />
                  <span className="text-[14px] font-medium text-text-secondary">
                    {totalAllowed} safe scenarios
                  </span>
                </div>
                <div className="hidden xl:flex items-center gap-2 bg-surface-2 border border-border rounded-xl px-4 py-2.5">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  <span className="text-[14px] font-medium text-text-secondary">
                    120ms control latency
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status bar */}
        <div
          className={`px-6 py-2.5 transition-colors duration-500 ${
            processing
              ? "bg-warning-subtle/55 border-b border-warning/20"
              : isBlocked
              ? "bg-danger-subtle/60 border-b border-danger/15"
              : "bg-accent-subtle/60 border-b border-accent/15"
          }`}
        >
          <div className="max-w-7xl mx-auto flex items-center gap-3 flex-wrap">
            <div
              className={`w-2 h-2 rounded-full ${
                processing
                  ? "bg-warning animate-pulse"
                  : isBlocked
                    ? "bg-danger-light animate-pulse"
                    : "bg-accent-light animate-pulse"
              }`}
            />
            <span
              className={`text-[14px] font-semibold ${
                processing ? "text-warning" : isBlocked ? "text-danger" : "text-accent"
              }`}
            >
              {processing
                ? processingLabel
                : isBlocked
                ? `BLOCKED — ${activeScenario.verdict.violatedRules.length} policy rule${activeScenario.verdict.violatedRules.length !== 1 ? "s" : ""} violated`
                : "ALLOWED — Transaction cleared all policy checks"}
            </span>
            <span className="ml-1 text-[13px] text-text-muted">
              {processing ? `· ${phaseLabel} · ${elapsedMs}ms` : `· Evaluated in ${activeScenario.verdict.executionTime}ms`}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/80 px-2.5 py-1 text-[12px] font-medium text-text-secondary">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-light" />
              Live Demo
            </span>
            <span className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/80 px-2.5 py-1 text-[12px] font-medium text-text-secondary">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-light" />
              Policy Engine Active
            </span>
            <span className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/80 px-2.5 py-1 text-[12px] font-medium text-text-secondary">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-light" />
              Wallet Simulation
            </span>
            <span className="hidden xl:inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/80 px-2.5 py-1 text-[12px] font-medium text-text-secondary">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-light" />
              Real-time Evaluation
            </span>
            <span className={`hidden md:inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-medium ${
              connected
                ? "border-accent/20 bg-accent-subtle text-accent"
                : "border-border bg-surface text-text-muted"
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-accent-light" : "bg-text-muted"}`} />
              {connected ? shortAddress : "Wallet disconnected"}
            </span>
          </div>
        </div>

        {processing && (
          <div className="px-6 py-3 border-b border-border bg-surface/85 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2.5">
              {pipelineSteps.map((step, index) => {
                const stepIndex =
                  activeStep <= 1 ? 0 :
                  activeStep <= 3 ? 1 :
                  activeStep === 4 ? 2 : 3;
                const completed = processing ? index < stepIndex : index < pipelineSteps.length;
                const current = index === stepIndex;

                return (
                  <div
                    key={step}
                    className={`rounded-xl border px-3.5 py-3 transition-all duration-300 ${
                      completed
                        ? "bg-accent-subtle border-accent/20 shadow-[0_10px_24px_rgba(34,197,94,0.08)]"
                        : current
                        ? "bg-warning-subtle border-warning/25 shadow-[0_10px_24px_rgba(245,158,11,0.08)]"
                        : "bg-surface-2 border-border opacity-70"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                          completed
                            ? "bg-accent/12 text-accent"
                            : current
                            ? "bg-warning/12 text-warning animate-pulse"
                            : "bg-surface text-text-muted border border-border"
                        }`}
                      >
                        {completed ? (
                          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                            <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : current ? (
                          <div className="w-1.5 h-1.5 rounded-full bg-current" />
                        ) : (
                          <span className="text-[10px] font-semibold">{index + 1}</span>
                        )}
                      </div>
                      <p
                        className={`text-[12px] font-medium leading-snug ${
                          completed
                            ? "text-accent"
                            : current
                            ? "text-warning"
                            : "text-text-muted"
                        }`}
                      >
                        {step}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-6 pt-6">
          <div className="grid grid-cols-1 gap-3 rounded-[16px] border border-[#e2e8f0] bg-[linear-gradient(90deg,#f8fafc,#f1f5f9)] px-5 py-5 md:grid-cols-2 xl:flex xl:items-center xl:justify-center xl:gap-4">
            <div className="text-center xl:min-w-[140px]">
              <p className="text-[15px] font-semibold text-[#64748b]">
                1. AI Agent Prompt
              </p>
              <p className="mt-1 text-[13px] text-[#94a3b8]">
                + Transaction Request
              </p>
            </div>
            <div className="hidden xl:block text-[24px] text-[#cbd5e1]">→</div>
            <div className="rounded-[12px] border-2 border-warning bg-surface px-4 py-4 text-center shadow-[0_4px_6px_-1px_rgb(0_0_0_/_0.10)] xl:min-w-[180px]">
              <p className="text-[16px] font-bold text-[#b45309]">
                2. PromptShield AI Analysis
              </p>
              <p className="mt-1 text-[13px] text-[#92400e]">
                Override • Full Balance Drain • Untrusted Recipient
              </p>
            </div>
            <div className="hidden xl:block text-[24px] text-[#cbd5e1]">→</div>
            <div className="text-center xl:min-w-[140px]">
              <p className="text-[15px] font-bold text-danger">
                3. BLOCKED / ALLOWED
              </p>
              <p className="mt-1 text-[13px] text-[#64748b]">
                Risk seviyesine gore karar
              </p>
            </div>
            <div className="hidden xl:block text-[24px] text-[#cbd5e1]">→</div>
            <div className="text-center xl:min-w-[140px]">
              <p className="text-[15px] font-semibold text-[#64748b]">
                4. OWS beforeSign Hook
              </p>
              <p className="mt-1 text-[13px] text-[#94a3b8]">
                Imzalama oncesi koruma
              </p>
            </div>
          </div>
        </div>

        {/* Main 3-column dashboard */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div
            className={`relative grid grid-cols-1 lg:grid-cols-3 gap-5 transition-all duration-300 ${
              transitioning ? "scale-[0.995] opacity-55" : "scale-100 opacity-100"
            }`}
            style={{ minHeight: "600px" }}
          >
            {processing && (
              <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px overflow-hidden rounded-full">
                <div className="processing-sheen h-full w-full" />
              </div>
            )}
            <PromptConsole
              activeScenario={activeScenario}
              onSelect={handleSelect}
              onRunCustom={handleRunCustom}
              onRerun={() => handleSelect(activeScenario, true)}
              processing={processing}
              phase={phase}
              elapsedMs={elapsedMs}
              walletConnected={connected}
              walletAddress={address}
              walletStatus={status}
            />
            <TransactionDetail
              transaction={activeScenario.transaction}
              processing={processing}
              phase={phase}
              analysisSummary={visibleAnalysis}
              verdictStatus={activeScenario.verdict.status}
              walletConnected={connected}
              walletAddress={address}
              walletStatus={status}
            />
            <VerdictCard
              verdict={activeScenario.verdict}
              processing={processing}
              scenarioId={activeScenario.id}
              phase={phase}
            />
          </div>
        </div>

        {/* Audit log — full width */}
        <div className="max-w-7xl mx-auto px-6 pb-12">
          <div
            className={`transition-opacity duration-200 ${transitioning ? "opacity-40" : "opacity-100"}`}
          >
            <AuditLog events={visibleEvents} processing={processing} phase={phase} />
          </div>
        </div>

        {/* Integration note */}
        <div className="max-w-7xl mx-auto px-6 pb-16">
          <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col sm:flex-row gap-5 items-start shadow-card">
            <div className="w-9 h-9 rounded-xl bg-surface-2 border border-border flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-text-muted" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M10 9v5M10 6.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <p className="text-[13.5px] font-semibold text-text-primary mb-1">
                Backend Integration Ready
              </p>
              <p className="text-[12.5px] text-text-muted leading-relaxed max-w-2xl">
                This frontend is built for clean handoff to Codex. The{" "}
                <code className="font-mono text-[11.5px] bg-surface-2 border border-border rounded px-1.5 py-0.5">
                  PromptConsole
                </code>
                ,{" "}
                <code className="font-mono text-[11.5px] bg-surface-2 border border-border rounded px-1.5 py-0.5">
                  TransactionDetail
                </code>
                , and{" "}
                <code className="font-mono text-[11.5px] bg-surface-2 border border-border rounded px-1.5 py-0.5">
                  VerdictCard
                </code>{" "}
                components accept typed props defined in{" "}
                <code className="font-mono text-[11.5px] bg-surface-2 border border-border rounded px-1.5 py-0.5">
                  src/types/index.ts
                </code>
                . Replace{" "}
                <code className="font-mono text-[11.5px] bg-surface-2 border border-border rounded px-1.5 py-0.5">
                  mockData.ts
                </code>{" "}
                with real OWS API calls to go live.
              </p>
            </div>
          </div>
        </div>
      </main>

      <ExplorerModal
        open={showExplorer}
        onClose={() => setShowExplorer(false)}
        txHash={simulatedHash}
        status={explorerStatus}
        timestamp={formatClock(runStartedAt)}
        network="Ethereum Mainnet"
        gasFee={deriveGasFee(activeScenario.transaction.gasEstimate)}
        from={address ?? "0x0000000000000000000000000000000000000000"}
        to={activeScenario.transaction.recipient}
        confirmationTime="12s"
      />

      <Footer />
    </div>
  );
}
