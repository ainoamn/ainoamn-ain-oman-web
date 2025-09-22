/**
 * GET /api/tasks/[id]/ics
 * يُنشئ ملف ICS بسيط بمعلومة عنوان المهمة وملاحظاتها.
 * يمكن لاحقًا ربطه بمواعيد واقعية (start/end).
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { readFileSync, existsSync } from "fs";
import path from "path";

function readTaskById(id: string): any | null {
  try {
    const file = path.join(process.cwd(), ".data", "tasks.json");
    if (!existsSync(file)) return null;
    const arr = JSON.parse(readFileSync(file, "utf8"));
    return (arr || []).find((t: any) => String(t.id) === String(id)) || null;
  } catch { return null; }
}

function formatICS(task: any) {
  const uid = `${task.id}@ain-oman`;
  const dt = (task.createdAt || new Date().toISOString()).replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
  const summary = `Task: ${task.title || task.id}`;
  const desc = (task.description || "").replace(/\r?\n/g, "\\n");
  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Ain Oman//Tasks//EN
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${dt}
SUMMARY:${summary}
DESCRIPTION:${desc}
END:VEVENT
END:VCALENDAR`;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "GET") { res.setHeader("Allow","GET"); return res.status(405).json({ error:"Method not allowed" }); }
    const id = String(req.query.id || "");
    const t = readTaskById(id);
    if (!t) return res.status(404).json({ error:"Task not found" });
    const ics = formatICS(t);
    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="task-${id}.ics"`);
    return res.status(200).send(ics);
  } catch (e:any) {
    console.error(e); return res.status(500).json({ error: e?.message || "Internal Server Error" });
  }
}
