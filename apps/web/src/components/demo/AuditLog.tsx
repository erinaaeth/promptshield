"use client";

import { AuditEvent } from "@/types";

interface AuditLogProps {
  events: AuditEvent[];
  processing?: boolean;
  phase?: "prompt" | "ai" | "draft" | "policy" | "trust" | "verdict" | "done";
}

const statusConfig = {
  info: {
    dot: "bg-text-muted",
    line: "bg-border",
    badge: "bg-surface-2 text-text-muted border-border",
    icon: "text-text-muted",
  },
  warning: {
    dot: "bg-warning",
    line: "bg-warning/30",
    badge: "bg-warning-subtle text-warning border-warning/30",
    icon: "text-warning",
  },
  blocked: {
    dot: "bg-danger-light",
    line: "bg-danger/20",
    badge: "bg-danger-subtle text-danger border-danger/20",
    icon: "text-danger",
  },
  allowed: {
    dot: "bg-accent-light",
    line: "bg-accent/20",
    badge: "bg-accent-subtle text-accent border-accent/20",
    icon: "text-accent",
  },
};

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toISOString().replace("T", " ").replace("Z", "").split(".")[0] +
    "." +
    d.getMilliseconds().toString().padStart(3, "0");
}

export default function AuditLog({
  events,
  processing = false,
  phase = "done",
}: AuditLogProps) {
  const phaseLabel =
    phase === "prompt"
      ? "PROMPT"
      : phase === "ai"
      ? "AI"
      : phase === "draft"
      ? "DRAFT"
      : phase === "policy"
      ? "POLICY"
      : phase === "trust"
      ? "TRUST"
      : phase === "verdict"
      ? "VERDICT"
      : "COMPLETE";

  return (
    <div className="bg-surface border border-border rounded-2xl shadow-card">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-text-muted mb-0.5">
            Transparency Layer
          </p>
          <h3 className="text-[15px] font-semibold text-text-primary">Audit Log</h3>
        </div>
        <div className="flex items-center gap-2">
          {processing ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" />
              <span className="text-[11.5px] text-text-muted">Pipeline: {phaseLabel}</span>
            </>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-accent-light animate-pulse" />
              <span className="text-[11.5px] text-text-muted">Immutable</span>
            </>
          )}
        </div>
      </div>

      {/* Log table header */}
      <div className="px-6 py-2.5 border-b border-border grid grid-cols-[140px_80px_1fr_200px] gap-4 hidden md:grid">
        {["Timestamp", "Step", "Event", "Detail"].map((h) => (
          <p key={h} className="text-[10.5px] font-semibold uppercase tracking-wider text-text-muted">
            {h}
          </p>
        ))}
      </div>

      {/* Events */}
      <div className="divide-y divide-border">
        {events.map((event, idx) => {
          const config = statusConfig[event.status];
          return (
            <div
              key={event.id}
              className={`px-6 py-4 grid grid-cols-1 md:grid-cols-[140px_80px_1fr_200px] gap-2 md:gap-4 items-start hover:bg-surface-2/50 transition-all duration-300 ${
                processing ? "opacity-95 rule-reveal" : "rule-reveal"
              }`}
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              {/* Timestamp */}
              <div className="font-mono text-[11px] text-text-muted whitespace-nowrap">
                {formatTimestamp(event.timestamp)}
              </div>

              {/* Step */}
              <div className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border ${config.badge}`}>
                  <span className="text-[10px] font-bold">{event.step}</span>
                </div>
              </div>

              {/* Event label */}
              <div className="flex items-center gap-2.5">
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.dot}`} />
                <span className="text-[13px] font-medium text-text-primary">{event.label}</span>
                <span className={`hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10.5px] font-semibold uppercase tracking-wide border ${config.badge}`}>
                  {event.status}
                </span>
              </div>

              {/* Detail */}
              <div>
                <p className="text-[12px] text-text-secondary leading-relaxed">{event.detail}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-6 py-3.5 border-t border-border flex items-center justify-between bg-surface-2/40 rounded-b-2xl">
        <p className="text-[11.5px] text-text-muted">
          {events.length} events recorded
        </p>
        <div className="flex items-center gap-3">
          {processing && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-warning/25 bg-warning-subtle px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-warning">
              <span className="h-1.5 w-1.5 rounded-full bg-warning animate-pulse" />
              Streaming
            </span>
          )}
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-danger-light" />
            <span className="text-[11px] text-text-muted">Blocked</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-accent-light" />
            <span className="text-[11px] text-text-muted">Allowed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-warning" />
            <span className="text-[11px] text-text-muted">Warning</span>
          </div>
        </div>
      </div>
    </div>
  );
}
