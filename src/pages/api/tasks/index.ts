// FILE: src/pages/api/tasks/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdminApi } from "@/server/auth";
import { listTasks, createTask, bulkUpdate, deleteTask } from "@/server/tasks/store";

function includes(s: string, q: string) { return s.toLowerCase().includes(q.toLowerCase()); }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdminApi(req, res)) return;

  if (req.method === "GET") {
    const { q = "", status = "", priority = "", assignees = "", categories = "", labels = "" } = req.query as Record<string, string>;
    const items = await listTasks();
    const out = items.filter((t) => {
      if (status && t.status !== status) return false;
      if (priority && t.priority !== priority) return false;
      if (assignees) {
        const set = new Set(assignees.split(",").map((s) => s.trim()).filter(Boolean));
        if (!t.assignees || !t.assignees.some((a) => set.has(a))) return false;
      }
      if (categories) {
        const set = new Set(categories.split(",").map((s) => s.trim()).filter(Boolean));
        if (!t.category || !set.has(t.category)) return false;
      }
      if (labels) {
        const set = new Set(labels.split(",").map((s) => s.trim()).filter(Boolean));
        if (!t.labels || !t.labels.some((l) => set.has(l))) return false;
      }
      if (q) {
        const blob = [t.id, t.serial, t.title, t.description, (t.labels||[]).join(" "), (t.assignees||[]).join(" "), t.category || ""]
          .filter(Boolean).join(" ");
        if (!includes(blob, q)) return false;
      }
      return true;
    });
    return res.status(200).json({ ok: true, items: out });
  }

  if (req.method === "POST") {
    const body = req.body || {};
    const item = await createTask({
      title: String(body.title || "Untitled"),
      description: String(body.description || ""),
      status: (body.status || "open"),
      priority: (body.priority || "medium"),
      assignees: Array.isArray(body.assignees) ? body.assignees : undefined,
      watchers: Array.isArray(body.watchers) ? body.watchers : undefined,
      labels: Array.isArray(body.labels) ? body.labels : undefined,
      category: body.category || undefined,
      createdAt: new Date().toISOString(),
    });
    return res.status(201).json({ ok: true, item });
  }

  if (req.method === "PUT") {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];
    const patch = req.body?.patch || {};
    const changed = await bulkUpdate(ids, patch);
    return res.status(200).json({ ok: true, items: changed });
  }

  if (req.method === "DELETE") {
    const id = String((req.body && req.body.id) || req.query.id || "");
    const deleted = await deleteTask(id);
    return res.status(200).json({ ok: true, deleted });
  }

  res.setHeader("Allow", "GET, POST, PUT, DELETE");
  return res.status(405).json({ ok: false, error: "Method Not Allowed" });
}
