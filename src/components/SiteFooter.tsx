import FooterNewsletter from "@/components/FooterNewsletter";
import AuraWordmark from "@/components/AuraWordmark";
import { Sparkles } from "lucide-react";
import {
  FOOTER_LEGAL,
  FOOTER_SOCIAL,
  NAV_LINKS,
  OPENING_HOURS,
  SALON_INFO,
  STUDIO_TAGLINE_ASIA,
} from "@/data/content";

export default function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="concierge" className="mx-auto mt-20 max-w-wide px-5 sm:px-8 lg:px-12">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
        <FooterNewsletter />
        <div className="flex flex-col justify-between border border-bordeaux/15 bg-bordeaux p-6 text-white sm:p-8">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-gold">
              Concierge
            </p>
            <p className="mt-3 font-display text-2xl leading-snug">
              Your chair is waiting.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              Priority booking for colour corrections, bridal trials, and new
              client consultations within 48 hours.
            </p>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#booking"
              className="bg-gold px-5 py-3 text-center text-[11px] font-medium uppercase tracking-[0.18em] text-[#1A1410] transition-opacity hover:opacity-90"
            >
              Reserve online
            </a>
            <a
              href={`https://wa.me/${SALON_INFO.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-white/20 px-5 py-3 text-center text-[11px] font-medium uppercase tracking-[0.18em] text-white transition-colors hover:border-gold/50 hover:text-gold"
            >
              WhatsApp us
            </a>
          </div>
        </div>
      </div>

      <div className="mt-14 grid gap-10 border-t border-border pt-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        <div className="lg:col-span-1">
          <AuraWordmark className="text-2xl text-foreground" />
          <p className="mt-2 text-xs italic text-dim">{STUDIO_TAGLINE_ASIA}</p>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            A private hair atelier in Dempsey Hill — precision colour, ritual
            care, and unhurried appointments by design.
          </p>
        </div>

        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-gold">
            Visit
          </p>
          <address className="mt-4 space-y-2 text-sm not-italic leading-relaxed text-muted">
            <p>{SALON_INFO.address}</p>
            <p>{SALON_INFO.mrt}</p>
            <p>{SALON_INFO.parking}</p>
          </address>
          <a
            href="#modal-visit"
            className="mt-4 inline-block text-[11px] font-medium uppercase tracking-[0.15em] text-bordeaux transition-opacity hover:opacity-70"
          >
            Directions &amp; hours →
          </a>
        </div>

        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-gold">
            Hours
          </p>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            {OPENING_HOURS.map((row) => (
              <li key={row.day} className="flex justify-between gap-4">
                <span>{row.day}</span>
                <span className="text-foreground">{row.hours}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-gold">
            Connect
          </p>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            <li>
              <a
                href={`tel:${SALON_INFO.phone.replace(/\s/g, "")}`}
                className="transition-colors hover:text-foreground"
              >
                {SALON_INFO.phone}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${SALON_INFO.email}`}
                className="transition-colors hover:text-foreground"
              >
                {SALON_INFO.email}
              </a>
            </li>
          </ul>
          <div className="mt-5 flex flex-wrap gap-4">
            {FOOTER_SOCIAL.map((link) => (
              <a
                key={link.id}
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={
                  link.href.startsWith("http")
                    ? "noopener noreferrer"
                    : undefined
                }
                className="text-[11px] font-medium uppercase tracking-[0.15em] text-dim transition-colors hover:text-bordeaux"
              >
                {link.label}
              </a>
            ))}
          </div>
          <nav className="mt-6" aria-label="Footer navigation">
            <ul className="space-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-[11px] uppercase tracking-[0.15em] text-dim transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      <div className="mt-14 text-center">
        <div className="mx-auto h-px w-full max-w-md bg-border" />
        <Sparkles className="mx-auto mt-8 h-5 w-5 text-gold" aria-hidden />
        <p className="mt-4 font-display text-sm tracking-[0.15em] text-foreground">
          AURA HAIR SPACE
        </p>
        <p className="mt-2 text-xs text-dim">
          By appointment only · Singapore · Est. 2014
        </p>
        <p className="mt-4 text-[11px] text-dim">
          © {currentYear} AURA Hair Space. All rights reserved.
          {FOOTER_LEGAL.map((link) => (
            <span key={link.href}>
              {" · "}
              <a
                href={link.href}
                className="transition-colors hover:text-bordeaux"
              >
                {link.label}
              </a>
            </span>
          ))}
        </p>
      </div>
    </footer>
  );
}
