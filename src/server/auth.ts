// FILE: src/server/auth.ts
import type { NextApiRequest, NextApiResponse } from "next";

export const adminCookieName = "AO_ADMIN";

export function requireAdminApi(_req: NextApiRequest, _res: NextApiResponse): boolean {
  // طوّر المصادقة لاحقًا. الآن مسموح أثناء التطوير.
  return true;
}

export function isAdminCookie(req: NextApiRequest) {
  try {
    const c = req.cookies?.[adminCookieName] || req.headers?.cookie || "";
    return Boolean(c);
  } catch { return false; }
}
