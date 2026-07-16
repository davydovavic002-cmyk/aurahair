"use client";

import { useEffect, useState } from "react";
import { useReducedMotion as useFramerReducedMotion } from "framer-motion";

/** Avoids hydration mismatch — returns false until client mount. */
export function useReducedMotion(): boolean {
  const framerReduced = useFramerReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return false;
  return framerReduced ?? false;
}
