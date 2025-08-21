// src/pages/api/tasks/invite.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdminApi } from "@/server/auth";
import { getTask, updateTask, type TaskAccessRole } from "@/server/tasks";
import { sendEmail, sendWhatsapp } from "@/server/notify";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdminApi(req, res)) return;
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).end(); }

  const { taskId, targets, role, message } = req.body || {};
  if (!taskId || !Array.isArray(targets) || targets.length === 0) {
    return res.status(400).json({ ok: false, error: "BAD_INPUT" });
  }
  const t = await getTask(String(taskId));
  if (!t) return res.status(404).json({ ok: false, error: "TASK_NOT_FOUND" });

  const access = t.access || [];
  const newRole: TaskAccessRole = (["owner","editor","commenter","viewer"].includes(role)) ? role : "commenter";

  const baseLink = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/admin/tasks?open=${encodeURIComponent(t.id)}`;
  const text = message ? String(message) : `تمت دعوتك للمشاركة في المهمة ${t.serial}: ${t.title}\n${baseLink}`;

  for (const trg of targets) {
    const v = String(trg).trim();
    if (!v) continue;
    // إضافة/تحديث صلاحية
    const idx = access.findIndex(a => a.user === v);
    if (idx >= 0) access[idx] = { user: v, role: newRole }; else access.push({ user: v, role: newRole });

    // إرسال الإشعار
    if (v.includes("@")) {
      await sendEmail({ to: v, subject: `دعوة لمهمة ${t.serial}`, text }).catch(()=>null);
    } else {
      await sendWhatsapp({ to: v, body: text }).catch(()=>null);
    }
  }

  await updateTask(t.id, { access });
  return res.status(200).json({ ok: true, access });
}
