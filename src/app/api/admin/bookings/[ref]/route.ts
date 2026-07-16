import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import {
  cancelBooking,
  getBookingByRef,
  getMasters,
  rescheduleBooking,
  updateBookingNotes,
  updateVisitStatus,
  type BookingStatus,
} from "@/lib/salon-db";
import { guestWhatsAppLink } from "@/lib/notifications";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ ref: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const { ref } = await params;
  try {
    const body = await request.json();

    if (body.notes !== undefined) {
      const result = updateBookingNotes(ref, String(body.notes));
      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      const stylist =
        getMasters().find((m) => m.id === result.booking.masterId)?.name ??
        result.booking.masterId;
      return NextResponse.json({ booking: { ...result.booking, stylist } });
    }

    if (body.status) {
      const status = String(body.status) as BookingStatus;
      const result = updateVisitStatus(ref, status);
      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      const stylist =
        getMasters().find((m) => m.id === result.booking.masterId)?.name ??
        result.booking.masterId;
      return NextResponse.json({ booking: { ...result.booking, stylist } });
    }

    if (body.date && body.time) {
      const result = rescheduleBooking(ref, {
        date: String(body.date),
        time: String(body.time),
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
    }

    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const denied = requireAdmin(_request);
  if (denied) return denied;

  const { ref } = await params;
  const result = cancelBooking(ref);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  const stylist =
    getMasters().find((m) => m.id === result.booking.masterId)?.name ??
    result.booking.masterId;
  return NextResponse.json({ booking: { ...result.booking, stylist } });
}

export async function GET(_request: Request, { params }: Params) {
  const denied = requireAdmin(_request);
  if (denied) return denied;

  const { ref } = await params;
  const booking = getBookingByRef(ref);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }
  const stylist =
    getMasters().find((m) => m.id === booking.masterId)?.name ?? booking.masterId;
  return NextResponse.json({
    booking: { ...booking, stylist },
    guestWhatsappUrl: guestWhatsAppLink(booking, stylist),
  });
}
