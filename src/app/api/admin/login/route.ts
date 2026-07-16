import { NextResponse } from "next/server";
import { getAdminSecret, isValidAdminKey } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const password = String(body.password ?? "");
    if (!isValidAdminKey(password)) {
      return NextResponse.json({ error: "Invalid password." }, { status: 401 });
    }

    const res = NextResponse.json({ ok: true });
    res.cookies.set("aura_admin_key", getAdminSecret(), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 12,
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("aura_admin_key", "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
