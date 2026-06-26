"use client";

import {
  createContext,
  Suspense,
  useContext,
  useEffect,
  type ReactNode,
} from "react";
import { useSearchParams } from "next/navigation";

const PortfolioEmbedContext = createContext(false);

export function usePortfolioEmbed(): boolean {
  return useContext(PortfolioEmbedContext);
}

function PortfolioEmbedProviderInner({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const embedded = searchParams.get("embed") === "portfolio";

  useEffect(() => {
    if (!embedded) return;
    document.documentElement.setAttribute("data-embed", "portfolio");
    return () => document.documentElement.removeAttribute("data-embed");
  }, [embedded]);

  return (
    <PortfolioEmbedContext.Provider value={embedded}>
      {children}
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
