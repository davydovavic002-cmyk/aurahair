"use client";

import { useEffect, useState } from "react";
import type { HotSlot } from "@/data/content";
import {
  buildFallbackHotSlots,
  diversifyHotSlots,
  formatStylistShort,
  getCurrentWeekLabel,
} from "@/lib/hot-slots";
import { isPastSlot } from "@/lib/salon-schedule";

interface ApiHotSlot {
  id: string;
  masterId: string;
  date: string;
  time: string;
  status: string;
  stylist: string;
  day: string;
  available: boolean;
}

function mapApiSlot(slot: ApiHotSlot): HotSlot {
  return {
    id: slot.id,
    day: slot.day,
    time: slot.time,
    stylist: formatStylistShort(slot.stylist),
    available: slot.available,
    masterId: slot.masterId,
    date: slot.date,
  };
}

function isBookableHotSlot(slot: HotSlot): boolean {
  return slot.available && (!slot.date || !isPastSlot(slot.date, slot.time));
}

export function useHotSlots() {
  const [slots, setSlots] = useState<HotSlot[] | null>(null);
  const [live, setLive] = useState(false);
  const weekLabel = getCurrentWeekLabel();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/availability?hot=1", {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("availability failed");
        const data = (await res.json()) as { slots?: ApiHotSlot[] };
        const mapped = (data.slots ?? [])
          .map(mapApiSlot)
          .filter(isBookableHotSlot)
          .filter(
            (slot): slot is HotSlot & { date: string; masterId: string } =>
              Boolean(slot.date && slot.masterId),
          );
        const diversified = diversifyHotSlots(mapped, 6);
        if (!cancelled && diversified.length > 0) {
          setSlots(diversified);
          setLive(true);
          return;
        }
      } catch {
        /* fall through */
      }
      if (!cancelled) {
        setSlots(buildFallbackHotSlots(6));
        setLive(false);
      }
    }

    void load();
    const interval = window.setInterval(load, 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const resolved = slots ?? buildFallbackHotSlots(6);

  return {
    slots: resolved,
    loading: slots === null,
    live,
    weekLabel,
    empty: !resolved.length,
  };
}
