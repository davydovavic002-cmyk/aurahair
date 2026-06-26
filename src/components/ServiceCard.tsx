"use client";

import { motion } from "framer-motion";
import type { Service } from "@/data/content";
import { CARD_HOVER } from "@/lib/interactive";

interface ServiceCardProps {
  service: Service;
  index?: number;
  onBook: () => void;
}

export default function ServiceCard({
  service,
  index = 0,
  onBook,
}: ServiceCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onBook}
      aria-label={`Book ${service.name}`}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{
        duration: 0.5,
        delay: index * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`${CARD_HOVER} border border-border bg-card p-5 text-left backdrop-blur-sm sm:p-6`}
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-gold">
        Signature
      </p>
      <h3 className="mt-3 font-display text-lg text-foreground transition-colors group-hover:text-bordeaux">
        {service.name}
      </h3>
      <p className="mt-2 text-xs leading-relaxed text-muted">
        {service.description}
      </p>
      <div className="mt-4 flex items-center justify-between text-[11px] uppercase tracking-[0.15em]">
        <span className="text-dim">{service.duration}</span>
        <span className="font-medium text-bordeaux">{service.price}</span>
      </div>
    </motion.button>
  );
}
