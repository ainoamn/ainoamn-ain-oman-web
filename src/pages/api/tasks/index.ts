// src/pages/api/tasks/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdminApi } from "@/server/auth";
import { createTask, listTasks, setTaskStatus } from "@/server/tasks";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdminApi(req, res)) return;

  if (req.method === "GET") {
    const items = await listTasks();
    return res.status(200).json({ ok: true, items });
  }

  if (req.method === "POST") {
    const body = req.body || {};
    const item = await createTask({
      title: String(body.title || "مهمة جديدة"),
      description: body.description ? String(body.description) : undefined,
      assignee: body.assignee ? String(body.assignee) : undefined,
      dueDate: body.dueDate ? String(body.dueDate) : undefined,
      data: body.data || undefined,
      status: body.status && ["open","in_progress","done","canceled"].includes(body.status) ? body.status : "open",
    });
    return res.status(200).json({ ok: true, item });
  }

  if (req.method === "PUT") {
    const { id, status } = req.body || {};
    if (!id || !["open","in_progress","done","canceled"].includes(status)) {
      return res.status(400).json({ ok: false, error: "BAD_INPUT" });
    }
    const item = await setTaskStatus(String(id), status);
    if (!item) return res.status(404).json({ ok: false, error: "NOT_FOUND" });
    return res.status(200).json({ ok: true, item });
  }

  res.setHeader("Allow", "GET, POST, PUT");
  return res.status(405).json({ ok: false, error: "Method Not Allowed" });
}
