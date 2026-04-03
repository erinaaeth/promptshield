import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Badge from "@/components/ui/Badge";
import SectionHeader from "@/components/ui/SectionHeader";
import ArchDiagram from "@/components/demo/ArchDiagram";
import Link from "next/link";

const layers = [
  {
    id: "ai",
    number: "01",
    tag: "UNTRUSTED",
    tagVariant: "warning" as const,
    title: "AI Interpretation Layer",
    subtitle: "The source of risk",
    color: "warning",
    description:
      "The AI layer transforms natural language into structured transaction proposals. This is where prompt injection attacks enter the system — a maliciously crafted prompt can manipulate the LLM into generating dangerous transaction parameters.",
    details: [
      "LLM parses user intent into action, token, amount, recipient",
      "Adversarial prompts can override system instructions",
      "Output is a structured JSON transaction proposal",
      "Must be treated as untrusted input by downstream layers",
    ],
    threat:
      "Prompt injection, jailbreaks, override instructions, and social engineering can cause the AI to propose unsafe transactions.",
  },
  {
    id: "policy",
    number: "02",
    tag: "ENFORCED",
    tagVariant: "accent" as const,
    title: "Policy Firewall Engine",
    subtitle: "The enforcement boundary",
    color: "accent",
    description:
      "The policy engine is the single gate between AI output and wallet execution. Every transaction proposal must pass a ruleset evaluation — regardless of what the AI was told or what the user requested.",
    details: [
      "Configurable rules: amount caps, address allowlists, slippage limits",
      "Prompt injection pattern detection",
      "Immutable audit log for every evaluation",
      "Returns structured verdict with reasons and violated rules",
    ],
    threat: null,
  },
  {
    id: "wallet",
    number: "03",
    tag: "TRUSTED",
    tagVariant: "dark" as const,
    title: "OWS Wallet Layer",
    subtitle: "The execution boundary",
    color: "dark",
    description:
      "The OWS wallet layer is responsible for signing and broadcasting approved transactions. The private key is completely isolated from the AI and policy layers — it only receives policy-approved requests.",
    details: [
      "Private key stored in secure local enclave",
      "Signs only firewall-approved transactions",
      "Broadcasts to target blockchain",
      "Never exposed to AI inference context",
    ],
    threat: null,
  },
];

const colorStyles = {
  warning: {
    border: "border-warning/35",
    bg: "bg-warning-subtle/65",
    iconBg: "bg-warning/12",
    iconColor: "text-warning",
    tagBg: "bg-warning-subtle text-warning border-warning/35",
    num: "text-warning/50",
    threatBg: "bg-warning-subtle border border-warning/25",
    threatText: "text-warning/90",
  },
  accent: {
    border: "border-accent/25",
    bg: "bg-accent-subtle/70",
    iconBg: "bg-accent/10",
    iconColor: "text-accent",
    tagBg: "bg-accent-subtle text-accent border-accent/25",
    num: "text-accent/45",
    threatBg: "",
    threatText: "",
  },
  dark: {
    border: "border-ink/12",
    bg: "bg-ink/[0.03]",
    iconBg: "bg-ink/[0.05]",
    iconColor: "text-text-primary",
    tagBg: "bg-ink text-background border-ink",
    num: "text-text-primary/30",
    threatBg: "",
    threatText: "",
  },
};

const principles = [
  {
    title: "Zero Trust on AI Output",
    description:
      "The AI layer is treated as completely untrusted. Even a legitimate AI response is validated against policy before execution.",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 6v4l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Separation of Concerns",
    description:
      "Intent parsing, policy evaluation, and key management are fully isolated layers with no shared context.",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="11" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="2" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="11" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    title: "Explicit Policy Rules",
    description:
      "Security is codified in explicit, auditable rules — not implicit LLM judgment. Rules can be updated independently of the AI model.",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
        <path d="M4 5h12M4 9h8M4 13h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Immutable Audit Trail",
    description:
      "Every policy evaluation — blocked or allowed — is logged with full context. Compliance and forensics are built-in.",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
        <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function ArchitecturePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-16">
        {/* Page header */}
        <section className="border-b border-border bg-surface">
          <div className="max-w-7xl mx-auto px-6 py-24 md:py-28">
            <div className="flex flex-col gap-6 max-w-3xl">
              <Badge variant="accent">System Design</Badge>
              <h1 className="text-display-md font-bold text-text-primary tracking-tight">
                Architecture
              </h1>
              <p className="text-body-lg text-text-secondary leading-[1.72] max-w-2xl">
                PromptShield uses a layered trust model to separate AI inference from wallet execution.
                The private key is never accessible to the AI or policy layers.
              </p>
              <div className="flex gap-3 pt-2">
                <Link
                  href="/demo"
                  className="px-6 py-3.5 rounded-xl bg-ink text-background text-[15px] font-semibold hover:bg-ink/92 transition-all shadow-card hover:-translate-y-0.5 duration-200"
                >
                  Try the Demo
                </Link>
                <Link
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 rounded-xl bg-surface border border-border text-text-primary text-[15px] font-medium hover:border-border-strong transition-all"
                >
                  View Source
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Model Diagram */}
        <section className="max-w-7xl mx-auto px-6 py-24 md:py-28">
          <ArchDiagram />
        </section>

        {/* Layer Deep Dives */}
        <section className="bg-surface-2 border-y border-border py-24 md:py-28">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col gap-12">
              <SectionHeader
                eyebrow="Layer breakdown"
                title="Three layers. One trust model."
                description="Each layer has a clearly defined responsibility and trust level. The boundaries are explicit and enforced in code."
              />

              <div className="flex flex-col gap-6">
                {layers.map((layer) => {
                  const c = colorStyles[layer.color as keyof typeof colorStyles];
                  return (
                    <div
                      key={layer.id}
                      className={`bg-surface border rounded-3xl shadow-card p-7 md:p-9 ${c.border}`}
                    >
                      <div className="flex flex-col md:flex-row gap-10">
                        {/* Left */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-5">
                            <span className={`text-[13px] font-bold uppercase tracking-[0.18em] ${c.num} font-mono`}>
                              {layer.number}
                            </span>
                            <span
                              className={`text-[12px] font-bold uppercase tracking-[0.14em] px-3 py-1.5 rounded-full border ${c.tagBg}`}
                            >
                              {layer.tag}
                            </span>
                          </div>
                          <h3 className="text-[22px] md:text-[24px] font-semibold text-text-primary mb-1.5">
                            {layer.title}
                          </h3>
                          <p className="text-[15px] font-medium text-text-muted mb-5">{layer.subtitle}</p>
                          <p className="text-[16px] text-text-secondary leading-[1.7] mb-6">
                            {layer.description}
                          </p>
                          {layer.threat && (
                            <div className={`rounded-2xl p-5 ${c.threatBg}`}>
                              <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-text-muted mb-2">
                                Threat Vector
                              </p>
                              <p className={`text-[15px] leading-[1.65] ${c.threatText}`}>
                                {layer.threat}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Right: capabilities */}
                        <div className="flex-1 flex flex-col gap-4">
                          <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-text-muted">
                            Capabilities
                          </p>
                          <div className="flex flex-col gap-3">
                            {layer.details.map((detail, i) => (
                              <div
                                key={i}
                                className="flex items-start gap-3 bg-surface-2 border border-border rounded-2xl p-4"
                              >
                                <div className="w-6 h-6 rounded-full bg-surface border border-border flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <span className="text-[10px] font-bold text-text-muted">{i + 1}</span>
                                </div>
                                <p className="text-[15px] text-text-secondary leading-[1.6]">{detail}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Why private key isolation matters */}
        <section className="max-w-7xl mx-auto px-6 py-24 md:py-28">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <div>
              <SectionHeader
                eyebrow="Key Isolation"
                title="Why the private key must never reach the AI layer"
              />
              <div className="mt-8 flex flex-col gap-6">
                <p className="text-[16px] text-text-secondary leading-[1.7]">
                  In AI-powered wallet architectures, there's a tempting shortcut: give the LLM direct signing
                  capability so it can "complete tasks autonomously." This is catastrophic from a security standpoint.
                </p>
                <p className="text-[16px] text-text-secondary leading-[1.7]">
                  LLMs are probabilistic systems. They can be manipulated by sufficiently clever prompts —
                  this is well-documented in the research literature. If the private key is accessible in the
                  AI's context window or callable via the AI's tools, a single successful jailbreak can drain a wallet.
                </p>
                <p className="text-[16px] text-text-secondary leading-[1.7]">
                  PromptShield enforces a hard boundary: the AI can only <em>propose</em>. It cannot
                  <em>sign</em>. The policy engine is the gatekeeper, and the OWS wallet only responds to
                  policy-approved requests. The key never moves.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {/* Comparison cards */}
              <div className="bg-danger-subtle border border-danger/20 rounded-3xl p-6">
                <div className="flex items-center gap-2.5 mb-4">
                  <svg className="w-4 h-4 text-danger" viewBox="0 0 16 16" fill="none">
                    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <p className="text-[16px] font-semibold text-danger">Without PromptShield</p>
                </div>
                <div className="flex flex-col gap-2.5">
                  {[
                    "AI has direct signing access",
                    "One jailbreak = wallet drained",
                    "No audit trail",
                    "No policy enforcement",
                  ].map((t) => (
                    <p key={t} className="text-[14px] text-danger/80 flex items-center gap-2">
                      <span className="text-danger/50">✗</span> {t}
                    </p>
                  ))}
                </div>
              </div>

              <div className="bg-accent-subtle border border-accent/20 rounded-3xl p-6">
                <div className="flex items-center gap-2.5 mb-4">
                  <svg className="w-4 h-4 text-accent" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="text-[16px] font-semibold text-accent">With PromptShield</p>
                </div>
                <div className="flex flex-col gap-2.5">
                  {[
                    "AI only proposes transactions",
                    "Policy engine enforces every rule",
                    "Private key fully isolated",
                    "Immutable audit log for all decisions",
                  ].map((t) => (
                    <p key={t} className="text-[14px] text-accent/85 flex items-center gap-2">
                      <span className="text-accent/50">✓</span> {t}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Design Principles */}
        <section className="bg-surface-2 border-t border-border py-24 md:py-28">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col gap-10">
              <SectionHeader
                eyebrow="Design Principles"
                title="Security principles"
                centered
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {principles.map((p) => (
                  <div
                    key={p.title}
                    className="bg-surface border border-border rounded-3xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-surface-2 border border-border flex items-center justify-center mb-5 text-text-secondary">
                      {p.icon}
                    </div>
                    <h3 className="text-[18px] font-semibold text-text-primary mb-2.5">{p.title}</h3>
                    <p className="text-[15px] text-text-muted leading-[1.65]">{p.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-7xl mx-auto px-6 py-24">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-surface border border-border rounded-3xl p-9 shadow-card">
            <div>
              <h3 className="text-[24px] font-semibold text-text-primary mb-2">
                See it defend against a real attack
              </h3>
              <p className="text-[16px] text-text-secondary leading-[1.65]">
                Run preset jailbreak scenarios in the interactive demo and watch the policy engine respond.
              </p>
            </div>
            <Link
              href="/demo"
              className="flex-shrink-0 px-7 py-3.5 rounded-xl bg-ink text-background text-[15px] font-semibold hover:bg-ink/92 transition-all shadow-card hover:-translate-y-0.5 duration-200 whitespace-nowrap"
            >
              Open Demo →
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
