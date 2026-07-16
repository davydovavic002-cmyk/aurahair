import "server-only";

import { MASTERS, SERVICES, type Master, type Service } from "@/data/content";
import { SALON_INFO } from "@/data/content";
import {
  getTimesForDate,
  getWeekDays,
  formatWeekRange,
  isPastDay,
  isPastSlot,
  isSalonClosed,
  toDateKey,
} from "@/lib/salon-schedule";
import { diversifyHotSlots } from "@/lib/hot-slots";
import {
  ensureUpcomingSlots,
  getSqlite,
  nextBookingRef,
} from "@/lib/salon-db/sqlite";
import {
  logEmailNotification,
  whatsappConfirmLink,
  guestWhatsAppLink,
} from "@/lib/notifications";
import { logAudit } from "@/lib/salon-db/audit";

export type SlotStatus = "open" | "held" | "booked" | "blocked";
export type BookingSource = "web" | "ai" | "admin";
export type BookingStatus =
  | "confirmed"
  | "arrived"
  | "completed"
  | "no_show"
  | "cancelled";

export const ACTIVE_BOOKING_STATUSES: BookingStatus[] = [
  "confirmed",
  "arrived",
  "completed",
  "no_show",
];

export interface InventorySlot {
  id: string;
  masterId: string;
  date: string;
  time: string;
  status: SlotStatus;
}

export interface BookingRecord {
  id: string;
  ref: string;
  masterId: string;
  serviceId: string | null;
  serviceName: string;
  date: string;
  time: string;
  guestName: string;
  guestPhone: string;
  notes: string;
  status: BookingStatus;
  source: BookingSource;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingInput {
  masterId: string;
  serviceId?: string | null;
  serviceName?: string;
  date: string;
  time: string;
  guestName: string;
  guestPhone: string;
  notes?: string;
  source?: BookingSource;
}

export interface RescheduleInput {
  date: string;
  time: string;
  masterId?: string;
}

interface SlotRow {
  id: string;
  master_id: string;
  date: string;
  time: string;
  status: SlotStatus;
}

interface BookingRow {
  id: string;
  ref: string;
  master_id: string;
  service_id: string | null;
  service_name: string;
  date: string;
  time: string;
  guest_name: string;
  guest_phone: string;
  notes: string;
  status: BookingStatus;
  source: BookingSource;
  created_at: string;
  updated_at: string;
}

function mapSlot(row: SlotRow): InventorySlot {
  return {
    id: row.id,
    masterId: row.master_id,
    date: row.date,
    time: row.time,
    status: row.status,
  };
}

function mapBooking(row: BookingRow): BookingRecord {
  return {
    id: row.id,
    ref: row.ref,
    masterId: row.master_id,
    serviceId: row.service_id,
    serviceName: row.service_name,
    date: row.date,
    time: row.time,
    guestName: row.guest_name,
    guestPhone: row.guest_phone,
    notes: row.notes,
    status: row.status,
    source: row.source,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function db() {
  const sqlite = getSqlite();
  ensureUpcomingSlots(sqlite);
  return sqlite;
}

export function resetSalonDb(): void {
  const sqlite = getSqlite();
  sqlite.exec(`
    DELETE FROM notifications;
    DELETE FROM bookings;
    DELETE FROM slots;
    DELETE FROM meta;
  `);
  // Force re-seed on next access
  const g = globalThis as unknown as { __auraSqlite?: unknown };
  g.__auraSqlite = undefined;
  getSqlite();
}

export function getMasters(): Master[] {
  return MASTERS;
}

export function getServices(): Service[] {
  return SERVICES;
}

export function findMaster(idOrName: string): Master | undefined {
  const q = idOrName.toLowerCase().trim();
  return MASTERS.find(
    (m) =>
      m.id === idOrName ||
      m.name.toLowerCase() === q ||
      m.name.toLowerCase().includes(q) ||
      m.name.split(" ")[0].toLowerCase() === q,
  );
}

export function findService(idOrName: string): Service | undefined {
  const q = idOrName.toLowerCase().trim();
  return SERVICES.find(
    (s) =>
      s.id === idOrName ||
      s.name.toLowerCase() === q ||
      s.name.toLowerCase().includes(q),
  );
}

export function listAvailability(opts: {
  date?: string;
  from?: string;
  to?: string;
  masterId?: string;
  onlyOpen?: boolean;
}): InventorySlot[] {
  const { date, from, to, masterId, onlyOpen = true } = opts;
  const clauses: string[] = [];
  const params: string[] = [];
  if (date) {
    clauses.push("date = ?");
    params.push(date);
  } else if (from && to) {
    clauses.push("date >= ?");
    params.push(from);
    clauses.push("date <= ?");
    params.push(to);
  }
  if (masterId) {
    clauses.push("master_id = ?");
    params.push(masterId);
  }
  if (onlyOpen) clauses.push("status = 'open'");
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const rows = db()
    .prepare(`SELECT * FROM slots ${where} ORDER BY date, time, master_id`)
    .all(...params) as SlotRow[];
  return rows.map(mapSlot);
}

export function listHotOpenSlots(limit = 8): InventorySlot[] {
  const weekDays = getWeekDays();
  const from = toDateKey(weekDays[0]);
  const to = toDateKey(weekDays[weekDays.length - 1]);

  const rows = db()
    .prepare(
      `SELECT * FROM slots WHERE status = 'open'
       AND date >= ? AND date <= ?
       ORDER BY date, time, master_id`,
    )
    .all(from, to) as SlotRow[];

  const candidates = rows
    .map(mapSlot)
    .filter((slot) => !isPastSlot(slot.date, slot.time));

  return diversifyHotSlots(candidates, limit);
}

export function createBooking(
  input: CreateBookingInput,
):
  | {
      ok: true;
      booking: BookingRecord;
      whatsappUrl: string;
    }
  | { ok: false; error: string } {
  const master = findMaster(input.masterId);
  if (!master) return { ok: false, error: "Stylist not found." };

  const name = input.guestName
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
  const phone = input.guestPhone.trim();
  if (name.length < 2) return { ok: false, error: "Please provide your name." };
  if (phone.length < 8)
    return { ok: false, error: "Please provide a valid phone number." };

  const dateObj = new Date(input.date + "T12:00:00");
  if (Number.isNaN(dateObj.getTime()))
    return { ok: false, error: "Invalid date." };
  if (isPastDay(dateObj)) return { ok: false, error: "That date is in the past." };
  if (isSalonClosed(dateObj))
    return { ok: false, error: "The salon is closed that day (Mondays)." };

  const allowed = getTimesForDate(dateObj);
  if (!allowed.includes(input.time))
    return { ok: false, error: `Time ${input.time} is not available that day.` };

  const sqlite = db();
  const slot = sqlite
    .prepare(
      `SELECT * FROM slots WHERE master_id = ? AND date = ? AND time = ?`,
    )
    .get(master.id, input.date, input.time) as SlotRow | undefined;

  if (!slot) return { ok: false, error: "Slot not found in inventory." };
  if (slot.status !== "open")
    return { ok: false, error: "That slot was just taken. Pick another time." };

  const service =
    (input.serviceId && findService(input.serviceId)) ||
    (input.serviceName ? findService(input.serviceName) : undefined);

  const now = new Date().toISOString();
  const booking: BookingRecord = {
    id: `bk-${Date.now()}`,
    ref: nextBookingRef(sqlite),
    masterId: master.id,
    serviceId: service?.id ?? null,
    serviceName: service?.name ?? input.serviceName ?? "Signature Consultation",
    date: input.date,
    time: input.time,
    guestName: name,
    guestPhone: phone,
    notes: (input.notes ?? "").trim(),
    status: "confirmed",
    source: input.source ?? "web",
    createdAt: now,
    updatedAt: now,
  };

  const tx = sqlite.transaction(() => {
    sqlite
      .prepare(`UPDATE slots SET status = 'booked' WHERE id = ?`)
      .run(slot.id);
    sqlite
      .prepare(
        `INSERT INTO bookings (
          id, ref, master_id, service_id, service_name, date, time,
          guest_name, guest_phone, notes, status, source, created_at, updated_at
        ) VALUES (
          @id, @ref, @masterId, @serviceId, @serviceName, @date, @time,
          @guestName, @guestPhone, @notes, @status, @source, @createdAt, @updatedAt
        )`,
      )
      .run(booking);
  });
  tx();

  logAudit({
    action: "booking.created",
    bookingRef: booking.ref,
    details: `${booking.guestName} · ${booking.date} ${booking.time} · ${master.name} · ${booking.source}`,
  });

  const whatsappUrl = whatsappConfirmLink(booking, master.name);
  logEmailNotification({
    recipient: SALON_INFO.email,
    subject: `New booking ${booking.ref}`,
    body: [
      `Guest: ${booking.guestName} (${booking.guestPhone})`,
      `Service: ${booking.serviceName}`,
      `Stylist: ${master.name}`,
      `When: ${booking.date} ${booking.time}`,
      `Source: ${booking.source}`,
      booking.notes ? `Notes: ${booking.notes}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
    bookingRef: booking.ref,
  });
  logEmailNotification({
    recipient: `${booking.guestPhone} (guest)`,
    subject: `AURA confirmation ${booking.ref}`,
    body: `Hi ${booking.guestName},\n\nYour visit is confirmed.\n${booking.serviceName} with ${master.name}\n${booking.date} at ${booking.time}\n${SALON_INFO.address}\n\nRef: ${booking.ref}\nWhatsApp desk: ${SALON_INFO.whatsapp}`,
    bookingRef: booking.ref,
  });

  return { ok: true, booking, whatsappUrl };
}

export function cancelBooking(
  ref: string,
): { ok: true; booking: BookingRecord } | { ok: false; error: string } {
  const sqlite = db();
  const row = sqlite
    .prepare(`SELECT * FROM bookings WHERE upper(ref) = upper(?)`)
    .get(ref.trim()) as BookingRow | undefined;
  if (!row) return { ok: false, error: "Booking not found." };
  if (row.status === "cancelled")
    return { ok: false, error: "Booking already cancelled." };

  const now = new Date().toISOString();
  const tx = sqlite.transaction(() => {
    sqlite
      .prepare(
        `UPDATE bookings SET status = 'cancelled', updated_at = ? WHERE id = ?`,
      )
      .run(now, row.id);
    sqlite
      .prepare(
        `UPDATE slots SET status = 'open'
         WHERE master_id = ? AND date = ? AND time = ?`,
      )
      .run(row.master_id, row.date, row.time);
  });
  tx();

  const booking = { ...mapBooking(row), status: "cancelled" as const, updatedAt: now };
  const master = findMaster(booking.masterId);
  logAudit({
    action: "booking.cancelled",
    bookingRef: booking.ref,
    details: `${booking.guestName} · ${booking.date} ${booking.time}`,
  });
  logEmailNotification({
    recipient: SALON_INFO.email,
    subject: `Cancelled ${booking.ref}`,
    body: `${booking.guestName} cancelled ${booking.date} ${booking.time} with ${master?.name ?? booking.masterId}.`,
    bookingRef: booking.ref,
  });

  return { ok: true, booking };
}

export function rescheduleBooking(
  ref: string,
  input: RescheduleInput,
):
  | { ok: true; booking: BookingRecord; whatsappUrl: string }
  | { ok: false; error: string } {
  const sqlite = db();
  const row = sqlite
    .prepare(`SELECT * FROM bookings WHERE upper(ref) = upper(?)`)
    .get(ref.trim()) as BookingRow | undefined;
  if (!row) return { ok: false, error: "Booking not found." };
  if (row.status === "cancelled")
    return { ok: false, error: "Cancelled bookings cannot be rescheduled." };
  if (row.status === "completed" || row.status === "no_show")
    return { ok: false, error: "Finished visits cannot be rescheduled." };

  const masterId = input.masterId ?? row.master_id;
  const master = findMaster(masterId);
  if (!master) return { ok: false, error: "Stylist not found." };

  const dateObj = new Date(input.date + "T12:00:00");
  if (Number.isNaN(dateObj.getTime()))
    return { ok: false, error: "Invalid date." };
  if (isPastDay(dateObj)) return { ok: false, error: "That date is in the past." };
  if (isSalonClosed(dateObj))
    return { ok: false, error: "The salon is closed that day." };
  if (!getTimesForDate(dateObj).includes(input.time))
    return { ok: false, error: "Time not available that day." };

  const newSlot = sqlite
    .prepare(
      `SELECT * FROM slots WHERE master_id = ? AND date = ? AND time = ?`,
    )
    .get(master.id, input.date, input.time) as SlotRow | undefined;
  if (!newSlot) return { ok: false, error: "Target slot not found." };
  if (newSlot.status !== "open")
    return { ok: false, error: "Target slot is taken." };

  const now = new Date().toISOString();
  const tx = sqlite.transaction(() => {
    sqlite
      .prepare(
        `UPDATE slots SET status = 'open'
         WHERE master_id = ? AND date = ? AND time = ?`,
      )
      .run(row.master_id, row.date, row.time);
    sqlite
      .prepare(`UPDATE slots SET status = 'booked' WHERE id = ?`)
      .run(newSlot.id);
    sqlite
      .prepare(
        `UPDATE bookings SET master_id = ?, date = ?, time = ?, updated_at = ?
         WHERE id = ?`,
      )
      .run(master.id, input.date, input.time, now, row.id);
  });
  tx();

  const booking = getBookingByRef(ref)!;
  const whatsappUrl = whatsappConfirmLink(booking, master.name);
  logAudit({
    action: "booking.rescheduled",
    bookingRef: booking.ref,
    details: `${row.date} ${row.time} → ${booking.date} ${booking.time} · ${master.name}`,
  });
  logEmailNotification({
    recipient: SALON_INFO.email,
    subject: `Rescheduled ${booking.ref}`,
    body: `${booking.guestName}: ${row.date} ${row.time} → ${booking.date} ${booking.time} (${master.name})`,
    bookingRef: booking.ref,
  });

  return { ok: true, booking, whatsappUrl };
}

export function getBookingByRef(ref: string): BookingRecord | undefined {
  const row = db()
    .prepare(`SELECT * FROM bookings WHERE upper(ref) = upper(?)`)
    .get(ref.trim()) as BookingRow | undefined;
  return row ? mapBooking(row) : undefined;
}

export function listBookings(opts?: {
  status?: BookingStatus | "all";
}): BookingRecord[] {
  const status = opts?.status ?? "all";
  const rows =
    status === "all"
      ? (db()
          .prepare(`SELECT * FROM bookings ORDER BY date DESC, time DESC`)
          .all() as BookingRow[])
      : (db()
          .prepare(
            `SELECT * FROM bookings WHERE status = ? ORDER BY date DESC, time DESC`,
          )
          .all(status) as BookingRow[]);
  return rows.map(mapBooking);
}

export function formatSlotLabel(slot: InventorySlot): string {
  const master = findMaster(slot.masterId);
  const d = new Date(slot.date + "T12:00:00");
  const day = d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  return `${day} ${slot.time} — ${master?.name ?? slot.masterId}`;
}

export interface DeskStats {
  todayCount: number;
  weekCount: number;
  weekLabel: string;
  confirmedCount: number;
  arrivedCount: number;
  completedCount: number;
  noShowCount: number;
  cancelledWeek: number;
  webCount: number;
  aiCount: number;
  adminCount: number;
}

export function getDeskStats(now = new Date()): DeskStats {
  const today = toDateKey(now);
  const weekDays = getWeekDays(now, 0).map(toDateKey);
  const weekSet = new Set(weekDays);
  const all = listBookings({ status: "all" });

  const active = (b: BookingRecord) =>
    b.status !== "cancelled" && weekSet.has(b.date);

  const weekActive = all.filter(active);
  const todayActive = all.filter(
    (b) => b.date === today && b.status !== "cancelled",
  );

  return {
    todayCount: todayActive.length,
    weekCount: weekActive.length,
    weekLabel: formatWeekRange(getWeekDays(now, 0)),
    confirmedCount: weekActive.filter((b) => b.status === "confirmed").length,
    arrivedCount: weekActive.filter((b) => b.status === "arrived").length,
    completedCount: weekActive.filter((b) => b.status === "completed").length,
    noShowCount: weekActive.filter((b) => b.status === "no_show").length,
    cancelledWeek: all.filter((b) => b.status === "cancelled" && weekSet.has(b.date))
      .length,
    webCount: weekActive.filter((b) => b.source === "web").length,
    aiCount: weekActive.filter((b) => b.source === "ai").length,
    adminCount: weekActive.filter((b) => b.source === "admin").length,
  };
}

export function searchBookings(query: string): BookingRecord[] {
  const q = query.trim().toLowerCase();
  if (!q) return listBookings({ status: "all" });
  return listBookings({ status: "all" }).filter(
    (b) =>
      b.ref.toLowerCase().includes(q) ||
      b.guestName.toLowerCase().includes(q) ||
      b.guestPhone.replace(/\s/g, "").includes(q.replace(/\s/g, "")),
  );
}

export function listBookingsForDate(dateKey: string): BookingRecord[] {
  return db()
    .prepare(
      `SELECT * FROM bookings WHERE date = ? AND status != 'cancelled'
       ORDER BY time ASC`,
    )
    .all(dateKey)
    .map((row) => mapBooking(row as BookingRow));
}

export function listBookingsForWeek(weekOffset = 0, now = new Date()): BookingRecord[] {
  const keys = new Set(getWeekDays(now, weekOffset).map(toDateKey));
  return listBookings({ status: "all" }).filter(
    (b) => keys.has(b.date) && b.status !== "cancelled",
  );
}

export function getGuestHistory(phone: string): BookingRecord[] {
  const normalized = phone.replace(/\s/g, "");
  return db()
    .prepare(
      `SELECT * FROM bookings
       WHERE replace(guest_phone, ' ', '') LIKE ?
       ORDER BY date DESC, time DESC LIMIT 20`,
    )
    .all(`%${normalized}%`)
    .map((row) => mapBooking(row as BookingRow));
}

export function updateBookingNotes(
  ref: string,
  notes: string,
): { ok: true; booking: BookingRecord } | { ok: false; error: string } {
  const sqlite = db();
  const row = sqlite
    .prepare(`SELECT * FROM bookings WHERE upper(ref) = upper(?)`)
    .get(ref.trim()) as BookingRow | undefined;
  if (!row) return { ok: false, error: "Booking not found." };

  const now = new Date().toISOString();
  sqlite
    .prepare(`UPDATE bookings SET notes = ?, updated_at = ? WHERE id = ?`)
    .run(notes.trim(), now, row.id);

  logAudit({
    action: "booking.notes_updated",
    bookingRef: row.ref,
    details: notes.trim().slice(0, 120),
  });

  return { ok: true, booking: getBookingByRef(ref)! };
}

const VISIT_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  confirmed: ["arrived", "no_show", "cancelled"],
  arrived: ["completed", "no_show", "cancelled"],
  completed: [],
  no_show: [],
  cancelled: [],
};

export function updateVisitStatus(
  ref: string,
  status: BookingStatus,
): { ok: true; booking: BookingRecord } | { ok: false; error: string } {
  const sqlite = db();
  const row = sqlite
    .prepare(`SELECT * FROM bookings WHERE upper(ref) = upper(?)`)
    .get(ref.trim()) as BookingRow | undefined;
  if (!row) return { ok: false, error: "Booking not found." };

  const current = row.status as BookingStatus;
  if (!VISIT_TRANSITIONS[current]?.includes(status)) {
    return { ok: false, error: `Cannot change ${current} → ${status}.` };
  }

  const now = new Date().toISOString();
  const tx = sqlite.transaction(() => {
    sqlite
      .prepare(`UPDATE bookings SET status = ?, updated_at = ? WHERE id = ?`)
      .run(status, now, row.id);
    if (status === "cancelled") {
      sqlite
        .prepare(
          `UPDATE slots SET status = 'open'
           WHERE master_id = ? AND date = ? AND time = ?`,
        )
        .run(row.master_id, row.date, row.time);
    }
  });
  tx();

  logAudit({
    action: `booking.${status}`,
    bookingRef: row.ref,
    details: `${row.guest_name}: ${current} → ${status}`,
  });

  return { ok: true, booking: getBookingByRef(ref)! };
}

export function listSlotsForDate(dateKey: string): InventorySlot[] {
  ensureUpcomingSlots();
  return db()
    .prepare(`SELECT * FROM slots WHERE date = ? ORDER BY master_id, time`)
    .all(dateKey)
    .map((row) => mapSlot(row as SlotRow));
}

export function blockSlot(
  masterId: string,
  date: string,
  time: string,
): { ok: true } | { ok: false; error: string } {
  const sqlite = db();
  const slot = sqlite
    .prepare(`SELECT * FROM slots WHERE master_id = ? AND date = ? AND time = ?`)
    .get(masterId, date, time) as SlotRow | undefined;
  if (!slot) return { ok: false, error: "Slot not found." };
  if (slot.status === "booked")
    return { ok: false, error: "Slot is booked." };
  if (slot.status === "blocked") return { ok: true };

  sqlite
    .prepare(`UPDATE slots SET status = 'blocked' WHERE id = ?`)
    .run(slot.id);

  logAudit({
    action: "slot.blocked",
    details: `${masterId} · ${date} ${time}`,
  });
  return { ok: true };
}

export function unblockSlot(
  masterId: string,
  date: string,
  time: string,
): { ok: true } | { ok: false; error: string } {
  const sqlite = db();
  const slot = sqlite
    .prepare(`SELECT * FROM slots WHERE master_id = ? AND date = ? AND time = ?`)
    .get(masterId, date, time) as SlotRow | undefined;
  if (!slot) return { ok: false, error: "Slot not found." };
  if (slot.status !== "blocked") return { ok: false, error: "Slot is not blocked." };

  sqlite.prepare(`UPDATE slots SET status = 'open' WHERE id = ?`).run(slot.id);
  logAudit({
    action: "slot.unblocked",
    details: `${masterId} · ${date} ${time}`,
  });
  return { ok: true };
}

export function bulkBlockDay(
  masterId: string,
  date: string,
): { ok: true; count: number } | { ok: false; error: string } {
  const sqlite = db();
  const result = sqlite
    .prepare(
      `UPDATE slots SET status = 'blocked'
       WHERE master_id = ? AND date = ? AND status = 'open'`,
    )
    .run(masterId, date);
  logAudit({
    action: "slot.bulk_blocked",
    details: `${masterId} · ${date} · ${result.changes} slots`,
  });
  return { ok: true, count: result.changes };
}

export function bulkOpenDay(
  masterId: string,
  date: string,
): { ok: true; count: number } {
  const sqlite = db();
  const result = sqlite
    .prepare(
      `UPDATE slots SET status = 'open'
       WHERE master_id = ? AND date = ? AND status = 'blocked'`,
    )
    .run(masterId, date);
  logAudit({
    action: "slot.bulk_opened",
    details: `${masterId} · ${date} · ${result.changes} slots`,
  });
  return { ok: true, count: result.changes };
}

export function exportBookingsCsv(from?: string, to?: string): string {
  const rows = listBookings({ status: "all" }).filter((b) => {
    if (from && b.date < from) return false;
    if (to && b.date > to) return false;
    return true;
  });

  const header =
    "ref,guest_name,guest_phone,service,stylist,date,time,status,source,notes,created_at";
  const lines = rows.map((b) => {
    const stylist = findMaster(b.masterId)?.name ?? b.masterId;
    const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
    return [
      b.ref,
      esc(b.guestName),
      esc(b.guestPhone),
      esc(b.serviceName),
      esc(stylist),
      b.date,
      b.time,
      b.status,
      b.source,
      esc(b.notes),
      b.createdAt,
    ].join(",");
  });
  return [header, ...lines].join("\n");
}

export { logAudit, listAuditLog } from "@/lib/salon-db/audit";
export type { AuditRecord } from "@/lib/salon-db/audit";
export { guestWhatsAppLink } from "@/lib/notifications";
