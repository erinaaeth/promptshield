"use client";

import { useState } from "react";
import { CustomSimulationInput, DemoScenario } from "@/types";
import { demoScenarios } from "@/lib/mockData";

interface PromptConsoleProps {
  activeScenario: DemoScenario;
  onSelect: (scenario: DemoScenario) => void;
  onRunCustom: (input: CustomSimulationInput) => void;
  onRerun?: () => void;
  processing?: boolean;
  phase?: "prompt" | "ai" | "draft" | "policy" | "trust" | "verdict" | "done";
  elapsedMs?: number;
  walletConnected?: boolean;
  walletAddress?: string | null;
  walletStatus?: string;
}

export default function PromptConsole({
  activeScenario,
  onSelect,
  onRunCustom,
  onRerun,
  processing = false,
  walletConnected = false,
}: PromptConsoleProps) {
  const attackScenarios = demoScenarios.filter((s) => s.category === "attack");
  const safeScenarios = demoScenarios.filter((s) => s.category === "safe").slice(0, 1);
  const [customInput, setCustomInput] = useState<CustomSimulationInput>({
    action: "transfer",
    network: "ethereum",
    token: "USDC",
    amount: "5",
    recipient: "approved-wallet.eth",
  });
  const recipientTrusted = customInput.recipient.toLowerCase().includes("approved");

  const scenarioActionMap: Record<string, string> = {
    "send-all-funds": "malicious-full-drain",
    "approve-unlimited": "malicious-unlimited-approval",
    "unknown-address-transfer": "malicious-unknown-recipient",
    "oversized-swap": "malicious-oversized-swap",
    "safe-usdc-transfer": "safe-transfer",
    "small-allowed-transfer": "safe-transfer-small",
    "sign-safe-message": "safe-sign-message",
  };

  const scenarioPresetMap: Record<string, CustomSimulationInput> = {
    "send-all-funds": {
      action: "transfer",
      network: "ethereum",
      token: "ETH",
      amount: "100",
      recipient: "0xDEAD00000000000000000000000000000000BEEF",
    },
    "approve-unlimited": {
      action: "approve",
      network: "ethereum",
      token: "USDC",
      amount: "1000000",
      recipient: "0xDEAD00000000000000000000000000000000BEEF",
    },
    "unknown-address-transfer": {
      action: "transfer",
      network: "ethereum",
      token: "ETH",
      amount: "35",
      recipient: "0xDEAD00000000000000000000000000000000BEEF",
    },
    "oversized-swap": {
      action: "transfer",
      network: "arbitrum",
      token: "ETH",
      amount: "150",
      recipient: "0xDEAD00000000000000000000000000000000BEEF",
    },
    "safe-usdc-transfer": {
      action: "transfer",
      network: "ethereum",
      token: "USDC",
      amount: "5",
      recipient: "approved-wallet.eth",
    },
    "small-allowed-transfer": {
      action: "transfer",
      network: "ethereum",
      token: "USDC",
      amount: "5",
      recipient: "approved-wallet.eth",
    },
    "sign-safe-message": {
      action: "transfer",
      network: "ethereum",
      token: "USDC",
      amount: "5",
      recipient: "approved-wallet.eth",
    },
  };

  const updateField = <K extends keyof CustomSimulationInput>(key: K, value: CustomSimulationInput[K]) => {
    setCustomInput((current) => ({ ...current, [key]: value }));
  };

  const handleScenarioSelect = (scenario: DemoScenario) => {
    const preset = scenarioPresetMap[scenario.id];
    if (preset) {
      setCustomInput(preset);
    }
    onSelect(scenario);
  };

  return (
    <div
      className={`bg-surface border border-border rounded-2xl shadow-card flex flex-col h-full transition-all duration-300 ${
        processing ? "opacity-90" : "panel-float-in"
      }`}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-border">
        <p className="mb-1 text-[12px] font-semibold uppercase tracking-[0.15em] text-text-muted">
          Input Layer
        </p>
        <h3 className="text-[16px] font-semibold text-text-primary">Prompt Console</h3>
      </div>

      <div className="flex-1 flex flex-col gap-4.5 p-4 overflow-y-auto">
        <div>
          <h3 className="mb-2 text-[16px] font-semibold text-[#374151]">
            One-Click Test Scenarios
          </h3>
        </div>

        {/* Current prompt display */}
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
            Active Prompt
          </p>
          <div className="bg-surface-2 border border-border rounded-xl p-3 min-h-[72px]">
            <p className="active-prompt text-[12px] text-text-secondary leading-[1.65] font-mono">
              {activeScenario.prompt}
            </p>
          </div>
        </div>

        {/* Attack presets */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-danger-light" />
            <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
              Attack Scenarios
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            {attackScenarios.map((s) => (
              <button
                key={s.id}
                disabled={processing || !walletConnected}
                onClick={() => handleScenarioSelect(s)}
                data-action={scenarioActionMap[s.id] ?? s.id}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-[12px] font-medium transition-all duration-200 ${
                  activeScenario.id === s.id
                    ? "bg-danger-subtle border-danger/20 text-danger"
                    : "bg-surface-2 border-border text-text-secondary hover:border-danger/20 hover:bg-danger-subtle/50 hover:text-danger"
                } ${processing || !walletConnected ? "cursor-not-allowed opacity-60" : ""}`}
              >
                <div className="flex items-center gap-2">
                  <AttackIcon className="w-3 h-3 flex-shrink-0" />
                  {s.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Safe presets */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-light" />
            <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
              Safe Reference
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            {safeScenarios.map((s) => (
              <button
                key={s.id}
                disabled={processing || !walletConnected}
                onClick={() => handleScenarioSelect(s)}
                data-action={scenarioActionMap[s.id] ?? s.id}
                className={`w-full cursor-pointer text-left px-3.5 py-2.5 rounded-xl border text-[12px] font-medium transition-all duration-200 ${
                  activeScenario.id === s.id
                    ? "bg-accent-subtle border-accent/20 text-accent"
                    : "bg-[#f0fdf4] border-[#86efac] text-[#166534] hover:border-accent/30 hover:bg-accent-subtle/60 hover:text-[#166534]"
                } ${processing || !walletConnected ? "cursor-not-allowed opacity-60" : ""}`}
              >
                <div className="flex items-center gap-2">
                  <SafeIcon className="w-3 h-3 flex-shrink-0" />
                  {s.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface-2 p-3.5">
          <div className="mb-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
              Custom Simulation
            </p>
            <p className="mt-1 text-[11px] leading-[1.5] text-text-muted">
              Create a simple wallet action and run it through the policy engine.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Field label="Action">
              <select
                id="sim-action"
                value={customInput.action}
                onChange={(e) => updateField("action", e.target.value as CustomSimulationInput["action"])}
                disabled={processing || !walletConnected}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-[12px] text-text-primary focus:outline-none focus:border-border-strong"
              >
                <option value="transfer">Transfer</option>
                <option value="approve">Approve</option>
              </select>
            </Field>
            <Field label="Network">
              <select
                id="sim-chain"
                value={customInput.network}
                onChange={(e) => updateField("network", e.target.value as CustomSimulationInput["network"])}
                disabled={processing || !walletConnected}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-[12px] text-text-primary focus:outline-none focus:border-border-strong"
              >
                <option value="ethereum">Ethereum</option>
                <option value="arbitrum">Arbitrum</option>
                <option value="polygon">Polygon</option>
              </select>
            </Field>
            <Field label="Token">
              <select
                id="sim-token"
                value={customInput.token}
                onChange={(e) => updateField("token", e.target.value as CustomSimulationInput["token"])}
                disabled={processing || !walletConnected}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-[12px] text-text-primary focus:outline-none focus:border-border-strong"
              >
                <option value="USDC">USDC</option>
                <option value="ETH">ETH</option>
                <option value="DAI">DAI</option>
              </select>
            </Field>
            <Field label="Amount">
              <input
                id="sim-amount"
                value={customInput.amount}
                type="number"
                min="0"
                onChange={(e) => updateField("amount", e.target.value)}
                disabled={processing || !walletConnected}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-[12px] text-text-primary focus:outline-none focus:border-border-strong"
              />
            </Field>
            <div className="col-span-2">
              <Field label="Recipient">
                <input
                  id="sim-recipient"
                  value={customInput.recipient}
                  onChange={(e) => updateField("recipient", e.target.value)}
                  disabled={processing || !walletConnected}
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-[12px] font-mono text-text-primary focus:outline-none focus:border-border-strong"
                />
              </Field>
            </div>
          </div>

          <div className="mt-2.5 rounded-xl border border-border bg-surface px-3 py-2.5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">
                Recipient Trust
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  recipientTrusted
                    ? "bg-accent-subtle text-accent"
                    : "bg-danger-subtle text-danger"
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${recipientTrusted ? "bg-accent-light" : "bg-danger-light"}`} />
                {recipientTrusted ? "Trusted" : "Untrusted"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onRunCustom(customInput)}
            disabled={processing || !walletConnected}
            className={`mt-3 inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-[12px] font-semibold transition-all ${
              processing || !walletConnected
                ? "cursor-not-allowed bg-surface text-text-muted opacity-60 border border-border"
                : "bg-accent text-background shadow-card hover:bg-accent/92 hover:shadow-card-hover"
            }`}
          >
            {walletConnected ? "Run Simulation" : "Connect wallet to run simulation"}
          </button>
        </div>

        <button
          type="button"
          onClick={onRerun}
          disabled={processing || !walletConnected}
          className={`mt-auto inline-flex w-full items-center justify-center rounded-lg border px-4 py-2.5 text-[12px] font-medium transition-all ${
            processing || !walletConnected
              ? "cursor-not-allowed border-border bg-surface text-text-muted opacity-60"
              : "border-border bg-surface text-text-primary hover:border-border-strong hover:bg-background"
          }`}
        >
          {walletConnected ? "Re-run scenario" : "Connect wallet to simulate signing layer"}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}

function AttackIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M7 1L13 4V7.5C13 10.5 10.5 12.5 7 13.5C3.5 12.5 1 10.5 1 7.5V4L7 1Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M5 5L9 9M9 5L5 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function SafeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M7 1L13 4V7.5C13 10.5 10.5 12.5 7 13.5C3.5 12.5 1 10.5 1 7.5V4L7 1Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M4.5 7L6 8.5L9.5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
