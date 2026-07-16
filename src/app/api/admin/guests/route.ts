import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getGuestHistory, getMasters } from "@/lib/salon-db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const phone = searchParams.get("phone");
  if (!phone) {
    return NextResponse.json({ error: "phone required" }, { status: 400 });
  }

  const history = getGuestHistory(phone).map((b) => ({
    ...b,
    stylist: getMasters().find((m) => m.id === b.masterId)?.name ?? b.masterId,
  }));

  return NextResponse.json({ history });
}
