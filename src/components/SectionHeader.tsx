interface SectionHeaderProps {
  step: string;
  title: string;
  description: string;
  className?: string;
}

export default function SectionHeader({
  step,
  title,
  description,
  className = "",
}: SectionHeaderProps) {
  return (
    <div className={`mb-8 max-w-md sm:mb-10 ${className}`}>
      <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-gold">
        {step}
      </p>
      <h2 className="mt-2 font-display text-2xl font-light tracking-wide text-foreground sm:text-3xl">
        {title}
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-muted">{description}</p>
    </div>
  );
}
