"use client";

import { motion } from "framer-motion";
import { getFeaturedServices } from "@/data/content";
import { useBooking } from "@/components/BookingProvider";
import ServiceCard from "@/components/ServiceCard";
import SectionHeader from "@/components/SectionHeader";
import Badge from "@/components/ui/Badge";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { EASE_LUXURY } from "@/lib/motion";

export default function ServicesPreview() {
  const reduced = useReducedMotion();
  const featured = getFeaturedServices();
  const { openBooking } = useBooking();

  return (
    <section id="highlights" className="scroll-mt-28">
      <motion.div
        initial={reduced ? false : { opacity: 0 }}
        whileInView={reduced ? undefined : { opacity: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: EASE_LUXURY }}
      >
        <SectionHeader
          step="Step 2 · Explore"
          title="Signature Services"
          description="Tap a service to book, or open the full menu for all treatments and prices."
          className="mb-4 sm:mb-5"
        />

        <div className="mb-8 flex items-center justify-between gap-3 sm:mb-10">
          <Badge variant="bordeaux">Hits</Badge>
          <a
            href="#modal-menu"
            className="focus-ring inline-flex shrink-0 items-center justify-center border-2 border-bordeaux px-5 py-2.5 text-label uppercase tracking-[0.2em] text-bordeaux transition-all duration-300 ease-luxury hover:bg-bordeaux-soft hover:shadow-[0_4px_16px_rgba(92,33,53,0.12)]"
          >
            Full Menu →
          </a>
        </div>

        <div className="grid auto-rows-fr items-stretch gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
          {featured.map((service, index) => (
            <ServiceCard
              key={service.id}
              service={service}
              index={index}
              emphasis={index < 2}
              onBook={() => openBooking({ serviceName: service.name })}
            />
          ))}
        </div>
      </motion.div>
    </section>
  );
}
