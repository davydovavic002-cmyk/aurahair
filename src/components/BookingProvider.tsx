"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { BookingDrawer } from "@/components/HotSlots";
import type { BookingIntent } from "@/lib/booking";
import { useUiShell } from "@/components/UiShellProvider";

export type { BookingIntent } from "@/lib/booking";

interface BookingContextValue {
  openBooking: (intent?: BookingIntent) => void;
  closeBooking: () => void;
  isBookingOpen: boolean;
}

const BookingContext = createContext<BookingContextValue | null>(null);

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) {
    throw new Error("useBooking must be used within BookingProvider");
  }
  return ctx;
}

function closeActiveModal() {
  if (typeof window === "undefined") return;
  if (!window.location.hash.includes("modal-")) return;
  window.history.replaceState(
    null,
    "",
    `${window.location.pathname}${window.location.search}`
  );
  window.dispatchEvent(new HashChangeEvent("hashchange"));
}

export function BookingProvider({ children }: { children: ReactNode }) {
  const { setBookingOpen: setShellBookingOpen } = useUiShell();
  const [isOpen, setIsOpen] = useState(false);
  const [intent, setIntent] = useState<BookingIntent | undefined>();

  useEffect(() => {
    setShellBookingOpen(isOpen);
  }, [isOpen, setShellBookingOpen]);

  const openBooking = useCallback((next?: BookingIntent) => {
    closeActiveModal();
    setIntent(next);
    setIsOpen(true);
  }, []);

  const closeBooking = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => setIntent(undefined), 400);
  }, []);

  return (
    <BookingContext.Provider
      value={{ openBooking, closeBooking, isBookingOpen: isOpen }}
    >
      {children}
      <BookingDrawer
        isOpen={isOpen}
        onClose={closeBooking}
        intent={intent}
      />
    </BookingContext.Provider>
  );
}
