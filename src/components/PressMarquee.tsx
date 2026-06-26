"use client";

import { PRESS_MENTIONS } from "@/data/content";

export default function PressMarquee() {
  const items = [...PRESS_MENTIONS, ...PRESS_MENTIONS];

  return (
    <div className="relative overflow-hidden border-y border-border py-5">
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-bg to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-bg to-transparent"
        aria-hidden
      />

      <div className="flex w-max animate-marquee items-center gap-12">
        {items.map((name, i) => (
          <span
            key={`${name}-${i}`}
            className="shrink-0 font-display text-sm tracking-wide text-muted sm:text-base"
          >
            {name}
          </span>
        ))}
      </div>

      <p className="sr-only">Press mentions: {PRESS_MENTIONS.join(", ")}</p>
    </div>
  );
}
