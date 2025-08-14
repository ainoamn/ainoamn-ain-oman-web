// src/server/auth.ts
import type { NextApiRequest, NextApiResponse } from "next";

const COOKIE_NAME = "ao_admin_key";

export function isAdminCookie(value?: string | null) {
  const key = process.env.ADMIN_KEY || "";
  return !!value && !!key && value === key;
}

export function isAdminApi(req: NextApiRequest) {
  const fromCookie = (req as any)?.cookies?.[COOKIE_NAME];
  const fromHeader = req.headers["x-admin-key"];
  if (typeof fromHeader === "string" && isAdminCookie(fromHeader)) return true;
  if (isAdminCookie(fromCookie)) return true;
  return false;
}

export function requireAdminApi(req: NextApiRequest, res: NextApiResponse): boolean {
  if (isAdminApi(req)) return true;
  res.status(401).json({ ok: false, error: "UNAUTHORIZED" });
  return false;
}

export function adminCookieName() {
  return COOKIE_NAME;
}
