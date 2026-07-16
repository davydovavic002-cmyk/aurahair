"use client";

import { useEffect, useMemo, useState } from "react";
import { toDateKey } from "@/lib/salon-schedule";

interface ApiSlot {
  date: string;
  time: string;
  masterId: string;
  status: string;
}

export function useBookingAvailability(weekDays: Date[], masterId: string) {
  const [slotsByDate, setSlotsByDate] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = weekDays[0] ? toDateKey(weekDays[0]) : "";
  const to = weekDays[6] ? toDateKey(weekDays[6]) : "";

  useEffect(() => {
    if (!from || !to || !masterId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    async function load() {
      try {
        const params = new URLSearchParams({
          from,
          to,
          masterId,
        });
        const res = await fetch(`/api/availability?${params}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("availability failed");
        const data = (await res.json()) as { slots?: ApiSlot[] };
        const grouped: Record<string, string[]> = {};
        for (const slot of data.slots ?? []) {
          if (!grouped[slot.date]) grouped[slot.date] = [];
          grouped[slot.date].push(slot.time);
        }
        for (const date of Object.keys(grouped)) {
          grouped[date].sort();
        }
        if (!cancelled) {
          setSlotsByDate(grouped);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setSlotsByDate({});
          setError("Could not load availability.");
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [from, to, masterId]);

  const datesWithSlots = useMemo(
    () => new Set(Object.keys(slotsByDate).filter((d) => slotsByDate[d].length > 0)),
    [slotsByDate],
  );

  return { slotsByDate, datesWithSlots, loading, error };
}
