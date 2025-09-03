import type { NextApiRequest, NextApiResponse } from "next";
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import path from "node:path";

/** تخزين محلي */
const DATA_DIR = path.join(process.cwd(), ".data");
const FILE = path.join(DATA_DIR, "notifications.json");

/** النوع */
type Severity = "info" | "success" | "warning" | "error";
type Notification = {
  id: string;
  userId: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: number;
  type?: string;
  severity?: Severity;
  meta?: Record<string, any>;
};

async function ensure() {
  try { await access(DATA_DIR); } catch { await mkdir(DATA_DIR, { recursive: true }); }
  try { await access(FILE); } catch { await writeFile(FILE, JSON.stringify({ items: [] }, null, 2), "utf8"); }
}
async function readDB(): Promise<{ items: Notification[] }> {
  const raw = await readFile(FILE, "utf8").catch(() => '{"items":[]}');
  try { return JSON.parse(raw || '{"items":[]}'); } catch { return { items: [] }; }
}
async function writeDB(data: { items: Notification[] }) {
  await writeFile(FILE, JSON.stringify(data, null, 2), "utf8");
}
const toInt = (v: any, d: number) => {
  const n = Number.parseInt(String(v), 10);
  return Number.isFinite(n) && n >= 0 ? n : d;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await ensure();

  // GET ?userId=&unread=1&since=TIMESTAMP&limit=&offset=
  if (req.method === "GET") {
    const { userId, unread, since } = req.query as { userId?: string; unread?: string; since?: string };
    const limit = toInt(req.query.limit, 50);
    const offset = toInt(req.query.offset, 0);

    let { items } = await readDB();

    if (userId) items = items.filter(n => n.userId === userId);
    if (unread === "1") items = items.filter(n => !n.read);
    if (since && Number.isFinite(Number(since))) {
      const t = Number(since);
      items = items.filter(n => n.createdAt >= t);
    }

    items = items.sort((a, b) => b.createdAt - a.createdAt);
    const total = items.length;
    const page = items.slice(offset, offset + limit);

    return res.status(200).json({ items: page, total, limit, offset });
  }

  // POST { userId, title, body?, type?, severity?, meta? }
  if (req.method === "POST") {
    const b = (req.body || {}) as Partial<Notification>;
    if (!b.userId || !b.title) return res.status(400).json({ error: "userId and title are required" });

    const now = Date.now();
    const item: Notification = {
      id: `ntf_${now}_${Math.random().toString(36).slice(2, 8)}`,
      userId: String(b.userId),
      title: String(b.title),
      body: String(b.body || ""),
      read: false,
      createdAt: now,
      type: b.type ? String(b.type) : undefined,
      severity: (["info","success","warning","error"] as Severity[]).includes(b.severity as Severity) ? (b.severity as Severity) : "info",
      meta: (b.meta && typeof b.meta === "object") ? b.meta as any : undefined,
    };

    const db = await readDB();
    db.items = [item, ...(db.items || [])];
    await writeDB(db);

    return res.status(201).json({ ok: true, item });
  }

  // PATCH { action: "markRead" | "markAllRead", ids?: string[], userId?: string }
  if (req.method === "PATCH") {
    const b = req.body || {};
    const db = await readDB();

    if (b.action === "markRead" && Array.isArray(b.ids) && b.ids.length > 0) {
      db.items = (db.items || []).map(n => b.ids.includes(n.id) ? { ...n, read: true } : n);
      await writeDB(db);
      return res.status(200).json({ ok: true });
    }

    if (b.action === "markAllRead" && b.userId) {
      db.items = (db.items || []).map(n => n.userId === b.userId ? { ...n, read: true } : n);
      await writeDB(db);
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: "invalid PATCH payload" });
  }

  res.setHeader("Allow", "GET, POST, PATCH");
  return res.status(405).json({ error: "Method Not Allowed" });
}
