import type { HotSlot } from "@/data/content";
import { MASTERS } from "@/data/content";
import {
  formatWeekRange,
  getTimesForDate,
  getWeekDays,
  isDayBookable,
  isPastSlot,
  toDateKey,
  weekdayLong,
} from "@/lib/salon-schedule";

export function formatStylistShort(name: string): string {
  return name
    .split(" ")
    .map((part, index) => (index === 0 ? part : `${part.charAt(0)}.`))
    .join(" ");
}

export interface DiversifiableSlot {
  date: string;
  time: string;
  masterId: string;
}

function slotKey(slot: DiversifiableSlot): string {
  return `${slot.date}|${slot.time}|${slot.masterId}`;
}

/**
 * Pick up to `limit` slots spread across weekdays, times, and stylists.
 * Avoids returning many copies of the same day+time (e.g. Wed 10:00 × 6).
 */
export function diversifyHotSlots<T extends DiversifiableSlot>(
  candidates: T[],
  limit = 6,
): T[] {
  const bookable = candidates.filter(
    (slot) => slot.date && slot.time && !isPastSlot(slot.date, slot.time),
  );
  if (!bookable.length) return [];

  const byDate = new Map<string, Map<string, T[]>>();
  for (const slot of bookable) {
    let byTime = byDate.get(slot.date);
    if (!byTime) {
      byTime = new Map();
      byDate.set(slot.date, byTime);
    }
    const pool = byTime.get(slot.time) ?? [];
    pool.push(slot);
    byTime.set(slot.time, pool);
  }

  const dates = [...byDate.keys()].sort();
  const picked: T[] = [];
  const usedKeys = new Set<string>();
  const usedMasters = new Set<string>();

  let round = 0;
  while (picked.length < limit && round < 50) {
    let added = false;
    for (const date of dates) {
      if (picked.length >= limit) break;

      const byTime = byDate.get(date)!;
      const times = [...byTime.keys()].sort();
      if (!times.length) continue;

      const time = times[round % times.length];
      const pool = byTime.get(time)!;

      let choice =
        pool.find(
          (slot) =>
            !usedKeys.has(slotKey(slot)) && !usedMasters.has(slot.masterId),
        ) ??
        pool.find((slot) => !usedKeys.has(slotKey(slot)));

      if (!choice) continue;

      usedKeys.add(slotKey(choice));
      usedMasters.add(choice.masterId);
      picked.push(choice);
      added = true;
    }
    if (!added) break;
    round++;
  }

  if (picked.length < limit) {
    for (const slot of bookable) {
      if (picked.length >= limit) break;
      const key = slotKey(slot);
      if (!usedKeys.has(key)) {
        usedKeys.add(key);
        picked.push(slot);
      }
    }
  }

  return picked;
}

const FALLBACK_TIME_SPREAD = [
  "10:00",
  "14:30",
  "11:00",
  "15:00",
  "13:00",
  "17:00",
  "09:30",
] as const;

/** Demo slots for the current week when live inventory is unavailable. */
export function buildFallbackHotSlots(count = 6): HotSlot[] {
  const bookableDays = getWeekDays().filter((day) => isDayBookable(day));
  if (!bookableDays.length) return [];

  const slots: HotSlot[] = [];
  const usedDayTime = new Set<string>();
  let dayIdx = 0;
  let attempts = 0;
  const maxAttempts = bookableDays.length * FALLBACK_TIME_SPREAD.length * 2;

  while (slots.length < count && attempts < maxAttempts) {
    const day = bookableDays[dayIdx % bookableDays.length];
    const dateKey = toDateKey(day);
    const futureTimes = getTimesForDate(day).filter(
      (time) => !isPastSlot(dateKey, time),
    );
    if (!futureTimes.length) {
      dayIdx++;
      attempts++;
      continue;
    }

    const preferred = FALLBACK_TIME_SPREAD[slots.length % FALLBACK_TIME_SPREAD.length];
    const time =
      futureTimes.find((t) => t === preferred) ??
      futureTimes[slots.length % futureTimes.length];

    const dayTimeKey = `${dateKey}|${time}`;
    if (usedDayTime.has(dayTimeKey)) {
      dayIdx++;
      attempts++;
      continue;
    }
    usedDayTime.add(dayTimeKey);

    const master = MASTERS[slots.length % MASTERS.length];
    slots.push({
      id: `fallback-${master.id}|${dateKey}|${time}`,
      day: weekdayLong(day),
      time,
      stylist: formatStylistShort(master.name),
      available: true,
      masterId: master.id,
      date: dateKey,
    });

    dayIdx++;
    attempts++;
  }

  return slots;
}

export function getCurrentWeekLabel(): string {
  return formatWeekRange(getWeekDays());
}
