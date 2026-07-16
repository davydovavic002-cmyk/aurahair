"use client";

import { motion } from "framer-motion";
import type { Testimonial } from "@/data/content";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { EASE_LUXURY } from "@/lib/motion";

interface TestimonialsProps {
  items: Testimonial[];
}

export default function Testimonials({ items }: TestimonialsProps) {
  const reduced = useReducedMotion();

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, index) => (
        <motion.blockquote
          key={item.id}
          initial={reduced ? false : { opacity: 0, y: 24 }}
          whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, delay: index * 0.08, ease: EASE_LUXURY }}
          className="flex flex-col border border-border bg-card p-6 backdrop-blur-sm transition-colors duration-300 hover:border-bordeaux/25 sm:p-7"
        >
          <span className="font-display text-4xl leading-none text-gold/40" aria-hidden>
            &ldquo;
          </span>
          <p className="mt-2 flex-1 font-display text-lg italic leading-relaxed text-foreground sm:text-xl">
            {item.quote}
          </p>
          <footer className="mt-6 border-t border-border pt-4">
            <cite className="not-italic">
              <p className="text-sm font-medium text-foreground">{item.name}</p>
              <p className="mt-1 text-label-sm text-dim">{item.service}</p>
            </cite>
          </footer>
        </motion.blockquote>
      ))}
    </div>
  );
}
