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
    <div className={`flex flex-col gap-4 ${centered ? "items-center text-center" : ""} ${className}`}>
      {eyebrow && (
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-text-muted">
          {eyebrow}
        </p>
      )}
      <h2 className="text-[1.7rem] md:text-[1.95rem] font-semibold leading-[1.1] text-text-primary">
        {title}
      </h2>
      {description && (
        <p
          className={`text-[15px] leading-[1.66] text-text-secondary ${
            centered ? "max-w-2xl" : "max-w-3xl"
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}
