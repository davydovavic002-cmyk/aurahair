import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "ghost" | "gold-outline" | "gold-soft";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-bordeaux text-white hover:bg-bordeaux/90 hover:-translate-y-0.5 hover:shadow-card disabled:opacity-30",
  ghost:
    "border border-border text-muted hover:border-bordeaux/30 hover:text-foreground",
  "gold-outline":
    "border border-gold/40 bg-gold/10 text-gold hover:bg-gold/20 hover:-translate-y-0.5",
  "gold-soft":
    "border border-bordeaux/30 text-bordeaux hover:bg-bordeaux-soft",
};

export default function Button({
  variant = "primary",
  fullWidth = false,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "focus-ring inline-flex items-center justify-center px-5 py-3.5 text-label uppercase tracking-[0.2em] transition-all duration-300 ease-luxury",
        variants[variant],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
