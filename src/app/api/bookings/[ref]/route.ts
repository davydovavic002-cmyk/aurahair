import { NextResponse } from "next/server";
import {
  cancelBooking,
  getBookingByRef,
  getMasters,
  rescheduleBooking,
} from "@/lib/salon-db";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ ref: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { ref } = await params;
  const booking = getBookingByRef(ref);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }
  const stylist =
    getMasters().find((m) => m.id === booking.masterId)?.name ?? booking.masterId;
  return NextResponse.json({ booking: { ...booking, stylist } });
}

export async function PATCH(request: Request, { params }: Params) {
  const { ref } = await params;
  try {
    const body = await request.json();
    const result = rescheduleBooking(ref, {
      date: String(body.date ?? ""),
      time: String(body.time ?? ""),
      masterId: body.masterId ? String(body.masterId) : undefined,
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

export async function DELETE(_request: Request, { params }: Params) {
  const { ref } = await params;
  const result = cancelBooking(ref);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ booking: result.booking });
}
