import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import {
  createBooking,
  getMasters,
  listBookings,
  searchBookings,
} from "@/lib/salon-db";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  try {
    const body = await request.json();
    const result = createBooking({
      masterId: String(body.masterId ?? ""),
      serviceId: body.serviceId ? String(body.serviceId) : null,
      serviceName: body.serviceName ? String(body.serviceName) : undefined,
      date: String(body.date ?? ""),
      time: String(body.time ?? ""),
      guestName: String(body.guestName ?? ""),
      guestPhone: String(body.guestPhone ?? ""),
      notes: body.notes ? String(body.notes) : "",
      source: "admin",
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const stylist =
      getMasters().find((m) => m.id === result.booking.masterId)?.name ??
      result.booking.masterId;

    return NextResponse.json({
      booking: { ...result.booking, stylist },
      whatsappUrl: result.whatsappUrl,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}

export async function GET(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const bookings = (q ? searchBookings(q) : listBookings({ status: "all" })).map(
    (b) => ({
      ...b,
      stylist: getMasters().find((m) => m.id === b.masterId)?.name ?? b.masterId,
    }),
  );

  return NextResponse.json({ bookings });
}
