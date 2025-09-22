/**
 * API: /api/tasks
 * - GET    : يدعم التصفية (q, status, priorities, assignees, categories, labels) + ترقيم اختياري.
 * - POST   : إنشاء مهمة (جسم واحد أو مصفوفة).
 * - PUT    : تحديث مفرد أو دفعي. يقبل {id,...fields} أو {id, patch:{...}} أو [{id,patch}...].
 * - DELETE : حذف مفرد ?id= أو { ids:[...] }.
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { readArray, writeArray } from "@/server/jsonStore";
import type { Task } from "@/types/tasks";
import { nextSerial } from "@/lib/seq";

const FILE = "tasks.json";

function nowISO() { return new Date().toISOString(); }
function byCreatedDesc(a: Task, b: Task) { return a.createdAt < b.createdAt ? 1 : -1; }

function contains(hay: any, needle: string) {
  return String(hay || "").toLowerCase().includes(needle.toLowerCase());
}
function intersect(a: string[] = [], b: string[] = []) {
  const set = new Set(a.map(x=>x.toLowerCase()));
  return b.some(x => set.has(String(x).toLowerCase()));
}

function applyFilters(items: Task[], q?: string, status?: string[], priorities?: string[], assignees?: string[], categories?: string[], labels?: string[]) {
  let out = items;
  if (q && q.trim()) {
    out = out.filter(t =>
      contains(t.title, q) ||
      contains(t.description, q) ||
      (t.labels || []).some(l => contains(l, q))
    );
  }
  if (status?.length) {
    const S = new Set(status.map(s => s.toLowerCase()));
    out = out.filter(t => S.has(String(t.status).toLowerCase()));
  }
  if (priorities?.length) {
    const P = new Set(priorities.map(s => s.toLowerCase()));
    out = out.filter(t => P.has(String(t.priority).toLowerCase()));
  }
  if (assignees?.length) {
    out = out.filter(t => intersect((t.assignees || []).map(x=>String(x)), assignees.map(x=>String(x))));
  }
  if (categories?.length) {
    const C = new Set(categories.map(s => s.toLowerCase()));
    out = out.filter(t => C.has(String(t.category || "").toLowerCase()));
  }
  if (labels?.length) {
    out = out.filter(t => intersect((t.labels || []).map(x=>String(x)), labels.map(x=>String(x))));
  }
  return out;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "GET") {
      const items = readArray<Task>(FILE).sort(byCreatedDesc);

      const q = typeof req.query.q === "string" ? req.query.q : "";
      const status = typeof req.query.status === "string" ? req.query.status.split(",").filter(Boolean) : undefined;
      const priorities = typeof req.query.priorities === "string" ? req.query.priorities.split(",").filter(Boolean) : undefined;
      const assignees = typeof req.query.assignees === "string" ? req.query.assignees.split(",").filter(Boolean) : undefined;
      const categories = typeof req.query.categories === "string" ? req.query.categories.split(",").filter(Boolean) : undefined;
      const labels = typeof req.query.labels === "string" ? req.query.labels.split(",").filter(Boolean) : undefined;

      let filtered = applyFilters(items, q, status, priorities, assignees, categories, labels);

      // ترقيم اختياري
      const page = Math.max(1, parseInt(String(req.query.page || "1"), 10) || 1);
      const pageSize = Math.max(1, Math.min(200, parseInt(String(req.query.pageSize || "50"), 10) || 50));
      const total = filtered.length;
      const start = (page - 1) * pageSize;
      const data = filtered.slice(start, start + pageSize);

      return res.status(200).json({ page, pageSize, total, items: data });
    }

    if (req.method === "POST") {
      const body = req.body;
      const now = nowISO();
      const createOne = async (b: any): Promise<Task> => {
        const id = b.id || (await nextSerial("TASK"));
        const t: Task = {
          id,
          title: String(b.title || "مهمة"),
          description: b.description ? String(b.description) : "",
          status: (b.status || "open"),
          priority: (b.priority || "medium"),
          category: b.category ? String(b.category) : undefined,
          assignees: Array.isArray(b.assignees) ? b.assignees.map(String) : [],
          labels: Array.isArray(b.labels) ? b.labels.map(String) : [],
          createdAt: now,
          updatedAt: now,
          thread: Array.isArray(b.thread) ? b.thread : [],
          attachments: Array.isArray(b.attachments) ? b.attachments : [],
        };
        return t;
      };

      const arr = readArray<Task>(FILE);
      if (Array.isArray(body)) {
        const created: Task[] = [];
        for (const b of body) created.push(await createOne(b));
        writeArray(FILE, [...arr, ...created]);
        return res.status(201).json({ items: created });
      } else {
        const t = await createOne(body || {});
        writeArray(FILE, [...arr, t]);
        return res.status(201).json(t);
      }
    }

    if (req.method === "PUT") {
      const body = req.body;
      const arr = readArray<Task>(FILE);

      const applyPatch = (t: Task, patch: any) => {
        const p = { ...t, ...patch, id: t.id };
        p.updatedAt = nowISO();
        if (patch.labels) p.labels = Array.isArray(patch.labels) ? patch.labels.map(String) : t.labels;
        if (patch.assignees) p.assignees = Array.isArray(patch.assignees) ? p.assignees.map(String) : t.assignees;
        return p as Task;
      };

      if (Array.isArray(body)) {
        let changed = 0;
        for (const it of body) {
          const id = String(it?.id || "");
          const i = arr.findIndex(x => x.id === id);
          if (i >= 0) { arr[i] = applyPatch(arr[i], it.patch || it); changed++; }
        }
        writeArray(FILE, arr);
        return res.status(200).json({ ok: true, updated: changed });
      } else {
        const id = String(body?.id || "");
        const i = arr.findIndex(x => x.id === id);
        if (i < 0) return res.status(404).json({ error: "Task not found" });
        const patch = body?.patch ? body.patch : body;
        arr[i] = applyPatch(arr[i], patch);
        writeArray(FILE, arr);
        return res.status(200).json(arr[i]);
      }
    }

    if (req.method === "DELETE") {
      const arr = readArray<Task>(FILE);
      const ids = Array.isArray((req.body || {})?.ids) ? (req.body.ids as any[]).map(String)
        : (typeof req.query.id === "string" ? [req.query.id] : []);
      if (!ids.length) return res.status(400).json({ error: "No ids provided" });
      const left = arr.filter(t => !ids.includes(t.id));
      writeArray(FILE, left);
      return res.status(200).json({ ok: true, deleted: arr.length - left.length });
    }

    res.setHeader("Allow", "GET,POST,PUT,DELETE");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: e?.message || "Internal Server Error" });
  }
}
