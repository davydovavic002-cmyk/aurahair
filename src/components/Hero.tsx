"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useBooking } from "@/components/BookingProvider";
import ThemeToggle from "@/components/ThemeToggle";
import MasterCard from "@/components/MasterCard";
import {
  MASTERS,
  NAV_LINKS,
  SALON_INFO,
  STYLIST_FILTERS,
  STUDIO_BIO,
  STUDIO_TAGLINE_ASIA,
  TAGLINE,
  filterMastersByCategory,
  type ServiceFilter,
} from "@/data/content";
import { fadeUp } from "@/lib/motion";
import { usePortfolioEmbed } from "@/components/PortfolioEmbedProvider";

export default function Hero() {
  const embedded = usePortfolioEmbed();
  const { openBooking } = useBooking();
  const [filter, setFilter] = useState<ServiceFilter>("coloring");
  const [query, setQuery] = useState("");

  const categoryFiltered = filterMastersByCategory(MASTERS, filter);

  const filteredMasters = categoryFiltered.filter((m) => {
    const q = query.toLowerCase();
    if (!q) return true;
    return (
      m.name.toLowerCase().includes(q) ||
      m.specialty.toLowerCase().includes(q) ||
      m.role.toLowerCase().includes(q)
    );
  });

  const noResults = query.trim().length > 0 && filteredMasters.length === 0;
  const displayMasters = noResults ? [] : filteredMasters;

  return (
    <section
      className={`relative px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10 ${
        embedded ? "min-h-0" : "min-h-screen"
      }`}
    >
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/lookbook-space.jpg"
          alt=""
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className={`mx-auto flex max-w-[1280px] flex-col overflow-hidden rounded-[28px] bg-[var(--hero-panel)] shadow-[0_24px_80px_rgba(0,0,0,0.18)] sm:rounded-[32px] lg:min-h-[720px] lg:flex-row ${
          embedded
            ? "min-h-[680px]"
            : "min-h-[calc(100vh-3rem)] sm:min-h-[calc(100vh-4rem)]"
        }`}
      >
        <div className="flex w-full flex-col border-b border-border lg:w-[38%] lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between px-5 pt-5 sm:px-6 sm:pt-6">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-dim">
                Step 1 · Find
              </p>
              <p className="mt-1 text-xs text-muted">Choose your stylist</p>
            </div>
            <a
              href="#modal-team"
              className="text-[11px] uppercase tracking-[0.15em] text-dim transition-colors hover:text-bordeaux"
            >
              All team →
            </a>
          </div>

          <div
            className={`flex flex-1 flex-col gap-3 overflow-y-auto px-5 py-4 scrollbar-hide sm:gap-3.5 sm:px-6 sm:py-5 ${
              embedded ? "lg:max-h-[600px]" : "lg:max-h-[calc(100vh-8rem)]"
            }`}
          >
            {noResults ? (
              <p className="py-8 text-center text-sm text-muted">
                No stylists match your search.
              </p>
            ) : (
              displayMasters.map((master, i) => (
                <motion.div
                  key={master.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.06, duration: 0.5 }}
                >
                  <MasterCard
                    master={master}
                    onSelect={() => openBooking({ master })}
                  />
                </motion.div>
              ))
            )}
          </div>
        </div>

        <div className="relative flex flex-1 flex-col px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12">
          <div className="pointer-events-none absolute right-6 top-16 hidden select-none font-display text-[5rem] leading-none text-border-strong opacity-40 sm:block lg:right-10 lg:top-20 lg:text-[6rem]">
            匠
          </div>

          <div className="flex items-start justify-between gap-4">
            <nav
              className="hidden flex-wrap gap-x-6 gap-y-2 sm:flex"
              aria-label="Main navigation"
            >
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted transition-colors hover:text-foreground"
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <ThemeToggle className="hidden sm:flex" />
          </div>

          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <motion.div
              initial="hidden"
              animate="visible"
              className="w-full max-w-md"
            >
              <motion.p
                custom={0.05}
                variants={fadeUp}
                className="text-[11px] font-medium uppercase tracking-[0.35em] text-gold"
              >
                美 · Singapore
              </motion.p>

              <motion.h1
                custom={0.1}
                variants={fadeUp}
                className="font-display text-[4.5rem] font-light leading-none tracking-tight text-foreground sm:text-[5.5rem] lg:text-[6.5rem]"
              >
                AURA
              </motion.h1>

              <motion.p
                custom={0.2}
                variants={fadeUp}
                className="mt-4 text-sm text-muted sm:text-base"
              >
                {TAGLINE}
              </motion.p>

              <motion.p
                custom={0.25}
                variants={fadeUp}
                className="mt-2 text-xs italic text-dim"
              >
                {STUDIO_TAGLINE_ASIA}
              </motion.p>

              <motion.div
                custom={0.3}
                variants={fadeUp}
                className="mx-auto mt-8 flex max-w-xs items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-dim"
              >
                <span>Studio</span>
                <span className="h-px flex-1 bg-border" />
                <span className="text-bordeaux">
                  {SALON_INFO.district} · {SALON_INFO.city}
                </span>
              </motion.div>

              <motion.p
                custom={0.32}
                variants={fadeUp}
                className="mt-8 text-[11px] uppercase tracking-[0.2em] text-dim"
              >
                Browse stylists by expertise
              </motion.p>

              <motion.div
                custom={0.35}
                variants={fadeUp}
                className="mt-3 flex flex-wrap justify-center gap-2"
              >
                {STYLIST_FILTERS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFilter(item.id)}
                    className={`rounded-full px-4 py-2 text-[11px] font-medium uppercase tracking-[0.18em] transition-all duration-300 ${
                      filter === item.id
                        ? "bg-invert text-invert-text"
                        : "border border-border text-muted hover:border-bordeaux/30 hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </motion.div>

              <motion.div custom={0.4} variants={fadeUp} className="relative mt-8">
                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-muted">
                  ⌕
                </span>
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name or specialty"
                  className="w-full border-b border-border bg-transparent py-2 pl-6 text-sm text-foreground placeholder:text-dim focus:border-bordeaux focus:outline-none"
                />
              </motion.div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-auto flex flex-col items-center gap-3 pt-10 text-center"
          >
            <span className="text-lg text-gold">✦</span>
            <p className="max-w-xs text-xs leading-relaxed text-muted">
              {STUDIO_BIO}
            </p>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
