import "server-only";

import { getSqlite } from "@/lib/salon-db/sqlite";
import { SALON_INFO } from "@/data/content";
import type { BookingRecord } from "@/lib/salon-db";

export interface NotificationRecord {
  id: string;
  channel: "email" | "whatsapp";
  recipient: string;
  subject: string;
  body: string;
  bookingRef: string | null;
  createdAt: string;
}

export function logEmailNotification(input: {
  recipient: string;
  subject: string;
  body: string;
  bookingRef?: string;
}): NotificationRecord {
  const db = getSqlite();
  const record: NotificationRecord = {
    id: `ntf-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    channel: "email",
    recipient: input.recipient,
    subject: input.subject,
    body: input.body,
    bookingRef: input.bookingRef ?? null,
    createdAt: new Date().toISOString(),
  };
  db.prepare(
    `INSERT INTO notifications (id, channel, recipient, subject, body, booking_ref, created_at)
     VALUES (@id, @channel, @recipient, @subject, @body, @bookingRef, @createdAt)`,
  ).run(record);
  return record;
}

export function listNotifications(limit = 50): NotificationRecord[] {
  const rows = getSqlite()
    .prepare(
      `SELECT id, channel, recipient, subject, body, booking_ref as bookingRef, created_at as createdAt
       FROM notifications ORDER BY created_at DESC LIMIT ?`,
    )
    .all(limit) as NotificationRecord[];
  return rows;
}

/** Guest WhatsApp deep-link to confirm with the salon desk. */
export function whatsappConfirmLink(
  booking: BookingRecord,
  stylistName: string,
): string {
  const phone = SALON_INFO.whatsapp.replace(/\D/g, "");
  const text = [
    `Hi AURA, confirmed booking ${booking.ref}.`,
    `${booking.serviceName} with ${stylistName}`,
    `${booking.date} at ${booking.time}`,
    `Guest: ${booking.guestName} / ${booking.guestPhone}`,
  ].join("\n");
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export function guestWhatsAppLink(
  booking: BookingRecord,
  stylistName: string,
): string {
  const phone = booking.guestPhone.replace(/\D/g, "");
  if (!phone) return "";
  const text = [
    `Hi ${booking.guestName},`,
    `AURA Hair — your visit is confirmed.`,
    `${booking.serviceName} with ${stylistName}`,
    `${booking.date} at ${booking.time}`,
    `Ref: ${booking.ref}`,
  ].join("\n");
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export function whatsappDeskLink(message?: string): string {
  const phone = SALON_INFO.whatsapp.replace(/\D/g, "");
  if (!message) return `https://wa.me/${phone}`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
