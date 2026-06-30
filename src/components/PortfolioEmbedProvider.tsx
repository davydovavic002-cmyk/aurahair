"use client";

import { createContext, Suspense, useContext, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import PortfolioEmbedBridge from "@/components/PortfolioEmbedBridge";

const PortfolioEmbedContext = createContext(false);

export function usePortfolioEmbed(): boolean {
  return useContext(PortfolioEmbedContext);
}

function PortfolioEmbedProviderInner({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const embedded = searchParams.get("embed") === "portfolio";

  return (
    <PortfolioEmbedContext.Provider value={embedded}>
      {children}
      {embedded ? <PortfolioEmbedBridge /> : null}
    </PortfolioEmbedContext.Provider>
  );
}

export function PortfolioEmbedProvider({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={children}>
      <PortfolioEmbedProviderInner>{children}</PortfolioEmbedProviderInner>
    </Suspense>
  );
}
