import PressMarquee from "@/components/PressMarquee";
import { FOOTER_HIGHLIGHTS, PARTNER_BRANDS } from "@/data/content";

export default function PrestigeBar() {
  return (
    <section
      aria-label="Recognition and partners"
      className="mx-auto max-w-wide px-5 sm:px-8 lg:px-12"
    >
      <div className="mb-8">
        <p className="mb-4 text-center text-[11px] font-medium uppercase tracking-[0.25em] text-dim">
          As seen in
        </p>
        <PressMarquee />
      </div>

      <div className="grid gap-8 border-t border-border py-10 sm:grid-cols-2 sm:gap-6">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-dim">
            House standards
          </p>
          <ul className="mt-4 space-y-2">
            {FOOTER_HIGHLIGHTS.map((item) => (
              <li
                key={item.label}
                className="flex items-baseline justify-between gap-4 text-sm"
              >
                <span className="text-muted">{item.label}</span>
                <span className="font-display text-foreground">{item.value}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-dim">
            Professional partners
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {PARTNER_BRANDS.map((brand) => (
              <span
                key={brand}
                className="border border-border px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] text-muted"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
