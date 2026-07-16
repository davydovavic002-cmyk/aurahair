/** Shared schedule rules for AURA Hair Space (Singapore). */

export const BOOKABLE_TIMES = [
  "09:30",
  "10:00",
  "11:00",
  "13:00",
  "14:30",
  "15:00",
  "17:00",
] as const;

export type BookableTime = (typeof BOOKABLE_TIMES)[number];

/** JS getDay(): 0=Sun … 6=Sat → opening window (inclusive start, exclusive close for last start). */
const DAY_HOURS: Record<number, { open: string; lastStart: string } | null> = {
  0: { open: "10:00", lastStart: "15:00" }, // Sunday
  1: null, // Monday closed
  2: { open: "10:00", lastStart: "18:00" }, // Tue
  3: { open: "10:00", lastStart: "18:00" },
  4: { open: "10:00", lastStart: "18:00" },
  5: { open: "10:00", lastStart: "18:00" },
  6: { open: "09:00", lastStart: "17:00" }, // Saturday
};

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function weekdayLong(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "long" });
}

export function isSalonClosed(date: Date): boolean {
  return DAY_HOURS[date.getDay()] === null;
}

export function isPastDay(date: Date, now = new Date()): boolean {
  const a = new Date(date);
  a.setHours(0, 0, 0, 0);
  const b = new Date(now);
  b.setHours(0, 0, 0, 0);
  return a < b;
}

/** True when the calendar day is before today, or the time has already passed today. */
export function isPastSlot(
  dateKey: string,
  time: string,
  now = new Date(),
): boolean {
  const date = parseDateKey(dateKey);
  if (isPastDay(date, now)) return true;
  if (toDateKey(now) !== dateKey) return false;
  const [h, m] = time.split(":").map(Number);
  const slotMins = h * 60 + m;
  const nowMins = now.getHours() * 60 + now.getMinutes();
  return slotMins <= nowMins;
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

/** Times bookable on a given calendar day. */
export function getTimesForDate(date: Date): string[] {
  const hours = DAY_HOURS[date.getDay()];
  if (!hours) return [];

  const open = timeToMinutes(hours.open);
  const last = timeToMinutes(hours.lastStart);

  return BOOKABLE_TIMES.filter((t) => {
    const mins = timeToMinutes(t);
    return mins >= open && mins <= last;
  });
}

export const BOOKING_HORIZON_DAYS = 21;

export function getWeekDays(from = new Date(), weekOffset = 0): Date[] {
  const day = from.getDay();
  const monday = new Date(from);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(from.getDate() - (day === 0 ? 6 : day - 1));
  monday.setDate(monday.getDate() + weekOffset * 7);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export function getWeekOffsetForDate(
  target: Date,
  from = new Date(),
): number {
  const currentMonday = getWeekDays(from, 0)[0];
  const targetMonday = getWeekDays(target, 0)[0];
  const diffMs = targetMonday.getTime() - currentMonday.getTime();
  return Math.round(diffMs / (7 * 24 * 60 * 60 * 1000));
}

export function formatWeekRange(days: Date[]): string {
  if (days.length === 0) return "";
  const start = days[0];
  const end = days[days.length - 1];
  const sameMonth = start.getMonth() === end.getMonth();
  const startLabel = start.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const endLabel = end.toLocaleDateString("en-US", {
    month: sameMonth ? undefined : "short",
    day: "numeric",
  });
  return `${startLabel} – ${endLabel}`;
}

export function isBeyondBookingHorizon(
  date: Date,
  horizonDays = BOOKING_HORIZON_DAYS,
  from = new Date(),
): boolean {
  const limit = new Date(from);
  limit.setHours(0, 0, 0, 0);
  limit.setDate(limit.getDate() + horizonDays - 1);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d > limit;
}

export function canNavigateWeek(
  weekOffset: number,
  direction: "prev" | "next",
  horizonDays = BOOKING_HORIZON_DAYS,
  from = new Date(),
): boolean {
  if (direction === "prev") return weekOffset > 0;
  const nextWeek = getWeekDays(from, weekOffset + 1);
  return nextWeek.some(
    (d) => !isPastDay(d, from) && !isBeyondBookingHorizon(d, horizonDays, from),
  );
}

export function isDayBookable(
  date: Date,
  horizonDays = BOOKING_HORIZON_DAYS,
  from = new Date(),
): boolean {
  return (
    !isPastDay(date, from) &&
    !isSalonClosed(date) &&
    !isBeyondBookingHorizon(date, horizonDays, from)
  );
}

/** Next N calendar days from today (inclusive). */
export function getUpcomingDays(count: number, from = new Date()): Date[] {
  const start = new Date(from);
  start.setHours(0, 0, 0, 0);
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

export function findDateByWeekday(
  weekday: string,
  week: Date[] = getWeekDays(),
): Date | null {
  const match = week.find((d) => weekdayLong(d) === weekday);
  return match ?? null;
}
