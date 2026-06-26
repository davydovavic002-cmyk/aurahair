"use client";

import Hero from "@/components/Hero";
import ServicesPreview from "@/components/ServicesPreview";
import HairDiagnostics from "@/components/HairDiagnostics";
import HotSlots from "@/components/HotSlots";
import PrestigeBar from "@/components/PrestigeBar";
import SiteFooter from "@/components/SiteFooter";
import SectionHeader from "@/components/SectionHeader";
import { useBooking } from "@/components/BookingProvider";
import { HAIR_CONCERNS, HOT_SLOTS } from "@/data/content";

export default function Home() {
  const { openBooking } = useBooking();

  return (
    <main className="pb-24">
      <Hero />

      <div className="mx-auto max-w-wide space-y-24 px-5 pt-20 sm:space-y-28 sm:px-8 sm:pt-24 lg:space-y-32 lg:px-12 lg:pt-28">
        <ServicesPreview />

        <section id="care" className="scroll-mt-28">
          <SectionHeader
            step="Step 3 · Personalise"
            title="Hair Care Guide"
            description="Not sure what you need? Pick a concern — we'll suggest a treatment and a home-care tip."
          />
          <HairDiagnostics concerns={HAIR_CONCERNS} />
        </section>

        <section id="booking" className="scroll-mt-28">
          <SectionHeader
            step="Step 4 · Reserve"
            title="Book Your Visit"
            description="Pick an open slot below to confirm instantly, or choose another date and time."
          />
          <HotSlots
            slots={HOT_SLOTS}
            onBook={(slot) => openBooking({ slot })}
          />
        </section>
      </div>

      <PrestigeBar />
      <SiteFooter />
    </main>
  );
}
