import { ReactNode } from "react";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  tag?: string;
  className?: string;
}

export default function FeatureCard({
  icon,
  title,
  description,
  tag,
  className = ""
}: FeatureCardProps) {
  return (
    <div
      className={`group relative rounded-2xl border border-border bg-surface p-7 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-hover ${className}`}
    >
      {tag && (
        <span className="absolute right-5 top-5 text-[12px] font-semibold uppercase tracking-widest text-text-muted">
          {tag}
        </span>
      )}
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-surface-2 transition-colors group-hover:border-accent/20 group-hover:bg-accent-subtle">
        <span className="text-text-secondary transition-colors group-hover:text-accent">{icon}</span>
      </div>
      <h3 className="mb-3 text-[18px] font-semibold text-text-primary">{title}</h3>
      <p className="text-[15px] leading-[1.68] text-text-secondary">{description}</p>
    </div>
  );
}
