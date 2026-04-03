export default function ArchDiagram() {
  return (
    <div className="bg-surface border border-border rounded-2xl shadow-card overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border">
        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-text-muted mb-0.5">
          System Design
        </p>
        <h3 className="text-[15px] font-semibold text-text-primary">Trust Model Diagram</h3>
      </div>

      <div className="p-8">
        {/* Diagram */}
        <div className="flex flex-col items-center gap-0">

          {/* Layer 1: User */}
          <div className="w-full max-w-2xl">
            <div className="bg-surface-2 border border-border rounded-2xl p-5 text-center shadow-card">
              <div className="w-10 h-10 rounded-xl bg-surface border border-border mx-auto mb-3 flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-text-secondary" />
              </div>
              <p className="text-[13px] font-semibold text-text-primary">User / dApp</p>
              <p className="text-[11.5px] text-text-muted mt-1">Natural language prompt or transaction intent</p>
            </div>
          </div>

          {/* Arrow down */}
          <ArrowDown label="prompt" />

          {/* Layer 2: AI Layer */}
          <div className="w-full max-w-2xl">
            <LayerCard
              color="warning"
              icon={<AIIcon className="w-5 h-5" />}
              title="AI Interpretation Layer"
              subtitle="LLM (GPT / Claude)"
              description="Parses natural language intent into structured transaction proposals. This layer can be manipulated by adversarial prompts."
              tag="UNTRUSTED"
              tagColor="warning"
              items={[
                "Converts text → transaction struct",
                "Infers chain, token, amount, recipient",
                "Vulnerable to prompt injection attacks",
              ]}
            />
          </div>

          {/* Arrow down */}
          <ArrowDown label="transaction proposal" />

          {/* Layer 3: Policy Engine */}
          <div className="w-full max-w-2xl">
            <LayerCard
              color="accent"
              icon={<PolicyIcon className="w-5 h-5" />}
              title="Policy Firewall Engine"
              subtitle="PromptShield Core"
              description="Evaluates every proposed transaction against a configurable ruleset. The single source of truth for what is and isn't allowed."
              tag="ENFORCED"
              tagColor="accent"
              items={[
                "Rule-based policy evaluation",
                "Amount, address & slippage limits",
                "Prompt injection pattern detection",
                "Immutable audit log generation",
              ]}
            />
          </div>

          {/* Fork: Blocked vs Allowed */}
          <div className="flex flex-col items-center my-2">
            <div className="w-px h-6 bg-border" />
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-surface-2 border border-border">
              <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">verdict</span>
            </div>
          </div>

          {/* Split outcomes */}
          <div className="w-full max-w-2xl grid grid-cols-2 gap-4">
            {/* Blocked */}
            <div className="bg-danger-subtle border border-danger/20 rounded-2xl p-5 text-center">
              <div className="w-9 h-9 rounded-xl bg-danger/10 mx-auto mb-3 flex items-center justify-center">
                <BlockedIcon className="w-4.5 h-4.5 text-danger" />
              </div>
              <p className="text-[13px] font-semibold text-danger">BLOCKED</p>
              <p className="text-[11.5px] text-danger/70 mt-1 leading-snug">
                Transaction rejected. Private key never accessed.
              </p>
              <div className="mt-3 flex flex-col gap-1.5">
                {["Audit event written", "User notified", "No chain interaction"].map((t) => (
                  <p key={t} className="text-[11px] text-danger/60 flex items-center gap-1.5">
                    <span>✗</span> {t}
                  </p>
                ))}
              </div>
            </div>

            {/* Allowed */}
            <div className="bg-accent-subtle border border-accent/20 rounded-2xl p-5 text-center">
              <div className="w-9 h-9 rounded-xl bg-accent/10 mx-auto mb-3 flex items-center justify-center">
                <AllowedIcon className="w-4.5 h-4.5 text-accent" />
              </div>
              <p className="text-[13px] font-semibold text-accent">ALLOWED</p>
              <p className="text-[11.5px] text-accent/70 mt-1 leading-snug">
                Transaction forwarded to wallet layer for signing.
              </p>
              <div className="mt-3 flex flex-col gap-1.5">
                {["Audit event written", "Wallet signer invoked", "Broadcast to chain"].map((t) => (
                  <p key={t} className="text-[11px] text-accent/60 flex items-center gap-1.5">
                    <span>✓</span> {t}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Arrow down (only allowed path) */}
          <div className="self-end w-1/2 flex flex-col items-center">
            <ArrowDown label="signed tx" />
          </div>

          {/* Layer 4: OWS Wallet */}
          <div className="w-full max-w-2xl">
            <LayerCard
              color="dark"
              icon={<WalletIcon className="w-5 h-5" />}
              title="OWS Wallet Layer"
              subtitle="Private Key Isolation"
              description="Signs and broadcasts only pre-approved transactions. The private key is never exposed to the AI or policy layers."
              tag="TRUSTED"
              tagColor="dark"
              items={[
                "Private key isolated from AI layer",
                "Signs only firewall-approved txs",
                "Broadcasts to target chain",
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ArrowDown({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center my-1 gap-0.5">
      <div className="w-px h-5 bg-border-strong" />
      <div className="flex items-center gap-2">
        <div className="w-px h-1 bg-border-strong" />
        <span className="text-[10.5px] font-mono font-medium text-text-muted px-2 py-0.5 rounded bg-surface-2 border border-border">
          {label}
        </span>
        <div className="w-px h-1 bg-border-strong" />
      </div>
      <div className="flex flex-col items-center">
        <div className="w-px h-4 bg-border-strong" />
        <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[7px] border-l-transparent border-r-transparent border-t-border-strong" />
      </div>
    </div>
  );
}

interface LayerCardProps {
  color: "warning" | "accent" | "dark";
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  tag: string;
  tagColor: "warning" | "accent" | "dark";
  items: string[];
}

const colorMap = {
  warning: {
    bg: "bg-warning-subtle border-warning/25",
    iconBg: "bg-warning/10",
    iconColor: "text-warning",
    tag: "bg-warning-subtle text-warning border-warning/30",
    bullet: "text-warning",
  },
  accent: {
    bg: "bg-accent-subtle/60 border-accent/20",
    iconBg: "bg-accent/10",
    iconColor: "text-accent",
    tag: "bg-accent-subtle text-accent border-accent/20",
    bullet: "text-accent",
  },
  dark: {
    bg: "bg-text-primary/5 border-text-primary/15",
    iconBg: "bg-text-primary/10",
    iconColor: "text-text-primary",
    tag: "bg-text-primary text-background border-text-primary",
    bullet: "text-text-primary",
  },
};

function LayerCard({ color, icon, title, subtitle, description, tag, tagColor, items }: LayerCardProps) {
  const c = colorMap[color];
  const t = colorMap[tagColor];
  return (
    <div className={`border rounded-2xl p-5 ${c.bg}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.iconBg}`}>
            <span className={c.iconColor}>{icon}</span>
          </div>
          <div>
            <p className="text-[13.5px] font-semibold text-text-primary">{title}</p>
            <p className="text-[11.5px] text-text-muted">{subtitle}</p>
          </div>
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${t.tag}`}>
          {tag}
        </span>
      </div>
      <p className="text-[12.5px] text-text-secondary mb-3 leading-relaxed">{description}</p>
      <div className="flex flex-wrap gap-x-5 gap-y-1.5">
        {items.map((item) => (
          <p key={item} className={`text-[11.5px] flex items-center gap-1.5 ${c.bullet}`}>
            <span className="text-[10px]">▸</span>
            <span className="text-text-secondary">{item}</span>
          </p>
        ))}
      </div>
    </div>
  );
}

// Icons
function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 17c0-3.5 3.1-6 7-6s7 2.5 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function AIIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none">
      <rect x="3" y="3" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 10h6M10 7v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function PolicyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none">
      <path d="M10 2L17 5.5v5C17 14.5 14 17.5 10 19c-4-1.5-7-4.5-7-8.5v-5L10 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function WalletIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none">
      <rect x="2" y="5" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 9h16" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="14.5" cy="13" r="1.5" fill="currentColor" />
    </svg>
  );
}
function BlockedIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 18 18" fill="none">
      <path d="M6 6l6 6M12 6l-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function AllowedIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 18 18" fill="none">
      <path d="M4 9l3.5 3.5L14 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
