"use client";

import { useReducedMotion } from "framer-motion";
import { EASE_LUXURY } from "@/lib/motion";

export function useLuxuryMotion() {
  const reduced = useReducedMotion();

  return {
    reduced: !!reduced,
    transition: reduced
      ? { duration: 0 }
      : { duration: 0.6, ease: EASE_LUXURY },
    fadeUp: reduced
      ? { initial: false, animate: { opacity: 1, y: 0 } }
      : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } },
    fadeIn: reduced
      ? { initial: false, animate: { opacity: 1 } }
      : { initial: { opacity: 0 }, animate: { opacity: 1 } },
    slideUp: reduced
      ? { initial: false, animate: { opacity: 1, y: 0 } }
      : { initial: { opacity: 0, y: 48 }, animate: { opacity: 1, y: 0 } },
    whileInView: reduced
      ? undefined
      : {
          initial: { opacity: 0, y: 20 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-50px" },
        },
  };
}
