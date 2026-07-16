"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import AuraWordmark from "@/components/AuraWordmark";
import IconButton from "@/components/ui/IconButton";
import { usePortfolioEmbed } from "@/components/PortfolioEmbedProvider";
import { NAV_LINKS } from "@/data/content";

export default function SiteNav() {
  const embedded = usePortfolioEmbed();
  const [menuOpen, setMenuOpen] = useState(false);

  if (embedded) return null;

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-bg/90 backdrop-blur-md sm:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/">
            <AuraWordmark className="text-xl" />
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <IconButton
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4" />
            </IconButton>
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
                <p className="text-label text-gold">Navigate</p>
                <IconButton onClick={closeMenu} aria-label="Close menu" size="sm">
                  <X className="h-4 w-4" />
                </IconButton>
              </div>
              <ul className="mt-8 space-y-1">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      onClick={closeMenu}
                      className="block border-b border-border py-4 text-label uppercase tracking-[0.22em] text-muted transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
              <p className="mt-auto text-label leading-relaxed text-dim">
                Dempsey Hill · Singapore
              </p>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
