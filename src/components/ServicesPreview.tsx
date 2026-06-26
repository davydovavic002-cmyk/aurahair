"use client";

import { motion } from "framer-motion";
import { getFeaturedServices } from "@/data/content";
import { useBooking } from "@/components/BookingProvider";
import ServiceCard from "@/components/ServiceCard";
import SectionHeader from "@/components/SectionHeader";

export default function ServicesPreview() {
  const featured = getFeaturedServices();
  const { openBooking } = useBooking();

  return (
    <section id="highlights" className="scroll-mt-28">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
      >
        <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeader
            step="Step 2 · Explore"
            title="Signature Services"
            description="Tap a service to book, or open the full menu for all treatments and prices."
            className="mb-0"
          />
          <a
            href="#modal-menu"
            className="shrink-0 border border-border px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.2em] text-muted transition-all duration-300 hover:border-bordeaux/30 hover:text-foreground"
          >
            Full Menu →
          </a>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:gap-6">
          {featured.map((service, index) => (
            <ServiceCard
              key={service.id}
              service={service}
              index={index}
              onBook={() => openBooking({ serviceName: service.name })}
            />
          ))}
        </div>
      </motion.div>
    </section>
  );
}
