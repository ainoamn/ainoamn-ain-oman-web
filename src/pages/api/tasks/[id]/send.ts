// src/pages/api/tasks/[id]/send.ts
import type { NextApiRequest, NextApiResponse } from "next";

export const config = { api: { bodyParser: { sizeLimit: "10mb" } } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = String(req.query.id || "");
  try {
    // استدعاء وحدتك الخادمية ديناميكياً حتى لا تدخل حزمة المتصفح
    const mod: any = await import("@/server/calendar/store");

    // نداءات مرنة حسب ما هو متاح عندك في store.ts
    if (typeof mod.sendTask === "function") await mod.sendTask(id);
    if (typeof mod.sendTaskEmail === "function") await mod.sendTaskEmail(id);
    if (typeof mod.createICS === "function") await mod.createICS(id);
    if (typeof mod.createIcsForTask === "function") await mod.createIcsForTask(id);
    if (typeof mod.generateIcs === "function") await mod.generateIcs(id);

    return res.status(200).json({ ok: true, id });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err?.message || "Internal error" });
  }
}
