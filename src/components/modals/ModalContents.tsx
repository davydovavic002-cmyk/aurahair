"use client";

import Image from "next/image";
import {
  SERVICE_FILTERS,
  SERVICES,
  MASTERS,
  ABOUT_STORY,
  OPENING_HOURS,
  SALON_INFO,
  PRIVACY_POLICY,
  CANCELLATION_POLICY,
  type ServiceFilter,
  type PolicySection,
} from "@/data/content";
import { useBooking } from "@/components/BookingProvider";
import { CARD_HOVER, ROW_HOVER, BOOK_CTA } from "@/lib/interactive";

export function ServicesModalContent() {
  const { openBooking } = useBooking();

  const grouped = SERVICE_FILTERS.reduce(
    (acc, filter) => {
      acc[filter.id] = SERVICES.filter((s) => s.category === filter.id);
      return acc;
    },
    {} as Record<ServiceFilter, typeof SERVICES>
  );

  return (
    <div className="space-y-10">
      {SERVICE_FILTERS.map((filter) => {
        const items = grouped[filter.id];
        if (!items.length) return null;

        return (
          <section key={filter.id}>
            <div className="mb-4 flex items-center gap-2">
              <div className="h-px w-4 bg-gold" />
              <h3 className="text-[10px] font-medium uppercase tracking-[0.25em] text-dim">
                {filter.label}
              </h3>
            </div>

            <div className="divide-y divide-border border border-border">
              {items.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => openBooking({ serviceName: service.name })}
                  aria-label={`Book ${service.name}`}
                  className={`${ROW_HOVER} flex flex-col gap-2 bg-card px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-display text-lg text-foreground transition-colors group-hover:text-bordeaux">
                        {service.name}
                      </h4>
                      {service.featured && (
                        <span className="rounded-full bg-gold-soft px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.12em] text-gold">
                          Signature
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted sm:text-sm">
                      {service.description}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1 sm:gap-2">
                    <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.15em]">
                      <span className="text-dim">{service.duration}</span>
                      <span className="min-w-[5rem] text-right font-medium text-bordeaux">
                        {service.price}
                      </span>
                    </div>
                    <span className={BOOK_CTA}>Reserve</span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        );
      })}

      <div className="border border-border bg-bg-muted p-5 text-sm text-muted">
        <p className="font-display text-lg text-foreground">Good to know</p>
        <ul className="mt-3 space-y-2 text-xs leading-relaxed">
          <li>· All color services include a complimentary consultation.</li>
          <li>· Final pricing depends on hair length, density, and condition.</li>
          <li>· A 48-hour cancellation policy applies to all appointments.</li>
        </ul>
      </div>
    </div>
  );
}

export function TeamModalContent() {
  const { openBooking } = useBooking();

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {MASTERS.map((master) => (
        <button
          key={master.id}
          type="button"
          onClick={() => openBooking({ master })}
          aria-label={`Book with ${master.name}`}
          className={`${CARD_HOVER} overflow-hidden border border-border bg-card text-left`}
        >
          <div className="relative aspect-[4/3] overflow-hidden bg-bg-muted">
            <Image
              src={master.bgImage}
              alt={master.name}
              fill
              unoptimized
              sizes="(max-width: 640px) 100vw, 360px"
              className="object-cover transition-transform duration-700 ease-luxury group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3">
              <span className="rounded-full bg-black/50 px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.15em] text-white/80 backdrop-blur-sm">
                {master.badge}
              </span>
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-display text-lg text-foreground transition-colors group-hover:text-bordeaux">
              {master.name}
            </h3>
            <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-dim">
              {master.role}
            </p>
            <p className="mt-2 text-sm text-bordeaux">{master.specialty}</p>
            {master.bio && (
              <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted">
                {master.bio}
              </p>
            )}
            <p className={`mt-3 ${BOOK_CTA}`}>Reserve</p>
          </div>
        </button>
      ))}
    </div>
  );
}

export function AboutModalContent() {
  const { openBooking } = useBooking();

  return (
    <div>
      <div className="space-y-5 text-sm leading-relaxed text-muted">
        {ABOUT_STORY.paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 24)}>{paragraph}</p>
        ))}
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {ABOUT_STORY.values.map((value) => (
          <div
            key={value.title}
            className="border border-border bg-card p-5 backdrop-blur-sm transition-colors duration-300 hover:border-bordeaux/25 hover:bg-bordeaux-soft"
          >
            <p className="font-display text-xl text-foreground">{value.title}</p>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              {value.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-10 border border-border bg-bg-muted p-5 text-center">
        <span className="text-lg text-gold">✦</span>
        <p className="mt-3 font-display text-lg text-foreground">
          By appointment only
        </p>
        <p className="mt-2 text-xs text-dim">
          Every visit is unhurried — typically 2–3 hours for color, 1 hour for cuts.
        </p>
        <button
          type="button"
          onClick={() => openBooking()}
          className="mt-5 border border-bordeaux/30 bg-bordeaux px-6 py-3 text-[10px] font-medium uppercase tracking-[0.2em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-bordeaux/90 hover:shadow-[0_8px_24px_rgba(92,33,53,0.25)]"
        >
          Book Your Visit →
        </button>
      </div>
    </div>
  );
}

export function VisitModalContent() {
  const { openBooking } = useBooking();

  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
      <section className="border border-border bg-card p-5 backdrop-blur-sm transition-colors duration-300 hover:border-bordeaux/20 sm:p-6">
        <div className="mb-3 flex items-center gap-2">
          <div className="h-px w-4 bg-gold" />
          <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-dim">
            Location
          </span>
        </div>
        <h3 className="font-display text-xl text-foreground">
          {SALON_INFO.district}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {SALON_INFO.address}
        </p>
        <div className="mt-4 space-y-2 text-sm text-muted">
          <p>
            <span className="text-[10px] uppercase tracking-[0.15em] text-dim">
              MRT —
            </span>{" "}
            {SALON_INFO.mrt}
          </p>
          <p>
            <span className="text-[10px] uppercase tracking-[0.15em] text-dim">
              Parking —
            </span>{" "}
            {SALON_INFO.parking}
          </p>
        </div>
        <div className="mt-6 flex h-36 items-center justify-center border border-border bg-bg-muted">
          <div className="text-center">
            <span className="font-display text-3xl text-border-strong opacity-60">
              美
            </span>
            <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-dim">
              Dempsey Hill, Singapore
            </p>
          </div>
        </div>
      </section>

      <div className="space-y-5">
        <section className="border border-bordeaux/20 bg-bordeaux p-5 text-white sm:p-6">
          <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-gold">
            Opening Hours
          </p>
          <div className="mt-3 space-y-2">
            {OPENING_HOURS.map((row) => (
              <div
                key={row.day}
                className="flex items-center justify-between border-b border-white/10 pb-2 text-sm last:border-0 last:pb-0"
              >
                <span>{row.day}</span>
                <span className="text-gold">{row.hours}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="border border-border bg-card p-5 sm:p-6">
          <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-dim">
            Contact
          </p>
          <div className="mt-3 space-y-2 text-sm text-muted">
            <p>
              <span className="text-dim">Phone —</span> {SALON_INFO.phone}
            </p>
            <p>
              <span className="text-dim">WhatsApp —</span> {SALON_INFO.whatsapp}
            </p>
            <p>
              <span className="text-dim">Email —</span> {SALON_INFO.email}
            </p>
          </div>
        </section>

        <button
          type="button"
          onClick={() => openBooking()}
          className="w-full border border-gold/40 bg-gold/10 py-3.5 text-xs font-medium uppercase tracking-[0.2em] text-gold transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold/20 hover:shadow-[0_8px_24px_rgba(166,139,91,0.15)]"
        >
          Book Appointment →
        </button>
      </div>
    </div>
  );
}

function PolicyContent({ sections }: { sections: PolicySection[] }) {
  return (
    <div className="space-y-8">
      {sections.map((section) => (
        <section key={section.title}>
          <h3 className="font-display text-lg text-foreground">{section.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">{section.body}</p>
        </section>
      ))}
      <p className="border-t border-border pt-6 text-[11px] text-dim">
        Last updated: June 2025 · AURA Hair Space, Singapore
      </p>
    </div>
  );
}

export function PrivacyModalContent() {
  return <PolicyContent sections={PRIVACY_POLICY} />;
}

export function CancellationModalContent() {
  return <PolicyContent sections={CANCELLATION_POLICY} />;
}
