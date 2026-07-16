"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { HairConcern, HairConcernData } from "@/data/content";
import { useBooking } from "@/components/BookingProvider";
import Button from "@/components/ui/Button";
import Label from "@/components/ui/Label";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { EASE_LUXURY } from "@/lib/motion";

interface HairDiagnosticsProps {
  concerns: HairConcernData[];
}

export default function HairDiagnostics({ concerns }: HairDiagnosticsProps) {
  const reduced = useReducedMotion();
  const { openBooking } = useBooking();
  const [selected, setSelected] = useState<HairConcern | null>(null);
  const active = concerns.find((c) => c.id === selected);

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 20 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: EASE_LUXURY }}
    >
      <div className="border border-border bg-card p-5 backdrop-blur-sm sm:p-7">
        <div className="mb-4 flex items-center gap-2">
          <div className="h-px w-4 bg-gold" />
          <Label>Hair Diagnostics</Label>
        </div>

        <p className="font-display text-xl text-foreground sm:text-2xl">
          What&apos;s your main concern?
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {concerns.map((concern) => (
            <button
              key={concern.id}
              type="button"
              onClick={() =>
                setSelected(selected === concern.id ? null : concern.id)
              }
              className={`focus-ring rounded-full border px-4 py-2 text-xs font-medium tracking-wide transition-all duration-300 ${
                selected === concern.id
                  ? "border-bordeaux bg-bordeaux text-white"
                  : "border-border text-muted hover:border-bordeaux/30 hover:text-foreground"
              }`}
            >
              {concern.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {active && (
            <motion.div
              key={active.id}
              initial={reduced ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={reduced ? undefined : { opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: EASE_LUXURY }}
              className="overflow-hidden"
            >
              <div className="mt-5 border-t border-border pt-5">
                <Label variant="gold">We recommend</Label>
                <h3 className="mt-2 font-display text-xl text-foreground">
                  {active.service}
                </h3>
                <p className="mt-1 text-sm text-muted">{active.serviceDetail}</p>

                <Button
                  variant="primary"
                  onClick={() => openBooking({ serviceName: active.service })}
                  className="mt-4"
                >
                  Book this treatment
                </Button>

                <div className="mt-4 rounded-sm bg-bg-muted p-4">
                  <Label>Home care tip</Label>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {active.tip}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
