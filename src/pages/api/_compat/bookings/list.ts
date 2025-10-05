import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

const DB = path.resolve(process.cwd(), ".data", "db.json");
function readDb(): any {
  try {
    if (!fs.existsSync(DB)) return {};
    return JSON.parse(fs.readFileSync(DB, "utf8") || "{}");
  } catch { return {}; }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const db = readDb();
  const a: any[] = Array.isArray(db.bookings) ? db.bookings : [];
  const b: any[] = Array.isArray(db.reservations) ? db.reservations : [];
  const c: any[] = Array.isArray(db.requests) ? db.requests.filter((x:any)=>x?.type==="booking"||x?.bookingId) : [];
  const map = new Map<string, any>();
  for (const it of [...a, ...b, ...c]) {
    const id = String(it?.id ?? it?.bookingId ?? "");
    if (!id) continue;
    map.set(id, it);
  }
  const items = Array.from(map.values()).sort((x:any,y:any)=>
    String(y?.updatedAt||y?.createdAt||"").localeCompare(String(x?.updatedAt||x?.createdAt||""))
  );
  return res.status(200).json({ items, compat: true });
}
