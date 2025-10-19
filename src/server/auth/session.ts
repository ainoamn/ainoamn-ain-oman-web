// @ts-nocheck
// src/server/auth/session.ts
import type { NextApiRequest } from "next";


export type SessionUser = { id: string; name?: string; role?: string };


/** استخراج هوية المستخدم من الطلب. حدّثه لاحقًا ليلتقط جلساتك الفعلية. */
export function getUserFromRequest(req: NextApiRequest): SessionUser | null {
try {
const hdr = (req.headers["x-user-id"] || req.headers["x-demo-user"]) as string | undefined;
if (hdr && typeof hdr === "string" && hdr.trim()) return { id: hdr.trim(), role: "user" };


// قراءة uid من الكوكيز إن وُجد
const cookie = String(req.headers.cookie || "");
const m = cookie.match(/(?:^|;\s*)uid=([^;]+)/);
if (m && m[1]) return { id: decodeURIComponent(m[1]), role: "user" };


// مستخدم تجريبي للعمل محليًا
return { id: "AO-USER-DEMO", name: "Demo User", role: "user" };
} catch {
return null;
}
}


export function isAdmin(req: NextApiRequest): boolean {
return String(req.headers["x-admin"]) === "true"; // بديل بسيط مؤقتًا
}
