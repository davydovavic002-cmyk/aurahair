import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { exportBookingsCsv } from "@/lib/salon-db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from") ?? undefined;
  const to = searchParams.get("to") ?? undefined;
  const csv = exportBookingsCsv(from, to);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="aura-bookings-${from ?? "all"}.csv"`,
    },
  });
}
