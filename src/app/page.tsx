"use client";

import Hero from "@/components/Hero";
import ServicesPreview from "@/components/ServicesPreview";
import HairDiagnostics from "@/components/HairDiagnostics";
import HotSlots from "@/components/HotSlots";
import SiteFooter from "@/components/SiteFooter";
import SectionHeader from "@/components/SectionHeader";
import LookbookGallery from "@/components/LookbookGallery";
import Testimonials from "@/components/Testimonials";
import { useBooking } from "@/components/BookingProvider";
import { HAIR_CONCERNS, LOOKBOOK_ITEMS, TESTIMONIALS } from "@/data/content";

export default function Home() {
  const { openBooking } = useBooking();

  return (
    <main className="pb-24">
      <Hero />

      <div className="mx-auto max-w-wide space-y-24 px-5 pt-20 sm:space-y-28 sm:px-8 sm:pt-24 lg:space-y-32 lg:px-12 lg:pt-28">
        <ServicesPreview />

        <section id="lookbook" className="scroll-mt-28">
          <SectionHeader
            step="Gallery"
            title="The Lookbook"
            description="Transformations from our atelier — colour architecture, precision cuts, and ritual care."
          />
          <LookbookGallery items={LOOKBOOK_ITEMS} />
        </section>

        <section id="care" className="scroll-mt-28">
          <SectionHeader
            step="Step 3 · Personalise"
            title="Hair Care Guide"
            description="Not sure what you need? Pick a concern — we'll suggest a treatment and a home-care tip."
          />
          <HairDiagnostics concerns={HAIR_CONCERNS} />
        </section>

        <section id="testimonials" className="scroll-mt-28">
          <SectionHeader
            step="Client Stories"
            title="What They Say"
            description="Editorial voices from our regulars — discretion, precision, and results that endure."
          />
          <Testimonials items={TESTIMONIALS} />
        </section>

        <section id="booking" className="scroll-mt-28">
          <SectionHeader
            step="Step 4 · Reserve"
            title="Book Your Visit"
            description="Pick an open slot below to confirm instantly, or choose another date and time."
          />
          <HotSlots onBook={(slot) => openBooking({ slot })} />
        </section>
      </div>

      <SiteFooter />
    </main>
  );
}
