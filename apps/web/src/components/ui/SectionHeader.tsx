interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  centered?: boolean;
  className?: string;
}

export default function SectionHeader({
  eyebrow,
  title,
  description,
  centered = false,
  className = ""
}: SectionHeaderProps) {
  return (
    <div className={`flex flex-col gap-5 ${centered ? "items-center text-center" : ""} ${className}`}>
      {eyebrow && (
        <p className="text-[13px] font-semibold uppercase tracking-[0.15em] text-text-muted">
          {eyebrow}
        </p>
      )}
      <h2 className="text-display-sm font-semibold leading-[1.12] text-text-primary">
        {title}
      </h2>
      {description && (
        <p
          className={`text-body-md leading-[1.72] text-text-secondary ${
            centered ? "max-w-2xl" : "max-w-3xl"
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}
