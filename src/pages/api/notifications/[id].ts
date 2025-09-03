import type { NextApiRequest, NextApiResponse } from "next";
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), ".data");
const FILE = path.join(DATA_DIR, "notifications.json");

async function ensure() {
  try { await access(DATA_DIR); } catch { await mkdir(DATA_DIR, { recursive: true }); }
  try { await access(FILE); } catch { await writeFile(FILE, JSON.stringify({ items: [] }, null, 2), "utf8"); }
}
async function readDB() { const raw = await readFile(FILE, "utf8").catch(()=> '{"items":[]}'); return JSON.parse(raw || '{"items":[]}'); }
async function writeDB(data: any) { await writeFile(FILE, JSON.stringify(data, null, 2), "utf8"); }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await ensure();
  const { id } = req.query as { id: string };

  if (req.method === "PUT") {
    const db = await readDB();
    db.items = (db.items || []).map((n: any) => n.id === id ? { ...n, ...(req.body || {}), id } : n);
    await writeDB(db);
    return res.status(200).json({ ok: true });
  }

  if (req.method === "DELETE") {
    const db = await readDB();
    db.items = (db.items || []).filter((n: any) => n.id !== id);
    await writeDB(db);
    return res.status(200).json({ ok: true });
  }

  res.setHeader("Allow", "PUT, DELETE");
  return res.status(405).json({ error: "Method Not Allowed" });
}
