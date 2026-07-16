interface AuraWordmarkProps {
  className?: string;
  showMark?: boolean;
  size?: "sm" | "md" | "hero";
}

const markSizes = {
  sm: 18,
  md: 24,
  hero: 48,
};

export default function AuraWordmark({
  className = "",
  showMark = true,
  size = "md",
}: AuraWordmarkProps) {
  const mark = markSizes[size];

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      {showMark && (
        <svg
          width={mark}
          height={mark}
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
          className="shrink-0 text-gold"
        >
          <circle
            cx="12"
            cy="12"
            r="10.5"
            stroke="currentColor"
            strokeWidth="0.75"
            opacity="0.45"
          />
          <path
            d="M12 5 L15.5 17 L12 13 L8.5 17 Z"
            fill="currentColor"
            opacity="0.9"
          />
        </svg>
      )}
      <span className="font-display font-light leading-none tracking-wide">AURA</span>
    </span>
  );
}
