"use client";

import { useTheme } from "@/components/ThemeProvider";
import { motion } from "framer-motion";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      className={`relative flex h-8 w-14 items-center rounded-full border border-border bg-bg-muted p-1 ${className}`}
    >
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
        className={`flex h-6 w-6 items-center justify-center rounded-full bg-bordeaux text-[10px] text-white shadow-sm ${
          theme === "dark" ? "ml-auto" : ""
        }`}
      >
        {theme === "light" ? "☀" : "☾"}
      </motion.div>
    </button>
  );
}
