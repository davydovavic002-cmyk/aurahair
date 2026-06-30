"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  preserveEmbedSearchParams,
  reportHeight,
  scheduleHeightReports,
} from "@/embed/portfolioEmbed";
import { usePortfolioEmbed } from "@/components/PortfolioEmbedProvider";

export default function PortfolioEmbedBridge() {
  const embedded = usePortfolioEmbed();
  const pathname = usePathname();
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!embedded) return;

    scheduleHeightReports();

    const onLoad = () => scheduleHeightReports();
    window.addEventListener("load", onLoad);

    const onHashChange = () => scheduleHeightReports();
    window.addEventListener("hashchange", onHashChange);
    window.addEventListener("popstate", onHashChange);

    const resizeObserver = new ResizeObserver(() => reportHeight());
    const main = document.querySelector("main");
    if (main) resizeObserver.observe(main);
    if (sentinelRef.current) resizeObserver.observe(sentinelRef.current);

    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as Element).closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("tel:") ||
        href.startsWith("mailto:") ||
        href.startsWith("http")
      ) {
        return;
      }

      const url = new URL(href, window.location.origin);
      if (url.origin !== window.location.origin) return;

      preserveEmbedSearchParams(url);
      const nextHref = `${url.pathname}${url.search}${url.hash}`;
      if (nextHref === href) return;

      event.preventDefault();
      window.location.href = nextHref;
    };

    document.addEventListener("click", onClick);

    return () => {
      window.removeEventListener("load", onLoad);
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("popstate", onHashChange);
      document.removeEventListener("click", onClick);
      resizeObserver.disconnect();
    };
  }, [embedded]);

  useEffect(() => {
    if (!embedded) return;
    scheduleHeightReports();
  }, [embedded, pathname]);

  return (
    <div
      ref={sentinelRef}
      id="embed-height-sentinel"
      aria-hidden="true"
      style={{ height: 0, width: "100%" }}
    />
  );
}
