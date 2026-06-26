"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { parseModalHash } from "@/lib/modals";

export default function HashScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || parseModalHash(hash)) return;

    const id = hash.slice(1);
    const scroll = () => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const timer = window.setTimeout(scroll, 100);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  return null;
}
