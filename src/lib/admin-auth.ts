import { timingSafeEqual } from "node:crypto";

export function getAdminSecret(): string {
  return process.env.ADMIN_SECRET?.trim() || "aura-desk";
}

export function isValidAdminKey(key: string | null | undefined): boolean {
  if (!key) return false;
  const expected = getAdminSecret();
  const a = Buffer.from(key);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function requireAdmin(request: Request): Response | null {
  const header = request.headers.get("x-admin-key");
  const cookie = request.headers
    .get("cookie")
    ?.split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("aura_admin_key="))
    ?.split("=")
    .slice(1)
    .join("=");

  const key = header || (cookie ? decodeURIComponent(cookie) : null);
  if (isValidAdminKey(key)) return null;
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}
