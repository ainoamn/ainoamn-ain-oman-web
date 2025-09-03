import type { NextApiRequest, NextApiResponse } from "next";
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import path from "node:path";

/** تخزين محلي */
const DATA_DIR = path.join(process.cwd(), ".data");
const FILE = path.join(DATA_DIR, "tasks.json");

/** النوع */
type TaskStatus = "open" | "done";
type LinkedRef = { type: "subscription" | "auction" | "user" | string; id: string };
type Task = {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  linked?: LinkedRef | null;
  assignees?: string[];
  createdAt: number;
  updatedAt: number;
  createdBy?: string | null;
};

/** تهيئة ملف البيانات عند الحاجة */
async function ensure() {
  try { await access(DATA_DIR); } catch { await mkdir(DATA_DIR, { recursive: true }); }
  try { await access(FILE); } catch { await writeFile(FILE, JSON.stringify({ items: [] }, null, 2), "utf8"); }
}

async function readDB(): Promise<{ items: Task[] }> {
  const raw = await readFile(FILE, "utf8").catch(() => '{"items":[]}');
  try { return JSON.parse(raw || '{"items":[]}'); } catch { return { items: [] }; }
}

async function writeDB(data: { items: Task[] }) {
  await writeFile(FILE, JSON.stringify(data, null, 2), "utf8");
}

function toInt(v: any, d: number) {
  const n = Number.parseInt(String(v), 10);
  return Number.isFinite(n) && n >= 0 ? n : d;
}

/** GET: ?q=&status=open|done&linkedType=&linkedId=&limit=&offset=  */
/** POST: { title, description?, status?, linked?, assignees?, createdBy? } */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await ensure();

  if (req.method === "GET") {
    const { q, status, linkedType, linkedId } = req.query as {
      q?: string; status?: TaskStatus; linkedType?: string; linkedId?: string;
    };
    const limit = toInt(req.query.limit, 50);
    const offset = toInt(req.query.offset, 0);

    const db = await readDB();
    let items = db.items || [];

    if (status === "open" || status === "done") {
      items = items.filter(t => t.status === status);
    }
    if (q && q.trim()) {
      const needle = q.toLowerCase();
      items = items.filter(t =>
        (t.title || "").toLowerCase().includes(needle) ||
        (t.description || "").toLowerCase().includes(needle)
      );
    }
    if (linkedType) items = items.filter(t => t.linked?.type === linkedType);
    if (linkedId)   items = items.filter(t => t.linked?.id === linkedId);

    items = items.sort((a, b) => b.createdAt - a.createdAt);

    const total = items.length;
    const page = items.slice(offset, offset + limit);

    return res.status(200).json({ items: page, total, limit, offset });
  }

  if (req.method === "POST") {
    const body = (req.body || {}) as Partial<Task> & {
      title?: string;
      description?: string;
      status?: TaskStatus;
      linked?: LinkedRef | null;
      assignees?: string[];
      createdBy?: string | null;
    };

    if (!body.title || !body.title.trim()) {
      return res.status(400).json({ error: "title is required" });
    }

    const now = Date.now();
    const id = `task_${now}_${Math.random().toString(36).slice(2, 8)}`;

    const newItem: Task = {
      id,
      title: body.title.trim(),
      description: body.description?.trim() || "",
      status: body.status === "done" ? "done" : "open",
      linked: body.linked ?? null,
      assignees: Array.isArray(body.assignees) ? body.assignees : [],
      createdAt: now,
      updatedAt: now,
      createdBy: body.createdBy ?? null,
    };

    const db = await readDB();
    db.items = [newItem, ...(db.items || [])];
    await writeDB(db);

    return res.status(201).json({ ok: true, item: newItem });
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Method Not Allowed" });
}

/** ملاحظات:
 * - هذا المسار يعمل على Node فقط. لا تستخدمه من كود متصفح مباشرة عبر import.
 * - استخدم fetch("/api/tasks") من الواجهة.
 * - يتم الحفظ في .data/tasks.json داخل جذر المشروع.
 */
