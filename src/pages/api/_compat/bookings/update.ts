import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

const DB = path.resolve(process.cwd(), ".data", "db.json");
function ensure() {
  if (!fs.existsSync(path.dirname(DB))) fs.mkdirSync(path.dirname(DB), { recursive: true });
  if (!fs.existsSync(DB)) fs.writeFileSync(DB, JSON.stringify({}, null, 2), "utf8");
}
function readDb(): any { ensure(); try { return JSON.parse(fs.readFileSync(DB, "utf8") || "{}"); } catch { return {}; } }
function writeDb(db: any) { ensure(); fs.writeFileSync(DB, JSON.stringify(db ?? {}, null, 2), "utf8"); }

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).end(); }
  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  const id = String(body.id || body.bookingId || "");
  const status = String(body.status || "");
  if (!id || !status) return res.status(400).json({ error: "id and status required" });

  const db = readDb();
  for (const coll of ["bookings", "reservations", "requests"]) {
    const arr: any[] = Array.isArray(db[coll]) ? db[coll] : [];
    const idx = arr.findIndex((x) => String(x?.id ?? x?.bookingId) === id);
    if (idx >= 0) {
      arr[idx] = { ...arr[idx], status, updatedAt: new Date().toISOString() };
      db[coll] = arr;
      writeDb(db);
      return res.status(200).json({ item: arr[idx], compat: true });
    }
  }
  // إذا لم يوجد، أنشئ سجل مبسط
  db.bookings = Array.isArray(db.bookings) ? db.bookings : [];
  const item = { id, status, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  db.bookings.push(item);
  writeDb(db);
  return res.status(200).json({ item, compat: true, upserted: true });
}
