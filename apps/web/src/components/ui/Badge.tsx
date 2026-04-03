import { ReactNode } from "react";

type BadgeVariant = "default" | "accent" | "danger" | "warning" | "outline" | "dark";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "border border-border bg-surface-3 text-text-secondary",
  accent: "border border-accent/20 bg-accent-subtle text-accent",
  danger: "border border-danger/20 bg-danger-subtle text-danger",
  warning: "border border-warning/30 bg-warning-subtle text-warning",
  outline: "border border-border bg-transparent text-text-secondary",
  dark: "border border-ink bg-ink text-background"
};

const dotStyles: Record<BadgeVariant, string> = {
  default: "bg-text-muted",
  accent: "bg-accent-light",
  danger: "bg-danger-light",
  warning: "bg-warning",
  outline: "bg-text-muted",
  dark: "bg-background"
};

export default function Badge({
  children,
  variant = "default",
  dot = false,
  className = ""
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium tracking-wide ${variantStyles[variant]} ${className}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dotStyles[variant]}`} />}
      {children}
    </span>
  );
}
