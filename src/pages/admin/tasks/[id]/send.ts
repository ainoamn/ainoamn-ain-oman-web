// FILE: src/pages/api/tasks/[id]/send.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdminApi } from "@/server/auth";
import { readTaskById, addThreadMessage } from "@/server/tasks/store";
import { enqueue } from "@/server/notify/store";
import { addEventFromTask } from "@/server/calendar/store";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdminApi(req, res)) return;
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST"); return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }
  const id = String(req.query.id || "");
  const { recipients = [], message = "", subject = "مهمة جديدة/تحديث", autoCalendar = true } = (req.body || {}) as any;
  if (!id) return res.status(400).json({ ok: false, error: "MISSING_ID" });

  const task = await readTaskById(id);
  if (!task) return res.status(404).json({ ok: false, error: "TASK_NOT_FOUND" });

  const list: string[] = Array.isArray(recipients) ? recipients : [];
  if (list.length === 0 && Array.isArray(task.watchers)) list.push(...task.watchers);

  for (const to of list) {
    const channel = String(to).includes("@") ? "email" : "whatsapp";
    await enqueue({ channel: channel as any, to, subject, text: message || `إشعار بشأن المهمة ${task.serial || task.id}`, taskId: id });
  }

  await addThreadMessage(id, "system", `تم إرسال المهمة إلى: ${list.join(", ") || "—"}`);

  if (autoCalendar) {
    await addEventFromTask(task);
  }

  return res.status(200).json({ ok: true, count: list.length });
}
