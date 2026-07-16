"use client";

import { useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { ModalMeta } from "@/lib/modals";
import IconButton from "@/components/ui/IconButton";

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
  const closeRef = useRef<HTMLButtonElement>(null);

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
      const t = window.setTimeout(() => closeRef.current?.focus(), 50);
      return () => {
        window.clearTimeout(t);
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleEsc);
      };
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
            className="embed-overlay fixed inset-0 z-[60] bg-[var(--overlay)] backdrop-blur-sm"
            onClick={handleClose}
            aria-hidden
          />

          <div className="embed-dialog-root pointer-events-none fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-8">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby={`modal-title-${meta.id}`}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="embed-dialog pointer-events-auto flex max-h-[min(88vh,900px)] w-full max-w-wide flex-col overflow-hidden rounded-2xl border border-border bg-drawer shadow-[0_24px_80px_rgba(0,0,0,0.22)]"
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
                <IconButton
                  ref={closeRef}
                  onClick={handleClose}
                  size="sm"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </IconButton>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 scrollbar-hide sm:px-7 sm:py-8">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
