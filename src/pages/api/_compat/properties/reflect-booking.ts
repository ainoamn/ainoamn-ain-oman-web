import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

const DB = path.resolve(process.cwd(), ".data", "db.json");
function ensure() {
  const dir = path.dirname(DB);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DB)) fs.writeFileSync(DB, JSON.stringify({}, null, 2), "utf8");
}
function readDb(): any { ensure(); try { return JSON.parse(fs.readFileSync(DB, "utf8")||"{}"); } catch { return {}; } }
function writeDb(db:any){ ensure(); fs.writeFileSync(DB, JSON.stringify(db??{}, null, 2), "utf8"); }

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") { res.setHeader("Allow","POST"); return res.status(405).end(); }
  const body = typeof req.body === "string" ? JSON.parse(req.body||"{}") : (req.body||{});
  const propertyId = String(body.propertyId || "");
  const status = String(body.status || "");
  if (!propertyId || !status) return res.status(400).json({ ok:false, error:"propertyId and status required" });

  const db = readDb();
  const arr: any[] = Array.isArray(db.properties) ? db.properties : [];
  const idx = arr.findIndex(p => String(p?.id) === propertyId);
  if (idx >= 0) {
    const now = new Date().toISOString();
    arr[idx] = { ...arr[idx], lastBookingStatus: status, updatedAt: now };
    db.properties = arr;
    writeDb(db);
    return res.status(200).json({ ok:true, item: arr[idx], compat:true });
  }
  return res.status(200).json({ ok:true, compat:true, note:"property not found, skipped" });
}
