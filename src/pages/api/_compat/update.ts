import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs"; import path from "path";

const DB = path.resolve(process.cwd(), ".data", "db.json");
function ensure(){ const d = path.dirname(DB); if(!fs.existsSync(d)) fs.mkdirSync(d,{recursive:true});
  if(!fs.existsSync(DB)) fs.writeFileSync(DB, JSON.stringify({}), "utf8"); }
function readDb(){ ensure(); try{ return JSON.parse(fs.readFileSync(DB,"utf8")||"{}"); } catch{ return {}; } }
function writeDb(db:any){ ensure(); fs.writeFileSync(DB, JSON.stringify(db??{}, null, 2), "utf8"); }

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PATCH" && req.method !== "POST") { res.setHeader("Allow","PATCH,POST"); return res.status(405).end(); }

  const body = typeof req.body === "string" ? JSON.parse(req.body||"{}") : (req.body||{});
  const id = String(body.id || "");
  if (!id) return res.status(400).json({ ok:false, error:"id required" });

  const db = readDb();
  const arr: any[] = Array.isArray(db.tasks) ? db.tasks : [];
  const idx = arr.findIndex(t => String(t?.id) === id);
  const now = new Date().toISOString();

  if (idx >= 0) {
    arr[idx] = { ...arr[idx], ...body, updatedAt: now };
    db.tasks = arr; writeDb(db);
    return res.status(200).json({ ok:true, item: arr[idx], compat:true });
  }
  const item = { id, ...body, createdAt: now, updatedAt: now };
  db.tasks = [...arr, item]; writeDb(db);
  return res.status(200).json({ ok:true, item, compat:true, upserted:true });
}
