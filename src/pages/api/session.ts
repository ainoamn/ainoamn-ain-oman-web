import type { NextApiRequest, NextApiResponse } from "next";
import type { UserRole as Role } from "@/lib/user-roles";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const DATA = path.join(process.cwd(), ".data");
const USERS = path.join(DATA, "users.json");
const DEFAULT_ROLE: Role = "individual_tenant";

function parseCookies(h?: string) {
  const out: Record<string, string> = {};
  if (!h) return out;
  for (const p of h.split(";")) { const [k, ...r] = p.trim().split("="); out[k] = decodeURIComponent((r.join("=") || "").trim()); }
  return out;
}
async function ensure() {
  try { await access(DATA); } catch { await mkdir(DATA, { recursive: true }); }
  try { await access(USERS); } catch { await writeFile(USERS, JSON.stringify({ items: [] }, null, 2), "utf8"); }
}
async function readUsers(){ const raw=await readFile(USERS,"utf8").catch(()=> '{"items":[]}'); return JSON.parse(raw||'{"items":[]}'); }
async function writeUsers(d:any){ await writeFile(USERS, JSON.stringify(d,null,2), "utf8"); }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await ensure();
  const c = parseCookies(req.headers.cookie);
  if (!c.uid) return res.status(200).json({ user: null });

  const db = await readUsers();
  let u = (db.items||[]).find((x:any)=> x.id===c.uid);
  if (!u) {
    u = { id: c.uid, name: c.uname || "User", role: c.urole || DEFAULT_ROLE, status:"active", createdAt: Date.now() };
    db.items = [u, ...(db.items||[])];
    await writeUsers(db);
  }
  const role: Role = (u.role as Role) || DEFAULT_ROLE;

  // توحيد الكوكيز مع السجل
  res.setHeader("Set-Cookie", [
    `uid=${encodeURIComponent(u.id)}; Path=/; SameSite=Lax`,
    `uname=${encodeURIComponent(u.name)}; Path=/; SameSite=Lax`,
    `urole=${encodeURIComponent(role)}; Path=/; SameSite=Lax`,
  ]);

  return res.status(200).json({ user: { id: u.id, name: u.name, role } });
}
