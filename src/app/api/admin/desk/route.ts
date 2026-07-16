import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import {
  getDeskStats,
  getMasters,
  getGuestHistory,
  listAuditLog,
  listBookings,
  listBookingsForDate,
  listBookingsForWeek,
  listSlotsForDate,
  searchBookings,
} from "@/lib/salon-db";
import { toDateKey } from "@/lib/salon-schedule";
import { listNotifications } from "@/lib/notifications";
import { guestWhatsAppLink, whatsappConfirmLink } from "@/lib/notifications";

export const dynamic = "force-dynamic";

function enrich(bookings: ReturnType<typeof listBookings>) {
  return bookings.map((b) => {
    const stylist =
      getMasters().find((m) => m.id === b.masterId)?.name ?? b.masterId;
    return {
      ...b,
      stylist,
      guestWhatsappUrl: guestWhatsAppLink(b, stylist),
      salonWhatsappUrl: whatsappConfirmLink(b, stylist),
    };
  });
}

export async function GET(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const view = searchParams.get("view") ?? "all";
  const status = searchParams.get("status");
  const q = searchParams.get("q")?.trim();
  const phone = searchParams.get("phone")?.trim();
  const calendarDate = searchParams.get("calendarDate");

  const stats = getDeskStats();
  const notifications = listNotifications(40);
  const audit = listAuditLog(80);

  let bookings = q
    ? searchBookings(q)
    : view === "today"
      ? listBookingsForDate(toDateKey(new Date()))
      : view === "week"
        ? listBookingsForWeek(0)
        : listBookings({
            status:
              status === "confirmed" ||
              status === "cancelled" ||
              status === "arrived" ||
              status === "completed" ||
              status === "no_show" ||
              status === "all"
                ? status
                : "all",
          });

  if (
    status &&
    status !== "all" &&
    (view === "today" || view === "week" || q)
  ) {
    bookings = bookings.filter((b) => b.status === status);
  }

  bookings.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.time.localeCompare(b.time);
  });

  const guestHistory = phone ? enrich(getGuestHistory(phone)) : [];

  const calendar = calendarDate
    ? {
        date: calendarDate,
        slots: listSlotsForDate(calendarDate),
        bookings: enrich(listBookingsForDate(calendarDate)),
      }
    : null;

  return NextResponse.json({
    stats,
    bookings: enrich(bookings),
    notifications,
    audit,
    guestHistory,
    calendar,
    masters: getMasters(),
  });
}
