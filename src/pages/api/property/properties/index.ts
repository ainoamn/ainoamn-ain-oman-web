import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

/** قراءة db.json */
function readDb(): any {
  try {
    const p = path.resolve(process.cwd(), ".data", "db.json");
    if (!fs.existsSync(p)) return {};
    return JSON.parse(fs.readFileSync(p, "utf8") || "{}");
  } catch { return {}; }
}

/** قراءة properties.json التاريخي */
function readLegacy(): any[] {
  const candidates = [
    path.resolve(process.cwd(), ".data", "properties.json"),
    path.resolve(process.cwd(), "data", "properties.json"),
    path.resolve(process.cwd(), "properties.json"),
  ];
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) {
        const j = JSON.parse(fs.readFileSync(p, "utf8") || "[]");
        if (Array.isArray(j)) return j;
        if (Array.isArray(j?.items)) return j.items;
      }
    } catch {}
  }
  return [];
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end();
  }
  const q = String(req.query.q || "").toLowerCase();
  const limit = Math.max(0, Math.min(1000, Number(req.query.limit || 0)));

  const db = readDb();
  const fromDb: any[] = Array.isArray(db.properties) ? db.properties : [];
  const fromLegacy = readLegacy();

  // دمج مع تفضيل الأحدث من db.json
  const map = new Map<string, any>();
  for (const p of fromLegacy) if (p?.id) map.set(String(p.id), p);
  for (const p of fromDb) if (p?.id) map.set(String(p.id), p);

  let items = Array.from(map.values());
  if (q) items = items.filter((p) => JSON.stringify(p).toLowerCase().includes(q));
  items.sort((a: any, b: any) => String(b?.updatedAt || b?.createdAt || "").localeCompare(String(a?.updatedAt || a?.createdAt || "")));
  if (limit) items = items.slice(0, limit);

  return res.status(200).json({ items });
}
