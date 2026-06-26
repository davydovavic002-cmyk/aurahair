"use client";

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ModalMeta } from "@/lib/modals";

interface ModalShellProps {
  meta: ModalMeta;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function ModalShell({
  meta,
  isOpen,
  onClose,
  children,
}: ModalShellProps) {
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEsc);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, handleClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60] bg-[var(--overlay)] backdrop-blur-sm"
            onClick={handleClose}
            aria-hidden
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`modal-title-${meta.id}`}
            initial={{ opacity: 0, y: 32, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-4 top-[6vh] z-[60] mx-auto flex max-h-[88vh] max-w-wide flex-col overflow-hidden rounded-2xl border border-border bg-drawer shadow-[0_24px_80px_rgba(0,0,0,0.22)] sm:inset-x-8 lg:inset-x-auto"
          >
            <div className="sticky top-0 z-10 flex shrink-0 items-start justify-between gap-4 border-b border-border bg-drawer/95 px-5 py-4 backdrop-blur-md sm:px-7 sm:py-5">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-gold">
                  {meta.subtitle}
                </p>
                <h2
                  id={`modal-title-${meta.id}`}
                  className="mt-1 font-display text-xl text-foreground sm:text-2xl"
                >
                  {meta.title}
                </h2>
                {meta.description && (
                  <p className="mt-2 max-w-lg text-xs leading-relaxed text-muted sm:text-sm">
                    {meta.description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="flex h-8 w-8 shrink-0 items-center justify-center border border-border text-muted transition-colors hover:border-bordeaux/30 hover:text-foreground"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-6 scrollbar-hide sm:px-7 sm:py-8">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
