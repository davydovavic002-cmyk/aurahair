import "server-only";

import { getSqlite } from "@/lib/salon-db/sqlite";

export interface AuditRecord {
  id: string;
  action: string;
  bookingRef: string | null;
  actor: string;
  details: string;
  createdAt: string;
}

export function logAudit(input: {
  action: string;
  bookingRef?: string | null;
  actor?: string;
  details?: string;
}): AuditRecord {
  const db = getSqlite();
  const record: AuditRecord = {
    id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    action: input.action,
    bookingRef: input.bookingRef ?? null,
    actor: input.actor ?? "admin",
    details: input.details ?? "",
    createdAt: new Date().toISOString(),
  };
  db.prepare(
    `INSERT INTO audit_log (id, action, booking_ref, actor, details, created_at)
     VALUES (@id, @action, @bookingRef, @actor, @details, @createdAt)`,
  ).run(record);
  return record;
}

export function listAuditLog(limit = 80): AuditRecord[] {
  return getSqlite()
    .prepare(
      `SELECT id, action, booking_ref as bookingRef, actor, details, created_at as createdAt
       FROM audit_log ORDER BY created_at DESC LIMIT ?`,
    )
    .all(limit) as AuditRecord[];
}
