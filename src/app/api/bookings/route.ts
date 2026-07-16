import { NextResponse } from "next/server";
import {
  createBooking,
  getMasters,
  listBookings,
} from "@/lib/salon-db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const bookings = listBookings({
    status:
      status === "confirmed" || status === "cancelled" || status === "all"
        ? status
        : "all",
  }).map((b) => ({
    ...b,
    stylist: getMasters().find((m) => m.id === b.masterId)?.name ?? b.masterId,
  }));
  return NextResponse.json({ bookings });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = createBooking({
      masterId: String(body.masterId ?? ""),
      serviceId: body.serviceId ?? null,
      serviceName: body.serviceName,
      date: String(body.date ?? ""),
      time: String(body.time ?? ""),
      guestName: String(body.guestName ?? ""),
      guestPhone: String(body.guestPhone ?? ""),
      notes: body.notes ? String(body.notes) : "",
      source:
        body.source === "ai"
          ? "ai"
          : body.source === "admin"
            ? "admin"
            : "web",
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const stylist =
      getMasters().find((m) => m.id === result.booking.masterId)?.name ??
      result.booking.masterId;

    return NextResponse.json(
      {
        booking: { ...result.booking, stylist },
        whatsappUrl: result.whatsappUrl,
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}
