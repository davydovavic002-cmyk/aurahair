import { NextResponse } from "next/server";
import {
  getMasters,
  listAvailability,
  listHotOpenSlots,
} from "@/lib/salon-db";
import { weekdayLong, parseDateKey } from "@/lib/salon-schedule";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") ?? undefined;
  const from = searchParams.get("from") ?? undefined;
  const to = searchParams.get("to") ?? undefined;
  const masterId = searchParams.get("masterId") ?? undefined;
  const hot = searchParams.get("hot") === "1";

  if (hot) {
    const slots = listHotOpenSlots(8).map((s) => {
      const master = getMasters().find((m) => m.id === s.masterId);
      return {
        ...s,
        stylist: master?.name ?? s.masterId,
        day: weekdayLong(parseDateKey(s.date)),
        available: s.status === "open",
      };
    });
    return NextResponse.json({ slots });
  }

  const slots = listAvailability({ date, from, to, masterId, onlyOpen: true });
  return NextResponse.json({
    slots,
    count: slots.length,
  });
}
