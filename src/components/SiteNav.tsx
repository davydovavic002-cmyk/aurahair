"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";
import { NAV_LINKS } from "@/data/content";

export default function SiteNav() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      {/* Mobile header */}
      <header className="sticky top-0 z-40 border-b border-border bg-bg/90 backdrop-blur-md sm:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="font-display text-xl font-light tracking-wide">
            AURA
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="flex h-9 w-9 items-center justify-center border border-border text-muted"
              aria-label="Open menu"
            >
              <span className="text-sm">☰</span>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-[var(--overlay)] backdrop-blur-sm sm:hidden"
              onClick={closeMenu}
            />
            <motion.nav
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 right-0 z-50 flex w-[min(100%,280px)] flex-col border-l border-border bg-drawer p-6 sm:hidden"
              aria-label="Main navigation"
            >
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-gold">
                  Navigate
                </p>
                <button
                  type="button"
                  onClick={closeMenu}
                  className="flex h-8 w-8 items-center justify-center border border-border text-muted"
                  aria-label="Close menu"
                >
                  ✕
                </button>
              </div>
              <ul className="mt-8 space-y-1">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      onClick={closeMenu}
                      className="block border-b border-border py-4 text-[11px] font-medium uppercase tracking-[0.22em] text-muted transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
              <p className="mt-auto text-[11px] leading-relaxed text-dim">
                Dempsey Hill · Singapore
              </p>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
