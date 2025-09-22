/**
 * POST /api/tasks/[id]/thread
 * body: { author: string, text: string }
 * يُضيف رسالة إلى محادثة المهمة.
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { readArray, writeArray } from "@/server/jsonStore";
import type { Task } from "@/types/tasks";

const FILE = "tasks.json";
function uuid() { return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => { const r=(Math.random()*16)|0, v=c==="x"?r:(r&0x3)|0x8; return v.toString(16); }); }

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") { res.setHeader("Allow","POST"); return res.status(405).json({ error: "Method not allowed" }); }
    const id = String(req.query.id || "");
    const body = req.body || {};
    const arr = readArray<Task>(FILE);
    const i = arr.findIndex(x => x.id === id);
    if (i < 0) return res.status(404).json({ error: "Task not found" });
    const msg = { id: uuid(), author: String(body.author || "—"), ts: new Date().toISOString(), text: String(body.text || "") };
    arr[i].thread = [...(arr[i].thread || []), msg];
    arr[i].updatedAt = new Date().toISOString();
    writeArray(FILE, arr);
    return res.status(200).json({ ok: true, message: msg });
  } catch (e:any) {
    console.error(e); return res.status(500).json({ error: e?.message || "Internal Server Error" });
  }
}
