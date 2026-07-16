"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { Service } from "@/data/content";
import { CARD_HOVER, BOOK_CTA } from "@/lib/interactive";
import { useReducedMotion } from "@/lib/use-reduced-motion";

interface ServiceCardProps {
  service: Service;
  index?: number;
  onBook: () => void;
  className?: string;
  emphasis?: boolean;
}

export default function ServiceCard({
  service,
  index = 0,
  onBook,
  className = "",
  emphasis = false,
}: ServiceCardProps) {
  const reduced = useReducedMotion();

  return (
    <motion.button
      type="button"
      onClick={onBook}
      aria-label={`Book ${service.name}`}
      initial={reduced ? false : { opacity: 0, y: 16 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{
        duration: 0.5,
        delay: index * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`${CARD_HOVER} flex h-full flex-col overflow-hidden border border-border bg-card text-left backdrop-blur-sm ${className}`}
    >
      {service.image && (
        <div
          className={`relative shrink-0 overflow-hidden bg-bg-muted ${
            emphasis ? "aspect-[16/9] sm:aspect-[5/3]" : "aspect-[16/10]"
          }`}
        >
          <Image
            src={service.image}
            alt=""
            fill
            unoptimized
            sizes={
              emphasis
                ? "(max-width: 768px) 100vw, 560px"
                : "(max-width: 768px) 100vw, 280px"
            }
            className="object-cover transition-transform duration-700 ease-luxury group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
      )}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="text-label text-gold">
          {service.featured ? "Signature" : service.category}
        </p>
        <h3 className="mt-3 font-display text-lg leading-snug text-foreground transition-colors group-hover:text-bordeaux sm:text-xl">
          {service.name}
        </h3>
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted">
          {service.description}
        </p>
        <div className="mt-auto flex items-center justify-between pt-4 text-label uppercase tracking-[0.15em]">
          <span className="text-dim">{service.duration}</span>
          <span className="font-medium text-bordeaux">{service.price}</span>
        </div>
        <p className={`mt-3 ${BOOK_CTA}`}>Reserve</p>
      </div>
    </motion.button>
  );
}
