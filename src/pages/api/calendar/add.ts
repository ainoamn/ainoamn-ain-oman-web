import type { NextApiRequest, NextApiResponse } from "next";
import { getTask, upsertTask } from "../../../server/db"; // ← صحيح (3 رجوع)
function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.setHeader("Allow", "POST").status(405).end();
  const { taskId, start, end } = req.body || {};
  if (!taskId || typeof taskId !== "string") return res.status(400).json({ error: "taskId required" });

  const t = getTask(taskId);
  if (!t) return res.status(404).json({ error: "Task not found" });

  t.calendarEvent = { id: `evt_${Date.now()}`, title: t.title || `Task ${t.id}`, start: start || t.dueDate, end: end || t.dueDate, createdAt: new Date().toISOString() };
  upsertTask(t);
  return res.status(200).json({ ok: true, event: t.calendarEvent });
}
