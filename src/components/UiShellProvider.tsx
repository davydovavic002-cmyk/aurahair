"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface UiShellContextValue {
  isModalOpen: boolean;
  setModalOpen: (open: boolean) => void;
  isBookingOpen: boolean;
  setBookingOpen: (open: boolean) => void;
  isAnyOverlayOpen: boolean;
}

const UiShellContext = createContext<UiShellContextValue | null>(null);

export function UiShellProvider({ children }: { children: ReactNode }) {
  const [isModalOpen, setModalOpen] = useState(false);
  const [isBookingOpen, setBookingOpen] = useState(false);

  const isAnyOverlayOpen = isModalOpen || isBookingOpen;

  const value = useMemo(
    () => ({
      isModalOpen,
      setModalOpen,
      isBookingOpen,
      setBookingOpen,
      isAnyOverlayOpen,
    }),
    [isModalOpen, isBookingOpen, isAnyOverlayOpen]
  );

  return (
    <UiShellContext.Provider value={value}>{children}</UiShellContext.Provider>
  );
}

export function useUiShell() {
  const ctx = useContext(UiShellContext);
  if (!ctx) {
    throw new Error("useUiShell must be used within UiShellProvider");
  }
  return ctx;
}

export function useUiShellOptional() {
  return useContext(UiShellContext);
}
