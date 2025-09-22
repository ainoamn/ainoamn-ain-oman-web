import type { NextApiRequest } from "next";

export type Ctx = { userId: string; tenantId: string; roles: string[] };

/** هويّة المستخدم من الرؤوس (خادم فقط) */
export function contextFrom(req: NextApiRequest): Ctx {
  const h = req.headers;
  const tenantId = String(h["x-tenant-id"] || "TENANT-1");
  const userId = String(h["x-user-id"] || "U1");
  const roles = String(h["x-roles"] || "LAWYER").split(",").map(s=>s.trim()).filter(Boolean);
  return { userId, tenantId, roles };
}
