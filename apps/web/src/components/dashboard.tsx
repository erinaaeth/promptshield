"use client";

import { ATTACK_PROMPTS, SAFE_PROMPTS, SimulationResponse } from "@promptshield/shared";
import clsx from "clsx";
import { useState, useTransition } from "react";
import { simulatePrompt } from "../lib/api";

const initialPrompt = ATTACK_PROMPTS[0].prompt;

function JsonCard({ title, value }: { title: string; value: unknown }) {
  return (
    <div className="panel p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">{title}</h3>
      </div>
      <pre className="overflow-x-auto rounded-2xl border border-line bg-black/30 p-4 text-xs leading-6 text-ink">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}

export function Dashboard() {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [result, setResult] = useState<SimulationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const runPrompt = (value: string) => {
    setPrompt(value);
    startTransition(async () => {
      try {
        setError(null);
        const response = await simulatePrompt(value);
        setResult(response);
      } catch (runError) {
        setError(runError instanceof Error ? runError.message : "Unknown request failure");
      }
    });
  };

  const verdictTone = result?.policy.allowed ? "text-accent" : "text-danger";
  const severityTone =
    result?.policy.severity === "high"
      ? "bg-danger/15 text-danger"
      : result?.policy.severity === "medium"
        ? "bg-warning/15 text-warning"
        : "bg-accent/15 text-accent";

  return (
    <main className="min-h-screen bg-grid bg-[size:26px_26px]">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-5 py-8 md:px-8 lg:px-10">
        <section className="panel relative overflow-hidden p-8 md:p-10">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <span className="eyebrow">OWS Security Sandbox</span>
              <div className="space-y-2">
                <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">PromptShield</h1>
                <p className="text-lg text-muted md:text-xl">AI Jailbreak Tester for OWS Wallets</p>
              </div>
              <p className="max-w-2xl text-sm leading-7 text-muted md:text-base">
                Feed attack-style prompts into a mock AI agent, inspect the generated blockchain transaction,
                then watch PromptShield&apos;s policy firewall allow or deny execution before the wallet boundary is touched.
              </p>
            </div>
            <div className="grid gap-3 text-sm text-muted md:grid-cols-3">
              <div className="rounded-2xl border border-line bg-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-muted">Wallet Mode</div>
                <div className="mt-2 font-medium text-ink">{result?.wallet.mode ?? "mock"}</div>
              </div>
              <div className="rounded-2xl border border-line bg-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-muted">Chain</div>
                <div className="mt-2 font-medium text-ink">{result?.wallet.chain ?? "eip155:1"}</div>
              </div>
              <div className="rounded-2xl border border-line bg-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-muted">Execution</div>
                <div className="mt-2 font-medium text-ink">{result?.execution.mode ?? "mock adapter"}</div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_1fr_1fr]">
          <div className="panel p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Prompt Console</h2>
              <span
                className={clsx(
                  "rounded-full px-3 py-1 text-xs font-medium",
                  isPending ? "bg-warning/15 text-warning" : "bg-accent/15 text-accent"
                )}
              >
                {isPending ? "Analyzing" : "Ready"}
              </span>
            </div>

            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              className="min-h-[220px] w-full rounded-2xl border border-line bg-black/25 p-4 text-sm leading-7 text-ink outline-none transition focus:border-accent"
              placeholder="Enter a malicious or safe wallet instruction..."
            />

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={() => runPrompt(prompt)}
                className="rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-black transition hover:brightness-110"
              >
                Simulate Prompt
              </button>
              <button
                onClick={() => {
                  setPrompt(initialPrompt);
                  setResult(null);
                  setError(null);
                }}
                className="rounded-2xl border border-line px-5 py-3 text-sm text-muted transition hover:border-accent hover:text-ink"
              >
                Reset
              </button>
            </div>

            <div className="mt-8 grid gap-5">
              <div>
                <div className="mb-3 text-xs uppercase tracking-[0.2em] text-muted">Attack Presets</div>
                <div className="grid gap-3 md:grid-cols-2">
                  {ATTACK_PROMPTS.map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => runPrompt(preset.prompt)}
                      className="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-left text-sm text-ink transition hover:border-danger"
                    >
                      <div className="font-medium">{preset.label}</div>
                      <div className="mt-1 text-xs text-muted">{preset.prompt}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-3 text-xs uppercase tracking-[0.2em] text-muted">Safe Presets</div>
                <div className="grid gap-3 md:grid-cols-2">
                  {SAFE_PROMPTS.map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => runPrompt(preset.prompt)}
                      className="rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3 text-left text-sm text-ink transition hover:border-accent"
                    >
                      <div className="font-medium">{preset.label}</div>
                      <div className="mt-1 text-xs text-muted">{preset.prompt}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {error ? (
              <div className="mt-6 rounded-2xl border border-danger/40 bg-danger/10 p-4 text-sm text-danger">{error}</div>
            ) : null}
          </div>

          <div className="space-y-6">
            <JsonCard
              title="AI Generated Transaction"
              value={
                result?.request ?? {
                  action: "transfer",
                  chain: "eip155:1",
                  token: "USDC",
                  amount: 250,
                  recipient: "0xabc...",
                  contractType: "erc20",
                  riskLevel: "high"
                }
              }
            />
            <JsonCard
              title="Wallet Context"
              value={
                result?.wallet ?? {
                  mode: "mock",
                  walletName: "my-agent",
                  walletAddress: "0xF00DBABE...",
                  chain: "eip155:1",
                  agentTokenConfigured: false
                }
              }
            />
          </div>

          <div className="space-y-6">
            <div className="panel p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Firewall Verdict</h2>
                <span className={clsx("rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]", severityTone)}>
                  {result?.policy.severity ?? "medium"}
                </span>
              </div>

              <div className="mt-6 rounded-3xl border border-line bg-black/25 p-5">
                <div className="text-xs uppercase tracking-[0.2em] text-muted">Result</div>
                <div className={clsx("mt-2 text-3xl font-semibold", verdictTone)}>
                  {result ? (result.policy.allowed ? "ALLOW" : "DENY") : "WAITING"}
                </div>
                <p className="mt-3 text-sm leading-7 text-muted">
                  {result
                    ? result.policy.reasons.join(" ")
                    : "Run a prompt to view the policy engine’s decision, matched rules, and execution path."}
                </p>
              </div>

              <div className="mt-6 space-y-3">
                {(result?.policy.matchedRules ?? ["maxTransferAmount", "approvedRecipientOnly"]).map((rule) => (
                  <div key={rule} className="flex items-center justify-between rounded-2xl border border-line bg-black/20 px-4 py-3 text-sm">
                    <span className="text-muted">{rule}</span>
                    <span className={clsx("font-medium", result?.policy.allowed ? "text-accent" : "text-warning")}>
                      {result?.policy.allowed ? "passed" : "triggered"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel p-6">
              <h2 className="text-lg font-semibold">Execution Outcome</h2>
              <div className="mt-5 grid gap-4">
                <div className="rounded-2xl border border-line bg-black/25 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted">Summary</div>
                  <div className="mt-2 text-sm leading-7 text-ink">
                    {result?.execution.summary ?? "Execution result will appear after simulation."}
                  </div>
                </div>
                <div className="rounded-2xl border border-line bg-black/25 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted">Transaction Hash</div>
                  <div className="mt-2 break-all text-sm text-muted">{result?.execution.txHash ?? "Not available"}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="panel mt-8 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Audit Log</h2>
            <span className="text-xs uppercase tracking-[0.2em] text-muted">Step-by-step execution trace</span>
          </div>
          <div className="mt-6 grid gap-4">
            {(result?.auditLog ?? []).length === 0 ? (
              <div className="rounded-2xl border border-dashed border-line p-8 text-sm text-muted">
                No audit events yet. Trigger a preset or submit a custom prompt to populate the execution trace.
              </div>
            ) : (
              result?.auditLog.map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-line bg-black/20 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className={clsx(
                          "status-dot",
                          entry.step.includes("failed") || entry.step.includes("blocked") || entry.step.includes("denied")
                            ? "bg-danger"
                            : entry.step.includes("approved") || entry.step.includes("succeeded")
                              ? "bg-accent"
                              : "bg-warning"
                        )}
                      />
                      <div>
                        <div className="font-medium text-ink">{entry.title}</div>
                        <div className="text-xs uppercase tracking-[0.2em] text-muted">{entry.step}</div>
                      </div>
                    </div>
                    <div className="text-xs text-muted">{new Date(entry.timestamp).toLocaleString()}</div>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-muted">{entry.detail}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
