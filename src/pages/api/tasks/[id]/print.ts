import type { NextApiRequest, NextApiResponse } from "next";
import { taskToPdfStream, type TaskForPdf } from "@/server/pdf/taskPdf";
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
const readThread = (t:any)=> Array.isArray(t?.thread) ? t.thread : [];
const readAttachments = (t:any)=> Array.isArray(t?.attachments) ? t.attachments : [];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "GET") { res.setHeader("Allow","GET"); return res.status(405).json({ error:"Method not allowed" }); }

    const id = String(req.query.id || "");
    const includeThread = String(req.query.includeThread || "1") !== "0";
    const includeAttachments = String(req.query.includeAttachments || "1") !== "0";

    const t = readTaskById(id);
    if (!t) return res.status(404).json({ error:"Task not found" });

    const payload: TaskForPdf = {
      id: t.id, title: t.title || "(بدون عنوان)", description: t.description || "",
      status: t.status || "open", priority: t.priority || "medium",
      category: t.category || "", assignees: t.assignees || [], labels: t.labels || [],
      createdAt: t.createdAt || "", updatedAt: t.updatedAt || "",
      thread: includeThread ? readThread(t) : [],
      attachments: includeAttachments ? readAttachments(t) : [],
    };

    const stream = taskToPdfStream(payload);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="task-${id}.pdf"`);
    // @ts-ignore
    stream.pipe(res);
  } catch (e:any) {
    console.error(e); return res.status(500).json({ error: e?.message || "Internal Server Error" });
  }
}
