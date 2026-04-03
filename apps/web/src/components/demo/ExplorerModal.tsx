"use client";

interface ExplorerModalProps {
  open: boolean;
  onClose: () => void;
  txHash: string;
  status: string;
  timestamp: string;
  network: string;
  gasFee: string;
  from: string;
  to: string;
  confirmationTime: string;
}

export default function ExplorerModal({
  open,
  onClose,
  txHash,
  status,
  timestamp,
  network,
  gasFee,
  from,
  to,
  confirmationTime,
}: ExplorerModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/30 px-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-border bg-surface shadow-[0_30px_120px_rgba(20,16,10,0.20)]">
        <div className="flex items-center justify-between border-b border-border bg-surface-2 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-danger/40" />
              <span className="h-2.5 w-2.5 rounded-full bg-warning/40" />
              <span className="h-2.5 w-2.5 rounded-full bg-accent/40" />
            </div>
            <span className="ml-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-text-muted">
              Explorer View
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-[12px] font-medium text-text-secondary transition-colors hover:text-text-primary"
          >
            Close
          </button>
        </div>

        <div className="grid gap-5 p-5 md:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-surface-2 p-4">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
                Transaction Hash
              </p>
              <p className="break-all font-mono text-[13px] text-text-primary">{txHash}</p>
            </div>

            <div className="rounded-2xl border border-border bg-surface-2 p-4">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
                Transaction Overview
              </p>
              <div className="space-y-2.5 text-[12.5px]">
                <InfoRow label="Status" value={status} />
                <InfoRow label="Timestamp" value={timestamp} />
                <InfoRow label="Network" value={network} />
                <InfoRow label="Gas Fee" value={gasFee} />
                <InfoRow label="ETA" value={confirmationTime} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-surface-2 p-4">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
                Route
              </p>
              <div className="space-y-3">
                <AddressCard label="From" value={from} />
                <AddressCard label="To" value={to} />
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-surface-2 p-4">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
                Network Status
              </p>
              <div className="rounded-xl border border-border bg-surface p-3">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[12px] font-medium text-text-primary">Ethereum Mainnet</span>
                  <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-text-secondary">
                    Preview
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="h-2 rounded-full bg-border">
                    <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-accent-light to-accent" />
                  </div>
                  <p className="text-[11.5px] text-text-muted">
                    Explorer metadata reflects the current execution state of the request pipeline.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border pb-2 last:border-0 last:pb-0">
      <span className="text-text-muted">{label}</span>
      <span className="font-medium text-text-primary">{value}</span>
    </div>
  );
}

function AddressCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface px-3 py-2.5">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">
        {label}
      </p>
      <p className="break-all font-mono text-[12px] text-text-primary">{value}</p>
    </div>
  );
}
