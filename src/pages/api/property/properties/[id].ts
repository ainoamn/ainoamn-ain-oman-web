import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

function dbPath() { return path.resolve(process.cwd(), ".data", "db.json"); }
function readDb(): any { try { return JSON.parse(fs.readFileSync(dbPath(), "utf8") || "{}"); } catch { return {}; } }
function writeDb(db: any) {
  const dir = path.dirname(dbPath());
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(dbPath(), JSON.stringify(db ?? {}, null, 2), "utf8");
}

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
  const id = String(req.query.id || "");
  if (!id) return res.status(400).json({ error: "id required" });

  if (req.method === "GET") {
    const db = readDb();
    const fromDb: any[] = Array.isArray(db.properties) ? db.properties : [];
    const legacy = readLegacy();
    const item = [...fromDb, ...legacy].find((x) => String(x?.id) === id) || null;
    if (!item) return res.status(404).json({ error: "Not found" });
    return res.status(200).json({ item });
  }

  if (req.method === "PUT" || req.method === "PATCH") {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const db = readDb();
    const arr: any[] = Array.isArray(db.properties) ? db.properties : [];
    const now = new Date().toISOString();
    const idx = arr.findIndex((x) => String(x?.id) === id);
    const merged = idx === -1
      ? { id, createdAt: now, updatedAt: now, ...body }
      : { ...arr[idx], ...body, id, updatedAt: now };
    if (idx === -1) arr.push(merged); else arr[idx] = merged;
    db.properties = arr;
    writeDb(db);
    return res.status(200).json({ item: merged });
  }

  if (req.method === "DELETE") {
    const db = readDb();
    const arr: any[] = Array.isArray(db.properties) ? db.properties : [];
    db.properties = arr.filter((x) => String(x?.id) !== id);
    writeDb(db);
    return res.status(204).end();
  }

  res.setHeader("Allow", "GET,PUT,PATCH,DELETE");
  return res.status(405).end();
}
