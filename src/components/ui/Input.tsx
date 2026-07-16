import { cn } from "@/lib/cn";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export default function Input({ label, className, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <label className="block" htmlFor={inputId}>
      {label && (
        <span className="text-label-sm uppercase tracking-[0.15em] text-dim">
          {label}
        </span>
      )}
      <input
        id={inputId}
        className={cn(
          "focus-ring mt-1.5 w-full rounded-sm border border-border bg-transparent px-3 py-2.5 text-sm text-foreground transition-colors duration-200 placeholder:text-dim focus:border-bordeaux",
          className,
        )}
        {...props}
      />
    </label>
  );
}
