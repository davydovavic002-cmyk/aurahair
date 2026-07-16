"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Copy,
  Download,
  MessageCircle,
  Plus,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import AuraWordmark from "@/components/AuraWordmark";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import IconButton from "@/components/ui/IconButton";
import Badge from "@/components/ui/Badge";
import { MASTERS, SERVICES } from "@/data/content";
import { BOOKABLE_TIMES } from "@/lib/salon-schedule";

type DeskView =
  | "dashboard"
  | "today"
  | "week"
  | "all"
  | "calendar"
  | "slots"
  | "mail"
  | "audit";

type BookingStatus =
  | "confirmed"
  | "arrived"
  | "completed"
  | "no_show"
  | "cancelled";

interface DeskBooking {
  ref: string;
  masterId: string;
  stylist: string;
  serviceName: string;
  date: string;
  time: string;
  guestName: string;
  guestPhone: string;
  notes: string;
  status: BookingStatus;
  source: string;
  createdAt: string;
  guestWhatsappUrl?: string;
  salonWhatsappUrl?: string;
}

interface DeskStats {
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

interface DeskNotification {
  id: string;
  channel: string;
  recipient: string;
  subject: string;
  body: string;
  bookingRef: string | null;
  createdAt: string;
}

interface AuditEntry {
  id: string;
  action: string;
  bookingRef: string | null;
  actor: string;
  details: string;
  createdAt: string;
}

interface InventorySlot {
  id: string;
  masterId: string;
  date: string;
  time: string;
  status: string;
}

const STATUS_LABEL: Record<BookingStatus, string> = {
  confirmed: "Confirmed",
  arrived: "Arrived",
  completed: "Completed",
  no_show: "No-show",
  cancelled: "Cancelled",
};

const REFRESH_MS = 30_000;

export default function AdminDesk() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [view, setView] = useState<DeskView>("dashboard");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [bookings, setBookings] = useState<DeskBooking[]>([]);
  const [stats, setStats] = useState<DeskStats | null>(null);
  const [notifications, setNotifications] = useState<DeskNotification[]>([]);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [guestHistory, setGuestHistory] = useState<DeskBooking[]>([]);
  const [calendarDate, setCalendarDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  const [calendarSlots, setCalendarSlots] = useState<InventorySlot[]>([]);
  const [calendarBookings, setCalendarBookings] = useState<DeskBooking[]>([]);
  const [slotDate, setSlotDate] = useState(calendarDate);
  const [slotMasterId, setSlotMasterId] = useState(MASTERS[0]?.id ?? "m1");
  const [slotGrid, setSlotGrid] = useState<InventorySlot[]>([]);
  const [busyRef, setBusyRef] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [live, setLive] = useState(true);
  const [reschedule, setReschedule] = useState<{
    ref: string;
    date: string;
    time: string;
    masterId: string;
  } | null>(null);
  const [newBooking, setNewBooking] = useState(false);
  const [createForm, setCreateForm] = useState({
    masterId: MASTERS[0]?.id ?? "m1",
    serviceId: SERVICES[0]?.id ?? "",
    date: "",
    time: "10:00",
    guestName: "",
    guestPhone: "",
    notes: "",
  });
  const [notesEdit, setNotesEdit] = useState<{ ref: string; notes: string } | null>(
    null,
  );

  const deskQuery = useMemo(() => {
    const p = new URLSearchParams();
    if (view === "today") p.set("view", "today");
    else if (view === "week") p.set("view", "week");
    else if (search.trim()) p.set("q", search.trim());
    else p.set("view", "all");
    if (statusFilter !== "all") p.set("status", statusFilter);
    if (view === "calendar") p.set("calendarDate", calendarDate);
    return p.toString();
  }, [view, search, statusFilter, calendarDate]);

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/desk?${deskQuery}`, { credentials: "include" });
    if (res.status === 401) {
      setAuthed(false);
      return;
    }
    if (!res.ok) {
      throw new Error(`Desk API ${res.status}`);
    }
    const data = await res.json();
    setBookings(data.bookings ?? []);
    setStats(data.stats ?? null);
    setNotifications(data.notifications ?? []);
    setAudit(data.audit ?? []);
    if (data.calendar) {
      setCalendarSlots(data.calendar.slots ?? []);
      setCalendarBookings(data.calendar.bookings ?? []);
    }
    setAuthed(true);
  }, [deskQuery]);

  const loadSlots = useCallback(async () => {
    const res = await fetch(
      `/api/admin/slots?date=${slotDate}`,
      { credentials: "include" },
    );
    if (!res.ok) return;
    const data = await res.json();
    setSlotGrid(
      (data.slots as InventorySlot[]).filter((s) => s.masterId === slotMasterId),
    );
  }, [slotDate, slotMasterId]);

  const loadGuestHistory = useCallback(async (phone: string) => {
    if (phone.length < 6) {
      setGuestHistory([]);
      return;
    }
    const res = await fetch(
      `/api/admin/guests?phone=${encodeURIComponent(phone)}`,
      { credentials: "include" },
    );
    if (!res.ok) return;
    const data = await res.json();
    setGuestHistory(data.history ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!authed || !live) return;
    const id = setInterval(() => void load(), REFRESH_MS);
    return () => clearInterval(id);
  }, [authed, live, load]);

  useEffect(() => {
    if (view === "slots" && authed) void loadSlots();
  }, [view, authed, loadSlots]);

  useEffect(() => {
    if (view === "calendar" && authed) void load();
  }, [calendarDate, view, authed, load]);

  useEffect(() => {
    if (createForm.guestPhone.length >= 6) {
      void loadGuestHistory(createForm.guestPhone);
    } else {
      setGuestHistory([]);
    }
  }, [createForm.guestPhone, loadGuestHistory]);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      setLoginError("Wrong password.");
      return;
    }
    setPassword("");
    try {
      await load();
    } catch {
      setLoginError("Signed in, but desk failed to load. Restart the dev server and try again.");
      return;
    }
  };

  const logout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    setAuthed(false);
  };

  const patchBooking = async (
    ref: string,
    body: Record<string, string>,
  ) => {
    setBusyRef(ref);
    setMessage(null);
    const res = await fetch(`/api/admin/bookings/${encodeURIComponent(ref)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setBusyRef(null);
    if (!res.ok) {
      setMessage(data.error ?? "Update failed");
      return false;
    }
    await load();
    return true;
  };

  const cancel = async (ref: string) => {
    if (!confirm(`Cancel ${ref}?`)) return;
    setBusyRef(ref);
    const res = await fetch(`/api/admin/bookings/${encodeURIComponent(ref)}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json();
    setBusyRef(null);
    if (!res.ok) {
      setMessage(data.error ?? "Cancel failed");
      return;
    }
    setMessage(`${ref} cancelled`);
    await load();
  };

  const createBooking = async () => {
    setMessage(null);
    const res = await fetch("/api/admin/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(createForm),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error ?? "Could not create booking");
      return;
    }
    setMessage(`Created ${data.booking.ref}`);
    setNewBooking(false);
    setCreateForm((f) => ({ ...f, guestName: "", guestPhone: "", notes: "" }));
    await load();
  };

  const slotAction = async (action: string, time: string) => {
    const res = await fetch("/api/admin/slots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        action,
        masterId: slotMasterId,
        date: slotDate,
        time,
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      setMessage(data.error ?? "Slot update failed");
      return;
    }
    await loadSlots();
    await load();
  };

  const bulkSlot = async (action: "bulk_block" | "bulk_open") => {
    const res = await fetch("/api/admin/slots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action, masterId: slotMasterId, date: slotDate }),
    });
    const data = await res.json();
    setMessage(
      action === "bulk_block"
        ? `Blocked ${data.count ?? 0} slots`
        : `Opened ${data.count ?? 0} slots`,
    );
    await loadSlots();
    await load();
  };

  const copyRef = async (ref: string) => {
    await navigator.clipboard.writeText(ref);
    setMessage(`Copied ${ref}`);
  };

  if (!authed) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-16">
        <AuraWordmark className="text-2xl text-foreground" />
        <Label variant="gold" className="mt-4">
          AURA Desk
        </Label>
        <h1 className="mt-2 font-display text-3xl text-foreground">Concierge login</h1>
        <p className="mt-2 text-sm text-muted">
          Password from <code className="text-xs">ADMIN_SECRET</code> (default{" "}
          <code className="text-xs">aura-desk</code>).
        </p>
        <form onSubmit={login} className="mt-8 space-y-3">
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            autoFocus
          />
          {loginError && <p className="text-xs text-bordeaux">{loginError}</p>}
          <Button type="submit" variant="primary" fullWidth>
            Enter desk
          </Button>
        </form>
      </main>
    );
  }

  const views: { id: DeskView; label: string }[] = [
    { id: "dashboard", label: "Dashboard" },
    { id: "today", label: "Today" },
    { id: "week", label: "This week" },
    { id: "all", label: "All" },
    { id: "calendar", label: "Calendar" },
    { id: "slots", label: "Slots" },
    { id: "mail", label: "Email log" },
    { id: "audit", label: "Audit" },
  ];

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <Label variant="gold">Operations · CRM</Label>
          <h1 className="mt-1 font-display text-3xl text-foreground">Salon desk</h1>
          {stats && (
            <p className="mt-1 text-xs text-muted">
              {stats.weekLabel} · Live refresh {live ? "on" : "off"}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" onClick={() => setNewBooking(true)} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            New booking
          </Button>
          <a
            href="/api/admin/export"
            className="focus-ring inline-flex items-center gap-1.5 border border-border px-3 py-2 text-label-sm uppercase tracking-[0.15em] text-muted hover:text-foreground"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </a>
          <Link
            href="/"
            className="focus-ring inline-flex items-center justify-center border border-border px-3 py-2 text-label-sm uppercase tracking-[0.15em] text-muted transition-colors hover:border-bordeaux/30 hover:text-foreground"
          >
            Site
          </Link>
          <Button variant="ghost" onClick={logout} className="px-3 py-2 text-label-sm">
            Log out
          </Button>
        </div>
      </div>

      {stats && view === "dashboard" && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Today", value: stats.todayCount },
            { label: "This week", value: stats.weekCount },
            { label: "Web / AI / Desk", value: `${stats.webCount} / ${stats.aiCount} / ${stats.adminCount}` },
            { label: "Completed", value: stats.completedCount },
          ].map((c) => (
            <div key={c.label} className="border border-border bg-card p-4">
              <p className="text-label-sm text-dim">{c.label}</p>
              <p className="mt-2 font-display text-2xl text-foreground">{c.value}</p>
            </div>
          ))}
          <div className="border border-border bg-card p-4 sm:col-span-2 lg:col-span-4">
            <p className="text-label-sm text-dim">Visit pipeline (this week)</p>
            <div className="mt-3 flex flex-wrap gap-4 text-sm">
              <span>Confirmed {stats.confirmedCount}</span>
              <span>Arrived {stats.arrivedCount}</span>
              <span>Completed {stats.completedCount}</span>
              <span>No-show {stats.noShowCount}</span>
              <span>Cancelled {stats.cancelledWeek}</span>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1">
          {views.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setView(id)}
              className={`focus-ring px-3 py-2 text-label-sm uppercase tracking-[0.15em] transition-colors ${
                view === id
                  ? "bg-bordeaux text-white"
                  : "border border-border text-muted hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {(view === "all" || view === "today" || view === "week") && (
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="focus-ring border border-border bg-transparent px-2 py-2 text-xs text-foreground"
          >
            <option value="all">All statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="arrived">Arrived</option>
            <option value="completed">Completed</option>
            <option value="no_show">No-show</option>
            <option value="cancelled">Cancelled</option>
          </select>
        )}

        <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-dim" />
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              if (e.target.value) setView("all");
            }}
            placeholder="Search ref, name, phone…"
            className="focus-ring w-full border border-border bg-transparent py-2 pl-9 pr-3 text-sm"
          />
        </div>

        <button
          type="button"
          onClick={() => setLive((v) => !v)}
          className={`focus-ring text-label-sm uppercase tracking-[0.15em] ${
            live ? "text-gold" : "text-dim"
          }`}
        >
          {live ? "● Live" : "○ Paused"}
        </button>
        <button
          type="button"
          onClick={() => void load()}
          className="focus-ring inline-flex items-center gap-1.5 text-label-sm uppercase tracking-[0.15em] text-dim hover:text-foreground"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {message && (
        <p className="mt-4 border border-gold/30 bg-gold-soft px-3 py-2 text-xs text-foreground">
          {message}
        </p>
      )}

      {(view === "today" || view === "week" || view === "all" || view === "dashboard") &&
        view !== "dashboard" && (
          <BookingList
            bookings={bookings}
            busyRef={busyRef}
            onCancel={cancel}
            onReschedule={setReschedule}
            onStatus={(ref, status) => void patchBooking(ref, { status })}
            onNotes={(ref, notes) => setNotesEdit({ ref, notes })}
            onCopyRef={copyRef}
          />
        )}

      {view === "dashboard" && (
        <div className="mt-6">
          <Label variant="gold">Today&apos;s agenda</Label>
          <BookingList
            bookings={bookings.filter((b) => {
              const t = new Date().toISOString().slice(0, 10);
              return b.date === t && b.status !== "cancelled";
            })}
            busyRef={busyRef}
            onCancel={cancel}
            onReschedule={setReschedule}
            onStatus={(ref, status) => void patchBooking(ref, { status })}
            onNotes={(ref, notes) => setNotesEdit({ ref, notes })}
            onCopyRef={copyRef}
          />
        </div>
      )}

      {view === "calendar" && (
        <div className="mt-6 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Calendar className="h-4 w-4 text-gold" />
            <input
              type="date"
              value={calendarDate}
              onChange={(e) => setCalendarDate(e.target.value)}
              className="focus-ring border border-border bg-transparent px-3 py-2 text-sm"
            />
          </div>
          <div className="overflow-x-auto border border-border">
            <table className="w-full min-w-[640px] text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-bg-muted">
                  <th className="p-3 text-label-sm text-dim">Time</th>
                  {MASTERS.map((m) => (
                    <th key={m.id} className="p-3 text-label-sm text-dim">
                      {m.name.split(" ")[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {BOOKABLE_TIMES.map((time) => (
                  <tr key={time} className="border-b border-border/60">
                    <td className="p-3 font-medium text-foreground">{time}</td>
                    {MASTERS.map((m) => {
                      const slot = calendarSlots.find(
                        (s) => s.masterId === m.id && s.time === time,
                      );
                      const booking = calendarBookings.find(
                        (b) =>
                          b.masterId === m.id &&
                          b.time === time &&
                          b.status !== "cancelled",
                      );
                      const cell =
                        booking?.guestName ??
                        (slot?.status === "blocked"
                          ? "Blocked"
                          : slot?.status === "booked"
                            ? "Booked"
                            : slot?.status === "open"
                              ? "Open"
                              : "—");
                      return (
                        <td
                          key={m.id}
                          className={`p-3 ${
                            booking
                              ? "bg-bordeaux-soft text-bordeaux"
                              : slot?.status === "blocked"
                                ? "bg-bg-muted text-dim"
                                : "text-muted"
                          }`}
                        >
                          {cell}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {view === "slots" && (
        <div className="mt-6 space-y-4">
          <div className="flex flex-wrap gap-3">
            <input
              type="date"
              value={slotDate}
              onChange={(e) => setSlotDate(e.target.value)}
              className="focus-ring border border-border bg-transparent px-3 py-2 text-sm"
            />
            <select
              value={slotMasterId}
              onChange={(e) => setSlotMasterId(e.target.value)}
              className="focus-ring border border-border bg-transparent px-3 py-2 text-sm"
            >
              {MASTERS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            <Button variant="ghost" onClick={() => void bulkSlot("bulk_block")}>
              Block full day
            </Button>
            <Button variant="ghost" onClick={() => void bulkSlot("bulk_open")}>
              Open full day
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {slotGrid.map((slot) => (
              <button
                key={slot.id}
                type="button"
                onClick={() =>
                  void slotAction(
                    slot.status === "blocked" ? "unblock" : "block",
                    slot.time,
                  )
                }
                className={`focus-ring px-3 py-2 text-xs ${
                  slot.status === "open"
                    ? "border border-border text-foreground"
                    : slot.status === "blocked"
                      ? "bg-bg-muted text-dim line-through"
                      : "bg-bordeaux-soft text-bordeaux"
                }`}
              >
                {slot.time} · {slot.status}
              </button>
            ))}
          </div>
        </div>
      )}

      {view === "mail" && (
        <div className="mt-6 space-y-3">
          {notifications.length === 0 && (
            <p className="text-sm text-muted">No emails logged yet.</p>
          )}
          {notifications.map((n) => (
            <article key={n.id} className="border border-border bg-card p-4 text-sm sm:p-5">
              <Label>
                {n.channel} · {new Date(n.createdAt).toLocaleString()}
                {n.bookingRef ? ` · ${n.bookingRef}` : ""}
              </Label>
              <p className="mt-2 font-medium text-foreground">{n.subject}</p>
              <p className="mt-1 text-xs text-muted">To: {n.recipient}</p>
              <pre className="mt-3 whitespace-pre-wrap font-sans text-xs leading-relaxed text-dim">
                {n.body}
              </pre>
            </article>
          ))}
        </div>
      )}

      {view === "audit" && (
        <div className="mt-6 divide-y divide-border border border-border bg-card">
          {audit.length === 0 && (
            <p className="p-6 text-sm text-muted">No audit entries yet.</p>
          )}
          {audit.map((a) => (
            <div key={a.id} className="p-4 text-sm sm:p-5">
              <div className="flex flex-wrap gap-2">
                <Badge variant="neutral">{a.action}</Badge>
                {a.bookingRef && <span className="text-label-sm text-gold">{a.bookingRef}</span>}
                <span className="text-label-sm text-dim">
                  {new Date(a.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="mt-2 text-foreground">{a.details}</p>
            </div>
          ))}
        </div>
      )}

      {reschedule && (
        <Modal
          title={`Reschedule ${reschedule.ref}`}
          onClose={() => setReschedule(null)}
        >
          <div className="space-y-3">
            <Input
              label="Date"
              type="date"
              value={reschedule.date}
              onChange={(e) => setReschedule({ ...reschedule, date: e.target.value })}
            />
            <label className="block">
              <span className="text-label-sm uppercase tracking-[0.15em] text-dim">Time</span>
              <select
                value={reschedule.time}
                onChange={(e) => setReschedule({ ...reschedule, time: e.target.value })}
                className="focus-ring mt-1.5 w-full rounded-sm border border-border bg-transparent px-3 py-2.5 text-sm"
              >
                {BOOKABLE_TIMES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-label-sm uppercase tracking-[0.15em] text-dim">Stylist</span>
              <select
                value={reschedule.masterId}
                onChange={(e) =>
                  setReschedule({ ...reschedule, masterId: e.target.value })
                }
                className="focus-ring mt-1.5 w-full rounded-sm border border-border bg-transparent px-3 py-2.5 text-sm"
              >
                {MASTERS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="mt-5 flex gap-2">
            <Button variant="ghost" fullWidth onClick={() => setReschedule(null)}>
              Back
            </Button>
            <Button
              variant="primary"
              fullWidth
              disabled={busyRef === reschedule.ref}
              onClick={async () => {
                const ok = await patchBooking(reschedule.ref, {
                  date: reschedule.date,
                  time: reschedule.time,
                  masterId: reschedule.masterId,
                });
                if (ok) setReschedule(null);
              }}
            >
              Save
            </Button>
          </div>
        </Modal>
      )}

      {notesEdit && (
        <Modal title={`Notes · ${notesEdit.ref}`} onClose={() => setNotesEdit(null)}>
          <textarea
            value={notesEdit.notes}
            onChange={(e) => setNotesEdit({ ...notesEdit, notes: e.target.value })}
            rows={4}
            className="focus-ring w-full border border-border bg-transparent p-3 text-sm"
          />
          <div className="mt-4 flex gap-2">
            <Button variant="ghost" fullWidth onClick={() => setNotesEdit(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={async () => {
                const ok = await patchBooking(notesEdit.ref, {
                  notes: notesEdit.notes,
                });
                if (ok) setNotesEdit(null);
              }}
            >
              Save notes
            </Button>
          </div>
        </Modal>
      )}

      {newBooking && (
        <Modal title="New desk booking" onClose={() => setNewBooking(false)}>
          <div className="space-y-3">
            <label className="block">
              <span className="text-label-sm uppercase tracking-[0.15em] text-dim">Stylist</span>
              <select
                value={createForm.masterId}
                onChange={(e) =>
                  setCreateForm({ ...createForm, masterId: e.target.value })
                }
                className="focus-ring mt-1.5 w-full border border-border bg-transparent px-3 py-2.5 text-sm"
              >
                {MASTERS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-label-sm uppercase tracking-[0.15em] text-dim">Service</span>
              <select
                value={createForm.serviceId}
                onChange={(e) =>
                  setCreateForm({ ...createForm, serviceId: e.target.value })
                }
                className="focus-ring mt-1.5 w-full border border-border bg-transparent px-3 py-2.5 text-sm"
              >
                {SERVICES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <Input
              label="Date"
              type="date"
              value={createForm.date}
              onChange={(e) => setCreateForm({ ...createForm, date: e.target.value })}
            />
            <label className="block">
              <span className="text-label-sm uppercase tracking-[0.15em] text-dim">Time</span>
              <select
                value={createForm.time}
                onChange={(e) => setCreateForm({ ...createForm, time: e.target.value })}
                className="focus-ring mt-1.5 w-full border border-border bg-transparent px-3 py-2.5 text-sm"
              >
                {BOOKABLE_TIMES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <Input
              label="Guest name"
              value={createForm.guestName}
              onChange={(e) =>
                setCreateForm({ ...createForm, guestName: e.target.value })
              }
            />
            <Input
              label="Phone"
              value={createForm.guestPhone}
              onChange={(e) =>
                setCreateForm({ ...createForm, guestPhone: e.target.value })
              }
            />
            {guestHistory.length > 0 && (
              <div className="border border-gold/30 bg-gold-soft p-3 text-xs">
                <p className="text-label-sm text-gold">Guest history</p>
                <ul className="mt-2 space-y-1 text-dim">
                  {guestHistory.slice(0, 3).map((h) => (
                    <li key={h.ref}>
                      {h.date} · {h.serviceName} · {h.stylist}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <Input
              label="Notes"
              value={createForm.notes}
              onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
            />
          </div>
          <div className="mt-5 flex gap-2">
            <Button variant="ghost" fullWidth onClick={() => setNewBooking(false)}>
              Cancel
            </Button>
            <Button variant="primary" fullWidth onClick={() => void createBooking()}>
              Create booking
            </Button>
          </div>
        </Modal>
      )}
    </main>
  );
}

function BookingList({
  bookings,
  busyRef,
  onCancel,
  onReschedule,
  onStatus,
  onNotes,
  onCopyRef,
}: {
  bookings: DeskBooking[];
  busyRef: string | null;
  onCancel: (ref: string) => void;
  onReschedule: (r: {
    ref: string;
    date: string;
    time: string;
    masterId: string;
  }) => void;
  onStatus: (ref: string, status: BookingStatus) => void;
  onNotes: (ref: string, notes: string) => void;
  onCopyRef: (ref: string) => void;
}) {
  if (bookings.length === 0) {
    return <p className="mt-6 text-sm text-muted">No bookings in this view.</p>;
  }

  return (
    <div className="mt-6 divide-y divide-border border border-border bg-card">
      {bookings.map((b) => (
        <div
          key={b.ref}
          className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5"
        >
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => void onCopyRef(b.ref)}
                className="focus-ring inline-flex items-center gap-1 text-label-sm text-gold hover:text-bordeaux"
              >
                {b.ref}
                <Copy className="h-3 w-3" />
              </button>
              <Badge
                variant={
                  b.status === "confirmed" || b.status === "arrived"
                    ? "bordeaux"
                    : "neutral"
                }
              >
                {STATUS_LABEL[b.status]}
              </Badge>
              <span className="text-label-sm text-dim">{b.source}</span>
            </div>
            <p className="mt-2 font-display text-xl text-foreground">{b.guestName}</p>
            <p className="mt-1 text-sm text-muted">
              {b.serviceName} · {b.stylist}
            </p>
            <p className="mt-1 text-sm text-foreground">
              {b.date} at {b.time}
            </p>
            <p className="mt-1 text-xs text-dim">
              {b.guestPhone}
              {b.notes ? ` · ${b.notes}` : ""}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            {b.guestWhatsappUrl && (
              <a
                href={b.guestWhatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring inline-flex items-center gap-1 border border-border px-3 py-2 text-label-sm text-muted hover:text-foreground"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                Guest
              </a>
            )}
            {b.status === "confirmed" && (
              <Button
                variant="ghost"
                disabled={busyRef === b.ref}
                onClick={() => onStatus(b.ref, "arrived")}
                className="px-3 py-2 text-label-sm"
              >
                Arrived
              </Button>
            )}
            {b.status === "arrived" && (
              <>
                <Button
                  variant="ghost"
                  disabled={busyRef === b.ref}
                  onClick={() => onStatus(b.ref, "completed")}
                  className="px-3 py-2 text-label-sm"
                >
                  Complete
                </Button>
                <Button
                  variant="ghost"
                  disabled={busyRef === b.ref}
                  onClick={() => onStatus(b.ref, "no_show")}
                  className="px-3 py-2 text-label-sm"
                >
                  No-show
                </Button>
              </>
            )}
            {(b.status === "confirmed" || b.status === "arrived") && (
              <>
                <Button
                  variant="ghost"
                  disabled={busyRef === b.ref}
                  onClick={() =>
                    onReschedule({
                      ref: b.ref,
                      date: b.date,
                      time: b.time,
                      masterId: b.masterId,
                    })
                  }
                  className="px-3 py-2 text-label-sm"
                >
                  Reschedule
                </Button>
                <Button
                  variant="ghost"
                  disabled={busyRef === b.ref}
                  onClick={() => onNotes(b.ref, b.notes)}
                  className="px-3 py-2 text-label-sm"
                >
                  Notes
                </Button>
                <Button
                  variant="gold-soft"
                  disabled={busyRef === b.ref}
                  onClick={() => void onCancel(b.ref)}
                  className="px-3 py-2 text-label-sm"
                >
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--overlay)] p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border border-border bg-drawer p-5 shadow-elevated">
        <div className="flex items-start justify-between gap-3">
          <Label variant="gold">{title}</Label>
          <IconButton size="sm" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </IconButton>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
