import { cn } from "@/lib/cn";

interface LabelProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "gold" | "dim";
}

export default function Label({
  children,
  className,
  variant = "default",
}: LabelProps) {
  const colors = {
    default: "text-dim",
    gold: "text-gold",
    dim: "text-muted",
  };

  return (
    <p
      className={cn(
        "text-label font-medium uppercase",
        colors[variant],
        className,
      )}
    >
      {children}
    </p>
  );
}
