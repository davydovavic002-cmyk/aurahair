"use client";

import { useTheme } from "@/components/ThemeProvider";
import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/cn";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      className={cn(
        "focus-ring relative flex h-8 w-14 items-center rounded-full border border-border bg-bg-muted p-1",
        className,
      )}
    >
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded-full bg-bordeaux text-white shadow-sm",
          theme === "dark" && "ml-auto",
        )}
      >
        {theme === "light" ? (
          <Sun className="h-3.5 w-3.5" aria-hidden />
        ) : (
          <Moon className="h-3.5 w-3.5" aria-hidden />
        )}
      </motion.div>
    </button>
  );
}
