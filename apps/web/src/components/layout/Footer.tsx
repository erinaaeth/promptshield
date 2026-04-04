import Link from "next/link";

export default function Footer() {
  const stableContainer = "mx-auto w-full max-w-[1240px] px-5";

  return (
    <footer className="border-t border-border bg-surface">
      <div className={`${stableContainer} py-14`}>
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-text-primary">
                <svg className="h-4 w-4 text-background" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M8 1L13 3.5V7.5C13 10.5 10.5 13 8 14.5C5.5 13 3 10.5 3 7.5V3.5L8 1Z"
                    fill="currentColor"
                    fillOpacity="0.3"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M5.5 8L7 9.5L10.5 6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="text-[16px] font-semibold text-text-primary">PromptShield</span>
            </div>
            <p className="max-w-[340px] text-[14px] leading-[1.7] text-text-secondary">
              Policy-gated AI execution for OWS wallets, designed as a calm security layer between language models, wallet actions, and execution.
            </p>
          </div>

          <div className="flex flex-col gap-7 sm:flex-row sm:gap-16">
            <div className="flex flex-col gap-3">
              <p className="text-[12px] font-semibold uppercase tracking-widest text-text-muted">Product</p>
              <div className="flex flex-col gap-2.5">
                <Link href="/demo" className="text-[14px] text-text-secondary transition-colors hover:text-text-primary">
                  Demo
                </Link>
                <Link href="/architecture" className="text-[14px] text-text-secondary transition-colors hover:text-text-primary">
                  Architecture
                </Link>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <p className="text-[12px] font-semibold uppercase tracking-widest text-text-muted">Resources</p>
              <div className="flex flex-col gap-2.5">
                <Link
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[14px] text-text-secondary transition-colors hover:text-text-primary"
                >
                  GitHub
                </Link>
                <Link href="#" className="text-[14px] text-text-secondary transition-colors hover:text-text-primary">
                  OWS Docs
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <p className="text-[13px] text-text-muted">
            © 2025 PromptShield. Security platform demo.
          </p>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-light animate-pulse-slow" />
            <span className="text-[13px] text-text-muted">Policy Firewall Active</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
