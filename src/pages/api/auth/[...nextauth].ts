// root: src/pages/api/auth/[...nextauth].ts
// استبدال كامل لعدم الاعتماد على حزمة next-auth
import type { NextApiRequest, NextApiResponse } from "next";

const COOKIE = "ao_session";
const ONE_MONTH = 60 * 60 * 24 * 30;

function parseCookies(header?: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  header.split(";").forEach((p) => {
    const i = p.indexOf("=");
    if (i < 0) return;
    const k = p.slice(0, i).trim();
    const v = p.slice(i + 1).trim();
    out[k] = decodeURIComponent(v);
  });
  return out;
}
function setCookie(res: NextApiResponse, name: string, value: string, maxAge: number) {
  const cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}`;
  res.setHeader("Set-Cookie", cookie);
}
async function readJSON(req: NextApiRequest) {
  const chunks: Buffer[] = [];
  for await (const c of req) chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c));
  const raw = Buffer.concat(chunks).toString("utf8");
  try { return raw ? JSON.parse(raw) : {}; } catch { return {}; }
}
function getSession(req: NextApiRequest) {
  const ck = parseCookies(String(req.headers.cookie || ""));
  try { return ck[COOKIE] ? JSON.parse(ck[COOKIE]) : null; } catch { return null; }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const seg = req.query.nextauth;
  const action = Array.isArray(seg) && seg.length ? seg[0] : String(req.query.action || "session");

  if (req.method === "GET" && action === "session") {
    const s = getSession(req);
    return res.status(200).json({ user: s?.user || null });
  }

  if (req.method === "POST" && action === "signin") {
    const b = await readJSON(req);
    const user = {
      id: "owner",
      name: String(b?.name || "مالك"),
      email: String(b?.email || "owner@example.com"),
      role: String(b?.role || "owner"),
    };
    setCookie(res, COOKIE, JSON.stringify({ user }), ONE_MONTH);
    return res.status(200).json({ ok: true, user });
  }

  if ((req.method === "POST" || req.method === "GET") && action === "signout") {
    setCookie(res, COOKIE, "", 0);
    return res.status(200).json({ ok: true });
  }

  // افتراضي: رجّع الجلسة الحالية
  const s = getSession(req);
  return res.status(200).json({ route: action, user: s?.user || null });
}
