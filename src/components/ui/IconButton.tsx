import { forwardRef } from "react";
import { cn } from "@/lib/cn";

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md";
  bordered?: boolean;
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    { size = "md", bordered = true, className, children, ...props },
    ref,
  ) {
    const sizes = {
      sm: "h-7 w-7",
      md: "h-9 w-9",
    };

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "focus-ring inline-flex shrink-0 items-center justify-center text-muted transition-colors duration-200 hover:text-foreground",
          bordered && "border border-border hover:border-bordeaux/30",
          sizes[size],
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);

export default IconButton;
