import { cn } from "@/lib/cn";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "gold" | "bordeaux" | "neutral";
  className?: string;
}

export default function Badge({
  children,
  variant = "gold",
  className,
}: BadgeProps) {
  const variants = {
    gold: "bg-gold-soft text-gold",
    bordeaux: "bg-bordeaux-soft text-bordeaux",
    neutral: "bg-bg-muted text-dim",
  };

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.12em]",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
