"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { LookbookItem } from "@/data/content";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { EASE_LUXURY } from "@/lib/motion";

interface LookbookGalleryProps {
  items: LookbookItem[];
}

export default function LookbookGallery({ items }: LookbookGalleryProps) {
  const reduced = useReducedMotion();

  return (
    <div className="grid auto-rows-fr grid-flow-dense grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
      {items.map((item, index) => (
        <motion.figure
          key={item.id}
          initial={reduced ? false : { opacity: 0, y: 20 }}
          whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, delay: index * 0.05, ease: EASE_LUXURY }}
          className={`group relative min-h-[220px] overflow-hidden border border-border bg-bg-muted ${
            item.featured
              ? "col-span-2 row-span-2 aspect-[4/5] min-h-[320px] sm:min-h-[420px]"
              : "aspect-[3/4]"
          }`}
        >
          <Image
            src={item.image}
            alt={item.caption}
            fill
            unoptimized
            sizes={
              item.featured
                ? "(max-width: 768px) 100vw, 560px"
                : "(max-width: 768px) 50vw, 280px"
            }
            className="object-cover transition-transform duration-700 ease-luxury group-hover:scale-105"
          />
          <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-4 pb-4 pt-16 sm:px-5 sm:pb-5">
            <p className="text-label-sm text-gold">{item.technique}</p>
            <p className="mt-1 font-display text-sm leading-snug text-white sm:text-base">
              {item.caption}
            </p>
            {item.stylist && (
              <p className="mt-1.5 text-[10px] uppercase tracking-[0.15em] text-white/60">
                {item.stylist}
              </p>
            )}
          </figcaption>
        </motion.figure>
      ))}
    </div>
  );
}
