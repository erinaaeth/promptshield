import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Badge from "@/components/ui/Badge";
import HeroDemoCard from "@/components/ui/HeroDemoCard";

const badges = [
  { label: "OWS Secured", variant: "accent" as const, dot: true },
  { label: "Private Key Isolated", variant: "default" as const },
  { label: "Policy Controlled", variant: "default" as const },
];

export default function HomePage() {
  const stableContainer = "mx-auto w-full max-w-[1240px] px-5";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-16">
        <section className={`${stableContainer} py-16 md:py-20`}>
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.96fr)_minmax(320px,380px)] gap-12 lg:gap-14 items-center">
            <div className="flex flex-col gap-7 animate-on-load">
              <div className="flex flex-col gap-5">
                <h1 className="max-w-[13ch] text-[2.8rem] md:text-[3.45rem] lg:text-[3.95rem] font-bold tracking-[-0.04em] text-text-primary leading-[0.98]">
                  AI can be manipulated.
                  <span className="block text-text-secondary">Your wallet cannot.</span>
                </h1>
                <p className="max-w-[34rem] text-[1rem] text-text-secondary leading-[1.68]">
                  PromptShield blocks unsafe AI-generated transactions before they ever reach signing.
                </p>
              </div>

              <div className="inline-flex w-fit items-center gap-2 rounded-2xl border border-danger/15 bg-danger-subtle px-4 py-2.5 text-[13px] font-medium text-danger/90 shadow-card">
                <span className="h-2 w-2 rounded-full bg-danger-light" />
                AI agents can be manipulated into draining wallets.
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/demo"
                  className="px-8 py-3.5 rounded-xl bg-accent text-background text-[15px] font-semibold hover:bg-accent/92 transition-all shadow-card hover:shadow-card-hover hover:scale-[1.01] duration-200"
                >
                  Run Live Demo
                </Link>
                <Link
                  href="/architecture"
                  className="px-7 py-3.5 rounded-xl bg-surface border border-border text-text-primary text-[15px] font-medium hover:border-border-strong transition-all shadow-card hover:shadow-card-hover hover:scale-[1.01] duration-200"
                >
                  View Architecture
                </Link>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {badges.map((badge) => (
                  <Badge key={badge.label} variant={badge.variant} dot={badge.dot}>
                    {badge.label}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex justify-center lg:justify-end animate-on-load delay-200">
              <HeroDemoCard />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
