import "server-only";

import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { MASTERS, SERVICES } from "@/data/content";
import {
  getTimesForDate,
  getUpcomingDays,
  isPastDay,
  isSalonClosed,
  toDateKey,
} from "@/lib/salon-schedule";

const globalForDb = globalThis as unknown as {
  __auraSqlite?: Database.Database;
};

function dbPath(): string {
  if (process.env.SALON_DB_PATH) return process.env.SALON_DB_PATH;
  return path.join(process.cwd(), "data", "salon.db");
}

export function getSqlite(): Database.Database {
  if (globalForDb.__auraSqlite) {
    ensureAuditLogTable(globalForDb.__auraSqlite);
    return globalForDb.__auraSqlite;
  }

  const file = dbPath();
  fs.mkdirSync(path.dirname(file), { recursive: true });

  const db = new Database(file);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  migrate(db);
  seedIfEmpty(db);
  ensureUpcomingSlots(db);

  globalForDb.__auraSqlite = db;
  return db;
}

function ensureAuditLogTable(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_log (
      id TEXT PRIMARY KEY,
      action TEXT NOT NULL,
      booking_ref TEXT,
      actor TEXT NOT NULL DEFAULT 'admin',
      details TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at);
  `);
}

function migrate(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS slots (
      id TEXT PRIMARY KEY,
      master_id TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('open','held','booked')),
      UNIQUE(master_id, date, time)
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      ref TEXT NOT NULL UNIQUE,
      master_id TEXT NOT NULL,
      service_id TEXT,
      service_name TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      guest_name TEXT NOT NULL,
      guest_phone TEXT NOT NULL,
      notes TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL CHECK (status IN ('confirmed','cancelled')),
      source TEXT NOT NULL CHECK (source IN ('web','ai','admin')),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      channel TEXT NOT NULL CHECK (channel IN ('email','whatsapp')),
      recipient TEXT NOT NULL,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      booking_ref TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_log (
      id TEXT PRIMARY KEY,
      action TEXT NOT NULL,
      booking_ref TEXT,
      actor TEXT NOT NULL DEFAULT 'admin',
      details TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_slots_date ON slots(date, status);
    CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status, date);
    CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at);
    CREATE INDEX IF NOT EXISTS idx_bookings_phone ON bookings(guest_phone);
  `);

  ensureAuditLogTable(db);
  migrateV2(db);
}

function migrateV2(db: Database.Database) {
  const row = db.prepare("SELECT value FROM meta WHERE key = 'schema_v'").get() as
    | { value: string }
    | undefined;
  if (row?.value === "2") return;

  const slotsSql = db
    .prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='slots'")
    .get() as { sql: string } | undefined;
  if (slotsSql?.sql && !slotsSql.sql.includes("'blocked'")) {
    db.exec(`
      CREATE TABLE slots_new (
        id TEXT PRIMARY KEY,
        master_id TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('open','held','booked','blocked')),
        UNIQUE(master_id, date, time)
      );
      INSERT INTO slots_new SELECT id, master_id, date, time, status FROM slots;
      DROP TABLE slots;
      ALTER TABLE slots_new RENAME TO slots;
      CREATE INDEX IF NOT EXISTS idx_slots_date ON slots(date, status);
    `);
  }

  const bookingsSql = db
    .prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='bookings'")
    .get() as { sql: string } | undefined;
  if (bookingsSql?.sql && !bookingsSql.sql.includes("'arrived'")) {
    db.exec(`
      CREATE TABLE bookings_new (
        id TEXT PRIMARY KEY,
        ref TEXT NOT NULL UNIQUE,
        master_id TEXT NOT NULL,
        service_id TEXT,
        service_name TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        guest_name TEXT NOT NULL,
        guest_phone TEXT NOT NULL,
        notes TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL CHECK (status IN ('confirmed','arrived','completed','no_show','cancelled')),
        source TEXT NOT NULL CHECK (source IN ('web','ai','admin')),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      INSERT INTO bookings_new
        SELECT id, ref, master_id, service_id, service_name, date, time,
               guest_name, guest_phone, notes, status, source, created_at, updated_at
        FROM bookings;
      DROP TABLE bookings;
      ALTER TABLE bookings_new RENAME TO bookings;
      CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status, date);
      CREATE INDEX IF NOT EXISTS idx_bookings_phone ON bookings(guest_phone);
    `);
  }

  db.prepare(
    `INSERT INTO meta (key, value) VALUES ('schema_v', '2')
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
  ).run();

  ensureAuditLogTable(db);
}

function seedIfEmpty(db: Database.Database) {
  const row = db.prepare("SELECT value FROM meta WHERE key = 'seeded'").get() as
    | { value: string }
    | undefined;
  if (row?.value === "1") return;

  const insertSlot = db.prepare(
    `INSERT OR IGNORE INTO slots (id, master_id, date, time, status)
     VALUES (@id, @masterId, @date, @time, @status)`,
  );

  const days = getUpcomingDays(14);
  const tx = db.transaction(() => {
    for (const day of days) {
      if (isSalonClosed(day) || isPastDay(day)) continue;
      const date = toDateKey(day);
      for (const master of MASTERS) {
        for (const time of getTimesForDate(day)) {
          insertSlot.run({
            id: `${master.id}|${date}|${time}`,
            masterId: master.id,
            date,
            time,
            status: "open",
          });
        }
      }
    }

    const presets = [
      { masterId: "m1", offset: 0, time: "10:00" },
      { masterId: "m2", offset: 1, time: "14:30" },
      { masterId: "m4", offset: 2, time: "11:00" },
    ];
    for (const p of presets) {
      const day = days[p.offset];
      if (!day || isSalonClosed(day)) continue;
      const date = toDateKey(day);
      db.prepare(
        `UPDATE slots SET status = 'booked'
         WHERE master_id = ? AND date = ? AND time = ?`,
      ).run(p.masterId, date, p.time);
    }

    db.prepare(
      `INSERT INTO meta (key, value) VALUES ('seeded', '1'), ('seq', '1000')
       ON CONFLICT(key) DO NOTHING`,
    ).run();
  });

  tx();
  // masters/services stay in content.ts — not duplicated in SQLite
  void SERVICES;
}

/** Extend inventory as calendar rolls forward. */
export function ensureUpcomingSlots(db = getSqlite()) {
  const insertSlot = db.prepare(
    `INSERT OR IGNORE INTO slots (id, master_id, date, time, status)
     VALUES (@id, @masterId, @date, @time, 'open')`,
  );

  const tx = db.transaction(() => {
    for (const day of getUpcomingDays(21)) {
      if (isSalonClosed(day) || isPastDay(day)) continue;
      const date = toDateKey(day);
      for (const master of MASTERS) {
        for (const time of getTimesForDate(day)) {
          insertSlot.run({
            id: `${master.id}|${date}|${time}`,
            masterId: master.id,
            date,
            time,
          });
        }
      }
    }
  });
  tx();
}

export function nextBookingRef(db = getSqlite()): string {
  const row = db.prepare("SELECT value FROM meta WHERE key = 'seq'").get() as
    | { value: string }
    | undefined;
  const next = Number(row?.value ?? "1000") + 1;
  db.prepare(
    `INSERT INTO meta (key, value) VALUES ('seq', ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
  ).run(String(next));
  return `AURA-${next}`;
}
