// root: src/lib/next-auth-server-shim.ts
// شِم بسيط لـ "next-auth" لبيئة API عند وجود استيراد قديم
import type { NextApiRequest, NextApiResponse } from "next";
type AuthOptions = any;
export default function NextAuth(_opts?: AuthOptions) {
  return async function handler(req: NextApiRequest, res: NextApiResponse) {
    return res.status(200).json({ ok: true, shim: "next-auth-server-shim" });
  };
}
export async function getServerSession() {
  return { user: { id: "local-owner", name: "مالك", email: "owner@example.com", role: "owner" } };
}
