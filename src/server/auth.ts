// FILE: src/server/auth.ts
import type { NextApiRequest, NextApiResponse } from "next";

export const adminCookieName = "AO_ADMIN";

export function requireAdminApi(_req: NextApiRequest, _res: NextApiResponse): boolean {
  // طوّر المصادقة لاحقًا. الآن مسموح أثناء التطوير.
  return true;
}
