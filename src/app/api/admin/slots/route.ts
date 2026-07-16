import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import {
  blockSlot,
  bulkBlockDay,
  bulkOpenDay,
  getMasters,
  listBookingsForDate,
  listSlotsForDate,
  unblockSlot,
} from "@/lib/salon-db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  if (!date) {
    return NextResponse.json({ error: "date required" }, { status: 400 });
  }

  const slots = listSlotsForDate(date);
  const bookings = listBookingsForDate(date).map((b) => ({
    ...b,
    stylist: getMasters().find((m) => m.id === b.masterId)?.name ?? b.masterId,
  }));

  return NextResponse.json({ slots, bookings, masters: getMasters() });
}

export async function POST(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  try {
    const body = await request.json();
    const action = String(body.action ?? "");

    if (action === "block") {
      const result = blockSlot(
        String(body.masterId),
        String(body.date),
        String(body.time),
      );
      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({ ok: true });
    }

    if (action === "unblock") {
      const result = unblockSlot(
        String(body.masterId),
        String(body.date),
        String(body.time),
      );
      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({ ok: true });
    }

    if (action === "bulk_block") {
      const result = bulkBlockDay(String(body.masterId), String(body.date));
      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({ ok: true, count: result.count });
    }

    if (action === "bulk_open") {
      const result = bulkOpenDay(String(body.masterId), String(body.date));
      return NextResponse.json({ ok: true, count: result.count });
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }
}
